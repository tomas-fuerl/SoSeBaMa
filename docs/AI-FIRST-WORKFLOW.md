# AI-First-Workflow

## Ziel

AI-First bedeutet, Assistenzsysteme bewusst für Analyse, Umsetzung,
Dokumentation und Prüfung einzusetzen. Es bedeutet nicht, Verantwortung oder
Review an ein Modell abzugeben. Eine benannte Person bleibt für Scope,
Entscheidungen und Freigabe verantwortlich.

## Standardablauf

1. Issue und Repository-Zustand vollständig erfassen.
2. Sicherheitsgrenzen und öffentlich teilbaren Kontext bestimmen.
3. Vorhandene Dateien, Muster und Automatisierungen nach dem
   [Reuse-first-Standard](REUSE-FIRST.md) suchen.
4. Ziel, betroffene Dateien und Prüfschritte vor der Änderung benennen.
5. Kleine, reviewbare Änderungen erzeugen und den Diff laufend prüfen.
6. Behauptungen durch Repository-Inhalte oder Prüfergebnisse belegen.
7. Ergebnisse, Annahmen, Risiken und menschlich zu treffende Entscheidungen
   transparent übergeben.

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
