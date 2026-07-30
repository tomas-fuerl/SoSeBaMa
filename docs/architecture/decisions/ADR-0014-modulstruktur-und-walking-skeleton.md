# ADR-0014: Modulstruktur und Walking Skeleton

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Der modulare Monolith benötigt eindeutige Fachverantwortung,
Abhängigkeitsrichtung und einen ersten Ende-zu-Ende-Schnitt. Ohne Grenzen würden
gemeinsame Datenbank und TypeScript-Monorepo zu verdeckter Kopplung führen.

## Ziele und Nicht-Ziele

Ziele sind fachliche Modulhoheit, explizite Fassaden, eine Unit of Work und ein
kleines Walking Skeleton. Event Sourcing, vollständiges CQRS, interner HTTP,
separater Lesedatenbestand und generische Sammelpakete sind keine Ziele.

## Entscheidungskriterien

- Übereinstimmung mit dem Produktmodell,
- geringe Kopplung und klare Datenverantwortung,
- atomare modulübergreifende Abläufe,
- technische Durchsetzbarkeit und Testbarkeit,
- spätere Portabilität einzelner Module.

## Betrachtete Optionen

1. **Status quo:** Keine Code- oder Modulstruktur.
2. **Angenommen:** Fachmodule mit innerer Schichtung, öffentlichen Fassaden und
   Walking Skeleton über Identität bis private PDF-Inhalte.
3. **Alternative:** Technische Schichten über das gesamte Backend oder früh
   getrennte Dienste. Beide verwischen entweder Fachhoheit oder erhöhen
   verteilte Komplexität.

## Entscheidung und Begründung

Das Backend besitzt die Fachmodule:

- `identity`,
- `bands`,
- `authorization`,
- `songs`,
- `contents`,
- `files`,
- `overlays`,
- `setlists`,
- `editing`,
- `sync`,
- `lifecycle`,
- `audit`.

Technische Plattformfunktionen sind keine Fachmodule. Jede persistierte
Struktur besitzt genau ein verantwortliches Modul. Andere Module verändern
fremde Tabellen nicht fachlich. Modulübergreifende Read Models dürfen lesend
mehrere Tabellen verbinden.

Jedes Modul gliedert sich intern in `domain`, `application`,
`infrastructure` und `presentation`. Abhängigkeiten zeigen nach innen. Die
Domain importiert weder NestJS noch Prisma. `forwardRef()` wird nicht regulär
verwendet.

Ein Modul exportiert nur seine öffentliche Fassade. Importe aus internen
Ordnern anderer Module sind verboten. Ein führender Application Service
orchestriert atomare modulübergreifende Abläufe. Module rufen einander nicht
über internes HTTP auf.

Domain Events beschreiben eingetretene Tatsachen. Jobs beschreiben noch
auszuführende technische Arbeit. Event Sourcing wird nicht verwendet; Audit ist
kein Event Store.

Eine explizite Unit of Work steuert Transaktionen. Repositories committen nicht
versteckt. Commands und Queries werden getrennt, ohne ein vollständiges
CQRS-System oder einen separaten Read-Datenbestand einzuführen.

Das Web ist featureorientiert. API, IndexedDB, Kryptografie und Service Worker
liegen hinter zentralen Adaptern. Workspace-Pakete sind zweckgebunden; ein
generisches `shared`, `common`, `helpers` oder `utils` ist verboten.

Quellcode, APIs und technische Kennungen sind Englisch. Produktoberfläche und
Produktdokumentation sind Deutsch. Verbindliche Mappings:

| Deutsch | Technisch |
| --- | --- |
| Song | `Song` |
| Inhalt | `ContentItem` |
| Basisinhalt | `BaseDocument` |
| Overlay | `Overlay` |
| Setlist | `Setlist` |
| Band | `Band` |
| Berechtigung | `Permission` |
| Eigentum | `Ownership` |
| Check-out | `EditCheckout` |
| Bearbeitungssitzung | `EditSession` |
| Löschvormerkung | `DeletionMark` |

CI setzt Modulgrenzen technisch durch.

Ein einmaliger nicht öffentlicher Bootstrapbefehl erzeugt den ersten
Plattformadministrator. Es gibt keinen HTTP-Bootstrap, kein Standardkonto und
kein Standardpasswort. Der Befehl funktioniert nur, solange kein
Plattformadministrator existiert.

Das Walking Skeleton umfasst:

1. Plattformgrundstruktur,
2. Identität und Einladung,
3. private PDF-Inhaltsstrecke.

Es umfasst noch nicht Overlaybearbeitung, Setlists, gemeinsame Berechtigungen,
Check-outs, Offlinefachdaten, Songzusammenführung, Veröffentlichung,
Löschlebenszyklus oder vollständige Administrationsoberflächen.

## Folgen und Risiken

Klare Hoheit reduziert Kopplung, erzeugt aber zusätzliche Fassaden und
Orchestrierung. Read Models dürfen keine versteckten Schreibwege werden.
Transaktionsgrenzen über mehrere Module benötigen explizite Integrationstests.

Frameworkfreie Domain und Adapter erhöhen Portabilität. Modulgrenzentests,
Fassadentests und Unit-of-Work-Integration machen Verstöße früh sichtbar.

Der Betrieb beginnt mit einem minimalen, beobachtbaren Laufzeitpfad und erhält
keine vorgetäuschten Fachfunktionen oder verdeckten Übergangsdienste.

## Security sowie DEV/TST/PRD

Serverinterne Module und Datenmodelle gelangen nicht in Clientpakete. Bootstrap
ist nicht per HTTP erreichbar, verwendet keine Standardzugangsdaten und wird
auditiert. DEV, TST und PRD besitzen getrennte Administratoren und Identitäten.
PRD enthält keine Bootstrap- oder Modul-Debugroute.

## Migration, Verifikation und Rückbau

AP-01 erstellt Struktur und Grenzprüfungen. AP-02 und AP-04 vervollständigen das
Walking Skeleton. Architekturtests verbieten interne Importe, Domain-
Frameworkabhängigkeit, versteckte Commits und unzulässige Zyklen.

Ein Modul kann später nur über ein ersetzendes ADR und stabile Fassade
abgetrennt werden. Tabellenhoheit, Transaktionen, Jobs und Read Models werden
vorher inventarisiert und schrittweise migriert. Der Bootstrap kann nach
erfolgreicher Erstanlage deaktiviert bleiben.

## Offene Annahmen

Die Modulgrenzen decken das angenommene Produktmodell ohne zyklische
Fachabhängigkeiten ab. AP-01 muss dies mit einer konkreten
Abhängigkeitsmatrix verifizieren.
