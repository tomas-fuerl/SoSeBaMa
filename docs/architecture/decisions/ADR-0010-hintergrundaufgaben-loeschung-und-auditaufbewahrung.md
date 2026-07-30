# ADR-0010: Hintergrundaufgaben, Löschung und Auditaufbewahrung

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

PDF-Prüfung, endgültige Löschung, Retention und Reparatur benötigen
zuverlässige Hintergrundarbeit. Jobanlage muss mit Fachzustand und Audit atomar
sein. Fachliche Löschfristen dürfen durch technische Verzögerung nicht
verlängert werden.

## Ziele und Nicht-Ziele

Ziele sind PostgreSQL-basierte Jobs, idempotente Handler, sichtbare Fehler,
mehrstufige endgültige Löschung und zweckgebundene Auditaufbewahrung. Redis,
RabbitMQ, Kafka, eine zweite Outbox und Runtime-DDL sind keine MVP-Ziele.

## Entscheidungskriterien

- atomare Job- und Fachtransaktion,
- geringer Betriebsaufwand,
- Wiederholbarkeit und Reparierbarkeit,
- sichere Lösch- und Aufbewahrungsgrenzen,
- Upgrade-, Test- und Rückbaufähigkeit.

## Betrachtete Optionen

1. **Status quo:** Keine technische Jobinfrastruktur.
2. **Angenommen:** `pg-boss` in PostgreSQL mit kontrolliert migriertem
   Queue-Schema.
3. **Alternative:** Externer Broker mit eigener Outbox. Das erhöht Komponenten,
   Zustandsabgleich und Wiederherstellungsaufwand.

## Entscheidung und Begründung

`pg-boss` stellt die PostgreSQL-basierte Jobinfrastruktur. Das Queue-Schema wird
ausschließlich durch den kontrollierten Migrator angelegt oder geändert.
Runtime-DDL ist verboten. Kann die konkrete Bibliotheksintegration diese Grenze
nicht einhalten, ist dies vor Implementierung eine blockierende technische
Verifikation; die Grenze bleibt bestehen.

Jobs werden atomar innerhalb der Fachtransaktion eingereiht. Eine parallele
eigene Outbox-Tabelle wird nicht eingeführt. Jobnamen sind stabil und
versioniert. Nutzdaten sind datensparsam und enthalten keine Secrets,
Binärdaten oder vorausberechneten Rechteentscheidungen.

Parallelität und Singleton-Schlüssel sind begrenzt. Handler bleiben idempotent.
Fehlerklassen sind explizit. Wiederholungen sind begrenzt und verwenden Backoff
mit Jitter. Dauerhafte Fehler erhalten einen Dead-Letter-Status und werden
nicht automatisch reaktiviert.

Server- und Datenbankzeit bestimmen fachliche Fristen. Ein periodischer
Reparaturlauf findet überfällige Aufgaben. Technische Verzögerung verlängert
keine Wiederherstellungsfrist.

Der Löschlebenszyklus verwendet:

- `active`,
- `deletion-marked`,
- `pending-final-deletion`,
- `finalizing`,
- `finalized`,
- `finalization-failed`.

Endgültige Löschung ist mehrstufig. Aktuelle Setlistreferenzen und abhängige
Overlays werden atomar entfernt; die Setlisthistorie erhält nur den
festgelegten Minimalmarker. Endgültig gelöschte technische Objektidentitäten
bleiben dauerhaft gesperrt.

Binärdateien werden erst nach erfolgreicher Datenbankfinalisierung entfernt.
Fehlgeschlagene Binärbereinigung erzeugt keine Wiederherstellungsmöglichkeit.
Wiederherstellung ist ausschließlich vor Fristablauf zulässig. Eine
Zeilensperre entscheidet das Rennen zwischen Wiederherstellung und
Finalisierung.

Audit verwendet eine append-only Struktur mit getrennten Runtime- und
Retention-Rollen. Eine kryptografische Hashkette gehört nicht zum MVP.
Aufbewahrung:

- Administration, Eigentum, Berechtigung, Löschung, Wiederherstellung und
  Check-out: 365 Tage,
- abgelehnte Zugriffe, Login und technische Security-Ereignisse: 90 Tage,
- fachliche Historie: solange das Objekt besteht,
- minimales Nachweismaterial nach endgültiger Löschung: 90 Tage.

Weitere technische Daten erhalten zweckgebundene Aufräumfristen. Eine
geschützte Betriebsansicht zeigt Job- und Löschfehler. TST-Diagnose ist
detailliert und geschützt; PRD besitzt keine Debugkonsole. Worker unterstützen
aktuelle und vorherige Jobversion und fahren kontrolliert herunter und wieder
an.

## Folgen und Risiken

PostgreSQL wird zusätzlich durch Jobs belastet; API-Latenz hat deshalb Vorrang,
Parallelität wird budgetiert und Stau beobachtet. Mehrstufige Binärlöschung
erfordert Kompensation und Betriebsalarme. Append-only schützt nicht allein
gegen privilegierte Datenbankmanipulation; Rollen, Backups und Auditkontrollen
bleiben nötig.

Versionierte Jobs und relationale Zustände sind portabel. Injizierbare Zeit,
Störfälle und wiederholte Handleraufrufe ermöglichen deterministische Tests.

Die Portabilität folgt aus der PostgreSQL-basierten Warteschlange ohne
zusätzlichen Broker. Die Testbarkeit wird durch deterministische Job-Handler,
kontrollierte Zeit und wiederholbare Fehler- und Wiederanlaufprüfungen gesichert.

## Security sowie DEV/TST/PRD

Worker autorisieren aus aktuellem Serverzustand und besitzen keine
Superuserwirkung. Jobnutzdaten enthalten keine Secrets oder Rechtecache.
Umgebungen teilen weder Queue, Datenbank, Identität noch Auditstore. TST darf
geschützte Detaildiagnose anbieten; in PRD existiert keine Debugkonsole.

## Migration, Verifikation und Rückbau

AP-10 implementiert Lebenszyklus, Auditretention und Reparaturläufe; frühere
Arbeitspakete führen benötigte Jobs kontrolliert ein. Vorher wird blockierend
geprüft, dass `pg-boss` ohne Runtime-DDL betrieben werden kann.

Integrationstests prüfen atomare Jobanlage, Doppelverarbeitung, Backoff,
Dead-Letter, Versionswechsel, kontrolliertes Herunterfahren, Fristrennen,
Setlistmarker, Binärkompensation und Retention.

Ein Brokerwechsel benötigt ein ersetzendes ADR und einen drainbaren,
idempotenten Parallelpfad. Offene Jobs werden versioniert migriert oder
kontrolliert abgeschlossen. Lösch- und Auditgrenzen dürfen beim Rückbau nicht
abgeschwächt werden.

## Offene Annahmen

Die konkrete `pg-boss`-Version unterstützt kontrollierte externe
Schemamigration ohne Runtime-DDL. Dies ist eine offene blockierende technische
Verifikation vor der Implementierung.
