# Arbeitsregeln für SoSeBaMa

Diese Regeln gelten für alle Beiträge durch Menschen und Assistenzsysteme. Bei
Widersprüchen haben Sicherheitsvorgaben und dokumentierte
Eigentümerentscheidungen Vorrang.

## Vor jeder Änderung

1. Issue, Akzeptanzkriterien und vorhandene Dokumentation vollständig lesen.
2. `git status --short --branch` prüfen und bestehende Änderungen bewahren.
3. Ziel, Scope und betroffene Dateien benennen.
4. Vorhandene Lösungen gemäß [Reuse-first-Standard](docs/REUSE-FIRST.md)
   suchen und bewerten.
5. Die kleinste reviewbare Änderung planen.

## Verbindliche Leitplanken

- Das Repository ist öffentlich. Inhalte müssen bereits vor dem Commit als
  öffentlich behandelbar sein.
- Secrets, Zugangsdaten, private Schlüssel und produktive Konfigurationswerte
  werden ausschließlich auf der Synology gespeichert und niemals in
  Repository, Issues, Pull Requests, Logs, Prompts oder Artefakte übernommen.
- DEV, TST und PRD bleiben bei Konfiguration, Daten, Secrets und Zugriffswegen
  strikt getrennt.
- PRD erhält keine Debugzugänge.
- Nur das App-Backend darf auf die Datenbank zugreifen. Clients,
  Entwicklungswerkzeuge und andere Komponenten dürfen keinen direkten
  Datenbankzugriff erhalten.
- code-server darf DEV ausschließlich über die dokumentierten und
  freigegebenen SSH-/Debugwege erreichen.
- Technologieentscheidungen werden ergebnisoffen bewertet und erst über das
  [ADR-Verfahren](docs/ADR.md) verbindlich.
- Neue Skripte oder Automatisierungen sind erst zulässig, wenn Wiederverwendung
  oder Erweiterung vorhandener Lösungen nachvollziehbar ausgeschlossen wurde.
- Betriebs- und Entwicklerdokumentation folgt dem
  [Foolproof-Dokumentationsstandard](docs/DOCUMENTATION-STANDARD.md).
- Abweichungen von diesen Regeln sind nur durch eine dokumentierte Entscheidung
  des Projekteigentümers gemäß
  [Projekt-Governance](docs/GOVERNANCE.md) zulässig.

## Änderungen und Prüfung

- Keine fachfremden Änderungen in dasselbe Arbeitspaket aufnehmen.
- Keine lokalen Environment-Dateien oder Infrastrukturwerte versionieren.
- Neue ausführbare Skripte erfüllen den
  [Reuse-first-Automatisierungsstandard](docs/REUSE-FIRST.md). Ein ADR ist nur
  erforderlich, wenn das Skript selbst eine Entscheidung nach den Kriterien
  des [ADR-Verfahrens](docs/ADR.md) einführt.
- Vor Übergabe mindestens Diff, relative Markdown-Links, Konfliktmarker und
  mögliche Secrets beziehungsweise reale Infrastrukturwerte prüfen.
- Für jedes Arbeitspaket wird ein lokales, durch `.gitignore` ausgeschlossenes
  `TASK-RESULT.md` erstellt oder aktualisiert.

## Git- und GitHub-Grenzen

- Branches zu einem Arbeitspaket verwenden das Schema
  `ap-XX/<kurze-beschreibung>`, beispielsweise
  `ap-01/compatibility-proof`. Das Präfix `agent/` wird nicht verwendet.
- Kein direkter Push auf `main`.
- Kein Merge eines Pull Requests; Merges führt ausschließlich der
  Projekteigentümer durch.
- Kein Force-Push und kein Umschreiben veröffentlichter Historie.
- Keine Tags oder Releases erstellen oder verändern.
- Branchschutz, Repositoryeinstellungen und GitHub-Secrets nicht verändern.
- Commit, Push und Erstellung oder Aktualisierung eines Draft Pull Requests
  erfolgen nur bei ausdrücklichem Auftrag.

## Betriebs- und Produktionsgrenzen

- Keine Deployments ausführen oder auslösen.
- Keine Änderungen an Portainer, Synology oder PRD vornehmen.
- Nicht auf produktive Daten oder produktive Secrets zugreifen.
- Keine produktiven Konfigurationen, Zugänge oder Infrastrukturwerte lesen oder
  in Arbeitskontext übernehmen.

Diese Grenzen gelten auch dann, wenn ein Werkzeug die technische Berechtigung
für eine Aktion besitzt. Ausnahmen sind nur durch die dokumentierte
Eigentümerentscheidung aus [GOVERNANCE.md](docs/GOVERNANCE.md) möglich; die
Verbote für Assistenzsysteme, Pull Requests zu mergen oder produktive Secrets
zu lesen, bleiben bestehen.

## Routing zum lokalen Coding-Agenten

ChatGPT oder Codex darf `tools/local-agent.sh` nur für kleine, klar begrenzte
und anschließend vollständig reviewbare Änderungen vorschlagen oder aufrufen.
Geeignet sind beispielsweise lokale Textänderungen, Boilerplate und kleine
Refactorings in ausdrücklich benannten Dateien. Architektur-, Sicherheits-,
Infrastruktur- und Produktentscheidungen, Abhängigkeitsänderungen, Deployments,
GitHub-Aktionen sowie Arbeiten mit Secrets oder produktiven Daten werden nicht
an das lokale Modell delegiert.

Für jede Delegation gelten zusätzlich:

1. Aufgabe und erlaubte relative Dateien werden ausdrücklich angegeben.
2. Die Aufgabe enthält keine Secrets, realen Infrastrukturwerte oder privaten
   Daten. Die lokalen Logs werden genauso behandelt wie der Prompt.
3. Der lokale Agent arbeitet ausschließlich im erzeugten Git-Worktree. Er darf
   den Scope nicht selbst erweitern und keine Shell-Befehle vorschlagen.
4. ChatGPT oder Codex prüft danach den vollständigen Diff gegen den
   Ausgangsstand sowie alle projektspezifischen Prüfungen. Modelländerungen
   werden niemals ungeprüft übernommen.
5. Commits, Cherry-pick, Push und Pull Request bleiben bewusste, separate
   Schritte und benötigen weiterhin den in diesem Dokument festgelegten
   Auftrag.

Das Repository enthält derzeit noch keine Anwendung und daher keinen Build-
oder Testbefehl. Bis ein verbindlicher Einstiegspunkt ergänzt wird, sind für
lokale Agentenänderungen mindestens `git diff --check`, eine Prüfung relativer
Markdown-Links, eine Suche nach Konfliktmarkern und die Sichtung des gesamten
Diffs erforderlich. Bedienung und Exit-Codes stehen in
[`tools/local-agent.sh`](tools/local-agent.sh) (`--help`).
