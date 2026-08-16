# Prüfungen der Software-Lieferkette

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-16
- Bezogenes Issue: [#25](https://github.com/tomas-fuerl/SoSeBaMa/issues/25)
- Geltungsbereich: Pull-Request-Stufe in GitHub-hosted CI

## Ziel

Jede Änderung durchläuft vor dem Merge dieselben automatisierten
Lieferkettenprüfungen. Neue kritische und hohe Befunde blockieren; eine Ausnahme
ist nur befristet und dokumentiert zulässig.

## Geltungsbereich und Abgrenzung

Diese Anleitung beschreibt ausschließlich die Pull-Request-Stufe.
[ADR-0013](../architecture/decisions/ADR-0013-teststrategie-und-software-lieferkette.md)
nennt drei CI-Stufen; die nächtliche Stufe und der Releasekandidat gehören zu
späteren Arbeitspaketen. SBOM, Provenienz und Attestierung sind Gegenstand von
AP-11 und hier bewusst nicht enthalten.

## Welche Prüfung was abdeckt

| Prüfung | Gegenstand | Blockiert bei |
| --- | --- | --- |
| Dependency Review | neu hinzukommende Abhängigkeiten im Pull Request | Schweregrad `high` |
| Lizenzprüfung | Lizenz jeder aufgelösten Abhängigkeit | jeder nicht zugelassenen Lizenz |
| Trivy `image` | beide gebauten DEV-Images samt Systempaketen | `CRITICAL`, `HIGH` mit verfügbarem Fix |
| Trivy `image` (Browserlaufzeit) | das gepinnte Playwright-Testimage | **nichts** — nur Sichtbarkeit, siehe unten |
| Trivy `fs` | aufgelöste Abhängigkeiten aus dem Lockfile | `CRITICAL`, `HIGH`, auch ohne Fix |
| Trivy `config` | Dockerfiles und Compose-Dateien | `CRITICAL`, `HIGH` |
| CodeQL | TypeScript/JavaScript und GitHub-Actions-Workflows | Sicherheitsbefunden ab `HIGH`, über die Ruleset-Regel |
| Secret Scanning | Secrets im Repository und beim Push | jedem erkannten Secret |

Die Lizenzprüfung ist getrennt dokumentiert in der
[Lizenzrichtlinie](LICENSE-POLICY.md).

## Installationsrichtlinie

Die Richtlinie steht in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) und
**nicht** in `.npmrc`:

| Einstellung | Wirkung |
| --- | --- |
| `ignoreScripts` | Lifecycle-Skripte von Abhängigkeiten laufen nicht |
| `engineStrict` | Macht eine inkompatible **Node**-Version zum Installationsfehler statt zur Warnung |
| `strictPeerDependencies` | Eine unerfüllte Peer-Abhängigkeit bricht ab |
| `saveExact` | Neue Abhängigkeiten werden exakt festgeschrieben |

Die pnpm-Version gehört nicht in diese Zeile: Ein unerfülltes `engines.pnpm`
bricht ohnehin ab, unabhängig von `engineStrict`. Welche pnpm-Version läuft,
legen `packageManager` und Corepack fest. Die Abgrenzung steht unten unter
[Gekoppelte Toolchain-Versionen](#gekoppelte-toolchain-versionen).

**pnpm 11 liest aus `.npmrc` ausschließlich Auth- und Registry-Einstellungen.**
Jede andere Einstellung wird dort stillschweigend ignoriert. Bis 2026-08-16
standen alle vier Werte in `.npmrc` und waren damit wirkungslos. Gemessen wurde:

- Ein Paket mit `preinstall`-Skript und `ignore-scripts=true` in `.npmrc` führte
  das Skript trotzdem aus. Mit `ignoreScripts: true` in `pnpm-workspace.yaml`
  lief es nicht.
- Ein `engines.node`-Konflikt erzeugte mit `.npmrc` nur
  `[WARN] Unsupported engine` und Exit-Code `0`. Mit `engineStrict: true` in
  `pnpm-workspace.yaml` bricht derselbe Konflikt mit
  `ERR_PNPM_UNSUPPORTED_ENGINE` und Exit-Code `1` ab.

Sicherheitsrelevant ist davon vor allem `ignoreScripts`: Ein Lifecycle-Skript
ist beliebiger Code aus einer Abhängigkeit, der bei jeder Installation läuft.
Die Installationsbefehle in CI, Dokumentation und Containern übergeben
`--ignore-scripts` zusätzlich auf der Kommandozeile; dieser Teil war und bleibt
wirksam. Wirkungslos war ausschließlich der Rückfall für einen Aufruf ohne
Flags.

`pnpm-workspace.yaml` liegt im Buildkontext beider Container. Die Richtlinie
gilt damit auch innerhalb der Images. Nachgewiesen im Containerbuild: Mit einem
Basisimage, dessen Node-Stand von `engines.node` abweicht, bricht
`RUN pnpm install` mit `ERR_PNPM_UNSUPPORTED_ENGINE` ab; ohne diese
Einstellungen baut derselbe Build durch und meldet nur eine Warnung.

### Warum `.npmrc` nicht versioniert ist

`.npmrc` steht in [`.gitignore`](../../.gitignore) und in
[`.dockerignore`](../../.dockerignore). Unter pnpm 11 ist die Datei
ausschließlich eine Auth- und Registrydatei; der Hersteller verlangt für die
Datei im Workspace-Wurzelverzeichnis wörtlich, sie solle in `.gitignore`
stehen. Eine versionierte `.npmrc` wäre eine Einladung, später Zugangsdaten
hineinzuschreiben und mitzucommitten.

Der Ausschluss aus dem Buildkontext ist die zweite Schicht: Kein Dockerfile
kopiert die Datei, aber ohne den Eintrag würde eine lokale `.npmrc` überhaupt
erst an den Docker-Daemon übertragen.

Eine Installationseinstellung in `.npmrc` wäre ohnehin wirkungslos — es gibt
deshalb keinen Grund, dort etwas abzulegen. Wer lokal eine Registry-
Authentifizierung braucht, legt sie über die von pnpm vorgesehenen Benutzer-
oder CI-Mechanismen ab, nicht im Repository.

### Gekoppelte Toolchain-Versionen

Hier wirken **vier getrennte Mechanismen**. Sie werden leicht verwechselt, weil
alle „die Version festhalten":

| Mechanismus | Aufgabe |
| --- | --- |
| `engineStrict` | erzwingt die **Node**-Engine-Kompatibilität hart statt nur zu warnen |
| `engines.node` / `engines.pnpm` | deklarieren die unterstützte Laufzeit beziehungsweise den unterstützten Paketmanager |
| `packageManager` + Corepack | legen die tatsächlich verwendete pnpm-Version fest |
| `test/toolchain-policy.test.ts` | stellt sicher, dass alle Deklarationen im Repository dieselbe Version nennen |

Zur Abgrenzung der ersten beiden, weil die Fehlermeldung hier irreführt:

| Verletzung | ohne `engineStrict` | mit `engineStrict` |
| --- | --- | --- |
| `engines.node` unerfüllbar | Exit `0`, nur `[WARN] Unsupported engine` | Exit `1` |
| `engines.pnpm` unerfüllbar | Exit `1` | Exit `1` |

**`engineStrict` betrifft ausschließlich die Node-Seite.** Ein unerfüllbarer
pnpm-Bereich bricht ohnehin ab, auch ohne den Schalter. Beide Abbrüche melden
denselben Text `bad pnpm and/or Node.js version`; er sagt gerade nicht, welche
Regel gegriffen hat. Ein abweichender pnpm-Stand gegenüber `packageManager`
wird davon getrennt über `pmOnFail` gesteuert — hier bewusst auf dem Standard
belassen, weil Corepack die Version bereits festlegt.

Keiner dieser Mechanismen kennt `.node-version` oder ein Dockerfile. Sie
vergleichen ausschließlich die *laufende* Umgebung mit `engines`. Der Test
schließt genau diese Lücke: Ohne ihn könnten `.node-version` und ein
Basisimage auseinanderlaufen, ohne dass irgendetwas anschlägt — jede Umgebung
wäre für sich konsistent.

**Node**

| Stelle | Geforderte Gleichheit |
| --- | --- |
| `.node-version` | Referenz für lokale Shell und `actions/setup-node` |
| `engines.node` in `package.json` | **Linie** `^<Version>`, am Pin verankert — nicht exakt, siehe unten |
| `FROM node:…` in beiden Dockerfiles | exakt gleich |
| `@types/node` | **nur Hauptversion gleich** |

`@types/node` folgt ausschließlich Nodes Hauptlinie. Minor- und Patchstand sind
die von DefinitelyTyped und stimmen nie mit der Laufzeit überein; eine
Forderung nach voller Gleichheit wäre sachlich falsch und dauerhaft rot.
Maßgeblich ist die Hauptversion, weil sie entscheidet, welche APIs deklariert
sind. `.github/dependabot.yml` hält sie über eine `ignore`-Regel für
Hauptversionen in der Linie.

#### Warum `engines.node` eine Linie nennt und keine exakte Version

`engines.node` stand zunächst exakt auf dem Pin. Das war falsch, und der Fehler
war teuer: **`engines` gilt auch für fremde Umgebungen, die ihr eigenes Node
mitbringen.** Dependabots Updater-Container läuft auf einem anderen Patchstand
als der hier fixierte. Seit `engineStrict` wirksam ist, brach seine
npm-Aktualisierung deshalb ab:

```
| typescript | tool_version_not_supported | {
|            |   "tool-name": "Node",
|            |   "detected-version": "24.18.1",
|            |   "supported-versions": "v24.19.0" }
```

Die Folge war nicht kosmetisch: Dependabot konnte keine npm-Aktualisierungen
mehr erzeugen, **einschließlich Sicherheitsaktualisierungen**.

Nachgemessen unter Node 24.19.0, also genau dem Stand des Updaters:

| `engines.node` | Ergebnis |
| --- | --- |
| `24.18.1` | Exit `1`, `ERR_PNPM_UNSUPPORTED_ENGINE` |
| `^24.18.1` | Exit `0` |

Die Rollenteilung lautet daher:

- **`engines.node`** deklariert die *unterstützte* Linie.
- **`.node-version` und die Dockerfile-Basen** legen fest, was tatsächlich
  läuft — beide weiterhin exakt.

`engineStrict` setzt die Linie weiterhin hart durch; gemessen brechen
`^25.0.0`, `^23.0.0` und `^24.19.0` gegen ein laufendes 24.18.1 jeweils ab. Der
Driftschutz hängt ohnehin nicht an `engines`, sondern an der
Deklarationsgleichheit, die `test/toolchain-policy.test.ts` erzwingt: Der Caret
bleibt am Pin verankert, ein Anheben von `.node-version` zieht diesen Eintrag
also mit.

**Warum `engines.pnpm` exakt bleibt:** Für pnpm bringt keine fremde Umgebung
eine eigene Version mit. Corepack aktiviert überall genau den Stand aus
`packageManager`; es gibt hier also keinen Fall, den eine Linienangabe retten
müsste.

**pnpm**

| Stelle | Geforderte Gleichheit |
| --- | --- |
| `packageManager` in `package.json` | Referenz; Corepack aktiviert genau diese Version |
| `engines.pnpm` | exakt gleich; pnpm prüft diese Angabe ohne Zutun von `engineStrict` |
| `corepack prepare pnpm@…` in beiden Dockerfiles und in `quality.yml` | exakt gleich |

Ein Wechsel einer der beiden Versionen ändert alle zugehörigen Stellen
gemeinsam. Der Test läuft ohne Docker und meldet die Abweichung, bevor ein
Image gebaut wird.

## Entscheidung zu Befunden ohne verfügbaren Fix

Die Image-Scans melden ausschließlich Befunde, für die ein Fix existiert. Der
Abhängigkeitsscan über das Lockfile tut das bewusst **nicht** und meldet auch
Befunde ohne Fix.

**Begründung.** Der erste Lauf dieser Prüfungen ergab im Backendimage 22
Befunde, davon 5 kritische, sämtlich aus dem Debian-Unterbau des gepinnten
Node-Images und sämtlich ohne verfügbaren Fix (`affected`, `fix_deferred`,
`will_not_fix`). Solche Befunde bieten keine Handlungsoption außer einer
Ausnahme. Eine Prüfung, die dauerhaft rot steht, ohne dass jemand sie grün
bekommen kann, wird erfahrungsgemäß abgeschaltet oder mit pauschalen Ausnahmen
umgangen. Beides ist schlechter als eine bewusst gezogene und dokumentierte
Grenze.

Für die eigenen Abhängigkeiten gilt das nicht: Dort sind Fixes in aller Regel
verfügbar, und der Fall aus
[#32](https://github.com/tomas-fuerl/SoSeBaMa/issues/32) hat gezeigt, dass sie
auch tatsächlich eingespielt werden können. Deshalb bleibt dieser Scan streng.

**Der Preis dieser Entscheidung.** Ein kritischer Befund ohne Fix blockiert
nicht mehr. Im ersten Lauf betraf das unter anderem `zlib1g` mit
CVE-2023-45853, von Debian als `will_not_fix` geführt. Damit solche Befunde
nicht unsichtbar werden, läuft ein zusätzlicher, ausdrücklich nicht
blockierender Scan, der sie weiterhin in das Joblog schreibt.

**Ergänzende Maßnahme.** Die Runtime-Stages beider Images enthalten weder npm
noch corepack. Beide werden zur Laufzeit nicht benötigt, bringen aber ein
eigenes gebündeltes Abhängigkeitsset mit, das im ersten Lauf sieben weitere
Befunde erzeugte. Das Entfernen reduziert Angriffsfläche und Scanfläche
gleichermaßen und beseitigt diese Befunde, statt sie per Ausnahme zu
akzeptieren.

Diese Festlegung ist eine Entscheidung des Projekteigentümers. Sie wird mit dem
Merge des zugehörigen Pull Requests bestätigt und ist bei jeder Änderung der
Scanner oder der Basisimages erneut zu bewerten.

## Bestehende Ausnahmen

Zum Prüfstand dieser Anleitung besteht eine Gruppe von Ausnahmen: 13 Go-Befunde
im vorkompilierten Caddy-Binary des Web-Images, sämtlich `HIGH`. Davon tragen 12
eine CVE-Kennung und einer eine GHSA-Kennung.

**Nicht alle sind Denial of Service.** Drei betreffen ausschließlich andere
Wirkungen: `CVE-2026-39821` eine mögliche Umgehung von
Autorisierungsentscheidungen über fehlerhaft akzeptierte Punycode-Labels,
`CVE-2026-39822` das Verlassen einer Wurzelgrenze über Symlinks und
`CVE-2026-56858` Cross-Site Scripting. `GHSA-hrxh-6v49-42gf` vereint mehrere
Wirkungsklassen, nämlich einen Autorisierungsfehler in xDS RBAC und
Denial-of-Service-Szenarien. `CVE-2026-56853` ist entgegen einer früheren
Fassung dieses Dokuments sehr wohl ein Denial of Service: `ReadHeaderTimeout`
greift beim Lesen des h2c-Preface nicht. Jede Ausnahme in
[`.trivyignore.yaml`](../../.trivyignore.yaml) trägt deshalb eine eigene
Bewertung aus Wirkung, Erreichbarkeit in der tatsächlichen Caddy-Konfiguration
und Restrisiko, statt einer pauschalen Einstufung.

Der Weg über ein Update ist ausgeschöpft. Caddy 2.11.4 ist die neueste
veröffentlichte Version. Das offizielle Image wurde seit dem ursprünglichen Pin
neu gebaut, nachweislich aber mit derselben Go-Toolchain: Nach dem Digestwechsel
meldet Trivy unverändert `stdlib v1.26.3`, `x/net v0.55.0` und `x/text v0.37.0`.
Das Binary wird als offizielles Image übernommen und nicht selbst gebaut; die
einzige Abhilfe ist ein Upstream-Release mit neuerer Go-Version. Dependabot
überwacht das Docker-Ökosystem und meldet einen solchen Rebuild.

Grundlage der Erreichbarkeitsbewertung ist die tatsächliche Konfiguration in
`containers/caddy/`: Beide Caddyfiles setzen `admin off` und `auto_https off`;
TLS-Terminierung, `templates`, `browse`, XML-Verarbeitung und ein xDS-Client
sind nicht konfiguriert. Der Caddy-Startlog bestätigt zusätzlich
„HTTP/2 skipped because it requires TLS". Das ist eine Bewertung auf
Konfigurationsebene und kein Nachweis auf Codeebene; Erreichbarkeit über einen
nicht betrachteten internen Pfad ist damit nicht ausgeschlossen.

### Abweichender Schweregrad bei CVE-2026-39821

Trivy meldet diesen Befund als `HIGH`. Die GitHub Advisory Database führt ihn
unter `GHSA-w2q5-6q6x-x959` als **`CRITICAL` mit CVSS 10.0**.

Das ist kein Nebenaspekt: Diese Anleitung hält an anderer Stelle fest, dass für
einen kritischen Befund keine Ausnahme vorgesehen ist. Nach der Trivy-Einstufung
greift diese Regel nicht, nach der Advisory-Einstufung schon. Die Ausnahme wird
deshalb ausdrücklich als **Entscheidung des Projekteigentümers** geführt und
nicht als Routinefall.

Tragende Gründe für die befristete Annahme:

- Beide Caddyfiles definieren die Site als `:8080` ohne Hostnamen. Es gibt weder
  Host-Matcher noch hostbasierte Routing- oder Autorisierungsentscheidungen; es
  existiert also keine Entscheidung, die umgangen werden könnte.
- Der Reparaturweg ist ausgeschöpft, siehe oben.
- In DEV ist der Eingang ausschließlich über Loopback erreichbar.

Nicht tragend wäre die Trivy-Einstufung allein. **Vor einer TST- oder
PRD-Freigabe ist dieser Befund zwingend und vorrangig neu zu bewerten**; dort
entfällt die Loopback-Mitigation, und eine spätere hostbasierte Konfiguration
würde die Erreichbarkeitsbewertung umkehren.

Die Ausnahmen laufen am 2026-11-16 ab. Caddy ist der einzige
Anwendungseingang, die Befunde sind also nicht folgenlos; in DEV besteht
allerdings kein Zugriff von außerhalb des Loopback. **Vor einer TST- oder
PRD-Freigabe ist diese Gruppe neu zu bewerten und nicht ungeprüft zu
verlängern.** Dort entfällt die Loopback-Mitigation. Höchste Priorität hat
dabei `CVE-2026-39821`, weil Hostnamen bei jeder Anfrage verarbeitet werden.

## Hinweis zum Format der Ignoredatei

Das YAML-Format der Trivy-Ignoredatei ist vom Hersteller als experimentell
gekennzeichnet und kann sich ohne Rückwärtskompatibilität ändern. Die
Trivy-Version ist deshalb exakt gepinnt. **Ein Upgrade des Scanners muss
`.trivyignore.yaml` ausdrücklich erneut prüfen**: Eine nicht mehr gelesene
Ignoredatei würde die Ausnahmen stillschweigend unwirksam machen und den Lauf
rot färben, eine anders interpretierte Datei könnte umgekehrt zu viel
unterdrücken.

## Zusammenspiel mit Dependabot

Dependabot meldet Schwachstellen in Abhängigkeiten und öffnet
Sicherheitsaktualisierungen. Auto-Merge ist nach ADR-0013 nicht eingerichtet;
jede Aktualisierung durchläuft denselben Pflichtcheck wie jede andere Änderung.

**Bekannte Einschränkung.** GitHub verwirft mit der voreingestellten
Auto-Triage-Regel Befunde in `development`-scoped Abhängigkeiten automatisch.
Ein solcher Befund erscheint dann als `auto_dismissed`, und es entsteht keine
Sicherheitsaktualisierung. Beim Befund aus
[#32](https://github.com/tomas-fuerl/SoSeBaMa/issues/32) ist das zweimal
eingetreten; beide Male wurde er nur durch manuelle Durchsicht bemerkt.

Der Trivy-Lauf über das Lockfile kennt diese Regel nicht und meldet solche
Befunde unabhängig davon. Er ist damit die verlässlichere Erkennung. Ob die
Auto-Triage-Regel zusätzlich abgeschaltet wird, ist eine offene
Eigentümerentscheidung und in
[#46](https://github.com/tomas-fuerl/SoSeBaMa/issues/46) verfolgt.

## Warum die Browserlaufzeit nicht blockierend gescannt wird

Der Scan des Playwright-Testimages läuft mit `exit-code: 0`. Das ist eine
Eigentümerentscheidung, keine Nachlässigkeit.

Gemessen am 2026-08-16 gegen
`mcr.microsoft.com/playwright:v1.62.1-noble`, Schweregrad `CRITICAL,HIGH`, nur
Befunde **mit** verfügbarem Fix:

| Paket | Befunde |
| --- | --- |
| `tar` | 1 × CRITICAL, 1 × HIGH |
| `brace-expansion` | 3 × HIGH |
| `ip-address` | 1 × HIGH |
| `undici` | 1 × HIGH |

Alle sieben liegen im **gebündelten npm** des Images — dieselbe Klasse wie beim
Node-Basisimage. Dort war die Abhilfe, npm aus dem Runtime-Image zu entfernen;
hier ist sie nicht verfügbar, weil das Image vom Hersteller kommt und nur dieser
es neu bauen kann.

Die Entscheidung stützt sich auf vier Punkte:

1. Das Image ist ein **reines Testartefakt** und in keinem ausgelieferten
   Container enthalten. Weder `backend.Dockerfile` noch `web.Dockerfile`
   beziehen sich darauf.
2. Der Smoke ruft `node_modules/.bin/playwright` direkt auf. **npm wird nicht
   ausgeführt**, das gebündelte Abhängigkeitsset also nicht erreicht.
3. Der Container läuft unprivilegiert, mit read-only Root-Dateisystem, ohne
   Capabilities, im `internal`-Netz ohne Route nach außen. Nachgewiesen:
   Weder das Internet noch ein Hostport ist von dort erreichbar.
4. Ein blockierendes Gate wäre ohne Handlungsoption dauerhaft rot — genau die
   Lage, in der ein Check abgeschaltet statt beachtet wird.

Der Scan bleibt trotzdem im Lauf, damit die Befunde sichtbar sind und eine
Verschlechterung auffällt. **Auslöser für eine Neubewertung:** ein Befund
außerhalb des npm-Bundles, ein Befund in einer Browserbibliothek oder jede
Verwendung des Images außerhalb des Tests.

### Warum Hauptversionen nicht gruppiert werden

Die beiden npm-Gruppen sammeln ausschließlich Neben- und Patchstände
(`update-types: [minor, patch]`). Eine Hauptversion kommt als eigener Pull
Request.

Der Grund ist eine beobachtete Blockade, kein Vorsichtsprinzip. In
[#38](https://github.com/tomas-fuerl/SoSeBaMa/pull/38) enthielt die
Entwicklungsgruppe sechs Aktualisierungen. Vier davon waren verträglich, aber
`typescript` sprang von `5.9.3` auf `7.0.2`, und `typescript-eslint` bricht
gegen diese Hauptlinie mit `typescript-eslint does not support TS 7.0` ab. Der
Pflichtcheck war damit rot, und die vier verträglichen Aktualisierungen ließen
sich nicht einzeln übernehmen: Eine Gruppe ist genau ein Pull Request.

Hauptversionen werden dadurch **nicht unterdrückt**. Sie werden einzeln
vorgelegt und einzeln entschieden — passend dazu, dass ein Hauptversionswechsel
nach [AP-01-COMPATIBILITY.md](../architecture/AP-01-COMPATIBILITY.md) einen
eigenen Kompatibilitätsnachweis benötigt.

### Bewusst ignorierte Hauptversionen

Zwei Abhängigkeiten sind an die fixierte Node-Hauptversion gekoppelt und
erhalten deshalb in `.github/dependabot.yml` eine `ignore`-Regel für
`version-update:semver-major`:

| Abhängigkeit | Ökosystem | Gekoppelt an |
| --- | --- | --- |
| `@types/node` | npm | `.node-version`, `engines.node` |
| `node` (Basisimage) | docker | `.node-version`, beide Dockerfiles |

Beide bewegen sich nur gemeinsam mit der Laufzeit. Ein isolierter Sprung wäre
entweder wirkungslos oder falsch: Typdefinitionen einer höheren Node-Linie
lassen Code gegen APIs typprüfen, die zur Laufzeit nicht existieren, ohne dass
eine Prüfung anschlägt.

**Bewusst in Kauf genommene Nebenwirkung.** Eine `ignore`-Regel gilt bei
Dependabot auch für Sicherheitsaktualisierungen. Hier ist das ohne Folge:
`@types/node` liefert ausschließlich Typdeklarationen und keinen ausgeführten
Code, und für Dockerfile-Basisimages erzeugt Dependabot ohnehin keine
Sicherheitsaktualisierungen. Beide bleiben zusätzlich durch die Trivy-Scans
abgedeckt, die diese Regel nicht kennen. Für andere Abhängigkeiten wäre eine
solche Regel nicht zulässig.

Ein gewollter Wechsel der Node-Hauptlinie ändert `.node-version`, die
`engines`-Angaben, beide Dockerfiles, `@types/node` und diese beiden
`ignore`-Regeln in einem Vorgang mit eigenem Nachweis.

## Ausnahmeverfahren

Ein Befund wird zuerst behoben. Eine Ausnahme ist die Rückfallposition.

1. Prüfen, ob ein Patch verfügbar ist. Wenn ja, wird aktualisiert. Zielversion
   ist der Kopf der betroffenen Patchlinie, nicht die im Advisory genannte
   Mindestversion: Ein Advisory kann revidiert werden, wenn sich ein Patch als
   unvollständig erweist.
2. Prüfen, ob eine gleichwertige Alternative ohne den Befund existiert.
3. Erst danach eine Ausnahme in [`.trivyignore.yaml`](../../.trivyignore.yaml)
   eintragen. Jeder Eintrag benötigt `id`, `statement` und `expired_at`.
4. Die Entscheidung des Projekteigentümers im zugehörigen Issue oder Pull
   Request verlinken; sie enthält die Angaben aus der
   [Projekt-Governance](../GOVERNANCE.md).

`expired_at` ist verpflichtend. Trivy lässt die Ausnahme danach automatisch
verfallen, sodass ein vergessener Eintrag wieder sichtbar wird. Ein Eintrag ohne
Ablaufdatum ist nach dieser Richtlinie unzulässig.

Kritische Befunde werden nach ADR-0013 nie ungeklärt weitergereicht. Eine
Ausnahme für einen kritischen Befund ist nicht vorgesehen.

## Wie CodeQL den Merge blockiert

Der Workflow analysiert lediglich; ein Sicherheitsbefund lässt den
Analysejob **nicht** fehlschlagen und erscheint deshalb auch nicht im
zusammenfassenden Pflichtcheck `quality`. GitHub führt Befunde in einem eigenen
Status `Code scanning results / CodeQL`.

Die Durchsetzung erfolgt daher über eine eigene Ruleset-Regel. Stand
2026-08-16 ist im Ruleset `Protect main` konfiguriert:

| Parameter | Wert |
| --- | --- |
| Regeltyp | `code_scanning` |
| Werkzeug | `CodeQL` |
| `security_alerts_threshold` | `high_or_higher` |
| `alerts_threshold` | `errors` |
| `enforcement` | `active`, ohne Bypass-Actors |

**Diese Regel ist nicht Teil des Repositoryinhalts.** Sie lässt sich nicht über
einen Pull Request wiederherstellen und geht bei einem Revert nicht mit
verloren, kann aber ebenso unbemerkt entfernt werden. Der Zustand ist deshalb
bei jeder Änderung der Rulesets zu prüfen:

```sh
gh api repos/tomas-fuerl/SoSeBaMa/rulesets/20240280 \
  -q '.rules[] | select(.type=="code_scanning") | .parameters.code_scanning_tools[]'
```

## Verifikation

1. Den Pull Request öffnen und den Pflichtcheck `quality` abwarten. Er fasst
   `repository`, `containers`, `dependencies` und `code-scanning` zusammen.
   CodeQL-Sicherheitsbefunde wirken getrennt davon über die oben genannte
   Ruleset-Regel.

2. Bei Bedarf einen Scan lokal wiederholen. Der folgende Befehl benötigt eine
   laufende lokale Docker-Engine und verändert nichts:

   ```sh
   docker run --rm --volume "$PWD:/repo:ro" --workdir /repo \
     aquasec/trivy:0.74.0 fs --scanners vuln \
     --severity CRITICAL,HIGH --exit-code 1 --ignorefile .trivyignore.yaml .
   ```

   Erwartet wird Exit-Code `0`. Ein Befund nennt Paket, Version und Kennung.

3. CodeQL-Ergebnisse stehen ausschließlich in der Code-Scanning-Ansicht des
   Repositorys. Sie werden nicht lokal reproduziert.

## Fehlerbehandlung

- **Neuer CRITICAL- oder HIGH-Befund:** Nach dem Verfahren oben vorgehen. Der
  Schweregrad wird nicht herabgesetzt und die Prüfung nicht übersprungen, um
  einen Lauf grün zu bekommen.
- **Trivy-Datenbank nicht erreichbar:** Der Lauf endet mit einem Fehler. Der
  unveränderte Lauf wird wiederholt. Ein Netzwerkfehler ist kein bestandener
  Scan; die Prüfung wird dafür nicht abgeschaltet.
- **CodeQL meldet einen Befund:** Vor dem Merge bewerten. Ein Fehlbefund wird in
  der Code-Scanning-Ansicht mit Begründung geschlossen, nicht durch Entfernen
  der Sprache aus der Matrix.
- **Abgelaufene Ausnahme:** Der Befund schlägt wieder fehl. Das ist beabsichtigt.
  Die Ausnahme wird neu bewertet, nicht ohne Prüfung verlängert.
- **Sichere Abbruchbedingung:** Bei unklarer Lage wird nicht gemergt und die
  Bewertung dem Projekteigentümer vorgelegt.

## Rollback

Die Prüfungen erzeugen keine Daten- oder Laufzeitfolgen. Ein Rückbau besteht aus
dem Revert der Workflow-, Ausnahme- und Dokumentationsänderung. Bereits
aufgelöste Abhängigkeiten und gebaute Images bleiben davon unberührt.

## Pflege

Der Projekteigentümer prüft diese Anleitung bei jeder Änderung der Scanner, der
Schweregradgrenzen, des Ausnahmeverfahrens und bei der Einführung der nächtlichen
oder der Releasekandidatenstufe.
