# Lokale Laufzeitrollen starten und prüfen

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-02
- Bezogenes Issue: [#13](https://github.com/tomas-fuerl/SoSeBaMa/issues/13)
- Geltungsbereich: ausschließlich lokales DEV

## Ziel und Grenzen

Web, API und Worker starten als drei getrennte technische Rollen. Der Schnitt
enthält nur eine technische Webansicht, API-Health und einen leeren Worker. Er
enthält keine Fachroute, Navigation, Jobregistrierung, Datenbankverbindung,
Secrets, Telemetrieintegration, Container oder Zugriffe auf TST und PRD.

Das Web erhält keine serverinterne Konfiguration. API und Worker lesen ihre
expliziten Werte ausschließlich über das serverseitige Paket `@sobama/config`.
Die wertfreie [`.env.example`](../../.env.example) dokumentiert nur Namen und
Platzhalter; sie wird nicht automatisch geladen.

## Voraussetzungen

1. Die [lokale Entwicklungsgrundlage](LOCAL-DEVELOPMENT.md) ist vollständig
   eingerichtet.
2. Der Checkout enthält keine unbekannten Änderungen.
3. Zwei freie lokale Ports für Web und API sind bekannt. In den folgenden
   Befehlen werden `<LOCAL_WEB_PORT>` und `<LOCAL_API_PORT>` vor der Ausführung
   durch diese ausschließlich lokalen Werte ersetzt.
4. Es werden keine Secrets oder privaten Infrastrukturwerte gesetzt.

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

   Erwartet wird Exit-Code `0`. Die Tests starten und stoppen Web, API und
   Worker kontrolliert und prüfen auch nicht bereite, fehlerhafte und ungültig
   konfigurierte Zustände.

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
   Portplatzhalter wird vor der Ausführung ersetzt:

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

   Erwartet wird eine einzelne JSON-Zeile mit dem Ereignis `runtime.started`
   und der Rolle `api`.

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
   technischer Fehler liefert HTTP `503` mit `error`. Die Antworten enthalten
   weder Umgebungswerte noch Diagnose- oder Fachdaten.

4. Im Startterminal `Ctrl-C` drücken. Die API muss herunterfahren und die
   Health-Endpunkte dürfen danach nicht mehr erreichbar sein. Der direkte
   Node-Prozess meldet `runtime.stopped` und endet mit Exit-Code `0`; pnpm kann
   den absichtlichen interaktiven Abbruch zusätzlich als `SIGINT` melden.

## Worker starten und stoppen

1. In einem eigenen Terminal die Umgebung setzen und den gebauten Worker
   starten:

   ```sh
   export SOSEBAMA_ENVIRONMENT="DEV"
   pnpm build
   pnpm start:worker
   ```

   Erwartet wird eine JSON-Zeile mit `runtime.started` und der Rolle `worker`.
   Der Prozess registriert keine Jobs und besitzt keine Datenbankabhängigkeit.

2. `Ctrl-C` drücken. Der direkte Node-Prozess meldet `runtime.stopped`; danach
   muss der Worker beendet sein. pnpm kann den absichtlichen interaktiven
   Abbruch zusätzlich als `SIGINT` melden.

## Fehlerbehandlung

- **Fehlende oder ungültige Konfiguration:** Der API- oder Workerprozess endet
  mit Exit-Code ungleich `0`. Die Fehlermeldung nennt nur den Variablennamen
  und die erwartete Form, niemals den übergebenen Wert.
- **Port bereits belegt:** API oder Web nicht mit einem anderen ungeprüften
  Wert erzwingen. Einen freien lokalen Port wählen und den Start wiederholen.
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
