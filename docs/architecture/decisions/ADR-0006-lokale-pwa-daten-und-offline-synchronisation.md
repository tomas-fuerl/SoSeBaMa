# ADR-0006: Lokale PWA-Daten und Offline-Synchronisation

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Die PWA muss vorbereitete Daten, eigene Entwürfe und Synchronisationszustände
offline verwalten. Browsercache, lokale Datenbank, Schlüssel und
Serverberechtigungen dürfen dabei nicht verwechselt werden.

## Ziele und Nicht-Ziele

Ziele sind kontrollierte lokale Persistenz, verschlüsselte PDFs,
konfliktsichere Vordergrundsynchronisation und verständliche Sperrzustände. Eine
automatische Vollspiegelung, ein externer Synchronisationsdienst und
Background Sync als Verlässlichkeitsgrenze sind keine Ziele.

## Entscheidungskriterien

- Vertraulichkeit lokaler Daten,
- Datenintegrität und Migrationssicherheit,
- browserübergreifende Testbarkeit,
- explizite Offlineberechtigung und Konfliktbehandlung,
- begrenzter Speicher- und Betriebsaufwand.

## Betrachtete Optionen

1. **Status quo:** Keine festgelegte lokale Ablage oder Synchronisation.
2. **Angenommen:** IndexedDB mit Dexie, getrennten Bereichen, verschlüsselten
   PDF-Blöcken, Outbox und Änderungscursor.
3. **Alternative:** Cache API für Fachantworten und automatische
   Hintergrundsynchronisation. Dies bietet keine ausreichende fachliche
   Datenbank-, Schlüssel- oder Verlässlichkeitsgrenze.

## Entscheidung und Begründung

IndexedDB ist die strukturierte lokale Datenbank; Dexie 4 ist die
TypeScript-Abstraktion. Lokale Schemaversionen verwenden kontrollierte
Migrationen. Getrennte Bereiche speichern:

- autorisierte Serverstände,
- eigene Entwürfe,
- Outbox,
- Sync-Cursor,
- PDF-Manifeste und verschlüsselte PDF-Blöcke,
- Offline-Grants,
- Schlüsselmaterial,
- Appmetadaten.

Fachliche Daten werden nicht in `localStorage` gespeichert. Die Cache API ist
kein Fachdatenspeicher. Ein externer Synchronisationsdienst wird nicht
eingeführt.

PDFs werden blockweise mit AES-GCM-256 verschlüsselt. Jeder Datensatz oder Block
verwendet einen einmaligen IV und authentifizierte Zusatzdaten. Geschützter
Serverbestand und eigene lokale Entwürfe besitzen getrennte Schlüsselbereiche.
Web-Crypto-Schlüssel sind nicht exportierbar. Schlüssel und Klartext werden
nicht protokolliert. Fehlt ein Schlüssel, entsteht ein sichtbarer Sperrzustand.
Die Verschlüsselung schützt nicht gegen einen kompromittierten Browser, ein
kompromittiertes Betriebssystem oder XSS während berechtigter Nutzung.

Ein serverseitig signierter, zeitbegrenzter Offline-Grant begrenzt lokale
Nutzung. Er ist kein Online-Sessiontoken. Zeitmanipulation oder widersprüchliche
Zeit sperrt geschützte Nutzung bis zur Onlineprüfung.

Der Service Worker cached nur Anwendungsshell und öffentliche statische Assets.
Authentifizierte API-Antworten, PDFs und Fachobjekte liegen nie in der Cache API.
Vordergrundsynchronisation ist der verbindliche Weg; Background Sync ist nur
optionale Komfortoptimierung.

Die Synchronisation verwendet Outbox-Befehle und einen serverseitigen
Änderungscursor. Jeder Befehl führt Idempotenz, Revision, Check-out und
Abhängigkeiten. Ergebnisse sind mindestens `applied`, `duplicate`, `conflict`,
`forbidden`, `checkoutNeeded`, `deleted`, `invalid` und `retryable`.

Offlinevorbereitung erfolgt bewusst objekt- oder setlistbezogen, nicht als
Vollspiegelung. Speicherverfügbarkeit und Persistenz werden geprüft. Lokale
Daten werden bei Migrationsfehlern nicht automatisch gelöscht. Während einer
Synchronisation erfolgt kein Update; lokale Entwürfe lösen keinen erzwungenen
Reload aus. Der Server unterstützt mindestens die aktuelle und unmittelbar
vorherige Clientvertragsversion.

## Folgen und Risiken

Browserpersistenz kann vom Betriebssystem entzogen werden; der Zustand muss
sichtbar und wiederherstellbar sein. Blockverschlüsselung erhöht Speicher- und
CPU-Aufwand. Migrationsfehler benötigen einen sicheren Rettungsweg statt
automatischer Löschung.

Dexie kapselt IndexedDB, bindet aber an Browserplattformen. Die öffentlichen
Syncverträge erhalten die Portabilität zu einem späteren nativen Client.
Outbox und Cursor sind deterministisch testbar.

## Security sowie DEV/TST/PRD

Lokale Schlüssel, Grants und Fachinhalte werden nie geloggt oder über
Telemetrie übertragen. Serverautorisierung wird bei jeder Synchronisation neu
geprüft. DEV, TST und PRD signieren getrennte Grants und teilen keine lokalen
Namensräume oder Identitäten. PRD bietet keinen Debugzugriff auf lokale Daten.

## Migration, Verifikation und Rückbau

AP-09 implementiert lokale Daten und Synchronisation. Tests decken
Schemamigration, Speicherentzug, Schlüsselverlust, Zeitmanipulation, XSS-Grenze,
Idempotenz, alle Ergebnisarten, Rechteentzug, Löschung, Clientversionswechsel
und unterbrochene Synchronisation ab.

Eine Änderung der lokalen Datenbank oder Kryptografie erfolgt versioniert und
mit lesender Übergangsphase. Bei nicht migrierbaren Daten bleibt ein
benutzergesteuerter Export- oder Rettungsweg für eigene Entwürfe; geschützte
Serverdaten können neu vorbereitet werden. Ein ersetzendes ADR ist nötig.

## Offene Annahmen

Quota-, Persistenz- und Web-Crypto-Verhalten der unterstützten Browser erfüllt
die Referenzszenarien. Dies wird in TST einschließlich Safari/iPadOS geprüft.
