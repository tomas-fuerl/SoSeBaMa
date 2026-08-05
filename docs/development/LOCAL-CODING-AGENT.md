# Lokalen Coding-Agenten sicher verwenden

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-05
- Bezogenes Issue: [#17](https://github.com/tomas-fuerl/SoSeBaMa/issues/17)
- Geltungsbereich: ausschließlich lokales DEV

## Ziel und Grenzen

`tools/local-agent.sh` lässt Aider mit `qwen2.5-coder:3b` eine kleine Änderung
in einem isolierten Git-Worktree vorbereiten. Der Haupt-Worktree bleibt
unverändert. Das Skript erstellt keinen Commit, übernimmt keinen Patch und
führt keine GitHub-Aktion aus.

Der Weg ist nur für kleine Textänderungen, Boilerplate und eng begrenzte
Refactorings in ausdrücklich benannten, versionierten Dateien zulässig.
Architektur-, Sicherheits-, Infrastruktur-, Abhängigkeits-, Produkt-,
Deployment- und GitHub-Aufgaben sind ausgeschlossen.

TST und PRD werden nicht erreicht oder verändert. Aufgaben und Logs dürfen
keine Secrets, privaten Daten, realen Infrastrukturwerte oder Inhalte lokaler
Environment-Dateien enthalten.

## Voraussetzungen

1. Der lokale Checkout liegt auf dem beabsichtigten Feature-Branch und ist
   vollständig sauber.
2. Git, Ollama, Aider und pnpm sind lokal im `PATH` verfügbar.
3. Ollama läuft lokal und das Modell `qwen2.5-coder:3b` ist installiert.
4. Die erlaubten Zieldateien sind bereits versioniert und keine Symlinks.
5. Tomas hat Aufgabe und Dateiscope ausdrücklich freigegeben. Ein Commit, Push
   oder Pull Request benötigt weiterhin einen eigenen Auftrag.

Die Werkzeughilfe zeigt Voraussetzungen und Exit-Codes ohne einen Agentenlauf:

```sh
tools/local-agent.sh --help
```

## Aufgabe vorbereiten

1. Den ignorierten lokalen Aufgabenordner anlegen:

   ```sh
   mkdir -p .local-agent/tasks
   ```

2. Eine neue Datei `.local-agent/tasks/<TASK-ID>.md` im lokalen Editor öffnen.
   `<TASK-ID>` wird durch eine kurze lokale Kennung ohne private Werte ersetzt.
3. Genau eine kleine Änderung beschreiben. Erlaubte Dateien und verbotene
   Nebenänderungen ausdrücklich nennen. Keine Shell-Befehle anfordern.
4. Vor dem Start prüfen, dass die Aufgabe keine Secrets, personenbezogenen
   Daten, realen Hosts, Domains, IP-Adressen, Ports oder Infrastrukturpfade
   enthält.

## Isolierten Agentenlauf starten

1. Den Repositoryzustand prüfen:

   ```sh
   git status --short --branch
   ```

   Erwartet wird der beabsichtigte Branch ohne Ausgabe weiterer Dateien. Bei
   unbekannten Änderungen wird abgebrochen.

2. Den Wrapper mit der Aufgabendatei und jeder einzeln erlaubten Datei starten:

   ```sh
   tools/local-agent.sh .local-agent/tasks/<TASK-ID>.md <RELATIVE-DATEI> [<RELATIVE-DATEI> ...]
   ```

   `<RELATIVE-DATEI>` ist ein versionierter Pfad ab Repositorywurzel. Das
   Skript normalisiert die Pfade, erzeugt einen abgetrennten Worktree unter
   `.local-agent/worktrees/` und speichert lokale Protokolle unter
   `.local-agent/logs/`.

3. Erwartet wird Exit-Code `0` und die Meldung, dass nichts übernommen oder
   committet wurde. Der ausgegebene Worktree bleibt zur Prüfung bestehen.

## Ergebnis vollständig prüfen

1. Die vom Wrapper ausgegebenen Befehle für Status, `diff --check` und den
   vollständigen Diff ausführen.
2. Prüfen, dass ausschließlich die vorher erlaubten Dateien geändert sind und
   der Worktree weiterhin auf dem protokollierten Ausgangs-Commit steht.
3. Den Inhalt fachlich und sicherheitlich vollständig prüfen. Modellausgaben
   gelten niemals ungeprüft als korrekt.
4. Im isolierten Worktree die exakt fixierten Abhängigkeiten scriptfrei
   installieren. `<LOCAL-AGENT-WORKTREE>` wird durch den vom Wrapper
   ausgegebenen, vollständig geprüften Pfad ersetzt:

   ```sh
   pnpm --dir "<LOCAL-AGENT-WORKTREE>" install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   ```

5. Im isolierten Worktree die vollständige Repositoryprüfung ausführen:

   ```sh
   pnpm --dir "<LOCAL-AGENT-WORKTREE>" check
   ```

6. Konfliktmarker und mögliche Secrets beziehungsweise reale
   Infrastrukturwerte erneut prüfen.

Erst nach allen Nachweisen darf ein angezeigter Patch mit `git apply --check`
geprüft und bewusst übernommen werden. Ein Commit oder Cherry-pick erfolgt nur
bei ausdrücklichem Auftrag. Das Wrapper-Skript übernimmt selbst keine Änderung.

## Exit-Codes und Fehlerbehandlung

| Exit-Code | Bedeutung | Sichere Reaktion |
| --- | --- | --- |
| `0` | Agentenlauf beendet, Scopeprüfung bestanden | Diff trotzdem vollständig prüfen. |
| `2` | Aufruf, Aufgabenpfad oder Dateiscope ungültig | Eingaben korrigieren; Schutzregel nicht umgehen. |
| `3` | Git, Ollama, Aider, pnpm oder Modell fehlt | Lokale Voraussetzung herstellen; keine Ersatzdienste anbinden. |
| `4` | Repository oder Worktree konnte nicht sicher verwendet werden | Abbrechen und lokalen Git-Zustand prüfen. |
| `5` | Aider schlug fehl, erzeugte keine Änderung oder veränderte Scope beziehungsweise Commit | Nichts übernehmen; isolierten Worktree untersuchen oder verwerfen. |

Bei einem Scope- oder Commitverstoß bleibt der Haupt-Worktree unverändert. Der
lokale Log kann Prompt- und Codeinhalt enthalten und darf nicht veröffentlicht
oder ungeprüft in ein Issue beziehungsweise einen Pull Request kopiert werden.

## Rückbau

Ohne bewusste Patchübernahme ist im Haupt-Worktree kein Rückbau nötig. Nach der
Prüfung kann der konkrete, vom Wrapper ausgegebene Worktree entfernt werden:

```sh
git worktree remove <LOCAL-AGENT-WORKTREE>
git worktree prune
```

`<LOCAL-AGENT-WORKTREE>` wird ausschließlich durch den vollständig angezeigten
Pfad des geprüften Agentenlaufs ersetzt. Logs, Aufgaben und Patchdateien unter
`.local-agent/` bleiben ignoriert und werden nur nach manueller Sichtung lokal
gelöscht.

## Pflege

Der Projekteigentümer prüft diese Anleitung bei Änderungen an Aider, Ollama,
Modell, Wrapper, Repositoryprüfungen oder Sicherheitsgrenzen erneut.
