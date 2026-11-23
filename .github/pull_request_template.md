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
- WIP-Zuordnung (von Codex erstellt, zulässig übernommen mit Nachweis oder unzugeordnet):

<!-- Zugeordnete offene PRs belegen bis zum nachgewiesenen Merge oder
Schließen einen Platz. Die Zuordnung bleibt bei Draft, CI, Review,
Wartezeit, Pause und Übergabe bestehen. -->

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
MERGE_EMPFOHLEN gilt, wenn sämtliche verbindlichen Akzeptanzkriterien,
Prüfungen einschließlich GitHub-Checks, Sicherheits-, Abhängigkeits- und
Integrationsbedingungen für den Kandidaten erfüllt sind. Blockierende
Findings sind behoben und zusätzliche Eigentümerentscheidungen geklärt.
Die reguläre Endprüfung und der Merge durch den Eigentümer stehen noch
aus und sind mit einer positiven technischen Empfehlung vereinbar.
NICHT_MERGEN gilt bei fehlenden oder nicht erfüllten technischen,
sicherheitsbezogenen oder Verifikationsvoraussetzungen, etwa bei roter
oder ausstehender CI, veralteten Nachweisen, offenen blockierenden Findings
oder nicht erfüllten Integrationsbedingungen. Ein Teilnachweis ist keine
vollständige Abnahme.
OWNER_ENTSCHEIDUNG_ERFORDERLICH gilt, wenn vor der Integration eine
zusätzliche fachliche, architektonische, sicherheitsbezogene oder
Governance-Entscheidung nötig ist. Konkrete Entscheidungsfrage, untersuchte
Optionen und ausstehende Eigentümeraktion verlinken. Treffen beide
Blockerarten zu, diese Kennung verwenden und technische Blocker
zusätzlich offen ausweisen. Der reguläre Mergevorbehalt allein genügt
für diese Kennung nicht.
Eine positive Empfehlung gilt nur für die dokumentierte Kombination aus
PR-Head und aktueller PR-Basis. Bei Änderungen am Head oder an der Basis
die bisherige Empfehlung verwerfen, betroffene Prüfungen auf dem neuen
Kandidaten wiederholen und den Bericht aktualisieren. Bei CI auf einem
synthetischen Merge-Commit dessen SHA und beide Eltern dokumentieren.
Der PR bleibt bis zur Eigentümeraktion ein Draft,
soweit keine ausdrückliche Repository-Regel etwas anderes zulässt.
Die Empfehlung erteilt keine Merge-Freigabe. Nur der Eigentümer mergt. -->
