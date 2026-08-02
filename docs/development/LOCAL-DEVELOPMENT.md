# Lokale Entwicklungsgrundlage

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-02
- Geltungsbereich: lokales DEV und GitHub-hosted CI

## Ziel

Ein frischer Checkout installiert exakt die fixierten Abhängigkeiten. Danach
enden Format-, Lint- und TypeScript-Prüfung gemeinsam mit Exit-Code `0`.

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

   Format, ESLint und TypeScript müssen jeweils mit Exit-Code `0` enden.

## Verifikation

Nach der Prüfung bleibt der versionierte Stand unverändert:

```sh
git status --short
```

Neue Einträge dürfen nur erwartete lokale, durch `.gitignore` ausgeschlossene
Installationsartefakte sein. Es existiert in diesem Teilschnitt noch kein
Anwendungsstart, Build oder fachlicher Test.

## Fehlerbehandlung

- **Falsche Node- oder pnpm-Version:** Version aus `.node-version` und
  `package.json` aktivieren. Nicht mit abgeschalteter Engineprüfung fortfahren.
- **Corepack-Berechtigungsfehler:** Einen benutzerlokalen Node-Versionsmanager
  verwenden. Corepack nicht mit pauschal erhöhten Rechten ausführen.
- **Registryfehler:** Unveränderten Installationsschritt später wiederholen.
  Keine private Registry oder Zugangsdaten in Repositorydateien eintragen.
- **Lockfileabweichung:** Abbrechen und Ursache prüfen. Das Lockfile nur in
  einem eigenen, reviewten Abhängigkeitsupdate neu erzeugen.
- **Prüfungsfehler:** Den ersten fehlgeschlagenen Schritt beheben. Prüfregeln
  dürfen nicht zur Umgehung des Fehlers abgeschaltet werden.

## Rollback

Dieser Ablauf verändert keine Daten oder Umgebungen. Ein fehlgeschlagener
Checkout kann verworfen und frisch ausgecheckt werden. Änderungen an
versionierten Dateien werden nicht automatisch zurückgesetzt.

## Pflege

Der Projekteigentümer prüft diese Anleitung bei jeder Änderung von Node.js,
pnpm, Root-Kommandos, Lockfileverhalten oder GitHub Actions erneut.
