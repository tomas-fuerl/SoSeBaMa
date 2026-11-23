# Codex-Entwicklungsreport

<!-- Bei anderen Beiträgen gelten die vorhandenen PR-Pflichtbereiche ebenfalls. -->

## Ziel

<!-- Genau ein beobachtbares Ergebnis nennen. -->

- Zugehöriges Issue:
- Arbeitspaket:
- Ziel:
- Umgesetzter Scope:
- Nicht-Ziele:
- Branch und Basis (Ref und Basis-SHA):
- Geprüfter PR-Head-SHA:
- CI-Kandidat (getestete Basis, Head und bei Merge-Prüfung synthetischer Merge-SHA):
- Aktive Codex-Betreuung (ja oder nein, mit Grund bei Beendigung):

## Änderungen

- Implementierte Änderungen:
- Betroffene Dateien oder Module:
- Erfüllte Akzeptanzkriterien:
- Nicht erfüllte Akzeptanzkriterien:

## Verifikation

- [ ] `git status --short` und vollständigen Diff geprüft
- [ ] `git diff --check` ohne Befund
- [ ] Relevante Format-, Lint-, Typ-, Test- und Build-Prüfungen bestanden
- [ ] Dokumentationslinks geprüft, falls Dokumentation geändert wurde
- [ ] Keine Secrets oder privaten Infrastrukturwerte enthalten

| Prüfart | Tatsächlich ausgeführter Befehl oder Nachweisweg | Ergebnis | Commit-SHA | CI- oder Testreport |
| --- | --- | --- | --- | --- |
| | | | | |

<!-- Je relevanter Prüfung eine Zeile. Ausstehende und nicht ausführbare
Prüfungen mit Grund, Auswirkung und geplantem Nachweis erfassen. Nur
tatsächlich bestandene Prüfungen als bestanden ausweisen. -->

## Reviewprotokoll

- Codex-Selbstreview (SHA und Umfang):
- Unabhängiges Review (tatsächliche Herkunft, SHA und Nachweis):
- Automatisierte Prüfungen (Verweis auf Prüfnachweise):
- Eigentümerreview (GitHub-Review und SHA oder ausstehend):

<!-- Fehlende Reviews ausdrücklich ausweisen. Eigene Prüfung als
Selbstreview erfassen. Im Finding dessen Quelle benennen. -->

| ID | Schweregrad | Finding | Fundstelle | Maßnahme | Nachprüfung | Status |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

## Auswirkungen

<!-- Je Zeile konkret antworten. Fehlende Auswirkungen kurz begründen.
Neue Entscheidungen oder Ausnahmen benötigen ADR oder dokumentierte
Eigentümerentscheidung nach Projekt-Governance. -->

- Benutzer und Entwickler:
- Fachliche Anforderungen:
- Security und Datenschutz:
- Öffentliche Verträge:
- Daten und Migrationen:
- DEV, TST und PRD:
- Betrieb und Observability:
- Lizenzen und Abhängigkeiten:
- Rückbaufolgen (siehe Rollback):

## Reuse und Entscheidungen

- Wiederverwendete oder erweiterte Lösung:
- Suchumfang und geprüfte Alternativen:
- Neue Abhängigkeiten, Skripte oder Automatisierungen:
- Neue oder geänderte Entscheidungen und Ausnahmen:

## Rollback

<!-- Sicheren Rückweg, Abbruchbedingung und mögliche Datenfolgen nennen. -->

## Ergebnisprotokoll

- [ ] Lokales, ignoriertes `TASK-RESULT.md` aktualisiert und nicht committed

## Verbleibende Risiken

- Offene Findings und Annahmen:
- Fehlende Verifikationen:
- Bekannte Abhängigkeiten und Integrationssperren:
- Ausstehende Eigentümerentscheidungen:
- Spätere Abnahmen:

## Mergeempfehlung

- Kennung:
- Begründung und geprüfter SHA:

<!-- Genau eine Kennung eintragen:
MERGE_EMPFOHLEN nur, wenn alle für den PR-Scope verbindlichen
Akzeptanzkriterien, alle erforderlichen Prüfungen einschließlich GitHub-Checks
auf dem geprüften Kandidaten und sämtliche Abhängigkeits- und Integrationssperren
erfüllt sind. Es gibt keine offenen blockierenden Findings und keine ungelöste
Eigentümerentscheidung, die die Integration verhindert.
OWNER_ENTSCHEIDUNG_ERFORDERLICH, wenn eine ausstehende Entscheidung des
Eigentümers die Integration blockiert. Technische Blocker weiterhin offenlegen.
NICHT_MERGEN in den übrigen blockierten Fällen, etwa bei ausstehenden oder
fehlgeschlagenen Checks. Ein Teilnachweis ist keine vollständige Abnahme.
Eine positive Empfehlung gilt nur für die dokumentierte Kombination aus
PR-Head und aktueller PR-Basis. Bei Änderungen am Head oder an der Basis
die bisherige Empfehlung verwerfen, betroffene Prüfungen auf dem neuen
Kandidaten wiederholen und den Bericht aktualisieren. Bei CI auf einem
synthetischen Merge-Commit dessen SHA und beide Eltern dokumentieren.
Der PR bleibt bis zur Eigentümeraktion ein Draft,
soweit keine ausdrückliche Repository-Regel etwas anderes zulässt.
Die Empfehlung erteilt keine Merge-Freigabe. Nur der Eigentümer mergt. -->
