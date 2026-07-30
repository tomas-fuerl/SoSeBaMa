# ADR-0002: TypeScript-Technologiestack und Monorepo

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Web, API und Worker benötigen einen gemeinsamen, typisierten
Entwicklungsstandard. Gemeinsam genutzte Pakete dürfen dabei keine
serverinternen Berechtigungs- oder Datenbankdetails an den Client tragen.

## Ziele und Nicht-Ziele

Ziele sind durchgängige Typisierung, reproduzierbare Builds, zweckgebundene
Pakete und eine geringe Zahl von Toolchains. SSR, mehrere Programmiersprachen
für die Kernanwendung und ein unstrukturiertes Sammelpaket sind keine MVP-Ziele.

## Entscheidungskriterien

- Eignung für PWA, API und Worker,
- gemeinsame öffentliche Verträge ohne Security-Leak,
- Wartbarkeit, Testbarkeit und Ökosystem,
- reproduzierbare Abhängigkeiten und Containerbuilds,
- Portabilität zwischen Entwicklungs- und Zielumgebung.

## Betrachtete Optionen

1. **Status quo:** Kein festgelegter Stack. Das verhindert reproduzierbare
   Projektstruktur und gemeinsame Prüfungen.
2. **Angenommen:** TypeScript-Monorepo mit React, Vite, NestJS und pnpm.
3. **Alternative:** Getrennte Repositories und unterschiedliche Sprachen für
   Web und Backend. Das erhöht Vertragsdrift und Betriebsaufwand.

## Entscheidung und Begründung

Web, API und Worker verwenden TypeScript. Das Web verwendet React 19 mit Vite
als clientseitig gerenderte PWA. SSR gehört nicht zum MVP. API und Worker
verwenden NestJS 11 auf Node.js 24 LTS.

Ein pnpm-Workspace-Monorepo erhält folgende vorgesehene Struktur:

```text
apps/web
apps/api
apps/worker
packages/contracts
packages/validation
packages/config
packages/testing
packages/eslint-config
packages/typescript-config
```

Gemeinsam genutzt werden ausschließlich öffentliche technische Verträge und
dafür notwendige Validierung. Autorisierung, Eigentumsregeln,
Datenbankmodelle, internes Audit und Secrets bleiben ausschließlich
serverseitig. Exakte Patchversionen werden bei der Implementierung über
`pnpm-lock.yaml` und Image-Digests fixiert.

## Folgen und Risiken

Ein Stack reduziert Kontextwechsel und vereinfacht Vertrags- und
Integrationstests. Gemeinsame Typen können fälschlich als Autorisierung
missverstanden werden; serverseitige Prüfungen bleiben deshalb zwingend.
Node-, React- oder NestJS-Upgrades betreffen mehrere Anwendungen und benötigen
gemeinsame Kompatibilitätsprüfungen.

Der Stack ist auf üblichen Containerplattformen portabel. Abhängigkeiten an
Frameworks bleiben hinter Fachmodul- und Adaptergrenzen. Testbarkeit wird durch
gemeinsame Konfiguration und getrennte Anwendungsstarts verbessert.

## Security sowie DEV/TST/PRD

Clientpakete enthalten keine serverinternen Modelle, Rechteentscheidungen,
Auditdetails oder Secrets. Alle Umgebungen bauen aus denselben Quellen und
verwenden dieselben Images; nur validierte Konfiguration und Secrets sind
getrennt. DEV darf Entwicklerhilfen besitzen, TST nur geschützte Prüfwege, PRD
keine Debugwerkzeuge.

## Migration, Verifikation und Rückbau

AP-01 initialisiert den Workspace. Lint, Typprüfung, Modulgrenzentests,
Lockfileprüfung und reproduzierbare Containerbuilds verifizieren die
Entscheidung. Browser- und API-Tests prüfen die tatsächliche Laufzeit.

Vor AP-01 ist kein technischer Rückbau nötig. Ein Framework- oder
Laufzeitwechsel erfordert ein ersetzendes ADR, Daten- und Vertragskompatibilität
sowie eine schrittweise Migration der jeweiligen Adapter.

## Offene Annahmen

Node.js 24 LTS und die genannten Hauptversionen erfüllen zur Umsetzung die
Support- und Sicherheitsanforderungen. Exakte Patchstände werden erst bei
Implementierung geprüft und fixiert.
