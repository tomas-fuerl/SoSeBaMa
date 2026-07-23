# Mitwirken an SoSeBaMa

SoSeBaMa wird in einem öffentlichen Repository entwickelt. Jeder Beitrag muss
für eine sofortige Veröffentlichung geeignet sein und die
[Projekt-Governance](docs/GOVERNANCE.md) einhalten.

## 1. Arbeit vorbereiten

1. Das zugehörige Issue einschließlich aller Kommentare vollständig lesen.
2. Den lokalen Stand und bestehende Änderungen mit
   `git status --short --branch` prüfen.
3. Einen thematisch eindeutigen Feature-Branch vom aktuellen `main` anlegen.
4. In Repository und Dokumentation nach wiederverwendbaren Lösungen suchen.
5. Scope, Akzeptanzkriterien und erforderliche Prüfungen festhalten.

Keine Änderung darf Secrets, reale interne Domains, IP-Adressen, Hostnamen,
Pfade oder andere lokale Infrastrukturwerte enthalten.

### Branch-Namensschema

Branch-Namen verwenden ein passendes Präfix und eine kurze Beschreibung in
Kleinbuchstaben, zum Beispiel:

- `feat/` für neue fachliche Funktionen,
- `fix/` für Fehlerkorrekturen,
- `docs/` für Dokumentation,
- `chore/` für Wartungsarbeiten,
- `refactor/` für strukturelle Änderungen ohne Funktionsänderung,
- `security/` für Sicherheitskorrekturen.

Direkte Änderungen und direkte Pushes auf `main` sind unzulässig.

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

Commits folgen Conventional Commits, beispielsweise `docs: ...`, `fix: ...`
oder `feat: ...`. Jeder Commit beschreibt genau eine zusammenhängende,
reviewbare Änderung.

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

Pull Requests werden standardmäßig als Draft erstellt und verwenden die
Repository-Vorlage. Sie enthalten:

- Bezug zum Issue,
- Ziel und vollständigen Scope,
- geänderte Dateien,
- Prüfungen mit Ergebnis,
- nicht ausgeführte Prüfungen mit Begründung,
- Security- und Umgebungsbewertung,
- Reuse-first-Nachweis,
- Daten- und Migrationsfolgen,
- Rollback und Ergebnisprotokoll,
- offene Annahmen und Risiken,
- gegebenenfalls eine dokumentierte Eigentümerentscheidung.

## 5. Merge und Aufräumen

- Ausschließlich der Projekteigentümer darf einen Pull Request mergen.
- Squash Merge ist die reguläre und einzig vorgesehene Merge-Methode.
- Assistenzsysteme dürfen keinen Pull Request mergen.
- Nach erfolgreichem Merge wird der zugehörige Feature-Branch gelöscht.
- Releases und Deployments sind nicht Bestandteil eines normalen Merges und
  benötigen jeweils ein separates freigegebenes Arbeitspaket.
