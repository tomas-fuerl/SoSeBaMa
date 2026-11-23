# AI-First-Workflow

Der Projekteigentümer verantwortet Anforderungen, Entscheidungen, Endprüfung
und Merge. Codex wählt, implementiert und prüft freigegebene technische
Arbeit. [Modell C](GOVERNANCE.md#codex-autonomiemodell-c) setzt eine aktive
Rahmenfreigabe voraus. Bis dahin gilt das Einzelfreigabeverfahren aus
[AGENTS.md](../AGENTS.md). GitHub ist der einzige verbindliche Projektkanal.
Die erforderlichen Informationen für die Endprüfung stehen in Issue und PR.

## A. Goal starten

Der Projekteigentümer startet das [Codex Goal](CODEX-GOAL.md) oder setzt es
fort. Codex gleicht `main`, offene Issues und PRs, Eigentümerentscheidungen,
CI- und Prüfergebnisse, Abhängigkeiten und Integrationssperren mit der
[Roadmap](architecture/IMPLEMENTATION-ROADMAP.md) ab. Vor autonomer Arbeit
prüft Codex die Gültigkeit der Rahmenfreigabe.

## B. Arbeit auswählen

1. Bearbeitbare Sicherheits- und Integrationsblocker zuerst behandeln.
2. Technisch notwendige Voraussetzungen als Nächstes bearbeiten.
3. Danach die nächste ausführbare Roadmap-Aufgabe wählen.

Scope, Freigaben, maximal drei aktive Codex-PRs und bestehende
Integrationssperren begrenzen die Auswahl. Entwicklung und Review auf einem
isolierten Branch setzen eine bestehende Freigabe für diese Arbeit voraus.
Eine Integrationssperre bleibt bis zu ihrem dokumentierten Wegfall wirksam.
Die Voraussetzungen und kumulativen Abnahmen der Roadmap gelten weiter.

Codex hält neue Entscheidungsfragen im
[Decision Issue](../.github/ISSUE_TEMPLATE/decision.yml) fest. Neue
fachliche Anforderungen außerhalb des freigegebenen Scopes gehören in ein
[Feature Proposal](../.github/ISSUE_TEMPLATE/feature-proposal.yml).
Ein Vorschlag ändert die Roadmap erst durch eine dokumentierte
Eigentümerentscheidung und die entsprechende Aktualisierung. Bestehende
Security-Debt-Fälle verwenden den [etablierten Prozess](development/SUPPLY-CHAIN-CHECKS.md)
und das [Security-Debt-Formular](../.github/ISSUE_TEMPLATE/security-debt.yml).
Blocker werden mit Grund, Abhängigkeit und nächstem möglichen Schritt
festgehalten. Unabhängige freigegebene Arbeit geht weiter.

## C. Implementieren

Codex hält das zugeordnete Issue aktuell und arbeitet auf einem eigenen
Branch vom aktuellen `main`. Pro Issue ist ein enger, überprüfbarer Scope
mit messbaren Akzeptanzkriterien festgelegt. Die Regeln zu Security,
Dokumentation, Tests und [Reuse-first](REUSE-FIRST.md) gelten weiter.
Codex erstellt oder aktualisiert das lokale ignorierte `TASK-RESULT.md`.

Das Repository ist öffentlich. Codex hält Secrets, Zugangsdaten, reale
Environment- und Authentifizierungsdateien, produktive Daten, private
Infrastrukturwerte und vertrauliche Sicherheitsmeldungen aus GitHub,
Doku, Diffs und Prüfausgaben heraus. Für Beispiele dienen neutrale
Platzhalter. DEV, TST und PRD bleiben getrennt.

## D. Prüfen

Codex führt die relevanten Prüfungen aus und dokumentiert Befehl oder
Nachweisweg, Ergebnis und Commit-SHA. Ausstehende oder nicht ausführbare
Prüfungen erhalten eine Begründung. Codex prüft Issue, Diff, Tests,
Dokumentation und Security im strukturierten Selbstreview und behebt
blockierende Findings vor einer positiven Mergeempfehlung. Ein durchgeführtes
unabhängiges Review wird mit Herkunft und Nachweis separat erfasst.

## E. Reviewbereiten Draft bereitstellen

Codex erstellt oder aktualisiert den Draft-PR und füllt den
[Entwicklungsreport](../.github/pull_request_template.md) aus. Der Bericht
enthält auch ausstehende Prüfungen oder Entscheidungen, Restrisiken und
genau eine Mergeempfehlung für den aktuellen PR-Head und die aktuelle Basis.
Ändert sich der Head oder die Basis, sind betroffene Nachweise und die
Empfehlung für die neue Kombination erneut zu prüfen. Bis alle Voraussetzungen einer positiven Empfehlung
belegt sind, bleibt die Empfehlung entsprechend negativ oder verweist
auf die ausstehende Eigentümerentscheidung. Der PR bleibt bis zur
Eigentümeraktion im Draft-Status, soweit keine ausdrückliche Repository-Regel
etwas anderes zulässt.

## F. Eigentümeraktion

Der Eigentümer prüft den Bericht in GitHub, kommentiert, fordert Änderungen
an, lehnt den PR ab oder gibt ihn frei und führt den Squash Merge selbst
durch. Der Wortlaut `FREIGEGEBEN` delegiert keinen Merge. Eigentümerentscheidungen
sind nach [Governance](GOVERNANCE.md#eigentümeraktionen-verifizieren) zu
verifizieren. Releases und Deployments erfordern eigene freigegebene
Arbeitspakete außerhalb der Modell-C-Schreibbefugnis.

## G. Fortsetzen

Beim nächsten Abgleich liest Codex neue oder geänderte Reviews, Entscheidungen,
Issues, Anforderungen, Merges und CI-Ergebnisse. Nach jedem Eigentümer-Merge
wird der aktuelle Stand von `main` samt Abhängigkeiten erneut geprüft.
Erst ein nachgewiesener Merge und die jeweils erforderlichen Abnahmen
erfüllen eine Integrationsvoraussetzung. Codex arbeitet Review-Findings
auf dem vorhandenen Branch ab oder wählt die nächste zulässige Aufgabe.

## H. Goal pausieren oder beenden

Bei einer planbaren Unterbrechung hält Codex den letzten geprüften SHA,
offene Checks, Blocker und nächste Schritte im betroffenen Issue oder PR
fest, soweit das Schreiben noch autorisiert ist. Der Eigentümer pausiert
oder beendet das Goal über die Codex-Steuerung. Bei einem sofortigen Stopp
gilt der zuletzt veröffentlichte Stand. Codex erzeugt keine separat
weiterlaufende Automatisierung. Bereits ausgelöste externe CI-Jobs können
weiterlaufen. Beim Fortsetzen beginnt Codex wieder mit dem GitHub-Abgleich.

## GitHub-Status

| Zustand | Verbindlicher Ablageort |
| --- | --- |
| Technische Aufgabe | Zugeordnetes offenes Issue mit Scope und Akzeptanzkriterien |
| Entscheidung erforderlich | Verlinktes Decision Issue mit konkreter Frage oder Feature Proposal bei neuer Fachanforderung |
| Eigentümerfreigabe ausstehend | Entscheidungs- oder Vorschlagsissue mit ausstehender Entscheidung bis zum verifizierten Eigentümernachweis |
| Reviewbereit | Draft-PR mit vollständigem Entwicklungsreport für den aktuellen SHA und Hinweis auf die gewünschte Eigentümerprüfung |
| Blockiert | Betroffenes Issue oder PR mit Blocker, Abhängigkeit und nächstem zulässigen Schritt |

`Reviewbereit` und Mergefähigkeit werden unabhängig beurteilt. Draft-Status,
Reviews und Kommentare bleiben die vorhandenen GitHub-Mechanismen. Labels
wie `bug`, `documentation` oder `enhancement` erleichtern die Navigation.
Für Security-Debt gelten die bestehenden fachlichen Labels. Modell C
benötigt keine neuen Statuslabels und leitet Freigaben ausschließlich aus
dem verifizierten Eigentümernachweis ab.
