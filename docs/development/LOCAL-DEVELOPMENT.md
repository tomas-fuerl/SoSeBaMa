# Lokale Entwicklungsgrundlage

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-11
- Geltungsbereich: lokales DEV und GitHub-hosted CI

## Ziel

Ein frischer Checkout installiert exakt die fixierten Abhängigkeiten. Danach
enden Format-, Lint-, TypeScript-, Build-, Test- und
Markdown-Dateizielprüfungen gemeinsam mit Exit-Code `0`.

Diese Anleitung verändert weder TST noch PRD. Sie benötigt keine Secrets,
privaten Registrys oder Infrastrukturwerte.

## Voraussetzungen

- ein sauberer Checkout dieses öffentlichen Repositorys,
- Git,
- Node.js exakt in der Version aus [`.node-version`](../../.node-version),
- Corepack `0.35.0`,
- öffentlicher Zugriff auf die npm-Registry.

Ein lokaler Versionsmanager darf `.node-version` auswerten. Das Repository legt
keinen Versionsmanager fest. VS-Code-Einstellungen unter `.vscode/` bleiben
lokal und werden nicht für Installation oder Prüfung benötigt.

## Installation und Prüfung

1. Repositoryzustand prüfen:

   ```sh
   git status --short --branch
   ```

   Erwartet wird der beabsichtigte Branch ohne unbekannte Änderungen. Bei
   fremden oder unklaren Änderungen wird abgebrochen.

2. Node.js prüfen:

   ```sh
   node --version
   ```

   Erwartet wird `v24.18.1`. Eine andere Version wird nicht mit `--force`
   umgangen.

3. Den im Repository fixierten Paketmanager aktivieren:

   ```sh
   corepack enable
   corepack prepare pnpm@11.18.0 --activate
   pnpm --version
   ```

   Erwartet wird `11.18.0`.

4. Abhängigkeiten ausschließlich aus dem Lockfile installieren:

   ```sh
   pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   ```

   Erwartet werden keine Engine-, Peer- oder Lockfilefehler. Die Installation
   darf `pnpm-lock.yaml` nicht verändern und führt in diesem Teilschnitt keine
   Abhängigkeitsskripte aus.

5. Alle aktuell anwendbaren Repositoryprüfungen ausführen:

   ```sh
   pnpm check
   ```

   Format, ESLint, TypeScript, die drei Laufzeitbuilds, die automatisierten
   Architektur-, Prozess- und Laufzeittests sowie die Prüfung relativer
   Markdown-Dateiziele müssen jeweils mit Exit-Code `0` enden. Die
   Architekturtests nennen bei einem Grenzverstoß Datei und Regel. Die
   Prozesstests senden reale lokale Signale und räumen fehlgeschlagene Child
   Processes mit harten Timeouts auf.

6. Nur wenn die Rollen lokal interaktiv benötigt werden, der
   [Anleitung für Web, API und Worker](RUNTIME-ROLES.md) folgen. Die dortigen
   Prozesse werden nicht durch `pnpm check` dauerhaft gestartet.

7. Nur wenn ein Coveragebericht benötigt wird, den V8-Einstieg ausführen:

   ```sh
   pnpm test:coverage
   ```

   Erwartet wird Exit-Code `0`. Der Bericht liegt lokal unter `coverage/` und
   bleibt durch `.gitignore` außerhalb des Repositorys. Für das noch leere
   Walking Skeleton gilt bewusst kein Coverage-Zielwert.

## Verifikation

Nach der Prüfung bleibt der versionierte Stand unverändert:

```sh
git status --short
```

Neue Einträge dürfen nur erwartete lokale, durch `.gitignore` ausgeschlossene
Installations- und Buildartefakte sein. Die Anwendung enthält ausschließlich
technische Starts und Health-Nachweise; fachliche Routen und Funktionen fehlen.

`pnpm docs:links` ist bewusst eine Dateizielprüfung. Sie prüft, ob relative
Markdown-Ziele im Repository existieren. Überschriftenanker und die vollständige
Markdown-Syntax gehören nicht zu ihrem Umfang.

## Fehlerbehandlung

- **Falsche Node- oder pnpm-Version:** Version aus `.node-version` und
  `package.json` aktivieren. Nicht mit abgeschalteter Engineprüfung fortfahren.
- **Corepack-Berechtigungsfehler:** Einen benutzerlokalen Node-Versionsmanager
  verwenden. Corepack nicht mit pauschal erhöhten Rechten ausführen.
- **Registryfehler:** Unveränderten Installationsschritt später wiederholen.
  Keine private Registry oder Zugangsdaten in Repositorydateien eintragen.
- **Lockfileabweichung:** Abbrechen und Ursache prüfen. Das Lockfile nur in
  einem eigenen, reviewten Abhängigkeitsupdate neu erzeugen.
- **Erforderliches Installationsskript:** Abbrechen. `--ignore-scripts` ist für
  den aktuellen Laufzeitschnitt geprüft. Spätere Werkzeuge mit notwendigen
  Installations- oder Generierungsschritten benötigen zuerst einen eigenen
  kontrollierten Supply-Chain-Nachweis.
- **Prüfungsfehler:** Den ersten fehlgeschlagenen Schritt beheben. Prüfregeln
  dürfen nicht zur Umgehung des Fehlers abgeschaltet werden.

## Rollback

Dieser Ablauf verändert keine Daten oder Umgebungen. Ein fehlgeschlagener
Checkout kann verworfen und frisch ausgecheckt werden. Änderungen an
versionierten Dateien werden nicht automatisch zurückgesetzt.

## Pflege

Der Projekteigentümer prüft diese Anleitung bei jeder Änderung von Node.js,
pnpm, Root-Kommandos, Lockfileverhalten oder GitHub Actions erneut.
