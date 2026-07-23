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
