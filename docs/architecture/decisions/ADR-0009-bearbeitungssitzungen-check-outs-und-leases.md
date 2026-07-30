# ADR-0009: Bearbeitungssitzungen, Check-outs und Leases

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Gemeinsam bearbeitbare Objekte benötigen sichtbare Präsenz und exklusive
Speicherberechtigung, ohne Login-Sitzung, Browser-Tab, PostgreSQL-Sperre und
fachlichen Check-out zu vermischen.

## Ziele und Nicht-Ziele

Ziele sind deterministische Leases, sichere Mehrfachsitzungen,
zustandsabhängige Speicherung und kontrollierte Rücknahme. Lange SQL-Sperren,
WebSockets, Warteschlangen und Check-out-Umgehung durch Administratoren sind
keine MVP-Ziele.

## Entscheidungskriterien

- Schutz vor stiller Überschreibung,
- Verhalten bei Zeit-, Netzwerk- und Konkurrenzfehlern,
- Datenschutz der Präsenzanzeige,
- geringe Laufzeit- und Betriebskomplexität,
- deterministische Testbarkeit.

## Betrachtete Optionen

1. **Status quo:** Nur fachliche Check-out-Regeln, keine technische
   Sitzungsarchitektur.
2. **Angenommen:** Serverseitige EditSession und persistenter
   PostgreSQL-Check-out mit kurzer Lease.
3. **Alternative:** Lange Datenbanksperren oder WebSocket-basierte
   Kollaborationssperren. Beide sind störanfälliger und koppeln
   Speicherberechtigung an Verbindungen.

## Entscheidung und Begründung

Eine serverseitige `EditSession` ist von Login- und Gerätesitzung getrennt.
Jede Browser- beziehungsweise Tabsitzung besitzt eigenen Status. Edit-Präsenz
wird auch bei aktuell allein bearbeitbaren Objekten geführt. Sie erteilt keine
Rechte und blockiert niemanden.

Ein persistenter PostgreSQL-Check-out erlaubt höchstens einen aktiven
Check-out je Objekt. Er ist kein langer SQL-Lock. Initial gelten:

- Online-Lease: 2 Minuten,
- Heartbeat: alle 30 Sekunden,
- erste Warnung: 45 Sekunden vor Ablauf,
- deutliche Warnung: 15 Sekunden vor Ablauf.

Serverzeit ist maßgeblich. Nach Lease-Ablauf ist Speichern verboten; ein alter
Client erwirbt nicht still neu.

Jeder Save prüft atomar:

- Login- und Gerätesitzung,
- EditSession,
- Check-out und Lease,
- Rechte,
- Objekt- und Löschstatus,
- Revision,
- Fachinvarianten.

Eine zweite eigene Sitzung darf den Check-out bewusst übernehmen. Die alte
Sitzung verliert serverseitig die Speicherberechtigung; lokale Eingaben dürfen
als Entwurf erhalten bleiben. Ein zentraler Beendigungsdienst verwendet
explizite Gründe für Verlassen, Ablauf, Rechteentzug, Löschung, Rücknahme und
Übernahme.

Rücknahmeberechtigungen folgen dem Produktmodell. Normale Bandmitgliedschaft
genügt nicht. Plattformadministratoren dürfen Check-outs zurücknehmen, aber
nicht umgehen. Berechtigungsänderung, Eigentumsübertragung, Löschvormerkung und
Rücknahme bleiben trotz Check-out möglich. Löschvormerkung beendet den
Check-out sofort.

REST bleibt Wahrheitsquelle. Server-Sent Events sind nur
Aktualisierungshinweise; Polling ist der Fallback. WebSockets,
Check-out-Warteschlange und Freigabebenachrichtigung gehören nicht zum MVP.
Sichtbar sind nur Anzeigename, Beginn, Ablauf und Eigenstatus, keine E-Mail-
oder Geräteinformationen.

## Folgen und Risiken

Kurze Leases begrenzen verwaiste Sperren, reagieren aber empfindlich auf
Netzstörungen. Warnungen und lokale Entwurfsrettung reduzieren Datenverlust,
vermitteln jedoch keine Serverberechtigung. Datenbankzeit und Heartbeats
benötigen Last- und Störfalltests.

Persistente Check-outs sind portabel mit dem relationalen Fachmodell.
Injizierbare Uhr, kontrollierte Sitzungskennungen und Transaktionstests machen
Zeit- und Konkurrenzfälle reproduzierbar.

Die Portabilität bleibt erhalten, weil Leases auf Anwendungscode,
Datenbankzeit und transaktionalen Datensätzen statt auf proprietären
Sperrdiensten beruhen.

## Security sowie DEV/TST/PRD

Jede Speicherung autorisiert neu; Präsenz und Check-out sind keine Rechte.
SSE-Nachrichten enthalten nur erlaubte Minimaldaten. Umgebungen teilen keine
Sitzungen oder Check-outs. TST besitzt geschützte Störfalldiagnose; PRD keine
Debugroute oder Debugports.

## Migration, Verifikation und Rückbau

AP-08 implementiert EditSession, Check-out, Lease, SSE und Polling. Tests decken
Zeitgrenzen, Heartbeats, Warnungen, Mehrfachtabs, Übernahme, Netzwerkverlust,
Rechteentzug, Eigentumswechsel, Löschung, Revision und Administratoreingriff ab.

Leasewerte können nach begründeter TST-Messung konfiguriert geändert werden.
Ein anderes Koordinationsmodell benötigt ein ersetzendes ADR und
Kompatibilitätsmigration aktiver Check-outs. Bei Rückbau werden aktive Leases
kontrolliert beendet; lokale Entwürfe bleiben als nicht speicherberechtigt
sichtbar.

## Offene Annahmen

Die initialen Lease- und Heartbeatwerte sind unter den Referenzverbindungen
ausreichend. TST muss dies vor MVP-Freigabe belegen.
