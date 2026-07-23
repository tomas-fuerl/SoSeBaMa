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
- Neue ausführbare Skripte folgen erst nach einer freigegebenen
  Technologieentscheidung den dokumentierten Repository-Konventionen und
  passenden statischen Prüfungen.
- Vor Übergabe mindestens Diff, relative Markdown-Links, Konfliktmarker und
  mögliche Secrets beziehungsweise reale Infrastrukturwerte prüfen.
- Änderungen werden nicht ohne ausdrücklichen Auftrag committed, gepusht oder
  gemergt.
