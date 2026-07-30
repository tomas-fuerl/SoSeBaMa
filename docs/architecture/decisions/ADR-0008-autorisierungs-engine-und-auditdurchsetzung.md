# ADR-0008: Autorisierungs-Engine und Auditdurchsetzung

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Das Produktmodell kombiniert globale Aktionsrechte, Objektberechtigungen,
Eigentümerausnahmen, Bandvertretung, Zustände, Audit und Step-up. Diese Regeln
müssen in API, Worker, Domäne und Abfragen identisch gelten.

## Ziele und Nicht-Ziele

Ziele sind eine zentrale deterministische Policy-Engine, sichere
Bestandsfilterung und transaktionale Auditdurchsetzung. Eine externe
Policy-Engine, Redis-Rechtecache, Rechte in JWTs und pauschale technische
Bypässe sind keine MVP-Ziele.

## Entscheidungskriterien

- Übereinstimmung mit dem Produktmodell,
- sichere Fehler- und Bestandsoffenlegung,
- transaktionale Integrität,
- geringe Cache- und Betriebskomplexität,
- vollständige automatisierte Testbarkeit.

## Betrachtete Optionen

1. **Status quo:** Regeln nur in Produktdokumenten, ohne technische
   Durchsetzungsarchitektur.
2. **Angenommen:** Zentrale interne typisierte Policy-Engine mit
   autorisierungsbewussten Repositories und verpflichtendem Auditkontext.
3. **Alternative:** Externe Policy-Engine mit verteiltem Rechtecache. Dies
   erhöht Vertrags-, Ausfall- und Invalidierungskomplexität.

## Entscheidung und Begründung

Eine zentrale interne typisierte Policy-Engine verwendet ein stabiles
technisches Aktionsregister. Für jede Aktion beschreibt es:

- globales Aktionsrecht,
- Objektberechtigung,
- Eigentümerausnahme,
- Bandvertretung,
- Administratorausnahme,
- Objektzustand,
- Auditpflicht,
- Step-up-Pflicht,
- zulässige Fehleroffenlegung.

Die Auswertung ist deterministisch:

1. technischer Anfragekontext,
2. Subjektstatus,
3. Objektzustand,
4. dokumentierte Administratorausnahme,
5. dokumentierte Sonderregel,
6. normale Zwei-Ebenen-Regel,
7. Integritätsprüfung,
8. Audit und Transaktion.

Positive Rechte werden additiv ausgewertet. Repositoryabfragen sind
autorisierungsbewusst. Unsichtbare Einzelobjekte ergeben 404. Sichtbarkeit wird
vor Pagination, Counts und Facetten gefiltert.

Bestands-, Sichtbarkeits-, Count- und Facettenfilter werden innerhalb der
SQL-Abfrage angewendet. Die Autorisierung erfolgt vor `LIMIT`, Cursorbildung,
Pagination, Counts, Aggregationen und Facetten. Nachträgliches
In-Memory-Filtering bereits paginierter, gezählter oder aggregierter Datensätze
ist unzulässig. Unautorisierte Zeilen dürfen weder geladen noch in
Gesamtzahlen, Seitengrenzen oder Filterwerten berücksichtigt werden.

Einzelobjektprüfungen und Bestandsabfragen verwenden dieselbe zentrale
Policysemantik. Die backendseitigen autorisierungsbewussten Repositories
erzeugen die erforderlichen SQL-Filter. PostgreSQL-RLS wird im MVP weiterhin
nicht verwendet und bildet keine eigene Autorisierungsentscheidung.

Memoisierung bleibt ausschließlich an Anfrage oder Transaktion gebunden. Es
gibt im MVP keinen Redis-Rechtecache und keine Rechte in JWTs. Durchsetzung
erfolgt in Transport, Application Service, Domäne sowie Repository und
Datenbank.

Auditpflichtige Fachaktion und Audit werden in derselben Transaktion
geschrieben. Ein fehlender Auditkontext blockiert die Fachaktion. Abgelehnte
sicherheitsrelevante Aktionen werden sicher außerhalb der fehlgeschlagenen
Fachtransaktion protokolliert.

Akteurtypen sind getrennt:

- `HumanUser`,
- `PlatformAdministrator`,
- `SystemWorker`,
- `MigrationProcess`,
- `TechnicalTestIdentity`.

Gemeinsame Administratorkonten sind ausgeschlossen. Worker haben keine
pauschale Superuserwirkung. Migratoren sind keine fachlichen Benutzer.
TST-Testidentitäten besitzen keinen fachlichen Bypass.

Aus dem Aktionsregister wird eine Autorisierungs-Entscheidungsmatrix generiert.
Unit-, SQL-, API-, Worker-, Negativ- und eigenschaftsbasierte Tests prüfen sie.

## Folgen und Risiken

Die Engine zentralisiert Semantik, darf aber nicht zur versteckten
Allzweckschicht werden. Repositoryfilter und Transaktionskontext benötigen
strenge Schnittstellen. Fehler in der Matrix können breit wirken und werden
deshalb mit Negativ- und Eigenschaftstests abgesichert.

Die interne Engine bleibt portabel und ohne externen Dienst betreibbar.
Typisierte Entscheidungen und generierte Matrix erhöhen Nachvollziehbarkeit und
Testbarkeit.

Die Portabilität bleibt erhalten, weil Fachregeln hinter eigenen
Autorisierungsfassaden liegen und nicht an einen externen Policy-Dienst
gekoppelt werden.

## Security sowie DEV/TST/PRD

Alle Umgebungen verwenden dieselben Policys. Identitäten, Daten und Auditstores
bleiben getrennt. TST darf geschützte Entscheidungsdiagnose ohne Secrets oder
unnötige Fachdaten bieten. In PRD fehlen Policy-Debugwege; externe Fehler zeigen
nur die erlaubte Offenlegung. Nur Backend und Worker führen Policys aus.

## Migration, Verifikation und Rückbau

AP-03 führt Register, Engine, Repositoryfilter und Auditkontext ein. Tests
vergleichen Produktmatrix und Implementierung, prüfen 404-Schutz, Counts,
Workerrechte, Transaktionsabbruch und getrennte Akteurtypen.

Eine externe Engine oder andere Policyarchitektur benötigt ein ersetzendes ADR.
Ein Parallelbetrieb muss identische Entscheidungen gegen denselben
synthetischen Korpus liefern, bevor die interne Engine entfernt wird.

## Offene Annahmen

Das Aktionsregister lässt sich vollständig aus den angenommenen
Produktentscheidungen ableiten. Jede neue Aktion benötigt vor Implementierung
eine explizite fachliche Einordnung.
