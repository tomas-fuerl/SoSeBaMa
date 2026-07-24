# ADR-Verfahren

## Zweck

Architecture Decision Records dokumentieren langfristig relevante technische,
architektonische und betriebliche Entscheidungen. Dieses Verfahren legt keine
Technologie fest; es sorgt für eine technologieoffene, nachvollziehbare
Auswahl.

## Wann ein ADR erforderlich ist

Ein ADR ist erforderlich, wenn eine Entscheidung:

- Architektur, Technologie oder Datenhaltung festlegt,
- Sicherheits- oder Netzwerkgrenzen verändert,
- mehrere Arbeitspakete oder Umgebungen betrifft,
- eine schwer umkehrbare Abhängigkeit erzeugt,
- eine Ausnahme von der Projekt-Governance genehmigt.

## Technologieoffene Auswahl

Vor einer Festlegung werden aus dem tatsächlichen Bedarf messbare Kriterien
abgeleitet. Mindestens betrachtet werden:

- funktionale Eignung,
- Sicherheit und Umgebungsisolation,
- Betriebs- und Wartungsaufwand,
- Reuse-Potenzial und Integrationsfähigkeit,
- Portabilität und Abhängigkeiten,
- Kosten und Lizenz,
- Testbarkeit, Beobachtbarkeit und Rückbaubarkeit.

Mindestens eine realistische Alternative und der Status quo werden gegen
dieselben Kriterien bewertet. Produktbekanntheit, persönliche Vorliebe oder ein
AI-Vorschlag allein sind keine Entscheidungskriterien.

## Ablauf und Status

1. Problem, Kontext und Nicht-Ziele beschreiben.
2. Kriterien vor der Bewertung festlegen.
3. Optionen einschließlich Status quo vergleichbar bewerten.
4. Sicherheits-, Betriebs- und Migrationsfolgen benennen.
5. Empfehlung mit offenen Annahmen zur Prüfung stellen.
6. Projekteigentümer dokumentiert die Entscheidung.
7. Umsetzung im Pull Request mit dem ADR verknüpfen.

Zulässige Status sind `Vorgeschlagen`, `Angenommen`, `Abgelehnt` und
`Ersetzt`. Angenommene ADRs werden nicht still geändert. Eine neue Entscheidung
ersetzt das alte ADR und verweist in beide Richtungen.

## Mindeststruktur

```text
# ADR-NNNN: Kurzer Entscheidungstitel

- Status:
- Datum:
- Eigentümer:
- Bezogenes Issue:

## Kontext und Problem
## Ziele und Nicht-Ziele
## Entscheidungskriterien
## Betrachtete Optionen
## Entscheidung und Begründung
## Folgen und Risiken
## Security sowie DEV/TST/PRD
## Migration, Verifikation und Rückbau
## Offene Annahmen
```

Bei Governance-Ausnahmen ergänzt das ADR betroffene Regel, Geltungsbereich,
Schutzmaßnahmen, Ablauf- oder Überprüfungstermin und Rückkehrplan. Es enthält
keine vertraulichen Werte oder realen Infrastrukturdetails.
