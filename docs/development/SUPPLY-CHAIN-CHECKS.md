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
| Trivy `fs` | aufgelöste Abhängigkeiten aus dem Lockfile | `CRITICAL`, `HIGH`, auch ohne Fix |
| Trivy `config` | Dockerfiles und Compose-Dateien | `CRITICAL`, `HIGH` |
| CodeQL | TypeScript/JavaScript und GitHub-Actions-Workflows | Sicherheitsbefunden ab `HIGH`, über die Ruleset-Regel |
| Secret Scanning | Secrets im Repository und beim Push | jedem erkannten Secret |

Die Lizenzprüfung ist getrennt dokumentiert in der
[Lizenzrichtlinie](LICENSE-POLICY.md).

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
Eigentümerentscheidung und in #25 vermerkt.

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
