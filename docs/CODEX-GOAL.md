# Codex Goal für SoSeBaMa

## Ziel und Voraussetzungen

Dieses Goal steuert die zulässige Entwicklung entlang der
[Roadmap AP-00 bis AP-11](architecture/IMPLEMENTATION-ROADMAP.md) bis zum
nachgewiesenen MVP-Releasekandidaten. Es gilt für das GitHub-Repository
SoSeBaMa und die dort freigegebene Entwicklungsarbeit. DEV, TST und PRD
bleiben getrennt. Die bestehenden Abnahmen setzen ihre jeweils dokumentierte
Umgebung voraus.

Vor dem Start prüft der Projekteigentümer, dass das Regelwerk auf `main`
integriert, die [Rahmenfreigabe](GOVERNANCE.md#rahmenfreigabe) aktiv und
die menschliche Eigentümeraktion in GitHub technisch eindeutig nachweisbar
ist. Der ausgewählte Codex-Thread benötigt Repositoryzugriff, die
freigegebene GitHub-Schreibidentität und eine Codex-Oberfläche mit
Goal-Steuerung. Der Start allein erteilt keine Schreibbefugnis.

## Start und Steuerung

1. Einen Codex-Thread im Repository öffnen und prüfen, ob `/goal` verfügbar
   ist. Bei fehlender Unterstützung den Projekteigentümer über den
   autorisierten GitHub-Weg informieren und beim Einzelfreigabeverfahren
   bleiben.
2. Den folgenden einzeiligen Block vollständig in den Thread kopieren.
   Automatischer Zeilenumbruch in der Anzeige ist zulässig. Vor der
   Fortsetzung mit `/goal` kontrollieren, dass das gespeicherte Ziel den
   vollständigen Auftrag bis zum letzten Satz enthält. Bei gekürztem oder
   nicht verifizierbarem Ziel sofort `/goal clear` verwenden und erst in
   einer Oberfläche mit vollständiger Eingabe und Anzeige erneut starten.
3. Nach dem ersten GitHub-Abgleich prüfen, ob der Fortschrittsnachweis im
   zugehörigen Issue oder Draft-PR Scope und Rahmenfreigabe erkennen lässt.
4. Zum Pausieren `/goal pause`, zum Fortsetzen `/goal resume` verwenden.
   Zum Beenden das Goal mit `/goal clear` entfernen. Den Goal-Status zeigt
   `/goal` an. Bei einem nicht fortsetzbaren Goal die Voraussetzungen erneut
   prüfen und bei gültiger Freigabe denselben Auftrag neu starten.

```text
/goal Entwickle SoSeBaMa entlang der Roadmap AP-00 bis AP-11 im Codex-Autonomiemodell C bis zum dokumentierten kumulativen Abnahmenachweis für AP-11. Lies AGENTS.md, docs/GOVERNANCE.md, docs/AI-FIRST-WORKFLOW.md und die Roadmap auf dem aktuellen main. Prüfe die aktive, befristete und eindeutig nachweisbare Eigentümer-Rahmenfreigabe, ihren Scope, ihren Beginn, ihren Überprüfungstermin und die technisch unterscheidbaren Akteure vor autonomer Arbeit und jeder Schreibaktion. Verwende GitHub als einzigen verbindlichen Projektkanal. Gleiche bei Start, Fortsetzung, vor jedem Arbeitspaket und nach jedem Eigentümer-Merge main, Issues, PRs, Reviews, Eigentümerentscheidungen, CI, Roadmap und Abhängigkeiten ab. Übernimm nur zulässige Arbeit. Priorisiere bearbeitbare Sicherheits- und Integrationsblocker, danach technische Voraussetzungen, danach ausführbare Roadmap-Arbeit. Halte vorhandene Integrationssperren und Abnahmegates ein. Führe höchstens drei offene Entwicklungs-PRs in aktiver Codex-Betreuung und pflege vor weiteren PRs vorhandene Reviews und Checks. Nutze ein abgegrenztes Issue je Arbeitspaket, einen eigenen Branch und je Umsetzung einen Draft-PR. Führe die relevanten Prüfungen und ein strukturiertes Selbstreview aus, korrigiere Findings und liefere den vollständigen Codex-Entwicklungsreport. Beziehe Nachweise, Reviews und genau eine Mergeempfehlung auf den aktuellen PR-Head und die aktuelle Basis. Wiederhole bei einer Änderung an Head oder Basis die betroffenen Prüfungen und verifiziere die erforderlichen GitHub-Checks auf der neuen Kombination. Dokumentiere Lücken und unabhängige Reviews wahrheitsgemäß. Bereite neue Entscheidungen über Decision Issues und neue fachliche Anforderungen über Feature Proposals vor. Warte für betroffene Arbeiten auf nachweisbar menschliche Eigentümerentscheidungen. Vermerke Blocker und arbeite an unabhängigen zulässigen Aufgaben weiter. Respektiere sämtliche angenommenen ADRs, Security-Gates, Umgebungsgrenzen und Eigentümervorbehalte. Merge, deploye und veröffentliche keine Releases. Aktiviere keine Betriebs- oder Security-Automatisierung. Beende das Goal als erreicht, wenn die Roadmap-Abnahmen auf Basis der tatsächlichen Eigentümer-Merges und erforderlichen Nachweise in GitHub dokumentiert sind. Halte bei Blockade oder planbarer Unterbrechung den letzten SHA, den Stand von Issue und PR, offene Checks, Blocker und mögliche nächste Schritte in GitHub fest, solange die Freigabe das Schreiben erlaubt. Wenn keine zulässige Arbeit fortgesetzt werden kann, halte an. Bei fehlender oder widerrufener Freigabe unterbleiben autonome Schreibaktionen. Bei Fortsetzung prüfe GitHub und die Freigabe erneut. Erzeuge keine separate Fortsetzungs- oder Überwachungsautomatisierung.
```

## Grenzen und Rückkehr

Goals gehören zum jeweiligen Thread und können durch Pause, Abbruch,
fehlende Werkzeuge, Budget oder eine externe Blockade unterbrochen werden.
GitHub-Änderungen starten oder reaktivieren einen Thread nicht von selbst.
Nach einem externen Merge oder einer Entscheidung liest Codex den neuen
Stand bei der nächsten aktiven Ausführung. Bei einem sofortigen Stopp kann
kein abschließendes GitHub-Update garantiert werden. Bereits ausgelöste
externe CI-Jobs laufen nach ihren eigenen Regeln.

Bei abgelaufener, widerrufener oder nicht verifizierbarer Freigabe gilt
das [Einzelfreigabeverfahren](../AGENTS.md). Der Eigentümer dokumentiert
einen Widerruf in GitHub und hält das Goal an. Änderungen werden bei Bedarf
über einen regulären Revert-PR zurückgenommen.

Der Projekteigentümer pflegt dieses Dokument bei Änderungen der
Goal-Steuerung, der Roadmap oder der Rahmenfreigabe. Am 23. November 2026
war die Goal-Funktion im lokalen Codex CLI 0.171.0 als aktiv ausgewiesen.
Die Befehle und Thread-Grenzen stammen aus der
[OpenAI-Dokumentation zur Goal-Steuerung](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex).
