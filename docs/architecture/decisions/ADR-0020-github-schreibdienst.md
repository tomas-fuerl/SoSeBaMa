# ADR-0020: Eigentümerkontrollierter GitHub-Schreibdienst

- Status: Vorgeschlagen
- Datum: 2026-11-24
- Eigentümer: Projekteigentümer
- Bezogenes Issue: [AP-01 (#9)](https://github.com/tomas-fuerl/SoSeBaMa/issues/9), [Implementierungs-Issue #96](https://github.com/tomas-fuerl/SoSeBaMa/issues/96)

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

### Authentifizierte Freigabeprüfung

Unauthentifizierte GitHub-Lesezugriffe sind pro Quell-IP auf 60 je Stunde
begrenzt. Pro erfolgreicher Aktion sind 12 Freigabeabfragen nötig. Bei
bestehenden Issues und Draft-PRs kommen drei Zielabfragen hinzu.

| Option | Beurteilung |
| --- | --- |
| Öffentliche API ohne Authentifizierung | Geringer Integrationsaufwand. Das gemeinsame Stundenlimit liegt theoretisch bei fünf beziehungsweise vier Aktionen. |
| Vorhandenen Lesebroker über seine private Schnittstelle wiederverwenden | Bevorzugt, sofern er einen eindeutig nur lesenden Zugang bietet, während einer Schreibsperre erreichbar bleibt und aktuelle Nachweise liefert. Die konkrete Schnittstelle und die effektiven Rechte sind noch zu prüfen. |
| Separater Nur-Lese-Zugang | Wenn der Broker die Kriterien verfehlt, kann ein eng begrenzter separater Lesezugang über denselben lokalen Adapter genutzt werden. Zusätzlich zu betreiben sind Rechte, Erneuerung und Widerruf. |

Der Entwurf unterstützt einen eigentümerkontrollierten Nur-Lese-Adapter.
Alle drei Freigabeprüfungen behalten aktuelle GitHub-Abfragen. Bei
Rate-Limits erfolgt die Ablehnung bis zur von GitHub angegebenen Wartezeit.
Der Widerruf bekannter Schreibcredentials bleibt davon unabhängig.
Siehe [GitHub REST-Rate-Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

### Unabhängiger Sperrweg

| Option | Beurteilung |
| --- | --- |
| Gemeinsame Installation | Weniger Verwaltungsaufwand. Eine Suspension entzieht auch den regulären Lesezugang. Das Wiederanlaufverfahren braucht einen genehmigten Lese-Rückfallpfad. |
| Getrennte Lese- und Schreib-App mit getrennten Installationen | Empfohlen. Der Eigentümer kann die Schreibinstallation einzeln suspendieren. Zusätzliche App-Verwaltung, Schlüsselrotation und getrennte Nachweise sind erforderlich. |

Zu entscheiden sind die erlaubten Identitäten, der Sperrweg und die
Zuständigkeit. Vor Integration muss die unabhängige Wirkung gegen bestehende
und neue Tokens in TST nachgewiesen werden. Der Token-Endpunkt muss pro
Operation die erwarteten Rechte und eine plausible Ablaufzeit bestätigen.

### WIP und Inhaltsverantwortung

Vorgeschlagen ist ein benannter Eigentümerhost mit einem autorisierten
Dienst. Der lokale Instanzschutz gilt auch bei unterschiedlichen
Zustandsverzeichnissen. Externe Threads und Eigentümeraktionen brauchen
denselben koordinierten WIP-Bestand. Bei einem unkoordinierten zweiten Host
oder einer unklaren Wiedereröffnung pausiert die Belegung bis zum Abgleich.
Ein gemeinsam genutzter verteilter Sperrdienst würde zusätzliche
Betriebsabhängigkeiten einführen und ist für diesen Vorschlag entbehrlich.

Für die erste Abnahme bleiben Draft-Pflege bei Einzelfreigaben und
Freigaben an den konkreten `main`-SHA gebunden. Die technische Kontrolle bindet
exakte Ziele und Dateipfade. Nur bei Issue-Neuanlagen bindet sie auch Titel
und Inhalt per Hash. Der Eigentümer entscheidet, welche Dateikategorien
delegierbar sind. Vorgeschlagen ist der Ausschluss von Governance, ADRs für
Sicherheitsgrenzen, Workflows, Regeln für Sicherheitsprüfungen und
Credential- oder Betriebsdateien aus der delegierten Auswahl. Die
Prüfverantwortung für fachliche Inhalte bleibt bei Issue-Scope, Prüfungen
und dem abschließenden Eigentümerreview.

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
Schreibexport anbinden. Vor dem gesondert freigegebenen TST bestätigt der Eigentümer die zu
prüfenden Identitäten, den Freigabeweg, die WIP-Koordination und den
unabhängigen Sperrweg. Über Integration und eine spätere Rahmenfreigabe
entscheidet der Eigentümer nach der technischen Abnahme separat.
