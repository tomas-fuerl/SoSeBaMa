# Browserlaufzeit für den Chromium-Smoke

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-11-11 (bereinigter lokaler Kandidat; veröffentlichte CI separat nachweisen)
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

Chromium kommt weiterhin aus dem offiziellen, per Digest gepinnten
Playwright-Image. Aus dessen fertigem Dateisystem wird jedoch ein eigenes,
bereinigtes **Testimage** gebaut; das Herstellerimage wird nicht mehr direkt
ausgeführt. Ownerfreigabe für diesen zusätzlichen Scope: 2026-11-10, [#65](https://github.com/tomas-fuerl/SoSeBaMa/pull/65).

Der veröffentlichte Hersteller-Scan enthält drei HIGH-Secret-Verdachtsmeldungen
in früheren npm-Cache-/Logschichten. Eine Dateinameninventur des vereinigten
Dateisystems fand keine `/root/.npm`-Einträge. Das beweist weder Ungültigkeit
noch einen Fehlalarm: alte Schichten bleiben extrahierbar. Kein Tokeninhalt
wird übernommen oder als Zugang getestet.

[`containers/browser.Dockerfile`](../../containers/browser.Dockerfile) behebt
die zwei APT- und sieben mittleren PCRE2-Fundzeilen mit exakt gepinnten
Ubuntu-Paketen und entfernt
ungenutztes globales npm/Yarn. Die finale `scratch`-Stufe übernimmt nur das
vereinigte Dateisystem, **nicht** die alten Hersteller-/Buildschichten.
OS-Paketdatenbank, Browser und Lizenzdateien bleiben für Analyse und
Attribution erhalten. Das ist kein Betriebssystemwechsel: Ubuntu und die
Hersteller-Browserbibliotheken werden weiterverwendet. Kein neuer Browser-
Download, kein eigener Chromium-Build, keine neue Sicherheitsausnahme.

Nur eine Löschschicht auf `FROM <Herstellerimage>` würde die alten Inhalte
weiter verteilen und scheidet aus. Ungepinntes Nachladen oder ein Wechsel der
Browserdistribution bleiben aus den unten genannten Gründen ausgeschlossen.
Ein eigener vollständiger Browserbuild wäre deutlich größerer Pflegeaufwand.
Die bestehende Container-/Sandbox-/Netzgrenze bleibt unverändert; dies ist ein
Security-Fix innerhalb des angenommenen Stacks, keine neue Technologieentscheidung.

| Verworfene Alternative | Grund |
| --- | --- |
| `pnpm exec playwright install chromium` | Der Download ist nur über eine Versionsangabe bestimmt, nicht über eine Prüfsumme. Das Repository pinnt jedes andere externe Artefakt per Digest oder Commit-SHA und erzwingt das maschinell; ein CDN-Abruf wäre der einzige ungepinnte Pfad und damit schwächer als der eigene Standard. |
| Chromium aus Debian-Paketen | Version und Playwright-Protokoll müssten getrennt gepflegt werden; Playwright unterstützt ausdrücklich nur die eigenen Builds. |
| Browser im DEV-Image mitbauen | Vergrößert das Anwendungsimage dauerhaft für einen reinen Testzweck und vermischt Anwendungs- mit Testlaufzeit. |

Die kanonische Herstellerreferenz steht in
[`containers/browser-runtime.json`](../../containers/browser-runtime.json).
Der Dockerfile-Pin wird maschinell dagegen geprüft. `runtimeImage` benennt nur
den **lokalen Buildtag**, keine entfernte Lieferquelle. Der Smoke inspiziert
dieses Image, prüft Herkunft, Buildmarker und den SHA-256 des aktuellen
Dockerfiles und startet mit der
unveränderlichen Image-ID und `--pull never`. Die Marker sind ein Driftcheck,
keine kryptografische Provenienz oder Attestierung. Ein nach einer
Dockerfileänderung veraltetes lokales Image wird abgewiesen.

Der aktuelle Pin ist Playwright 1.65.0. Der offizielle Multi-Arch-Index
`sha256:6e3fb709361521eb27161606e6da6d2674e5e89fa16516cb37d6fdd91372273d`
wurde am 2026-11-10 fuer amd64 und arm64 verifiziert und erfolgreich gezogen.
Der damalige 1.62.1-Installationsversuch bleibt oben als historischer Nachweis
gekennzeichnet. Aktuelle Image-Befunde und die noch offene Neubewertung stehen
in [Supply-Chain-Prüfungen](SUPPLY-CHAIN-CHECKS.md).

## Was das Image enthält — und was nicht

Das Testimage liefert Browserbinärdateien unter `/ms-playwright` mit gesetztem
`PLAYWRIGHT_BROWSERS_PATH`, außerdem Node und Systemabhängigkeiten. Ein
Playwright-npm-Paket ist **nicht** enthalten; im Image gibt es weder ein
globales `playwright` noch ein `node_modules` mit Playwright.

Das ist keine Lücke, sondern die vorgesehene Aufteilung: Die Testbibliothek
stammt aus dem Lockfile dieses Repositorys, die Binärdatei aus dem gepinnten
Image. Beide Hälften werden getrennt versioniert und müssen zusammenpassen —
deshalb prüft Schritt 5 das Zusammenspiel und nicht nur zwei Versionsstrings.

Praktische Folge: `npx playwright --version` ist kein Prüfschritt. Im
bereinigten Image fehlt npx; im direkten Herstellerimage würde es ein Paket
nachladen können. Der Smoke ruft ausschließlich das Playwright dieses
Repositorys aus dem schreibgeschützten Mount auf.

## Warum der Index-Digest und nicht der Plattform-Digest

Der eingetragene Digest gehört zum Multi-Arch-Index, nicht zu einem einzelnen
Plattformmanifest. Er pinnt unveränderlich und löst gleichzeitig auf `amd64`
und `arm64` auf. Das ist keine Bequemlichkeit, sondern notwendig: CI läuft auf
`amd64`, Entwicklungsmaschinen häufig auf `arm64`. Ein Plattformdigest würde auf
der jeweils anderen Architektur fehlschlagen.

## Warum die Chromium-Sandbox abgeschaltet ist

Das Herstellerimage läuft ab Werk als `root`; das eigene Testimage und der Smoke laufen als
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
- Laufende lokale DEV-Container-Laufzeit für Schritt 3; genügend freier
  Speicher für Herstellerimage, Buildcache und bereinigtes Image (mehrere GiB).
- Netzzugang zu `mcr.microsoft.com`. Das ist eine **zweite Registry** neben
  Docker Hub; sie ist damit ein weiterer Vertrauensanker und ein weiterer
  möglicher Ausfallpunkt.
- Netzzugang zu den signierten Ubuntu-Paketquellen für die exakt gepinnten
  APT-Fixpakete. Keine produktiven Docker-Kontexte verwenden.

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

3. Das bereinigte Testimage bauen:

   ```bash
   pnpm browser:build
   ```

   Erwartet: Exit-Code `0`, lokales Image `sosebama-browser:dev`.
   Der Build bezieht die gepinnte Herstellerquelle und die exakt angegebenen
   Ubuntu-Fixpakete. Keine lokale `.npmrc` oder Environment-Datei wird kopiert.
   Bei einem Fehler abbrechen; **kein** Rückfall auf das direkte Herstellerimage.

4. Das gebaute Image vor seiner ersten Ausführung scannen. Der Socket wird
   ausschließlich dem vorhandenen lokalen Scanner gegeben, niemals dem Browser:

   ```bash
   docker run --rm --volume /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy:0.74.0 image --scanners vuln --severity HIGH,CRITICAL \
     --ignore-unfixed --exit-code 1 sosebama-browser:dev
   docker run --rm --volume /var/run/docker.sock:/var/run/docker.sock \
     aquasec/trivy:0.74.0 image --scanners secret --exit-code 1 sosebama-browser:dev
   ```

   Erwartet: beide Scans erfolgreich, keine fixbaren HIGH/CRITICAL und keine
   Secret-Treffer. Technische Scannerfehler oder neue Befunde sind ein
   Abbruchgrund, kein Anlass für eine Ignore-Regel oder erweiterten Waiver.
   Vollständige Secret-Matches nicht kopieren oder veröffentlichen.

5. Den vorhandenen DEV-Stack gemäß [DEV-Container](DEV-CONTAINERS.md) starten
   und `pnpm browser:smoke` ausführen. Erwartet: drei bestandene Chromiumtests
   ohne Download, im internen Netz und mit unveränderter Härtung. Anschließend
   `pnpm container:down` und `pnpm container:cleanup` ausführen.

## Erwartetes Ergebnis

Die Abhängigkeitsinstallation bleibt frei von Browserbinärdateien, und die
Browserquelle ist über einen unveränderlichen Digest bestimmt. Das daraus
gebaute Testimage wird separat gescannt und anhand seiner lokalen Image-ID
gestartet; ein lokaler Buildtag allein ist kein Qualifikationsnachweis.

## Verifikation

```bash
pnpm test:toolchain
```

Die Prüfungen unter `pinned browser runtime` verlangen: genau eine
Imagereferenz, Pinnung per `sha256`, kein beweglicher Tag, die erwartete
Registry und Versionsgleichheit zwischen Imagetag und installiertem
`@playwright/test`. Sie benötigen keine Container-Laufzeit und laufen deshalb
in `pnpm check` sowie im CI-Job `repository`.

Zusätzlich wird der bereinigte Aufbau (`FROM scratch`, Dateisystemkopie,
APT-Fixpins, Entfernung globaler npm-Pakete) geprüft. In CI erhalten beide
blockierenden Scans und der vorhandene Browser-Smoke dieselbe lokale Image-ID.
Der zusätzliche Sichtbarkeitsscan zeigt nichtfixbare HIGH/CRITICAL weiterhin.
Ein grüner Deklarationstest ersetzt weder Image-Scan noch Chromiumlauf.

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
- **APT-Fixversion nicht mehr verfügbar:** Build abbrechen und Pin anhand
  eines frischen Scans neu bewerten. Kein Downgrade und kein ungepinntes Update.
- **Bereinigtes Image fehlt oder Marker stimmen nicht:** `pnpm browser:build`
  wiederholen und erneut scannen. Der Smoke lädt kein Ersatzimage nach.

## Rollback

Ein reviewter Revert stellt Dockerfile, Workflow, Helfer und Konfiguration auf
den vorherigen Stand zurück. Die bestehende Playwright-Abhängigkeit wird
dadurch nicht entfernt. Datenfolgen entstehen nicht; die Anwendung
verwendet die Browserlaufzeit an keiner Stelle. Ein Rückbau auf den bekannten
ungeklärten Herstellerstand ist **keine** erneute Nutzungsfreigabe; Browser-
Qualifikation bis zu einer sicheren Alternative aussetzen.

Ein lokal bezogenes Image lässt sich entfernen:

```bash
docker image rm sosebama-browser:dev
```

## Pflege

Verantwortlich ist der Projekteigentümer. Auslöser für eine Aktualisierung sind
eine neue Playwright-Version, ein neu veröffentlichter Imagetag und jeder
Sicherheitsbefund an der Browserlaufzeit. Bei jedem Quellenwechsel die
APT-Pins erneut bewerten, überflüssige Pins entfernen und beide Plattformen
getrennt qualifizieren. Ein amd64-Nachweis belegt keine native arm64-Ausführung.
Build, Secret-/Vulnerability-/Konfigurationsscan und drei Smokes wiederholen.
Der bereinigte Build entfernt alte Schichten nur aus dem **neuen** Image;
bereits bezogene Herstellerimages und lokale Buildcaches bleiben unverändert.

Digest neu ermitteln:

```bash
docker buildx imagetools inspect mcr.microsoft.com/playwright:v<version>-noble
```

Der oberste ausgewiesene `Digest` ist der Index-Digest und gehört in
`containers/browser-runtime.json`. Die darunter aufgeführten Plattformmanifeste
werden **nicht** eingetragen.

Den identischen Pin im Browser-Dockerfile aktualisieren; der Policytest
erzwingt die Gleichheit. Ohne Registry-Push gibt es keinen veröffentlichten
Multi-Arch-Digest des eigenen Testimages. CI baut es deshalb jeweils neu und
scannt das tatsächlich ausgeführte Artefakt. Exakte APT-Versionen und ein
Source-Digest sind keine Behauptung bitidentischer Builds oder vollständiger
Build-Provenienz.

Playwright und Imagetag werden gemeinsam gehoben. Dependabot kann diese Kopplung
nicht herstellen; `pnpm test:toolchain` weist eine Abweichung aus.
