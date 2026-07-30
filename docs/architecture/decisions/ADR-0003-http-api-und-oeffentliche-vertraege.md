# ADR-0003: HTTP-API und öffentliche Verträge

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

PWA, API und Synchronisation benötigen stabile, validierte und dokumentierbare
Verträge. Konflikte, Wiederholungen und Autorisierungsfilter müssen eindeutig
und ohne Offenlegung interner Details behandelt werden.

## Ziele und Nicht-Ziele

Ziele sind sichere REST-Verträge, reproduzierbares OpenAPI, explizite
Konkurrenzkontrolle und autorisierungsbewusste Listen. GraphQL, öffentliche
interaktive PRD-Dokumentation und Autorisierungslogik in Clientschemas sind
keine Ziele.

## Entscheidungskriterien

- Verständlichkeit und Standardkonformität,
- Laufzeitvalidierung und Generierbarkeit,
- sichere Fehleroffenlegung,
- Idempotenz, Konflikt- und Versionsbehandlung,
- Testbarkeit und Rückwärtskompatibilität.

## Betrachtete Optionen

1. **Status quo:** Keine festgelegte API. Verträge und Fehlerverhalten wären
   uneinheitlich.
2. **Angenommen:** REST/JSON mit Zod, OpenAPI 3.1 und standardisierten
   Konfliktmechanismen.
3. **Alternative:** GraphQL mit schemaweiter Autorisierung. Für den MVP erhöht
   dies Komplexität bei Caching, Autorisierungsfilterung und Offlinebefehlen.

## Entscheidung und Begründung

Die API verwendet REST/JSON, ressourcenorientierte Endpunkte und explizite
Domänenaktionen. Öffentliche Endpunkte liegen unter `/api/v1`. Zod ist die
Quelle für öffentliche Vertrags- und Laufzeitvalidierung; gemeinsame Schemas
enthalten keine Autorisierungsentscheidungen.

OpenAPI 3.1 wird reproduzierbar generiert. CI vergleicht das Artefakt und
erkennt Vertragsänderungen. Interaktive Dokumentation ist in DEV zulässig, in
TST ausschließlich geschützt und in PRD nicht vorhanden.

Fehler folgen RFC 9457 Problem Details. Sie verwenden stabile sichere
Fehlercodes, eine `traceId` und ausschließlich validierte Feldverletzungen.
Interne Details und unsichtbare Objekte bleiben verborgen.

Veränderliche Ressourcen verwenden ETag und `If-Match`. Veraltete Revisionen
ergeben HTTP 412, fachliche Konflikte HTTP 409. Wiederholbare Schreibbefehle
verwenden Idempotency Keys. Songs bleiben im MVP die ausdrücklich auditierte
Last-write-wins-Ausnahme. Ein Check-out ersetzt weder Revision noch
Autorisierung.

Listen verwenden Cursor-Pagination. Sichtbarkeits- und Autorisierungsfilter
werden vor Pagination, Counts und Facetten angewendet.

## Folgen und Risiken

Die API wird gut test- und beobachtbar. Generierung und Zod-zu-OpenAPI-Abbildung
müssen deterministisch bleiben. Falsch sortierte Autorisierungsfilter könnten
Bestandsinformationen offenlegen und werden deshalb negativ getestet.

REST/JSON ist portabel und unterstützt getrennte Clients. Eine spätere
Protokollergänzung kann hinter denselben Application Services erfolgen, darf
die fachliche Autorisierung jedoch nicht duplizieren.

Der Betrieb benötigt nur eine versionierte HTTP-Schnittstelle und keine zweite
Transportinfrastruktur. Die Portabilität bleibt erhalten, weil OpenAPI 3.1 und
HTTP-Problemantworten implementierungsunabhängige Verträge bilden.

## Security sowie DEV/TST/PRD

Autorisierung erfolgt ausschließlich serverseitig vor Ergebnissen und Counts.
Problem Details enthalten keine Secrets oder internen Objektdaten. DEV darf
interaktive Dokumentation anbieten. TST schützt sie mit eigener Identität und
minimalen Rechten. In PRD fehlen interaktive Dokumentation, Swagger-Route und
zugehörige Debugwege technisch.

## Migration, Verifikation und Rückbau

Vertrags-, Negativ-, Idempotenz-, Pagination-, OpenAPI-Diff- und
Konkurrenztests verifizieren die Entscheidung. TST prüft geschützte
Dokumentation; PRD-Artefakttests prüfen ihre Abwesenheit.

Verträge werden versioniert. Eine inkompatible Ablösung benötigt eine neue
URI-Version und Migrationszeitraum. Ein anderes API-Protokoll erfordert ein
ersetzendes ADR und einen nachgewiesenen Parallel- oder Konvertierungspfad.

## Offene Annahmen

Die konkrete Zod-OpenAPI-Integration muss reproduzierbares OpenAPI 3.1 ohne
manuelle Vertragsdrift ermöglichen.
