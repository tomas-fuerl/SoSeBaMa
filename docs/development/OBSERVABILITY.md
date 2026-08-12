# DEV-Telemetriegrundlage prüfen und sicher verwenden

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-12
- Bezogenes Issue: [#15](https://github.com/tomas-fuerl/SoSeBaMa/issues/15)
- Geltungsbereich: API und Worker ausschließlich in lokalem DEV

## Ziel und Grenzen

API und Worker schreiben maschinenlesbare, allowlist-begrenzte Pino-JSON-Logs. Die
gemeinsame serverseitige OpenTelemetry-Grundlage erzeugt begrenzte
Lifecycle-Traces und niedrig kardinale Metriken. Ein optionaler lokaler
OTLP-Collector darf ausfallen, ohne Start, Health oder kontrollierten Stopp der
Rollen zu blockieren.

Dieser Teilschnitt erstellt keinen Collector, kein Observability-Netz und
keinen Telemetriespeicher. Er erreicht weder TST noch PRD. Pino bleibt das
Logsystem; die noch in Entwicklung befindliche OpenTelemetry-Logunterstützung
wird nicht verwendet. Audit, Fachhistorie und Telemetrie bleiben getrennt.

## Sicherheits- und Datenregeln

- Logs enthalten ausschließlich die von der Observability-Schicht selbst
  gesetzten technischen Felder `time`, `level`, `environment`, `role`,
  `service`, `event` sowie bei Fehlern `stage` und gegebenenfalls `category`.
  Die öffentliche API akzeptiert weder freie Ereignisnamen noch zusätzliche
  Attribute oder Freitext. `pid` und `hostname` fehlen ebenfalls.
- Fehler aus Exportern werden ausschließlich als generisches technisches
  Ereignis protokolliert. Endpunkt und Fehlerinhalt werden nicht ausgegeben.
- Spans verwenden ausschließlich die fest codierten Namen `runtime.started`,
  `runtime.stopped`, `runtime.failed`, `runtime.shutdown-failed` und
  `runtime.propagation`. Die API akzeptiert keine frei gewählten Span-Namen.
  Spans enthalten keine dynamischen Attribute. Die Resource enthält nur
  Service, Namespace und `DEV`.
- `sobama.runtime.started` und `sobama.runtime.failed` besitzen keine
  Datenpunktattribute. Benutzer-, Objekt-, Band-, Job-, Session- und Trace-IDs
  sind damit nicht als Labels möglich.
- Der Propagator schreibt ausschließlich W3C `traceparent`. Externes Baggage
  wird weder übernommen noch weitergereicht.
- OTLP-URLs dürfen ausschließlich `localhost`, `127.0.0.1` oder `::1`
  adressieren und keine Zugangsdaten, Query oder Fragment enthalten. Secrets
  und Authentifizierungsheader werden nicht über Umgebungsvariablen ergänzt.
  `OTEL_EXPORTER_OTLP_ENDPOINT` ist die einzige unterstützte
  `OTEL_EXPORTER_OTLP_*`-Variable. Jede weitere Variable dieses Präfixes wird
  vor dem Erzeugen eines Exporters generisch abgelehnt. Das verhindert auch das
  Einlesen fremder Header, Zertifikate oder Private-Key-Dateien durch die
  OpenTelemetry-Bibliothek. Sowohl die Konfigurations- als auch die
  Exportgrenze prüfen diese Regel, damit ein direkter Factory-Aufruf sie nicht
  umgehen kann.
- Die öffentliche Produktionsfactory besitzt keine Exporter-Overrides. Bei
  `SOSEBAMA_TELEMETRY_EXPORTER=none` haben auch paketinterne Test-Exporter keinen
  Effekt.

## Sicherer Standardzustand

Ohne Konfiguration gilt:

```sh
SOSEBAMA_TELEMETRY_EXPORTER=none
```

Pino-Logs und lokale Instrumente bleiben aktiv. Es werden keine Traces oder
Metriken übertragen und keine Netzwerkverbindung zu einem Collector versucht.
Der DEV-Containerrahmen setzt diesen Zustand ausdrücklich für API und Worker.

## Lokal bauen und automatisiert prüfen

1. Abhängigkeiten und alle Repositoryprüfungen ausführen:

   ```sh
   pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   pnpm check
   pnpm test:coverage
   ```

   Erwartet werden ausschließlich Exit-Code `0`. Die Tests prüfen die
   Feld-Allowlist, feste Span-Namen, W3C Trace Context, lokale OTLP-Ziele,
   die Abweisung geerbter OTLP-Konfiguration, Metriknamen, Labelabwesenheit,
   `none`-Vorrang und einen ausfallenden Collector.

2. Für den Containerpfad der
   [DEV-Containeranleitung](DEV-CONTAINERS.md) bis einschließlich Start und
   Host-Smoke folgen.

3. Die tatsächlichen API- und Worker-Startlogs prüfen:

   ```sh
   pnpm container:logs
   ```

   Erwartet wird Exit-Code `0`. Beide Rollen müssen genau den Service, die
   Rolle, `DEV` und `runtime.started` als JSON liefern. PID und Hostname dürfen
   nicht erscheinen. Der Befehl liest nur Logs und verändert keine Container.

4. Den Stack gemäß Containeranleitung stoppen und den Cleanup prüfen.

## Optionalen lokalen OTLP-Collector verwenden

Diese Option ist nur für einen bereits separat freigegebenen, lokalen und
secretfreien DEV-Collector vorgesehen. Sie ist für den normalen Start nicht
erforderlich.

1. Im Startterminal ausschließlich die Namen bereits gesetzter OTLP-Variablen
   anzeigen:

   ```sh
   env | sed 's/=.*//' | grep '^OTEL_EXPORTER_OTLP_' || true
   ```

   Erwartet wird keine Ausgabe. Falls Namen erscheinen, die Variablen in
   diesem Terminal mit `unset <VARIABLE_NAME>` entfernen. Ihre Werte nicht
   anzeigen, kopieren oder in Prompt und Log übernehmen.

2. Ausschließlich sichtbare lokale Platzhalter ersetzen:

   ```sh
   export SOSEBAMA_TELEMETRY_EXPORTER="otlp"
   export OTEL_EXPORTER_OTLP_ENDPOINT="<LOCAL_LOOPBACK_OTLP_BASE_URL>"
   ```

   `<LOCAL_LOOPBACK_OTLP_BASE_URL>` ist eine absolute HTTP- oder
   HTTPS-Basis-URL mit dem Host `localhost`, `127.0.0.1` oder `::1` und ohne
   Zugangsdaten, Query und Fragment. Andere Hostnamen und IP-Adressen werden
   abgelehnt. Kein TST-/PRD-Endpunkt und keine private Zielhostkonfiguration
   dürfen in Repository, Prompt, Log oder Artefakt übernommen werden.

3. API oder Worker direkt nach der
   [Anleitung für lokale Laufzeitrollen](RUNTIME-ROLES.md) starten. Die
   Signalpfade `/v1/traces` und `/v1/metrics` werden automatisch an die
   Basis-URL angehängt.

4. Den Rollenstart und die Health-Nachweise unabhängig vom Collector prüfen.
   Ein Collectorfehler darf nur `telemetry.flush-failed` beziehungsweise
   `telemetry.shutdown-failed` erzeugen und den Rollen-Exit-Code nicht ändern.

## Fehlerbehandlung

- **Exporterwert ungültig:** Nur `none` oder `otlp` verwenden. Keine
  zusätzliche Exporterimplementierung lokal einschleusen.
- **OTLP-URL abgelehnt:** Einen der erlaubten Loopback-Hosts verwenden und
  Zugangsdaten, Query und Fragment entfernen. Keine Prüfung durch Ausgabe des
  abgelehnten Werts vornehmen.
- **Weitere OTLP-Variable abgelehnt:** Neben
  `OTEL_EXPORTER_OTLP_ENDPOINT` keine `OTEL_EXPORTER_OTLP_*`-Variable setzen.
  Nur den Variablennamen ermitteln, die Variable mit `unset <VARIABLE_NAME>`
  entfernen und ihren Wert weder anzeigen noch weitergeben.
- **Collector nicht erreichbar:** Die Rolle weiter über Health prüfen und
  kontrolliert stoppen. Telemetrieausfall ist kein Grund, fachliche oder
  technische Laufzeit mit zusätzlichen Rechten neu zu starten.
- **Nicht erlaubter oder dynamischer Wert sichtbar:** Ausgabe nicht
  weitergeben. Rolle stoppen, den betroffenen Logpfad als Securitybefund
  behandeln und die technische Allowlist samt Regressionstest vor erneutem
  Start korrigieren. Keine Denylist ergänzen.
- **`pnpm container:logs` schlägt fehl:** Keine Logformate manuell tolerant
  machen. Containerzustand und ausschließlich secretfreie lokale Logs prüfen,
  danach kontrolliert abbauen.

## Rollback und Pflege

`SOSEBAMA_TELEMETRY_EXPORTER=none` beendet jede optionale OTLP-Übertragung ohne
Änderung an Health oder Laufzeitrollen. Ein Code-Rollback erfolgt ausschließlich
über einen reviewten Revert. Es existieren keine Telemetriedatenbank,
Migrationen oder persistenten Volumes in diesem Teilschnitt.

Der Projekteigentümer prüft diese Anleitung bei Änderungen an Logfeld- oder
Span-Allowlist, Metriknamen, Labels, Propagation, Exportern,
Collectorverdrahtung oder Umgebungsgrenzen.
