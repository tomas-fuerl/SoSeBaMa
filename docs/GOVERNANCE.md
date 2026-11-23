# Projekt-Governance

## Zweck und Geltung

Diese Governance ist die verbindliche Entscheidungs- und Arbeitsgrundlage für
SoSeBaMa. Sie gilt für Menschen, Assistenzsysteme, Code, Dokumentation,
Automatisierung und Betrieb. Das Repository ist öffentlich; nicht
veröffentlichbare Informationen gehören nicht in den Entwicklungsprozess auf
GitHub.

## Verantwortlichkeiten

| Rolle | Verantwortung |
| --- | --- |
| Projekteigentümer | Prioritäten, Risikoakzeptanz, verbindliche Entscheidungen und Ausnahmen |
| Beitragende | Scope einhalten, Änderungen prüfen, Risiken und Annahmen offenlegen |
| Reviewende | Issue-Erfüllung, Sicherheit, Nachvollziehbarkeit und Reuse-first prüfen |
| Betriebsverantwortliche | Umgebungen trennen, Secrets auf der Synology schützen und Zugriffe freigeben |

Eine Person kann mehrere Rollen wahrnehmen. Die Verantwortung bleibt dennoch
für jede Entscheidung explizit benannt.

## Entscheidungsgrundsätze

1. Sicherheit und Schutz produktiver Daten haben Vorrang.
2. Es gilt die kleinste Änderung, die das dokumentierte Ziel vollständig
   erfüllt.
3. Vorhandene Lösungen werden vor Neuerstellung gesucht, bewertet und
   möglichst wiederverwendet.
4. Technologieauswahl bleibt bis zu einer nachvollziehbaren Bewertung offen.
5. Betriebsrelevante Abläufe werden so dokumentiert, dass eine berechtigte
   Person ohne implizites Projektwissen sicher folgen kann.
6. Entscheidungen und ihre Gründe müssen im Repository überprüfbar sein,
   sofern sie keine vertraulichen Informationen enthalten.

## Änderungskontrolle

Jede Änderung benötigt ein klar abgegrenztes Issue und einen reviewbaren Pull
Request. Der Pull Request dokumentiert Ziel, Dateien, Prüfungen, Security,
Reuse-first, Annahmen und Risiken. Technologie- oder Architekturentscheidungen
folgen zusätzlich dem [ADR-Verfahren](ADR.md).

Merge-Freigaben erfolgen erst, wenn:

- der Issue-Scope vollständig und ohne fachfremde Ergänzungen erfüllt ist,
- erforderliche Prüfungen erfolgreich oder Abweichungen entschieden sind,
- Sicherheits- und Umgebungsgrenzen eingehalten werden,
- Dokumentation und Auswirkungen nachvollziehbar sind.

## Ausnahmen

Eine Abweichung ist nur durch eine ausdrücklich dokumentierte Entscheidung des
Projekteigentümers zulässig. Schweigen, Zeitdruck oder ein Pull-Request-Merge
ohne Vermerk gelten nicht als Ausnahmeentscheidung.

Die Entscheidung enthält mindestens:

- Eigentümer und Entscheidungsdatum,
- betroffene Regel und begrenzten Geltungsbereich,
- Begründung und geprüfte Alternativen,
- Risiken und Schutzmaßnahmen,
- Ablaufdatum oder Überprüfungstermin,
- Rückkehrplan zum Regelzustand.

Die Entscheidung wird als ADR oder im betroffenen Issue und Pull Request
verlinkt. Vertrauliche Werte werden dabei durch neutrale Platzhalter ersetzt.

## Codex-Autonomiemodell C

GitHub ist der einzige verbindliche Kanal für Projektkommunikation, Scope,
Reviews, Entscheidungen und Freigaben. Die Interaktion des Projekteigentümers
im Codex-Thread dient der Goal-Steuerung (Start, Pause, Fortsetzung und Ende).
Die technische Ausführung folgt dem [AI-First-Workflow](AI-FIRST-WORKFLOW.md)
und den [Arbeitsregeln](../AGENTS.md).

### Delegierte technische Arbeit

Innerhalb einer aktiven Rahmenfreigabe und bereits genehmigter Anforderungen
wählt, priorisiert und zerlegt Codex technische Aufgaben. Codex kann technische
Issues anlegen und pflegen, freigegebene Funktionen implementieren, Code
refaktorieren, technische Schulden abbauen, Fehler und Regressionen beheben
sowie Tests und Dokumentation ergänzen. Reversible technische Detailentscheidungen
sind innerhalb der angenommenen ADRs zulässig.

Im dokumentierten Umfang kann Codex Arbeitsbranches, Commits, normale Pushes
und Draft-PRs erstellen, seine Draft-PRs aktualisieren, CI-Fehler analysieren
und beheben sowie Review-Findings bearbeiten. Codex darf die nächste
unabhängige, zulässige Aufgabe auswählen. Angenommene ADRs, bestehende
Eigentümerentscheidungen, Abhängigkeiten, Abnahmegates und Integrationssperren
gelten weiter.

### Eigentümervorbehalt

Nur der Projekteigentümer entscheidet über neue oder geänderte fachliche
Anforderungen außerhalb des freigegebenen Scopes, neue oder ersetzende ADRs,
wesentliche Architektur- und Technologieentscheidungen, Sicherheits- oder
Netzwerkgrenzen, Risikoakzeptanz und Sicherheitsausnahmen, erhebliche laufende
Kosten oder Lizenzverpflichtungen, schwer reversible oder destruktive
Datenänderungen, Produktions- und Betriebsfreigaben sowie die abschließende
Review- und Merge-Freigabe. Codex bereitet die Entscheidung vor und verweist
bei ADR-pflichtigen Fällen auf das [ADR-Verfahren](ADR.md).

Der Projekteigentümer führt alle Merges selbst durch. Für Codex gelten die
[Git-, Betriebs- und Produktionsgrenzen](../AGENTS.md), insbesondere das
Verbot direkter Pushes auf `main`, von Force-Pushes, Merges, Releases,
Deployments, Änderungen an geschützten Repositoryeinstellungen und GitHub-Secrets
sowie des Zugriffs auf produktive Secrets oder Daten. Security-Gates dürfen
nicht umgangen werden. Schreibende Betriebs- oder Security-Automatisierungen
dürfen durch Codex nicht eigenmächtig aktiviert werden. Die bestehende
[Security-Debt-Regelung](architecture/decisions/ADR-0018-befristete-security-zurueckstellung.md)
gilt einschließlich ihrer getrennten Freigaben weiter.

### Rahmenfreigabe

**Status: Vorgeschlagen.** Die folgende Dokumentation erteilt noch keine
Rahmenfreigabe. Auch die Integration dieser Dokumentation in `main` aktiviert
sie nicht. Der Projekteigentümer dokumentiert eine gesonderte, ausdrückliche
Entscheidung in einem GitHub-Issue und verlinkt die geltende Fassung des
Regelwerks. Das Issue enthält:

| Pflichtangabe | Inhalt |
| --- | --- |
| Freigebende Person | Projekteigentümer und überprüfbarer Nachweis der menschlichen Eigentümeraktion |
| Aktivierung und Laufzeit | Beginn, Überprüfungstermin und spätestes Ablaufdatum mit Zeitzone |
| Umfang | Repository, freigegebene Roadmap-Teilbereiche oder Issues, erlaubte GitHub-Schreiboperationen und Branchbereiche |
| Ausschlüsse | Nicht delegierte Aufgaben, geltende Sperren und ausgeschlossene Aktionen |
| Schutzmaßnahmen | Technische Trennung der Akteure, kleinste erforderliche Rechte, WIP-Limit sowie Prüfung von Scope und Gültigkeit vor Schreibaktionen |
| Widerruf und Rückkehr | GitHub-Nachweis für Widerruf, sofortiges Ende der autonomen Schreibbefugnis und Rückkehr zur Einzelfreigabe |

Codex prüft vor jeder Schreibaktion anhand des aktuellen GitHub-Stands, ob
das Regelwerk auf `main` gilt, die Freigabe ausdrücklich aktiviert wurde,
der dokumentierte Beginn erreicht ist, Überprüfung und Ablauf noch nicht
fällig sind, kein Widerruf vorliegt und die Aktion im freigegebenen Umfang
liegt. Vor dem dokumentierten Beginn unterbleiben autonome Schreibaktionen.
Die Rahmenfreigabe ersetzt Einzelfreigaben für gewöhnliche Entwicklungscommits,
Pushes und Draft-PRs erst ab wirksamer Aktivierung und nur in diesem Umfang.
Frühere Einzelfreigaben und Eigentümerentscheidungen behalten ihren jeweiligen
Geltungsbereich. Schweigen, der Start eines Goals und andere PR-Merges
begründen keine Freigabe.

Bei Ablauf, fälliger Überprüfung ohne bestätigte Verlängerung, Widerruf,
fehlendem Zugriff oder unklarem Nachweis unterbleiben die betroffenen
autonomen Schreibaktionen. Nach einem Widerruf pausiert der Eigentümer das
Goal zusätzlich über die Codex-Steuerung. Weitere Schreibarbeiten benötigen
eine separate Einzelfreigabe oder eine erneut ausdrücklich aktivierte
Rahmenfreigabe. Ein Rückbau des Regelwerks erfolgt über einen vom Eigentümer
gemergten Revert-PR. Vor dem Rückbau ist eine aktive Rahmenfreigabe zu widerrufen.

### Eigentümeraktionen verifizieren

Vor einer Aktivierung legt der Projekteigentümer einen innerhalb von GitHub
nachprüfbaren Nachweisweg fest. Codex prüft die von GitHub ausgewiesene
stabile Akteur-ID gegen die bestätigte Eigentümeridentität und deren
Berechtigung für die konkrete Entscheidung. Bewertet werden der verlinkte
Originalnachweis, der genehmigte Scope und seine Bedingungen. Der verwendete
Nachweisweg muss Codex technisch daran hindern, die menschliche
Eigentümeraktion selbst zu erzeugen oder zu ändern. Ein getrenntes,
eingeschränktes Codex-Schreibkonto und ein nur dem Eigentümer zugänglicher
Freigabezugang sind ein möglicher Nachweisweg.

Kommentartext, ein Anzeigename, ein Label oder die bloße Anzeige einer
Eigentümerrolle belegen bei gemeinsam genutzter GitHub-Identität keine
menschliche Aktion. Ist die Aktion technisch nicht eindeutig zuzuordnen oder
kann Codex den Nachweis imitieren, dokumentiert Codex den Sicherheitsblocker
im betroffenen GitHub-Issue oder PR, soweit ein Schreibauftrag dafür vorliegt.
Die betroffene Entscheidung gilt als ausstehend. Dieselbe Prüfung gilt für
neue Eigentümerentscheidungen zu Anforderungen, ADRs und Ausnahmen.

### Begrenzung paralleler Arbeit

Es dürfen repositoryweit höchstens drei offene Entwicklungs-PRs gleichzeitig
in aktiver Codex-Bearbeitung oder unter laufender Codex-Reviewbetreuung sein,
einschließlich Drafts und solcher, die auf CI oder Eigentümerreview warten.
Codex macht die Betreuung im PR kenntlich. Dependabot- und fremde PRs zählen,
sobald Codex sie aktiv zur Bearbeitung übernimmt. Unklare Zuordnungen sind
vor dem Eröffnen eines weiteren PRs zu klären. Ohne eine nachprüfbare,
vom Eigentümer festgelegte Koordination paralleler Threads eröffnet nur ein
Codex-Thread neue Entwicklungs-PRs für dieses Repository. Das Limit wird
unmittelbar vor dem Eröffnen oder Wiederaufnehmen eines PRs geprüft.

Am Limit bearbeitet Codex bestehende PRs und deren Reviews oder führt
unabhängige Untersuchungen ohne weiteren Implementierungs-PR durch. Der
Wechsel eines PRs aus der aktiven Betreuung wird mit Grund im PR dokumentiert.
Derselbe PR zählt ab Wiederaufnahme erneut. Abhängigkeiten und
Integrationssperren gelten auch bei freiem Platz.
