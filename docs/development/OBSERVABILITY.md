# DEV-Telemetriegrundlage prüfen und sicher verwenden

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-12
- Bezogenes Issue: [#15](https://github.com/tomas-fuerl/SoSeBaMa/issues/15)
- Geltungsbereich: API und Worker ausschließlich in lokalem DEV

## Ziel und Grenzen

API und Worker schreiben maschinenlesbare, redigierte Pino-JSON-Logs. Die
gemeinsame serverseitige OpenTelemetry-Grundlage erzeugt begrenzte
Lifecycle-Traces und niedrig kardinale Metriken. Ein optionaler lokaler
OTLP-Collector darf ausfallen, ohne Start, Health oder kontrollierten Stopp der
Rollen zu blockieren.

Dieser Teilschnitt erstellt keinen Collector, kein Observability-Netz und
keinen Telemetriespeicher. Er erreicht weder TST noch PRD. Pino bleibt das
Logsystem; die noch in Entwicklung befindliche OpenTelemetry-Logunterstützung
wird nicht verwendet. Audit, Fachhistorie und Telemetrie bleiben getrennt.

## Sicherheits- und Datenregeln

- Logs enthalten nur technische, vorab begrenzte Felder. `pid` und `hostname`
  fehlen.
- Schlüssel für Authorization, Baggage, Cookies, Tokens, Secrets, Passwörter,
  E-Mails, Bodies, Inhalte, PDFs, Overlays und SQL-Parameter werden rekursiv
  durch `[Redacted]` ersetzt. Freitextfelder wie `message` werden ebenfalls
  redigiert; Ereignisnamen müssen dem begrenzten technischen Namensschema
  entsprechen.
- Fehler aus Exportern werden ausschließlich als generisches technisches
  Ereignis protokolliert. Endpunkt und Fehlerinhalt werden nicht ausgegeben.
- Spans enthalten in diesem Schnitt keine dynamischen Attribute. Die Resource
  enthält nur Service, Namespace und `DEV`.
- `sobama.runtime.started` und `sobama.runtime.failed` besitzen keine
  Datenpunktattribute. Benutzer-, Objekt-, Band-, Job-, Session- und Trace-IDs
  sind damit nicht als Labels möglich.
- Der Propagator schreibt ausschließlich W3C `traceparent`. Externes Baggage
  wird weder übernommen noch weitergereicht.
- OTLP-URLs dürfen keine Zugangsdaten, Query oder Fragment enthalten. Secrets
  und Authentifizierungsheader werden nicht über Umgebungsvariablen ergänzt.

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

   Erwartet werden ausschließlich Exit-Code `0`. Die Tests prüfen Pino-Felder,
   rekursive Redaction, Lifecycle-Spans, W3C Trace Context, Metriknamen,
   Labelabwesenheit und einen ausfallenden Collector.

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

1. Im Startterminal ausschließlich sichtbare lokale Platzhalter ersetzen:

   ```sh
   export SOSEBAMA_TELEMETRY_EXPORTER="otlp"
   export OTEL_EXPORTER_OTLP_ENDPOINT="<LOCAL_OTLP_BASE_URL>"
   ```

   `<LOCAL_OTLP_BASE_URL>` ist eine absolute HTTP- oder HTTPS-Basis-URL ohne
   Zugangsdaten, Query und Fragment. Kein TST-/PRD-Endpunkt und keine private
   Zielhostkonfiguration dürfen in Repository, Prompt, Log oder Artefakt
   übernommen werden.

2. API oder Worker direkt nach der
   [Anleitung für lokale Laufzeitrollen](RUNTIME-ROLES.md) starten. Die
   Signalpfade `/v1/traces` und `/v1/metrics` werden automatisch an die
   Basis-URL angehängt.

3. Den Rollenstart und die Health-Nachweise unabhängig vom Collector prüfen.
   Ein Collectorfehler darf nur `telemetry.flush-failed` beziehungsweise
   `telemetry.shutdown-failed` erzeugen und den Rollen-Exit-Code nicht ändern.

## Fehlerbehandlung

- **Exporterwert ungültig:** Nur `none` oder `otlp` verwenden. Keine
  zusätzliche Exporterimplementierung lokal einschleusen.
- **OTLP-URL abgelehnt:** Zugangsdaten, Query und Fragment entfernen und eine
  absolute HTTP-/HTTPS-Basis-URL verwenden. Keine Prüfung durch Ausgabe des
  abgelehnten Werts vornehmen.
- **Collector nicht erreichbar:** Die Rolle weiter über Health prüfen und
  kontrolliert stoppen. Telemetrieausfall ist kein Grund, fachliche oder
  technische Laufzeit mit zusätzlichen Rechten neu zu starten.
- **Nicht redigierter oder dynamischer Wert sichtbar:** Ausgabe nicht
  weitergeben. Rolle stoppen, den betroffenen Logpfad als Securitybefund
  behandeln und Redaction samt Regressionstest vor erneutem Start ergänzen.
- **`pnpm container:logs` schlägt fehl:** Keine Logformate manuell tolerant
  machen. Containerzustand und ausschließlich secretfreie lokale Logs prüfen,
  danach kontrolliert abbauen.

## Rollback und Pflege

`SOSEBAMA_TELEMETRY_EXPORTER=none` beendet jede optionale OTLP-Übertragung ohne
Änderung an Health oder Laufzeitrollen. Ein Code-Rollback erfolgt ausschließlich
über einen reviewten Revert. Es existieren keine Telemetriedatenbank,
Migrationen oder persistenten Volumes in diesem Teilschnitt.

Der Projekteigentümer prüft diese Anleitung bei Änderungen an Logfeldern,
Redaction, Span- oder Metriknamen, Labels, Propagation, Exportern,
Collectorverdrahtung oder Umgebungsgrenzen.
