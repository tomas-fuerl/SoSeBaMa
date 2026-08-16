# Browserlaufzeit für den Chromium-Smoke

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-16
- Bezogenes Issue: [#26](https://github.com/tomas-fuerl/SoSeBaMa/issues/26)
- Geltungsbereich: lokale DEV-Umgebung und Pull-Request-Stufe

## Ziel

Chromium steht für den Browser-Smoke aus einer nachvollziehbar gepinnten Quelle
zur Verfügung, ohne dass die Abhängigkeitsinstallation eine Binärdatei aus dem
Netz nachlädt.

## Geltungsbereich

Beschrieben wird ausschließlich die Herkunft und Pflege der Browserlaufzeit.

Nicht enthalten: der Smoke selbst, Firefox, WebKit sowie jede Browser- und
Gerätematrix. Die Matrix gehört zu AP-11, der Smoke zum nachfolgenden
Teilschnitt von [#26](https://github.com/tomas-fuerl/SoSeBaMa/issues/26).

## Ausgangsbefund

Die lokale Entwicklungsgrundlage verlangt für Werkzeuge mit Installations- oder
Generierungsschritten zuerst einen eigenen Supply-Chain-Nachweis. Für Playwright
wurde ein solcher Schritt angenommen — die Annahme trägt nicht:

**`@playwright/test` lädt bei der Installation keinen Browser.** Gemessen am
2026-08-16 mit Version `1.62.1` in einem leeren Verzeichnis, mit `npm` und
**aktivierten** Lifecycle-Skripten sowie isoliertem `PLAYWRIGHT_BROWSERS_PATH`:
Die Installation endete mit Exit-Code `0` und einem leeren Browserverzeichnis.

Das ist kein Zufall dieser Version, sondern eine Umstellung des Herstellers.
Das veröffentlichte Paket `playwright` deklarierte bis einschließlich `1.37.1`
`"scripts": {"install": "node install.js"}` und ab `1.38.0` kein Skript mehr:

| Version | deklariertes Skript |
| --- | --- |
| `playwright@1.37.1` | `install: node install.js` |
| `playwright@1.38.0` und später | keines |

Seither lädt ausschließlich der ausdrückliche Aufruf `playwright install`
Browser nach.

Damit ist `--ignore-scripts` an dieser Stelle **nicht** die wirksame Schranke.
Die Installationsrichtlinie in
[`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) bleibt trotzdem richtig und
in Kraft; sie ist hier nur nicht der Grund, warum kein Browser entsteht.

Der eigentliche Supply-Chain-Punkt bleibt bestehen und verschiebt sich lediglich:
Chromium muss irgendwoher kommen. Genau diese Quelle legt diese Anleitung fest.

## Entscheidung

Chromium kommt aus dem offiziellen, per Digest gepinnten Playwright-Image.

| Verworfene Alternative | Grund |
| --- | --- |
| `pnpm exec playwright install chromium` | Der Download ist nur über eine Versionsangabe bestimmt, nicht über eine Prüfsumme. Das Repository pinnt jedes andere externe Artefakt per Digest oder Commit-SHA und erzwingt das maschinell; ein CDN-Abruf wäre der einzige ungepinnte Pfad und damit schwächer als der eigene Standard. |
| Chromium aus Debian-Paketen | Version und Playwright-Protokoll müssten getrennt gepflegt werden; Playwright unterstützt ausdrücklich nur die eigenen Builds. |
| Browser im DEV-Image mitbauen | Vergrößert das Anwendungsimage dauerhaft für einen reinen Testzweck und vermischt Anwendungs- mit Testlaufzeit. |

Die Referenz steht als einzige Quelle in
[`containers/browser-runtime.json`](../../containers/browser-runtime.json).
Werkzeuge und Tests lesen ausschließlich diese Datei.

## Was das Image enthält — und was nicht

Das Image liefert **nur** Browserbinärdateien und deren Systemabhängigkeiten,
unter `/ms-playwright` mit gesetztem `PLAYWRIGHT_BROWSERS_PATH`. Ein
Playwright-npm-Paket ist **nicht** enthalten; im Image gibt es weder ein
globales `playwright` noch ein `node_modules` mit Playwright.

Das ist keine Lücke, sondern die vorgesehene Aufteilung: Die Testbibliothek
stammt aus dem Lockfile dieses Repositorys, die Binärdatei aus dem gepinnten
Image. Beide Hälften werden getrennt versioniert und müssen zusammenpassen —
deshalb prüft Schritt 4 das Zusammenspiel und nicht nur zwei Versionsstrings.

Praktische Folge: Ein Aufruf wie `docker run <image> npx playwright --version`
funktioniert **nicht** wie erwartet. Er lädt `playwright` aus der Registry
nach und scheitert ohne Netz. Für eine Versionsauskunft ist er unbrauchbar.

## Warum der Index-Digest und nicht der Plattform-Digest

Der eingetragene Digest gehört zum Multi-Arch-Index, nicht zu einem einzelnen
Plattformmanifest. Er pinnt unveränderlich und löst gleichzeitig auf `amd64`
und `arm64` auf. Das ist keine Bequemlichkeit, sondern notwendig: CI läuft auf
`amd64`, Entwicklungsmaschinen häufig auf `arm64`. Ein Plattformdigest würde auf
der jeweils anderen Architektur fehlschlagen.

## Warum die Chromium-Sandbox abgeschaltet ist

Das Image läuft ab Werk als `root`; der Smoke startet es dagegen bewusst als
`1000:1000` mit `--cap-drop ALL` und `no-new-privileges`. Genau diese Härtung
nimmt Chromium die Mittel, seine eigene Sandbox aufzubauen — sie braucht dafür
Capabilities beziehungsweise User-Namespaces.

Die Entscheidung lautet deshalb: **Sandbox aus, Härtung an.** Sie umzudrehen
hieße, dem Browser die Rechte zurückzugeben, die die Containerpolicy gerade
entfernt. Der Container ist stattdessen die Isolationsgrenze — ephemer,
read-only, ohne Capabilities, unprivilegiert, im `internal`-Netz ohne Route nach
außen. Der Smoke lädt ausschließlich Inhalte, die dieses Repository erzeugt hat.

Nachgewiesen wurde die Netzgrenze aus dem Browsercontainer heraus: weder
`https://example.com` noch der veröffentlichte Hostport waren erreichbar, der
Gateway dagegen mit HTTP 200.

Die Einstellung steht in `playwright.config.ts` mit derselben Begründung, damit
sie nicht ohne Kenntnis dieser Abwägung geändert wird.

## Voraussetzungen

- Node und pnpm in den fixierten Versionen, siehe
  [Lokale Entwicklungsumgebung](LOCAL-DEVELOPMENT.md).
- Laufende Container-Laufzeit für Schritt 3.
- Netzzugang zu `mcr.microsoft.com`. Das ist eine **zweite Registry** neben
  Docker Hub; sie ist damit ein weiterer Vertrauensanker und ein weiterer
  möglicher Ausfallpunkt.

## Sicherheitswarnungen

- Das Image ist groß und enthält eine vollständige Browserlaufzeit mit
  Systembibliotheken. Es gehört **nicht** in ein Anwendungsimage und wird
  ausschließlich für Tests gestartet.
- Der Digest darf nie durch einen beweglichen Tag ersetzt werden. Ohne Digest
  wäre nicht mehr feststellbar, welche Binärdatei den Test bestanden hat.
- Ein Digestwechsel ist eine Änderung der Lieferkette und benötigt denselben
  Review wie jede andere Abhängigkeitsänderung.

## Nummerierte Schritte

1. Ein leeres Browserverzeichnis anlegen und die Installation ausschließlich
   dorthin lenken:

   ```bash
   SOSEBAMA_PROBE="$(mktemp -d)" \
     && PLAYWRIGHT_BROWSERS_PATH="$SOSEBAMA_PROBE" \
        pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   ```

   Erwartet: Exit-Code `0`.

   Die Isolation ist der eigentliche Punkt dieses Schritts. Ein Blick in die
   Standardpfade unter `$HOME` würde auf einer benutzten Maschine nichts
   belegen: Ein dort bereits vorhandener Cache erzeugt einen Fehlalarm, und
   ohne Vorher-Nachher-Bezug bliebe offen, ob diese Installation etwas geladen
   hat.

2. Belegen, dass kein Browser entstanden ist, und aufräumen:

   ```bash
   find "$SOSEBAMA_PROBE" -mindepth 1 | head; rmdir "$SOSEBAMA_PROBE"
   ```

   Erwartet: keine Ausgabe von `find` — das Verzeichnis ist leer geblieben —
   und `rmdir` gelingt.

3. Die gepinnte Browserlaufzeit beziehen:

   ```bash
   docker pull "$(node -e "process.stdout.write(require('./containers/browser-runtime.json').image)")"
   ```

   Erwartet: Exit-Code `0`.

4. Prüfen, dass das Playwright **dieses Repositorys** im Image genau den
   Chromium-Build findet, den es erwartet:

   ```bash
   docker run --rm --network none -v "$PWD":/w:ro -w /w \
     "$(node -e "process.stdout.write(require('./containers/browser-runtime.json').image)")" \
     node -e "const {chromium}=require('@playwright/test');const p=chromium.executablePath();console.log(p, require('node:fs').existsSync(p))"
   ```

   Erwartet: ein Pfad unterhalb von `/ms-playwright` und `true`, zum Prüfstand
   `/ms-playwright/chromium-1234/chrome-linux64/chrome true`.

   `--network none` ist hier kein Beiwerk, sondern der Kern des Schritts: Er
   belegt, dass die Binärdatei aus dem Image stammt und nichts nachgeladen wird.

## Erwartetes Ergebnis

Die Abhängigkeitsinstallation bleibt frei von Browserbinärdateien, und die
Browserlaufzeit ist über einen unveränderlichen Digest bestimmt.

## Verifikation

```bash
pnpm test:toolchain
```

Die Prüfungen unter `pinned browser runtime` verlangen: genau eine
Imagereferenz, Pinnung per `sha256`, kein beweglicher Tag, die erwartete
Registry und Versionsgleichheit zwischen Imagetag und installiertem
`@playwright/test`. Sie benötigen keine Container-Laufzeit und laufen deshalb
in `pnpm check` sowie im CI-Job `repository`.

**Abgrenzung:** Maschinell geprüft ist damit die *Deklaration*. Das
Zusammenspiel aus Schritt 4 — findet das Playwright des Repositorys seinen
Chromium-Build im Image — ist hier ein dokumentierter Prüfschritt. Automatisiert
wird es mit dem Browser-Smoke im nachfolgenden Teilschnitt, der das Image
ohnehin startet; ein zweiter Bezug desselben mehrere Gigabyte großen Images
allein für diese Prüfung wäre nicht zu rechtfertigen.

## Fehlerbehandlung

- **Versionsgleichheit schlägt fehl:** Nicht den Test anpassen. Entweder das
  Image auf die installierte Playwright-Version heben oder umgekehrt; beides
  gehört in denselben Pull Request.
- **Digest nicht auffindbar:** Der Tag wurde neu veröffentlicht. Digest nach dem
  Verfahren unter „Pflege" neu ermitteln und die Änderung begründen.
- **Kein Netzzugang zu `mcr.microsoft.com`:** Abbrechen und wiederholen. Nicht
  auf einen ungepinnten Bezug ausweichen und nicht auf `playwright install`
  zurückfallen.
- **Ein Browser wird bei der Installation doch geladen:** Abbrechen. Das wäre
  ein Verhaltenswechsel gegenüber dem hier festgehaltenen Prüfstand und ist vor
  dem Weiterarbeiten zu klären.

## Rollback

Die Änderung ist reine Konfiguration und Dokumentation. Ein `git revert` des
zugehörigen Commits entfernt die Entwicklungsabhängigkeit, die Referenzdatei und
die Prüfungen. Laufzeit- oder Datenfolgen entstehen nicht; die Anwendung
verwendet die Browserlaufzeit an keiner Stelle.

Ein lokal bezogenes Image lässt sich entfernen:

```bash
docker image rm mcr.microsoft.com/playwright:v1.62.1-noble
```

## Pflege

Verantwortlich ist der Projekteigentümer. Auslöser für eine Aktualisierung sind
eine neue Playwright-Version, ein neu veröffentlichter Imagetag und jeder
Sicherheitsbefund an der Browserlaufzeit.

Digest neu ermitteln:

```bash
docker buildx imagetools inspect mcr.microsoft.com/playwright:v<version>-noble
```

Der oberste ausgewiesene `Digest` ist der Index-Digest und gehört in
`containers/browser-runtime.json`. Die darunter aufgeführten Plattformmanifeste
werden **nicht** eingetragen.

Playwright und Imagetag werden gemeinsam gehoben. Dependabot kann diese Kopplung
nicht herstellen; `pnpm test:toolchain` weist eine Abweichung aus.
