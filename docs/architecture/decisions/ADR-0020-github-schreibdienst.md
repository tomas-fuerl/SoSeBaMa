# ADR-0020: Eigentümerkontrollierter GitHub-Schreibdienst

- Status: Vorgeschlagen
- Datum: 2026-11-24
- Eigentümer: Projekteigentümer
- Bezogenes Issue: [AP-01 (#9)](https://github.com/tomas-fuerl/SoSeBaMa/issues/9), Implementierungs-Issue lokal vorbereitet

## Kontext und Problem

[ADR-0019](ADR-0019-lokale-entwicklungszugaenge.md) beschreibt die erforderliche
Trennung des Codex-Prozesses von Schreibcredentials. Ein Lesebroker und ein
Einzelfreigabeverfahren bestehen. Die abgenommene Signer-Anbindung und eine
technisch nachgewiesene Installationstrennung fehlen.

## Ziele und Nicht-Ziele

Modell C braucht einen engen, absperrbaren DEV-Schreibpfad. Der Entwurf
liefert die technische Grundlage. Aktivierung, neue GitHub-Rechte und
Veränderungen an TST oder PRD sind außerhalb dieser Entscheidung.

## Entscheidungskriterien

Entscheidend sind atomare Branchaktualisierung, Begrenzbarkeit der Rechte,
Eigentümerkontrolle und Widerruf. Weitere Kriterien sind Wiederverwendung,
Portabilität, Betriebsaufwand, zusätzliche Kosten und Abnahmemöglichkeiten.

## Betrachtete Optionen

| Option | Beurteilung |
| --- | --- |
| Lesebroker und Einzelfreigabe | Geringer Betriebsaufwand und etablierte Kontrolle. Erfüllt den autonomen Schreibbedarf nicht. |
| Git HTTPS im Eigentümerprozess | Unterstützt die volle Git-Historie. Erfordert stark isolierte Git-Ausführung und zusätzliche Kontrollen für fremde Git-Konfiguration und Prozesse. |
| REST Git Data API | Bietet eine feste API, erfordert mehrere autorisierte Objektmutationen mit Teilzuständen. |
| Feste REST- und GraphQL-Operationen | GitHub führt Commit und Branchupdate atomar aus. Der Dienst braucht nur Node-Standardbibliotheken und begrenzte Dateidaten. Beide API-Familien müssen in TST geprüft werden. |

## Entscheidungsvorschlag und Begründung

Einen Eigentümerprozess mit festen REST- und GraphQL-Operationen und
dateisystemgeschütztem Unix-Socket zur Abnahme vorlegen. Die vorhandene
Signer-Funktion bleibt im Eigentümerbereich. Die Rechte werden pro
Installationstoken und Operation weiter eingeschränkt. Die Architektur
vermeidet einen dauerhaft gültigen Schreibcredential-Cache und einen
allgemeinen Git- oder HTTP-Zugang. Die separate Freigabe erhält eine
GitHub-Originalbindung mit lokal verifiziertem Wortlaut und Eigentümer-ID.

## Folgen und Risiken

Neue Laufzeitkosten für einen kleinen lokalen Prozess. Keine zusätzlichen
Bibliothekslizenzen. GitHub-Verfügbarkeit und lokale Betriebsverantwortung
bleiben erforderlich. Bei verlorener Tokenantwort muss die Installation
im Notfall unabhängig suspendierbar sein. Bei gemeinsamer Installation
betrifft die Suspension auch die Lesefunktion. Automatische Abnahme dieses
Notfallpfads steht aus.

## Security sowie DEV, TST und PRD

Der Entwurf betrifft den GitHub-Entwicklungszugang in DEV. TST-Live-Tests
benötigen eine separate Testinstallation. PRD liegt außerhalb des Scopes.
GitHub-Schutzregeln und das projektweite WIP-Limit bleiben verbindlich.

## Migration, Verifikation und Rückbau

Der [Betriebs- und Abnahmeleitfaden](../../development/GITHUB-WRITE-SERVICE.md)
beschreibt den gesperrten Einstieg, die Nachweise, den Stopp, die
Wiederherstellung und den Rückbau zur Einzelfreigabe.

## Offene Annahmen

Der vorhandene Signer lässt sich ohne neue Secret-Kopie und ohne
Schreibexport anbinden. Der Eigentümer bestätigt Identität, Freigabeformat,
WIP-Koordination und unabhängigen Sperrweg nach der technischen Abnahme.
Bis dahin bleibt die Rahmenfreigabe inaktiv.
