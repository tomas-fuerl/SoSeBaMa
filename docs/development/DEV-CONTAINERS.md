# Lokalen DEV-Containerrahmen starten und zurückbauen

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-13
- Bezogenes Issue: [#15](https://github.com/tomas-fuerl/SoSeBaMa/issues/15)
- Geltungsbereich: ausschließlich lokales DEV

## Ziel und Grenzen

Web, API und Worker laufen als getrennte, gehärtete Container. Caddy ist der
einzige Hosteingang und bindet ausschließlich an einen vom Ausführenden
gewählten lokalen Loopback-Port. Der sichtbare Sollzustand besteht aus der
technischen Webansicht sowie den secretfreien Gateway-, Web- und API-Health-
Antworten.

Dieser Schnitt erstellt oder erreicht weder TST noch PRD. Er enthält keine
Datenbank, Fachroute, produktiven Werte, Secrets, persistenten Daten,
Collector oder Telemetriespeicher. API und Worker verwenden die getrennt
dokumentierte [DEV-Telemetriegrundlage](OBSERVABILITY.md) ohne Export.

## Sicherheitsgrenzen

- Keine `.env`-Datei mit Secrets anlegen oder an Compose übergeben.
- Nur einen freien lokalen Port als `SOSEBAMA_DEV_GATEWAY_PORT` setzen. Keine
  LAN-Adresse, Domain oder Weiterleitung konfigurieren.
- `compose.yaml` und `compose.dev.yaml` immer gemeinsam verwenden. Keine
  TST-/PRD-Datei ergänzen oder nachbilden.
- API, Web und Worker besitzen keine Hostports. Nur Caddy verbindet das
  `edge`- mit dem internen `application`-Netz.
- Der Worker beantwortet seine Health-Endpunkte ausschließlich auf dem
  containerinternen Loopback `127.0.0.1`. Der Bind-Host ist im Code eine
  Konstante; keine Umgebungsvariable kann ihn erweitern. Der Endpunkt ist weder
  aus dem `application`-Netz noch vom Host erreichbar und besitzt keinen
  Hostport.
- Alle Container laufen als Nicht-Root, mit read-only Root-Dateisystem, ohne
  hinzugefügte Capabilities und mit `no-new-privileges`. Docker-Socket,
  Host-PID/-IPC, Geräte, Hostnetz und persistente Volumes fehlen.
- DEV-Services verwenden ausschließlich die zuvor lokal gebauten Images.
  Compose darf fehlende DEV-Images nicht aus einer Registry laden.
- Der API-Containerbind wird ausschließlich durch den eigenen
  Container-Entrypoint freigegeben. Eine Prozessvariable kann einen direkten
  lokalen API-Start nicht von Loopback auf `0.0.0.0` umschalten.

## Voraussetzungen

1. Die [lokale Entwicklungsgrundlage](LOCAL-DEVELOPMENT.md) ist eingerichtet.
2. Der Checkout enthält keine unbekannten Änderungen.
3. Docker Desktop oder eine kompatible lokale Docker-Engine läuft.
4. Docker Compose V2 ist verfügbar.
5. Für den Build sind die öffentlichen Docker- und npm-Registrys erreichbar.
6. Ein freier lokaler Port ist bekannt. Der sichtbare Platzhalter
   `<LOCAL_GATEWAY_PORT>` wird ausschließlich lokal ersetzt.

## Validieren und bauen

1. Repository- und Werkzeugzustand prüfen:

   ```sh
   git status --short --branch
   docker --version
   docker compose version
   ```

   Erwartet werden der beabsichtigte Branch, keine unbekannten Änderungen und
   eine erreichbare Docker-Engine mit Compose V2. Bei fremden Änderungen oder
   einer nicht erreichbaren Engine wird abgebrochen.

2. Im selben Terminal einen freien lokalen Port setzen:

   ```sh
   export SOSEBAMA_DEV_GATEWAY_PORT="<LOCAL_GATEWAY_PORT>"
   ```

   Die Variable enthält weder ein Secret noch einen Hostnamen. Sie bleibt
   ausschließlich in diesem lokalen Terminal.

3. Compose-Konfiguration und beide Anwendungsimages prüfen und bauen:

   ```sh
   pnpm container:check
   ```

   Erwartet wird Exit-Code `0`. Die Images `sosebama-web:dev` und
   `sosebama-backend:dev` entstehen aus exakt gepinnten Basisimages. API und
   Worker verwenden dasselbe Backendimage mit getrennten Startkommandos.

## Starten und prüfen

1. Den DEV-Stack starten und alle Healthchecks abwarten:

   ```sh
   pnpm container:up
   ```

   Erwartet wird Exit-Code `0`. Gateway, Web, API und Worker müssen `Healthy`
   erreichen. Der Gatewaycheck ruft dabei auch Web und API über Caddy auf.
   Fehlt ein lokales DEV-Image, bricht der Start ab, ohne es aus einer Registry
   zu laden. Alle vier Healthchecks prüfen Rolle und Status der Antwort; ein
   bloßer HTTP-Erfolg genügt keinem der Checks.

2. Die lokale Gatewayadresse anzeigen:

   ```sh
   pnpm container:port
   ```

   Erwartet wird `127.0.0.1:<LOCAL_GATEWAY_PORT>`. Eine andere Hostadresse ist
   ein Abbruchgrund.

3. Den Hosteingang und alle drei technischen Healthantworten automatisiert
   prüfen:

   ```sh
   pnpm container:smoke
   ```

   Erwartet wird Exit-Code `0`. Der Befehl prüft Gateway, Web und API über
   `127.0.0.1:<LOCAL_GATEWAY_PORT>` und damit denselben Hostpfad wie ein lokaler
   Client.

4. Den Healthzustand aller vier Rollen maschinell prüfen:

   ```sh
   pnpm container:health
   ```

   Erwartet wird Exit-Code `0`. Der Befehl fordert für Gateway, Web, API und
   Worker den Docker-Healthzustand `healthy`. Er ist der einzige externe
   Nachweis für den Worker: Dieser veröffentlicht keinen Port und liegt im
   internen Netz, ist also über den Hosteingang aus `pnpm container:smoke`
   grundsätzlich nicht erreichbar.

5. Die strukturierten API- und Worker-Startlogs prüfen:

   ```sh
   pnpm container:logs
   ```

   Erwartet wird Exit-Code `0`. Beide Rollen liefern begrenztes Pino-JSON für
   `runtime.started`; PID und Hostname fehlen. Der vollständige Datenvertrag
   steht in der [DEV-Telemetrieanleitung](OBSERVABILITY.md).

6. Bei Bedarf die Antworten einzeln ausschließlich über Caddy anzeigen:

   ```sh
   curl --fail --silent --show-error "http://127.0.0.1:<LOCAL_GATEWAY_PORT>/health/gateway"
   curl --fail --silent --show-error "http://127.0.0.1:<LOCAL_GATEWAY_PORT>/health.json"
   curl --fail --silent --show-error "http://127.0.0.1:<LOCAL_GATEWAY_PORT>/api/health/ready"
   ```

   Erwartet werden die Rollen `gateway`, `web` und `api` jeweils mit Status
   `ready`. Andere Antworten, Weiterleitungen oder Fachinhalte sind Fehler.

7. Containerstatus und veröffentlichte Ports prüfen:

   ```sh
   pnpm container:status
   ```

   Alle vier Rollen müssen gesund sein. Ausschließlich `gateway` darf die
   lokale Portbindung zeigen. API, Web und Worker dürfen keinen Hostport
   besitzen.

## Ausfallnachweis für den Worker

Dieser Nachweis belegt, dass der Worker-Healthcheck eine blockierte Laufzeit
tatsächlich erkennt. Er ist nicht destruktiv, verändert keine Daten und wird im
laufenden Stack ausgeführt.

Wichtig: Wegen `init: true` ist PID 1 im Container der Docker-Init-Prozess, nicht
die Node-Laufzeit. `docker compose kill` trifft deshalb PID 1 und blockiert den
Worker nicht. Der Nachweis muss den Node-Prozess selbst adressieren.

1. Die PID der Node-Laufzeit im Worker ermitteln:

   ```sh
   docker compose -f compose.yaml -f compose.dev.yaml exec -T worker node -e 'const fs=require("node:fs");for(const p of fs.readdirSync("/proc")){if(!/^[0-9]+$/.test(p))continue;let c="";try{c=fs.readFileSync("/proc/"+p+"/cmdline","utf8")}catch{}if(c.includes("worker/dist/main.js")&&!c.includes("docker-init"))console.log(p)}'
   ```

   Erwartet wird genau eine PID ungleich `1`. Der Platzhalter `<WORKER_PID>`
   wird in den folgenden Schritten durch diesen Wert ersetzt.

2. Die Laufzeit anhalten und den Healthzustand beobachten:

   ```sh
   docker compose -f compose.yaml -f compose.dev.yaml exec -T worker node -e 'process.kill(<WORKER_PID>,"SIGSTOP")'
   docker inspect --format '{{.State.Health.Status}}' sosebama-dev-worker-1
   ```

   Der Zustand muss nach spätestens `interval` × `retries` von `healthy` auf
   `unhealthy` wechseln; gemessen wurden rund 60 Sekunden. Solange der Wechsel
   aussteht, wird der zweite Befehl wiederholt. `pnpm container:health` muss in
   diesem Zustand mit Exit-Code `1` enden.

3. Die Laufzeit fortsetzen und die Erholung prüfen:

   ```sh
   docker compose -f compose.yaml -f compose.dev.yaml exec -T worker node -e 'process.kill(<WORKER_PID>,"SIGCONT")'
   pnpm container:health
   ```

   Erwartet wird ein Wechsel zurück auf `healthy` innerhalb eines Intervalls und
   danach Exit-Code `0`. Es ist keine `restart`-Policy gesetzt; der Container
   wird also nicht neu gestartet und der Zustandswechsel bleibt beobachtbar.

## Kontrolliert stoppen und verifizieren

1. Im selben Terminal alle DEV-Container und temporären Netze entfernen:

   ```sh
   pnpm container:down
   ```

   Erwartet wird Exit-Code `0`. Der Befehl sendet zuerst das reguläre
   Stoppsignal und entfernt danach Container, Netze und gegebenenfalls
   ausschließlich diesem DEV-Projekt zugeordnete Volumes.

2. Den Rückbau maschinell prüfen:

   ```sh
   pnpm container:cleanup
   ```

   Erwartet wird Exit-Code `0`. Der Befehl schlägt fehl, falls Container oder
   Netze des Projekts `sosebama-dev` zurückbleiben. Die lokal gebauten Images
   bleiben für den nächsten Buildcache erhalten und enthalten keine Daten oder
   Secrets.

Die maschinellen Nachweise verwenden das vorhandene Node.js über
`tools/check-dev-containers.mjs`. `--help` beschreibt Eingabe und Kommandos.
Exit-Code `1` kennzeichnet einen fehlgeschlagenen Nachweis, Exit-Code `2` eine
fehlende oder ungültige Eingabe. Der Cleanup-Nachweis verändert keine
Ressourcen und kann gefahrlos wiederholt werden.

## Fehlerbehandlung

- **`SOSEBAMA_DEV_GATEWAY_PORT` fehlt:** Im selben Terminal einen freien
  lokalen Port setzen. Keinen Wert in eine versionierte Datei schreiben.
- **Port bereits belegt:** `pnpm container:down` ausführen, einen anderen
  freien lokalen Port setzen und erneut starten. Keine LAN-Bindung verwenden.
- **Docker-Engine nicht erreichbar:** Docker Desktop kontrolliert starten und
  `docker version` wiederholen. Nicht auf einen fremden Dockerhost ausweichen.
- **Registry- oder Buildfehler:** Den Stack nicht starten. Den unveränderten
  Build nach Wiederherstellung des öffentlichen Registryzugriffs wiederholen.
- **Lokales DEV-Image fehlt:** `pnpm container:check` erneut ausführen. Die
  Pull-Sperre nicht umgehen und keinen gleichnamigen Registry-Tag verwenden.
- **Container wird `unhealthy` oder beendet sich:** Keine Anfrage senden.
  Secretfreie DEV-Logs mit
  `docker compose -f compose.yaml -f compose.dev.yaml logs --no-color`
  lokal prüfen und anschließend `pnpm container:down` ausführen. Logs vor einer
  Weitergabe trotzdem auf vertrauliche lokale Eingaben prüfen.
- **Unerwarteter Hostport, Docker-Socket, Hostnetz, Hostnamespace, Gerät,
  Capability oder Rootbenutzer:** Sofort stoppen. Diese Abweichung darf nicht
  durch eine lokale Override-Datei umgangen werden.

## Rollback und Pflege

Der Containerrahmen besitzt keine Datenmigration und keine persistenten
Volumes. Der sichere Rückbau ist `pnpm container:down`; ein Code-Rollback
erfolgt ausschließlich über einen reviewten Revert. TST und PRD bleiben in
beiden Fällen unberührt.

Der Projekteigentümer prüft diese Anleitung bei Änderungen an Images,
Compose-Dateien, Startkommandos, Netzen, Healthchecks oder Härtungsoptionen.
