# AI-First-Workflow

## Ziel

AI-First bedeutet, Assistenzsysteme bewusst für Analyse, Umsetzung,
Dokumentation und Prüfung einzusetzen. Es bedeutet nicht, Verantwortung oder
Review an ein Modell abzugeben. Eine benannte Person bleibt für Scope,
Entscheidungen und Freigabe verantwortlich.

## Verbindliche Rollen

- Tomas verantwortet Anforderungen, Freigaben, manuelle Endprüfung und Merge.
- ChatGPT Web strukturiert Anforderungen und prüft Arbeitsergebnisse read-only.
- Codex setzt begrenzte Arbeitspakete um, prüft und dokumentiert sie, darf aber
  keinen Pull Request mergen.

## End-to-End-Standardablauf

1. Tomas definiert die Anforderung gemeinsam mit ChatGPT Web.
2. Die Anforderung wird als GitHub-Issue mit eindeutigem Scope und messbaren
   Akzeptanzkriterien angelegt.
3. ChatGPT erstellt daraus ein begrenztes Codex-Arbeitspaket ohne verdeckte
   Erweiterung des Issue-Scopes.
4. Codex arbeitet auf einem eigenen Feature-Branch, niemals direkt auf `main`.
5. Codex führt die vorgeschriebenen Prüfungen tatsächlich aus.
6. Codex erstellt oder aktualisiert ein lokales, durch `.gitignore`
   ausgeschlossenes `TASK-RESULT.md`.
7. Codex committet und pusht ausschließlich bei entsprechendem Auftrag.
8. Codex erstellt bei entsprechendem Auftrag einen Draft Pull Request.
9. ChatGPT prüft Issue, Diff, Prüfnachweise, Dokumentation und Security
   ausschließlich read-only.
10. Codex bearbeitet erforderliche Findings auf demselben Feature-Branch.
11. Tomas führt die manuelle Endprüfung durch.
12. Tomas führt ausschließlich einen Squash Merge aus.
13. Codex und ChatGPT dürfen den Pull Request nicht mergen.
14. Releases und Deployments benötigen separate, ausdrücklich freigegebene
    Arbeitspakete.

## Sichere Kontextgrenzen

Assistenzsysteme erhalten niemals:

- Secrets oder Zugangsdaten von der Synology,
- Inhalte realer Environment- oder Authentifizierungsdateien,
- produktive Daten,
- reale interne Domains, IP-Adressen, Hostnamen oder Infrastrukturpfade,
- vertrauliche Sicherheitsmeldungen außerhalb des dafür freigegebenen Wegs.

Beispiele verwenden deutlich erkennbare Platzhalter. Ausgaben und Diffs werden
vor Veröffentlichung auf versehentlich übernommene Werte geprüft.

## Qualitätsregeln

- Generierte Inhalte werden wie fremde Beiträge vollständig reviewed.
- Prüfungen werden tatsächlich ausgeführt und nicht nur vorgeschlagen.
- Fehlende Evidenz wird als offene Annahme benannt.
- Keine Technologie wird allein aufgrund eines Modellvorschlags festgelegt.
- Sicherheitskritische oder irreversible Schritte benötigen eine bewusste
  menschliche Freigabe.
- Automatisierung wird nicht dupliziert, nur weil Neuerstellung schneller
  erscheint.

Ausnahmen benötigen die dokumentierte Eigentümerentscheidung aus
[GOVERNANCE.md](GOVERNANCE.md).
