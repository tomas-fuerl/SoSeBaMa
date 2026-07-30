# ADR-0012: Container, Netz, Secrets und Deployment

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

SoSeBaMa soll auf einem einzelnen Zielhost in drei strikt getrennten Umgebungen
laufen. Images, Netze, Secrets, Konfiguration, Migration und Rollback benötigen
einen reproduzierbaren Sollzustand ohne private Infrastrukturwerte im
Repository.

## Ziele und Nicht-Ziele

Ziele sind gehärtete Container, unveränderliche Promotion, minimale
Netzreichweite, dateibasierte Secrets und kontrollierte Migrationen. Swarm,
Kubernetes, Hostnetz, Docker-Socket, automatische PRD-Auslieferung und
Zero-Downtime-Versprechen sind keine MVP-Ziele.

## Entscheidungskriterien

- Isolation von DEV, TST und PRD,
- kleinste Rechte und Angriffsfläche,
- reproduzierbare Builds und Deployments,
- Portabilität und überprüfbarer Sollzustand,
- sicherer Rollback ohne automatische Down-Migration.

## Betrachtete Optionen

1. **Status quo:** Keine festgelegte Container- oder Deploymentarchitektur.
2. **Angenommen:** Docker Compose V2 mit getrennten Projekten, drei Images,
   Caddy-Gateway und digestbasierter Promotion.
3. **Alternative:** Kubernetes oder Swarm. Für einen einzelnen Zielhost erhöht
   dies Betriebs- und Sicherheitskomplexität ohne nachgewiesenen Bedarf.

## Entscheidung und Begründung

Docker Compose V2 betreibt auf einem einzelnen Zielhost getrennte Projekte:

- `sosebama-dev`,
- `sosebama-tst`,
- `sosebama-prd`.

Es gibt drei eigene GHCR-Images:

- `sosebama-web`,
- `sosebama-backend`,
- `sosebama-pdf-validator`.

Das Backendimage unterstützt die Rollen API, Worker und Migrator. Builds sind
mehrstufig. Backendimages basieren auf Debian und Node.js 24; Alpine wird nicht
verwendet.

Eine gemeinsame Compose-Basis wird mit expliziten DEV-, TST- und PRD-Dateien
kombiniert. Implizite TST-/PRD-Overrides sind unzulässig. Profile gelten nur
für optionale DEV-Werkzeuge. Vor jedem Deployment wird die gerenderte
Konfiguration geprüft. Reale Domains, Hosts, Ports, Pfade und andere private
Infrastrukturwerte bleiben außerhalb des Repositorys.

Netztypen sind `edge`, `application`, `data`, `validation` und
`observability`. Nur das Web-Gateway ist vom Infrastruktur-Ingress erreichbar.
Datenbank, API, Worker, Migrator und Validator veröffentlichen keine Hostports.
Der PDF-Validator hat weder Internet- noch Datenbankzugang. Docker-Socket und
Hostnetz sind verboten.

Caddy ist der interne Application Gateway. Öffentliches TLS endet am
Infrastruktur-Ingress; der SoSeBaMa-Stack enthält keine Zertifikatsschlüssel.
Die Proxykette ist vertrauenswürdig festgelegt und Forwarding-Header werden
kontrolliert.

Eigene Container laufen standardmäßig:

- nicht privilegiert,
- nicht als Root,
- mit read-only Root-Dateisystem,
- ohne Capabilities,
- mit `no-new-privileges`.

Schreibbare Pfade sind einzeln explizit. Laufzeitkonfiguration wird validiert.
Die PWA erhält nur nicht vertrauliche Werte über `runtime-config.json`. Secrets
liegen als hostgeschützte Dateien in servicespezifischen Compose Secrets,
niemals in `.env`.

Jede Umgebung besitzt getrennte persistente Bereiche. TST und PRD verwenden
keine Quellcode-Bind-Mounts. Promotion erfolgt ausschließlich über
unveränderliche SHA-256-Image-Digests; `latest` ist verboten.

Ein Releasemanifest enthält Version, Commit, Digests, Schema, Verträge,
Attestierung und SBOM. Deployment ist kontrolliert und verwendet einen
separaten Migrator; normales Startup führt keine Migration aus. Ein Merge nach
`main` löst kein PRD-Deployment aus. Wartungsfenster ersetzen ein
Zero-Downtime-Versprechen.

Rollbackstufen sind Anwendungsrollback, Vorwärtskorrektur und konsistente
Datenwiederherstellung. Automatische Down-Migrationen sind ausgeschlossen.
PWA und Service Worker werden kontrolliert ausgerollt.

Repository und Releasemanifest sind Sollquelle. Portainer ist keine Quelle
dauerhafter Konfigurationsänderungen. Vor und nach Deployment wird Drift
geprüft.

## Folgen und Risiken

Compose hält den Betrieb überschaubar, bietet aber keine automatische
Mehrhostausfallsicherheit. Gemeinsame Basisdateien dürfen Umgebungstrennung
nicht verschleiern. Read-only und Nicht-Root erfordern explizite Schreibpfade.

OCI-Images, Compose und Releasemanifest sind portabel zu anderen kompatiblen
Runtimes. Die Testbarkeit umfasst gerenderte Konfiguration, Netzwerk- und
Containerpolicy in statischen Prüfungen und TST.

## Security sowie DEV/TST/PRD

Alle Daten, Netze, Secrets, Identitäten und Volumes sind je Umgebung getrennt.
Nur das Gateway besitzt einen Anwendungseingang. TST darf geschützte
Diagnosewege besitzen; entsprechende Routen, Ports und Profile fehlen in PRD
technisch. Kein Container erhält Docker-Socket, Hostnetz oder nicht benötigte
Secrets.

## Migration, Verifikation und Rückbau

AP-01 führt Imagestruktur und DEV-Grundlage ein; spätere Pakete ergänzen
explizite Rollen. AP-11 prüft TST-Releasemanifest, Digest, Attestierung, SBOM,
Netze, Härtung, Migration, PWA-Rollout, Drift und Wiederherstellung.

Ein Runtimewechsel benötigt ein ersetzendes ADR und muss Netz-, Secret-,
Volume-, Digest- und Rollbackgarantien gleichwertig abbilden. Bei
Anwendungsrollback bleibt das Schema kompatibel; andernfalls erfolgt
Vorwärtskorrektur oder konsistente Wiederherstellung.

## Offene Annahmen

Der Zielhost unterstützt Docker Compose V2 und die erforderlichen
Härtungsoptionen. Private Details und tatsächliche Kapazität werden außerhalb
des Repositorys verwaltet und vor PRD qualifiziert.
