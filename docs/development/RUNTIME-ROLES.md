# Lokale Laufzeitrollen starten und prüfen

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-13
- Bezogenes Issue: [#13](https://github.com/tomas-fuerl/SoSeBaMa/issues/13)
- Geltungsbereich: ausschließlich lokales DEV

## Ziel und Grenzen

Web, API und Worker starten als drei getrennte technische Rollen. Der Schnitt
enthält nur eine technische Webansicht sowie Health-Endpunkte für API und
Worker; der Worker verarbeitet keine Aufgaben. Er
enthält keine Fachroute, Navigation, Jobregistrierung, Datenbankverbindung,
Secrets, Collector, Telemetriespeicher oder Zugriffe auf TST und PRD. API und
Worker verwenden die [DEV-Telemetriegrundlage](OBSERVABILITY.md). Diese
Anleitung beschreibt direkte Hostprozesse. Der getrennte Containerablauf steht
in der [DEV-Containeranleitung](DEV-CONTAINERS.md).

Das Web erhält keine serverinterne Konfiguration. API und Worker lesen ihre
expliziten Werte ausschließlich über das serverseitige Paket `@sobama/config`.
Die wertfreie [`.env.example`](../../.env.example) dokumentiert nur Namen und
Platzhalter; sie wird nicht automatisch geladen.

## Voraussetzungen

1. Die [lokale Entwicklungsgrundlage](LOCAL-DEVELOPMENT.md) ist vollständig
   eingerichtet.
2. Der Checkout enthält keine unbekannten Änderungen.
3. Freie lokale Ports für Web, API und den Worker-Health-Endpunkt sind bekannt.
   In den folgenden Befehlen werden `<LOCAL_WEB_PORT>`, `<LOCAL_API_PORT>` und
   `<LOCAL_WORKER_HEALTH_PORT>` vor der Ausführung durch diese ausschließlich
   lokalen Werte ersetzt. Der Worker-Health-Port ist optional; ohne Angabe gilt
   `3001`.
4. Es werden keine Secrets oder privaten Infrastrukturwerte gesetzt.
5. Die API bindet in DEV ausschließlich an `localhost`, `127.0.0.1` oder
   `::1`. Eine externe Interface- oder LAN-Bindung wird von der
   Konfigurationsvalidierung abgelehnt.
6. API und Worker akzeptieren in diesem lokalen Teilschnitt ausschließlich
   `DEV`. Werte für TST oder PRD werden vor dem Start abgelehnt.

## Bauen und automatisiert prüfen

1. Abhängigkeiten aus dem fixierten Lockfile installieren:

   ```sh
   pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   ```

2. Alle statischen Prüfungen, Builds, Laufzeittests und
   Markdown-Dateizielprüfungen ausführen:

   ```sh
   pnpm check
   ```

   Erwartet wird Exit-Code `0`. Die Tests starten die gebauten API- und
   Worker-Einstiegspunkte als eigene Prozesse, senden `SIGINT` beziehungsweise
   `SIGTERM` und prüfen Start-, Stopp- und Fehlerereignisse sowie Exit-Codes und
   harte Timeouts. Der Webtest lädt die Startseite und führt den echten
   React-Bootstrap in einer DOM-Umgebung aus. Zusätzlich werden Healthzustände
   und ungültige Konfigurationen geprüft.

## Web starten und stoppen

1. In einem eigenen Terminal den sichtbaren Platzhalter ersetzen und starten:

   ```sh
   pnpm dev:web -- --port "<LOCAL_WEB_PORT>" --strictPort
   ```

2. Die angezeigte lokale Adresse öffnen. Erwartet werden nur der Titel
   `SoSeBaMa` und der technische Bereitschaftstext. Eine Navigation oder
   Fachfunktion darf nicht sichtbar sein.
3. `health.json` unter derselben lokalen Adresse abrufen. Erwartet werden die
   Rolle `web` und der Status `ready`.
4. Im Startterminal `Ctrl-C` drücken. Der Prozess muss enden und die lokale
   Adresse darf anschließend nicht mehr erreichbar sein.

## API starten, Health prüfen und stoppen

1. In einem eigenen Terminal die rein lokale DEV-Konfiguration setzen. Der
   Portplatzhalter wird vor der Ausführung ersetzt. Für den Host ist in DEV nur
   ein Loopbackwert zulässig:

   ```sh
   export SOSEBAMA_ENVIRONMENT="DEV"
   export SOSEBAMA_API_HOST="localhost"
   export SOSEBAMA_API_PORT="<LOCAL_API_PORT>"
   ```

2. API bauen und starten:

   ```sh
   pnpm build
   pnpm start:api
   ```

   Erwartet wird eine Pino-JSON-Zeile mit dem Ereignis `runtime.started`, dem
   Service `sobama-api`, der Rolle `api` und der Umgebung `DEV`.

3. Die drei technischen Endpunkte über die lokale API-Adresse prüfen:

   ```sh
   curl "http://localhost:<LOCAL_API_PORT>/health/startup"
   curl "http://localhost:<LOCAL_API_PORT>/health/live"
   curl "http://localhost:<LOCAL_API_PORT>/health/ready"
   ```

   | Endpunkt | Erfolgsstatus | Bedeutung |
   | --- | --- | --- |
   | `/health/startup` | `started` | Der HTTP-Prozess ist gestartet. |
   | `/health/live` | `alive` | Der Prozess ist nicht im Fehlerzustand. |
   | `/health/ready` | `ready` | Die Rolle darf Anfragen annehmen. |

   Ein nicht bereiter Zustand liefert HTTP `503` mit `not-ready`. Ein
   technischer Fehler liefert HTTP `503` mit `error`. Beim ersten
   Shutdown-Signal wechselt die API vor dem Schließen auf `not-ready`. Eine
   spätere Drain-Zeit folgt im Containerarbeitspaket. Die Antworten enthalten
   weder Umgebungswerte noch Diagnose- oder Fachdaten.

4. Im Startterminal `Ctrl-C` drücken. Die API muss herunterfahren und die
   Health-Endpunkte dürfen danach nicht mehr erreichbar sein. Der direkte
   Node-Prozess meldet `runtime.stopped` und endet mit Exit-Code `0`; pnpm kann
   den absichtlichen interaktiven Abbruch zusätzlich als `SIGINT` melden.

## Worker starten, Health prüfen und stoppen

Der Worker besitzt keine Fachroute. Er beantwortet ausschließlich drei
technische Health-Endpunkte auf einem eigenen lokalen Port. Die Bindeadresse
`127.0.0.1` ist eine Konstante unmittelbar am Listener und weder über die
Umgebung noch über einen Programmaufruf beeinflussbar; konfigurierbar ist allein
der Port. Damit wird der Worker durch keine Konfiguration zu einem
Netzwerkdienst.

1. In einem eigenen Terminal die Umgebung setzen und den gebauten Worker
   starten. Der Portplatzhalter ist optional; ohne ihn gilt `3001`:

   ```sh
   export SOSEBAMA_ENVIRONMENT="DEV"
   export SOSEBAMA_WORKER_HEALTH_PORT="<LOCAL_WORKER_HEALTH_PORT>"
   pnpm build
   pnpm start:worker
   ```

   Erwartet wird eine JSON-Zeile mit `runtime.started` und der Rolle `worker`.
   Der Prozess registriert keine Jobs und besitzt keine Datenbankabhängigkeit.

2. Die drei technischen Endpunkte prüfen:

   ```sh
   curl "http://127.0.0.1:<LOCAL_WORKER_HEALTH_PORT>/health/startup"
   curl "http://127.0.0.1:<LOCAL_WORKER_HEALTH_PORT>/health/live"
   curl "http://127.0.0.1:<LOCAL_WORKER_HEALTH_PORT>/health/ready"
   ```

   | Endpunkt | Erfolgsstatus | Bedeutung |
   | --- | --- | --- |
   | `/health/startup` | `started` | Der Prozess ist gestartet. |
   | `/health/live` | `alive` | Der Prozess ist nicht im Fehlerzustand. |
   | `/health/ready` | `ready` | Die Rolle ist betriebsbereit. |

   Ein nicht bereiter Zustand liefert HTTP `503` mit `not-ready`, ein
   technischer Fehler HTTP `503` mit `error`. Beim ersten Shutdown-Signal
   wechselt der Worker vor dem Schließen auf `not-ready`. Jeder andere Pfad
   liefert HTTP `404` ohne Inhalt. Zulässig sind ausschließlich `GET` und
   `HEAD`; `HEAD` liefert Status und Header wie `GET`, aber keinen Rumpf. Jede
   andere Methode liefert HTTP `405` mit dem Header `Allow: GET, HEAD`. Die
   Antworten enthalten weder Umgebungswerte noch Diagnose- oder Fachdaten.

3. `Ctrl-C` drücken. Der direkte Node-Prozess meldet `runtime.stopped`; danach
   muss der Worker beendet und der Health-Port geschlossen sein. pnpm kann den
   absichtlichen interaktiven Abbruch zusätzlich als `SIGINT` melden.

## Fehlerbehandlung

- **Fehlende oder ungültige Konfiguration:** Der API- oder Workerprozess endet
  mit Exit-Code ungleich `0`. Die Fehlermeldung nennt nur den Variablennamen
  und die erwartete Form, niemals den übergebenen Wert.
- **Nicht lokaler API-Host in DEV:** Der Start endet mit `runtime.failed` und
  Exit-Code `1`. Keine externe Bindung erzwingen; einen der dokumentierten
  Loopbackwerte verwenden.
- **TST oder PRD als lokale Laufzeitumgebung:** Der Start endet mit
  `runtime.failed` und Exit-Code `1`. Der Teilschnitt ist nicht für diese
  Umgebungen freigegeben; den Wert nicht lokal umgehen oder vortäuschen.
- **Port bereits belegt:** API oder Web nicht mit einem anderen ungeprüften
  Wert erzwingen. Einen freien lokalen Port wählen und den Start wiederholen.
- **Worker-Health-Port bereits belegt:** Der Start endet mit `runtime.failed`
  und Exit-Code `1`, bevor der Worker bereit meldet. Das ist beabsichtigt: Ein
  Worker ohne erreichbaren Health-Endpunkt wäre von außen nicht beobachtbar.
  Einen freien lokalen Port über `SOSEBAMA_WORKER_HEALTH_PORT` setzen.
- **Fehler beim Herunterfahren:** API oder Worker meldet
  `runtime.shutdown-failed` und Exit-Code `1`. Der Prozess darf nicht als
  erfolgreich gestoppt bewertet werden; verbliebene lokale Prozesse werden
  kontrolliert beendet.
- **Health meldet `not-ready` oder `error`:** Keine Fachanfrage senden. Den
  lokalen Prozess stoppen und zuerst den fehlgeschlagenen Test oder Startfehler
  untersuchen.
- **Unerwartete Route oder Datenbankabhängigkeit:** Abbrechen. Beides liegt
  außerhalb von Issue #13 und benötigt einen eigenen reviewten Teilschnitt.

## Verifikation und Rollback

Nach dem Stopp darf kein Rollenprozess weiterlaufen. `git status --short` darf
nur beabsichtigte Quelländerungen zeigen; lokale Buildausgaben sind ignoriert.
TST und PRD werden von keinem Schritt erreicht.

Der Teilschnitt besitzt keine Daten oder Migrationen. Ein Rollback besteht aus
dem Revert der Quelländerungen und dem Stoppen noch laufender lokaler Prozesse.

## Pflege

Der Projekteigentümer prüft diese Anleitung bei jeder Änderung der
Startkommandos, Konfigurationsvariablen, Healthzustände oder Laufzeitrollen.
