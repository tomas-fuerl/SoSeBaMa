# Mitwirken an SoSeBaMa

SoSeBaMa wird in einem öffentlichen Repository entwickelt. Jeder Beitrag muss
für eine sofortige Veröffentlichung geeignet sein und die
[Projekt-Governance](docs/GOVERNANCE.md) einhalten.

## 1. Arbeit vorbereiten

1. Das zugehörige Issue einschließlich aller Kommentare vollständig lesen.
2. Den lokalen Stand und bestehende Änderungen mit
   `git status --short --branch` prüfen.
3. Einen thematisch eindeutigen Branch vom aktuellen `main` anlegen.
4. In Repository und Dokumentation nach wiederverwendbaren Lösungen suchen.
5. Scope, Akzeptanzkriterien und erforderliche Prüfungen festhalten.

Keine Änderung darf Secrets, reale interne Domains, IP-Adressen, Hostnamen,
Pfade oder andere lokale Infrastrukturwerte enthalten.

## 2. Änderung umsetzen

- Änderungen klein, nachvollziehbar und auf genau ein Arbeitspaket begrenzen.
- Bestehende Konventionen vor neuen Mustern verwenden.
- Technologien nicht beiläufig festlegen. Auswahlentscheidungen benötigen eine
  ergebnisoffene Bewertung nach dem [ADR-Verfahren](docs/ADR.md).
- Umgebungs-, Sicherheits- und Zugriffsregeln aus
  [ENVIRONMENTS.md](docs/ENVIRONMENTS.md) und
  [NETWORK-BOUNDARIES.md](docs/NETWORK-BOUNDARIES.md) einhalten.
- Neue Automatisierung nur nach dem
  [Reuse-first-Standard](docs/REUSE-FIRST.md) anlegen.
- Anleitungen nach dem
  [Foolproof-Dokumentationsstandard](docs/DOCUMENTATION-STANDARD.md) schreiben.

## 3. Änderung prüfen

Die zum Änderungstyp passenden Lint-, Typ-, Test- und Build-Prüfungen sind
auszuführen. Für reine Dokumentationsänderungen gilt mindestens:

```text
git status --short
git diff --check
```

Zusätzlich sind zu prüfen:

- relative Markdown-Links,
- nicht aufgelöste Konfliktmarker,
- Secrets und Zugangsdaten,
- reale Domains, IP-Adressen und lokale Infrastrukturwerte,
- versehentlich angelegte ausführbare Dateien,
- Einhaltung des Issue-Scopes.

Prüfergebnisse und nicht geprüfte Annahmen gehören in die Übergabe und den Pull
Request.

## 4. Pull Request

Der Pull Request verwendet die Repository-Vorlage und enthält:

- Bezug zum Issue,
- Ziel und vollständigen Scope,
- geänderte Dateien,
- Prüfungen mit Ergebnis,
- Security- und Umgebungsbewertung,
- Reuse-first-Nachweis,
- offene Annahmen und Risiken,
- gegebenenfalls eine dokumentierte Eigentümerentscheidung.

Pull Requests werden nicht von der erstellenden Person selbst gemergt, sofern
der Projekteigentümer dies nicht ausdrücklich entscheidet.
