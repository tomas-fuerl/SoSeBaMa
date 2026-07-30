# ADR-0011: Logging, Metriken, Tracing und Diagnose

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Fachhistorie, Audit und technische Telemetrie haben unterschiedliche Zwecke und
Ausfallwirkungen. DEV und TST benötigen Diagnose; PRD darf keine Debugwege
besitzen. Telemetrie muss datensparsam und auf dem Zielhost budgetierbar sein.

## Ziele und Nicht-Ziele

Ziele sind strukturierte redigierte Logs, standardisierte Traces, niedrige
Metrikkardinalität, getrennte Umgebungsstores und klare Health-Endpunkte.
Analytics, Session Replay, DOM-Snapshots, Fingerprinting und PRD-Debugkonsolen
sind keine Ziele.

## Entscheidungskriterien

- Datenschutz und Secretfreiheit,
- Diagnosefähigkeit ohne Fachtransaktionsabhängigkeit,
- geringe Kardinalität und begrenzter Speicher,
- Portabilität offener Standards,
- automatisierte Ausfall- und Abwesenheitstests.

## Betrachtete Optionen

1. **Status quo:** Keine festgelegte Telemetriearchitektur.
2. **Angenommen:** Pino, OpenTelemetry, Prometheus-kompatible Metriken und
   Grafana-Referenzstack über Alloy.
3. **Alternative:** Proprietärer gemeinsamer Cloud-Telemetriedienst. Dies
   erhöht Datenabfluss, Kosten- und Plattformbindung.

## Entscheidung und Begründung

Fachhistorie, Audit, Betriebslogs, Metriken und Traces bleiben strikt getrennt.
Telemetrieausfall blockiert keine Fachtransaktion. Auditausfall blockiert jede
auditpflichtige Fachtransaktion.

Pino schreibt strukturierte JSON-Logs über stdout und stderr. Pretty-Ausgabe
ist nur in DEV zulässig. Redaction entfernt konsequent Secrets, Cookies,
Tokens, E-Mails, Request-Bodies, PDFs, Overlays, SQL-Parameter und
Benutzerinhalte.

W3C Trace Context wird verwendet; externes Baggage ist nicht vertrauenswürdig.
OpenTelemetry liefert Backendtraces und Metriken. Pino bleibt das Logsystem;
die Lösung hängt weder von experimenteller Browser- noch
OpenTelemetry-Logunterstützung ab.

Metriken sind Prometheus-kompatibel und niedrig kardinal. Benutzer-, Objekt-,
Band-, Job-, Session- und Trace-IDs sind als Labels verboten.

DEV erfasst vollständige Traces. TST erfasst grundsätzlich vollständige
Backend- und Workertraces. PRD verwendet niedriges konfigurierbares Sampling.
Grafana Alloy ist Collector. Der Referenzstack besteht aus Prometheus, Loki,
Tempo und Grafana. Jede Umgebung besitzt eigene Stores und Identitäten; TST und
PRD teilen keinen Stack. Der kleine erwartete Umfang nutzt einen monolithischen
Betriebsmodus.

Ein dauerhafter PRD-Tracepfad benötigt einen von Tempo unterstützten und
gesicherten Speicher. Die für `OQ-016` festgelegten 72 Stunden
PRD-Traceaufbewahrung sind Releasevoraussetzung. Eine ungeeignete lokale Ablage
gilt nicht als Erfüllung.

Startup, Liveness und Readiness sind getrennte Endpunkte mit minimaler externer
Ausgabe. TST besitzt den geschützten Pfad `/technical-diagnostics/`. Eine
entsprechende Route, Swagger und Debugports fehlen in PRD technisch.

Die PWA sendet nur minimale Telemetrie über Performance API und gezielte Marks.
Alarme sind versioniert und datensparsam. Telemetrieaufbewahrung ist
zweckgebunden und folgt dem
[Ressourcenbudget](../RESOURCE-BUDGET.md).

## Folgen und Risiken

Der Referenzstack erhöht den Speicherbedarf und benötigt Retention- und
Backpressurekontrollen. Vollständige TST-Traces dürfen keine Fachdaten
enthalten. Sampling kann seltene PRD-Fehler verbergen; Metriken, Logs und
gezielte Alarme ergänzen es.

Offene Standards halten Export und Collector ersetzbar. Redaktions-,
Kardinalitäts-, Ausfall- und PRD-Abwesenheitstests machen die Grenzen
verifizierbar.

Die Testbarkeit umfasst maschinell prüfbare Logfelder, Metriknamen,
Tracekontext und die technische Abwesenheit der Diagnosewege in PRD.

## Security sowie DEV/TST/PRD

Stores, Identitäten und Retention bleiben je Umgebung getrennt. TST-Diagnose
erfordert benannte technische Identität, minimale Rechte, Audit und Widerruf.
PRD enthält weder Diagnosepfad noch Swagger, Debugports oder Pretty-Logs.
Telemetrie enthält keine Secrets oder unnötigen Personen- und Inhaltsdaten.

## Migration, Verifikation und Rückbau

AP-01 schafft Health- und Telemetriegrundlagen; AP-11 qualifiziert Retention,
Sampling und Alarme. Tests injizieren Collector-Ausfall, prüfen
Transaktionsfortgang, Auditblockade, Redaction, Labelkardinalität,
Umgebungstrennung und technische PRD-Abwesenheit.

Collector oder Speicher können über OpenTelemetry- und
Prometheus-Schnittstellen ersetzt werden. Ein Wechsel benötigt Datenfluss-,
Retention- und Securitynachweis. Bei Rückbau dürfen Health und Audit nicht
entfallen; Telemetrie wird kontrolliert drainiert.

## Offene Annahmen

Die konkrete Tempo-Ablage kann 72 Stunden PRD-Traces gesichert und innerhalb
des Budgets halten. Dies ist vor PRD-Freigabe in TST technisch zu verifizieren.
