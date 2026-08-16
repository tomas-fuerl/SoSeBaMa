# AP-01: Hauptversions- und Kompatibilitätsnachweis

- Status: Bestanden
- Prüfstand: 2026-08-02
- Letzte Durchsicht: 2026-08-16
- Bezogenes Issue: [#9](https://github.com/tomas-fuerl/SoSeBaMa/issues/9)
- Geltungsbereich: AP-01 in lokaler isolierter DEV-Probe

Der Prüfstand nennt das Datum der ausgeführten Probe. Die Durchsicht bewertet
ausschließlich, welche der damals offenen Punkte inzwischen durch eigene
Teilschnitte erbracht sind; der geprüfte Versionskorridor bleibt unverändert.

## Ziel und Ergebnis

Dieser Nachweis prüft vor dem Monorepo-Aufbau, ob die in den angenommenen ADRs
vorgegebenen Hauptversionen gemeinsam unter Node.js 24 LTS auflösbar und als
ES-Module ladbar sind.

Der geprüfte Korridor ist kompatibel. Es gibt keinen Versionsblocker für den
nächsten AP-01-Teilschnitt. Dieser Nachweis erzeugt noch keinen verbindlichen
Projekt-Lockfile und keine funktionsfähige Anwendung. Die konkrete
Repositoryauflösung wird im nachfolgenden Monorepo-Teilschnitt erneut geprüft
und dort exakt fixiert.

## Verbindliche Vorgaben

Der Nachweis setzt folgende angenommene Entscheidungen um:

- [ADR-0002](decisions/ADR-0002-typescript-technologiestack-und-monorepo.md):
  React 19, Vite, NestJS 11, Node.js 24 LTS und pnpm,
- [ADR-0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md):
  PostgreSQL 18 und Prisma 7,
- [ADR-0011](decisions/ADR-0011-logging-metriken-tracing-und-diagnose.md):
  Pino und OpenTelemetry,
- [ADR-0013](decisions/ADR-0013-teststrategie-und-software-lieferkette.md):
  Vitest, Playwright und Testcontainers.

## Geprüfter Versionskorridor

Die Patchstände sind ein reproduzierbarer Prüfstand und noch keine dauerhafte
Upgradefreigabe. Maßgeblich bleibt jeweils die im Repository fixierte Version.

| Bestandteil | Prüfversion | Veröffentlichte Kompatibilitätsgrenze | Ergebnis |
| --- | --- | --- | --- |
| Node.js | 24.18.1 LTS | Linie 24 ist LTS | bestanden |
| pnpm | 11.18.0 | Node.js `>=22.13` | bestanden |
| TypeScript | 5.9.3 | Node.js `>=14.17` | bestanden |
| React und React DOM | 19.2.8 | gleiche React-/React-DOM-Linie | bestanden |
| Vite | 8.2.0 | Node.js `^20.19.0` oder `>=22.12.0` | bestanden |
| NestJS | 11.1.28 | Node.js `>=20` | bestanden |
| Prisma und Prisma Client | 7.9.1 | Node.js `^20.19`, `^22.12` oder `>=24.0`; TypeScript `>=5.4` | bestanden |
| PostgreSQL | 18.4 | durch Prisma 7 als unterstützte Hauptversion geführt | Metadaten bestanden; Laufzeit folgt |
| Vitest | 4.1.10 | Node.js 20, 22 oder `>=24`; Vite 6 bis 8 | bestanden |
| Playwright Test | 1.62.1 | Node.js `>=20` | bestanden |
| Testcontainers | 12.0.4 | keine engere Node-Engine veröffentlicht | ESM-Import bestanden; Laufzeit folgt |
| Pino | 10.3.1 | keine engere Node-Engine veröffentlicht | ESM-Import bestanden |
| OpenTelemetry API | 1.9.1 | Node.js `>=8` | ESM-Import bestanden |

TypeScript 7.0.2 war am Prüftag die aktuelle Hauptversion. Für AP-01 bleibt
TypeScript 5.9.3 der geprüfte Ausgangspunkt, weil Prisma 7 diese Linie
ausdrücklich empfiehlt und kein fachlicher oder technischer Bedarf für einen
zusätzlichen TypeScript-Major-Wechsel besteht. Eine spätere Umstellung benötigt
einen eigenen kompatiblen Nachweis, aber kein neues ADR, solange die
angenommene Stackentscheidung unverändert bleibt.

Prisma 7 benötigt für direkte Datenbankverbindungen einen Treiberadapter und
ist ESM-basiert. Der Monorepo-Teilschnitt muss deshalb `type: module` und eine
ESM-kompatible TypeScript-Konfiguration verwenden. Die konkrete
PostgreSQL-Anbindung folgt erst im dafür vorgesehenen Integrationsschnitt.

## Quellen

Die folgenden Herstellerquellen und veröffentlichten Paketmetadaten wurden am
2026-08-02 geprüft:

- [Node.js-Releasestatus](https://nodejs.org/en/about/previous-releases),
- [React-Versionen](https://react.dev/versions),
- [Vite-8-Ankündigung und Node.js-Grenze](https://vite.dev/blog/announcing-vite8),
- [NestJS-11-Migrationshinweise](https://docs.nestjs.com/migration-guide),
- [Prisma-Systemanforderungen](https://docs.prisma.io/docs/orm/reference/system-requirements),
- [Prisma-Unterstützung für PostgreSQL](https://docs.prisma.io/docs/orm/reference/supported-databases),
- [Prisma-7-Upgradehinweise](https://docs.prisma.io/docs/orm/v6/more/upgrades/to-v7),
- [PostgreSQL-18-Releasehinweise](https://www.postgresql.org/docs/current/release-18.html),
- öffentliche npm-Registry-Metadaten über `pnpm view` für alle Tabellenzeilen.

## Reproduzierbare Prüfeingabe

Die Probe verwendet ausschließlich öffentliche Pakete. Das folgende Manifest
wird in einem leeren, temporären Verzeichnis als `package.json` gespeichert:

```json
{
  "name": "sobama-ap01-compatibility-probe",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.18.0",
  "engines": {
    "node": "24.x",
    "pnpm": "11.x"
  },
  "dependencies": {
    "@nestjs/common": "11.1.28",
    "@nestjs/core": "11.1.28",
    "@nestjs/platform-express": "11.1.28",
    "@opentelemetry/api": "1.9.1",
    "@prisma/client": "7.9.1",
    "pino": "10.3.1",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "reflect-metadata": "0.2.2",
    "rxjs": "7.8.2"
  },
  "devDependencies": {
    "@playwright/test": "1.62.1",
    "@types/react": "19.2.18",
    "@types/react-dom": "19.2.4",
    "prisma": "7.9.1",
    "testcontainers": "12.0.4",
    "typescript": "5.9.3",
    "vite": "8.2.0",
    "vitest": "4.1.10"
  }
}
```

## Prüfschritte

Voraussetzungen sind Docker mit Zugriff auf die öffentliche Registry und ein
leeres Probeverzeichnis außerhalb des Repositorys. Der Platzhalter
`<LEERES-PROBEVERZEICHNIS>` wird durch dessen absoluten Pfad ersetzt. Das
Verzeichnis darf keine Secrets oder private Konfiguration enthalten.

1. Die Metadaten werden ohne Installationsskripte streng aufgelöst:

   ```sh
   docker run --rm \
     --volume "<LEERES-PROBEVERZEICHNIS>:/workspace" \
     --workdir /workspace \
     node:24.18.1-bookworm-slim \
     sh -lc 'corepack enable && corepack prepare pnpm@11.18.0 --activate && pnpm install --lockfile-only --ignore-scripts --strict-peer-dependencies'
   ```

2. Das Ergebnis wird ohne Installationsskripte aus dem Lockfile installiert:

   ```sh
   docker run --rm \
     --volume "<LEERES-PROBEVERZEICHNIS>:/workspace" \
     --workdir /workspace \
     node:24.18.1-bookworm-slim \
     sh -lc 'corepack enable && corepack prepare pnpm@11.18.0 --activate && pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies'
   ```

3. TypeScript und die zentralen ES-Module werden geladen:

   ```sh
   docker run --rm \
     --volume "<LEERES-PROBEVERZEICHNIS>:/workspace" \
     --workdir /workspace \
     node:24.18.1-bookworm-slim \
     sh -lc 'corepack enable && corepack prepare pnpm@11.18.0 --activate && pnpm exec tsc --version && node --input-type=module -e "await Promise.all([import(\"react\"), import(\"@nestjs/core\"), import(\"vite\"), import(\"vitest\"), import(\"pino\"), import(\"@opentelemetry/api\"), import(\"testcontainers\")]); console.log(\"esm-imports: ok\")"'
   ```

Erwartet werden ausschließlich Exit-Code `0`, TypeScript `5.9.3` und die
Ausgabe `esm-imports: ok`. Warnungen über langsame Registryantworten verändern
das Ergebnis nicht.

## Ausgeführtes Ergebnis

Die Probe lief mit dem offiziellen Image
`node:24.18.1-bookworm-slim` und dem beim Abruf gemeldeten Digest
`sha256:235600a8101ab264e117b1768e925532262668dc9b581ef1dd7d96ced463b8e7`.

- Die strikte Lockfile-Auflösung endete mit Exit-Code `0`.
- pnpm bestätigte seine Supply-Chain-Prüfung für 458 Lockfileeinträge.
- Die gefrorene Installation löste 433 Pakete ohne Engine- oder
  Peer-Abhängigkeitskonflikt auf.
- Installationsskripte blieben deaktiviert.
- TypeScript meldete Version `5.9.3`.
- Alle geprüften ES-Module wurden erfolgreich geladen.

## Noch nicht nachgewiesen

Dieser Teilschnitt ersetzt keine späteren G1- bis G3-Nachweise.

Seit dem Prüfstand durch eigene Teilschnitte erbracht:

- tatsächliche Web-, API- und Worker-Builds und -Starts über #20, #23 und #24,
- native Containerbuilds über #23.

Offen bleiben:

- Prisma-Client-Erzeugung, Treiberadapter und Migration gegen PostgreSQL 18,
- Testcontainers-Start auf GitHub-hosted Runnern,
- Playwright-Browserlaufzeit und Browsermatrix,
- mehrarchitekturfähige Containerbuilds,
- Zielhost-, TST- und PRD-Eignung,
- Schwachstellen-, Lizenz-, SBOM- und Provenienzprüfung.

Diese Punkte blockieren nicht den Monorepo-Aufbau. Sie sind den zugehörigen
Teilschnitten beziehungsweise späteren Arbeitspaketen zugeordnet:
Browserlaufzeit und Browsermatrix in #26, Schwachstellen- und Lizenzprüfung in
#25, Prisma und Testcontainers ab AP-04 sowie Mehrarchitektur, Zielhosteignung,
SBOM und Provenienz in AP-11. Der kumulative G1- bis G3-Nachweis für AP-01
entsteht in #27.

## Fehlerbehandlung und sichere Abbruchbedingungen

- Bei Engine- oder Peer-Abhängigkeitskonflikten wird die Probe abgebrochen.
  `--force`, `--legacy-peer-deps` oder das Abschalten der Engineprüfung sind
  nicht zulässig.
- Bei einem Registry- oder Netzwerkfehler darf die unveränderte Probe erneut
  ausgeführt werden. Ein Netzwerkfehler ist kein Kompatibilitätsnachweis.
- Wenn Installationsskripte erforderlich werden, endet dieser reine
  Metadatennachweis. Solche Skripte werden erst im passenden isolierten Build-
  und Security-Nachweis zugelassen und bewertet.
- Ohne verfügbares Node-24-Containerimage darf ein Hostlauf die Probe nicht
  ersetzen.

## Security sowie DEV/TST/PRD

Die Probe verwendet keine Secrets, Zugangsdaten, privaten Registrys,
Infrastrukturwerte, Datenbanken oder produktiven Zugriffe. Sie wirkt nur auf
ein temporäres lokales DEV-Verzeichnis. TST und PRD sind nicht betroffen. Das
Repository erhält aus dieser Probe weder `node_modules` noch einen vorläufigen
Lockfile.

## Rollback und Pflege

Das temporäre Probeverzeichnis kann nach der Auswertung vollständig entfernt
werden. Im Repository lässt sich dieser reine Dokumentationsnachweis durch
Revertieren seiner Dokumentationsänderungen zurücknehmen; Laufzeit- oder
Datenfolgen entstehen nicht.

Verantwortlich für die Pflege ist der Projekteigentümer. Die Prüfung wird vor
dem ersten verbindlichen `pnpm-lock.yaml`, bei jeder Änderung einer genannten
Hauptversion sowie bei geänderten Node-, Prisma-, Vite- oder pnpm-Grenzen
wiederholt. Abweichende Patchstände werden im zugehörigen Pull Request
dokumentiert.

Damit dieser Korridor nicht durch ein Routineupdate unbemerkt verlassen wird,
legt Dependabot Hauptversionen einzeln statt gruppiert vor; `@types/node` und
das Node-Basisimage sind zusätzlich an die hier fixierte Node-Hauptlinie
gebunden. Die Regeln und ihre Nebenwirkungen stehen in den
[Prüfungen der Software-Lieferkette](../development/SUPPLY-CHAIN-CHECKS.md).
