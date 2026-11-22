# ADR-0017: nginx als Application Gateway und Webserver

- Status: Angenommen
- Datum: 2026-11-10
- Eigentümer: Projekteigentümer
- Bezogenes Issue: [#64](https://github.com/tomas-fuerl/SoSeBaMa/issues/64)
- Ownerentscheidung: ausdrückliche Freigabe im Chat nach erfolgreichem lokalem nginx-Proof.
- Ersetzt: [ADR-0012](ADR-0012-container-netz-secrets-und-deployment.md); dessen übrige Festlegungen werden unverändert übernommen.

## Kontext und Problem

Der interne Gateway verteilt HTTP an Web und API. Der Webprozess liefert die
gebaute PWA aus. Öffentliches TLS endet bereits am Infrastruktur-Ingress.
Caddys automatische Zertifikatsverwaltung und Admin-API werden nicht genutzt.
Das offizielle Caddy-2.11.9-Binary enthält einen fixbaren HIGH-Befund, für den
am Prüftag kein korrigiertes offizielles Image verfügbar war. Ein Wechsel darf
keinen Securitycheck oder eine Netzgrenze umgehen.

## Ziele und Nicht-Ziele

Gleiche Rollen, Härtung, HTTP-Verträge, Isolation und Digest-Promotion bei
nachgewiesener Wartbarkeit. Keine neue Ingressplattform, keine dynamische
Dockererkennung, keine zusätzlichen Verwaltungszugänge. Kein Deployment und
keine automatische AP-01-, TST- oder PRD-Freigabe.

## Entscheidungskriterien

- Dateiauslieferung, SPA-Fallback und API-Prefixentfernung,
- Nicht-Root, read-only, keine Capabilities und keine neuen Netzrechte,
- korrigierbare Supply-Chain-Befunde ohne zusätzliche Ausnahmen,
- zuverlässige DNS-Reauflösung bei ausgetauschten Containern,
- überschaubare, versionierte Konfiguration und kontrollierter Rückbau.

## Betrachtete Optionen

1. Caddy behalten: kurze Konfiguration und bereits integrierte Runtime;
   das benötigte offizielle Securityupdate fehlt derzeit.
2. nginx Open Source: deckt beide Aufgaben ab; explizitere Konfiguration,
   keine zusätzlichen Anwendungsdienste. Im lokalen Proof geeignet.
3. Einen anderen Proxy oder eigenen Caddy-Build einführen: vom Owner nicht
   als weiterer Kandidat ausgewählt; würde zusätzliche Komponenten oder
   Buildverantwortung ohne nachgewiesenen Nutzen schaffen.

## Entscheidung und Begründung

nginx Open Source ersetzt Caddy in Gateway und Web. Ein gemeinsames Webimage
enthält beide Konfigurationen, aber die Rollen bleiben getrennte Container.
Ausgangsbasis ist das offizielle Debian-Trixie-Image nginx 1.30.6, gepinnt auf
den in `containers/web.Dockerfile` versionierten Multi-Arch-Digest.
Das enthaltene zlib1g wird gezielt auf die verfügbare Debian-Fixversion
aktualisiert. Der gesamte fertige Kandidat unterliegt denselben Scans wie zuvor.
Ungenutzte dynamische ACME-, GeoIP-, Bildfilter-, njs- und XSLT-Module sowie
curl/gettext-base werden mitsamt ausschließlich dafür benötigten Abhängigkeiten
entfernt. Die Anwendung lädt keine dynamischen Zusatzmodule und benötigt keine
Template-Entrypoints. Node und nginx werden im fertigen Image erneut geprüft.

Die Entscheidung beruht auf der Passung zu expliziter Infrastruktur und dem
[lokalen Proof](../../development/NGINX-PROOF.md), nicht auf einer pauschalen
Behauptung höherer Sicherheit oder Geschwindigkeit. Beide Produkte sind
Open Source mit kommerzieller Unterstützung; nginx benötigt für die hier
verwendeten Funktionen keine kommerzielle Edition.

Alle Container-, Netz-, Secret-, Umgebungs-, Promotion-, Migrations-,
Rollback- und Betriebsfestlegungen aus ADR-0012 werden **unverändert
übernommen**, ausgenommen die Wahl Caddys. Dortige Verweise auf Caddy sind
fortan als nginx-Gateway zu verstehen. Andere ADRs werden nicht ersetzt.

## Folgen und Risiken

77 statt 33 Konfigurationszeilen; zusätzliche explizite PID-/Temp-Pfade,
Header und DNS-Reauflösung. Gateway nutzt ausschließlich den Docker-internen
Resolver und bekannte Upstreams, keine vom Nutzer bestimmbaren Proxyziele.
Node 24.21 bleibt ausschließlich für die bestehenden JSON-Healthchecks im
Webimage. npm und corepack werden nicht in die Runtime kopiert.

Der Webruntime-Basiswechsel von Bookworm auf Trixie ist Teil dieser
Entscheidung; die Backendruntime bleibt unverändert. Scanergebnisse sind
deshalb kein isolierter Webserververgleich. Der lokale Proof qualifiziert
keine TST-Kapazität oder native arm64-Laufzeit.

## Security sowie DEV/TST/PRD

Keine neue Ausnahme, kein gelockertes Gate. Accesslogs bleiben deaktiviert,
damit URLs und Querywerte nicht zusätzlich protokolliert werden. Fehlerlogs
dienen der Betriebsdiagnose; vor Fachrouten ist deren Secretfreiheit erneut
zu prüfen. Laufzeitrollen, Ports, Netze und Dienstezugriffe bleiben unverändert.

Aktueller DEV-Gateway nimmt nur internes HTTP entgegen und setzt Forwarding-
Header aus dem unmittelbaren Requestkontext; eingehendes `Forwarded` wird
entfernt. Eine reale Ingress-Vertrauenskette ist vor TST/PRD separat explizit
festzulegen und zu testen. Private Infrastrukturwerte werden nicht benötigt.

## Migration, Verifikation und Rückbau

Der Standardbuild und die beiden regulären Compose-Dateien wählen nginx.
Proof-Overlay und Caddy-Konfiguration werden entfernt; keine parallele
dauerhafte Implementierung. Unveränderte Build-/Prüfwerkzeuge werden genutzt.
Erforderlich sind aktuelle lokale Repository-, Policy-, Image-/Config-Scans,
Health-, Browser-, DNS-Wechsel-, Failure-/Recovery- und Cleanup-Nachweise.
GitHub-CI muss anschließend auf demselben veröffentlichten Kandidaten bestehen.
Ownerfreigabe dieser Technologie ersetzt weder diese Nachweise noch einen Merge.

Rollback erfolgt über einen reviewten Revert und neu qualifizierte Images;
ein Rückfall auf das bekannte verwundbare Caddy-Image ist keine automatische
Sicherheitsfreigabe. Keine Datenmigration, kein Zugriff auf TST/PRD.

## Offene Annahmen

nginx-Defaults für Bodygröße und Timeouts sind nur für den aktuellen
technischen Schnitt qualifiziert. Vor Uploadfunktionen müssen das maximale
50-MiB-MVP-Dateibudget, Multipart-Overhead, Streaming, tmpfs und Timeouts
gemeinsam umgesetzt und getestet werden. WebSockets, Last und reale
Ingressheader sind nicht durch den Proof freigegeben.
