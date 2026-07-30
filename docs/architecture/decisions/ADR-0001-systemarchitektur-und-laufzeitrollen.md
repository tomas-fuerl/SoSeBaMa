# ADR-0001: Systemarchitektur und Laufzeitrollen

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

SoSeBaMa benötigt eine wartbare Architektur für den PDF-zentrierten MVP und
spätere Produktteile. Weboberfläche, synchrone Fachlogik, Hintergrundarbeit und
PDF-Prüfung besitzen unterschiedliche Laufzeit- und Sicherheitsanforderungen.
DEV, TST und PRD müssen strikt getrennt bleiben.

## Ziele und Nicht-Ziele

Ziele sind klare Modulgrenzen, eine alleinige fachliche Transaktionsgrenze,
portable Laufzeitrollen und kontrollierte Offlinefähigkeit. Die vollständige
Offlineverfügbarkeit jeder Funktion im ersten Schnitt ist kein Ziel.
Microservices, verteilte Transaktionen und getrennte fachliche Datenbanken sind
keine Ziele des MVP.

## Entscheidungskriterien

- fachliche Konsistenz und geringe Betriebskomplexität,
- Sicherheits- und Umgebungsisolation,
- Testbarkeit und schrittweise Lieferbarkeit,
- Portabilität des Anwendungsbundles,
- Eignung für Online- und vorbereitete Offlinepfade.

## Betrachtete Optionen

1. **Status quo:** Nur Dokumente, keine festgelegte Laufzeitarchitektur. Dies
   verhindert konsistente Modul-, Transaktions- und Deploymentgrenzen.
2. **Angenommen:** Modularer Monolith mit Web, API und getrenntem Workerprozess
   aus derselben Backendcodebasis sowie isoliertem PDF-Prüfer. Das hält
   Fachregeln zusammen und trennt Laufzeitrechte.
3. **Alternative:** Früh aufgeteilte Microservices mit eigenen Datenbeständen.
   Das erhöht Betriebs-, Test- und Konsistenzaufwand ohne nachgewiesenen Bedarf.

## Entscheidung und Begründung

SoSeBaMa wird als modularer Monolith mit klaren Fachmodulen und einer
gemeinsamen PostgreSQL-Datenbank gebaut. Die installierbare responsive PWA
liefert den vollständigen Primärumfang für Tablet, Notebook und Desktop. Der
Smartphoneumfang bleibt entsprechend dem Produktmodell reduziert.

Die Architektur wird offlinefähig. Das bedeutet vorbereitete lokale Daten,
Entwürfe und Synchronisationsmetadaten; es bedeutet nicht, dass jede Funktion
im ersten Schnitt offline verfügbar ist. Der zentrale Serverstand bleibt
maßgeblich.

Jede Umgebung verwendet dasselbe containerisierte Anwendungsbundle. DEV, TST
und PRD besitzen getrennte Netze, Datenbanken, Dateien, Konfigurationen,
Secrets, Identitäten und Volumes. Dieselben unveränderlichen Images werden von
DEV über TST nach PRD promoviert.

Das Backend bildet die einzige fachliche Schreib- und Transaktionsgrenze und
den einzigen Datenbankzugang. Es läuft in getrennten Rollen:

- API für synchrone Anwendungszugriffe,
- Worker aus derselben Backendcodebasis für Hintergrundaufgaben,
- kontrollierte technische Rollen für Migration und Betrieb.

API und Worker besitzen getrennte Prozesse und technische Identitäten. Der
Worker ist kein Microservice. Er verwendet dieselben Fachregeln wie die API und
nur die minimal notwendigen Rechte. Der PDF-Prüfer ist eine getrennte,
zustandslose Sicherheitsrolle ohne Fach- oder Datenbankzugriff.

## Folgen und Risiken

Der modulare Monolith erleichtert atomare Fachabläufe und lokale Tests. Fehler
in Modulgrenzen könnten dennoch zu unerlaubter Kopplung führen; diese Grenzen
werden strukturell und in CI geprüft. Ein gemeinsamer Datenbestand verlangt
klare Tabellenverantwortung.

Der Betrieb benötigt mehrere Prozesse, aber keine verteilte
Serviceorchestrierung. Portabilität entsteht durch identische Images und
konfigurationsgetrennte Umgebungen. Eine spätere Modulabtrennung bleibt möglich,
wenn öffentliche Fassaden und Datenverantwortung eingehalten werden.

## Security sowie DEV/TST/PRD

Nur das Backend schreibt Fachzustand und erreicht PostgreSQL. Clients speichern
lokal ausschließlich autorisierte vorbereitete Daten, eigene Entwürfe und
Synchronisationsmetadaten. API und Worker erhalten getrennte Minimalrechte.
DEV, TST und PRD teilen keine Daten, Identitäten, Secrets, Netze oder Volumes.
PRD besitzt keine Debug- oder Diagnosewege.

## Migration, Verifikation und Rückbau

AP-01 führt die Laufzeitrollen und Modulgrenzen ein. Architekturtests prüfen
Modulabhängigkeiten, getrennte Identitäten, alleinigen Backend-Datenbankzugriff
und identische Image-Digests bei Promotion. TST prüft Online-, Offline- und
Workerpfade.

Vor Implementierung existiert kein Datenrückbau. Eine spätere Ersetzung erfolgt
durch ein neues ADR. Module können nur nach Vertrags-, Daten-,
Transaktions- und Betriebsnachweis in eigene Dienste überführt werden.

## Offene Annahmen

Der erwartete Umfang passt zu einem modularen Monolithen. Das wird mit dem
[Ressourcenbudget](../RESOURCE-BUDGET.md) in TST verifiziert.
