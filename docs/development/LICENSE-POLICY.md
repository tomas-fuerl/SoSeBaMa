# Lizenzrichtlinie für Abhängigkeiten

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-15
- Bezogenes Issue: [#25](https://github.com/tomas-fuerl/SoSeBaMa/issues/25)
- Geltungsbereich: alle aufgelösten Abhängigkeiten des Monorepos in DEV, CI,
  TST und PRD

## Ziel

Jede aufgelöste Abhängigkeit trägt eine ausdrücklich zugelassene Lizenz. Eine
neue Lizenzart gelangt nur nach einer dokumentierten Entscheidung des
Projekteigentümers in das Repository.

## Geltungsbereich und Abgrenzung

Die Richtlinie gilt für Laufzeit- und Entwicklungsabhängigkeiten gleichermaßen,
weil beide über das Lockfile reproduzierbar Teil der Lieferkette sind. Sie
bewertet nicht die Lizenz des Repositorys selbst; diese ist eine getrennte
Entscheidung des Projekteigentümers.

## Zugelassene Lizenzen

| Lizenz | Familie | Wirkung auf eigenen Code |
| --- | --- | --- |
| `MIT` | permissiv | keine, Lizenztext mitliefern |
| `Apache-2.0` | permissiv mit Patentklausel | keine, Lizenztext und Hinweise mitliefern |
| `ISC` | permissiv | keine |
| `BSD-2-Clause` | permissiv | keine |
| `BSD-3-Clause` | permissiv | keine |
| `0BSD` | permissiv ohne Namensnennung | keine |
| `BlueOak-1.0.0` | permissiv | keine |
| `MPL-2.0` | schwaches Copyleft, dateibezogen | nur bei Änderung einer MPL-Datei bleibt diese Datei MPL |

## Nicht zugelassene Lizenzen

Alles, was oben nicht aufgeführt ist, gilt als nicht zugelassen. Die Prüfung
arbeitet mit Default-Deny; auch eine unbekannte, fehlende oder nicht
auswertbare Lizenzangabe schlägt fehl.

Die Tabelle nennt exakte SPDX-Kennungen. Eine Variante mit angehängtem `+` wie
`MIT+` ist eine eigene Kennung und damit nicht zugelassen, solange sie nicht
ausdrücklich in die Tabelle aufgenommen wurde. Die Prüfung normalisiert das `+`
bewusst nicht weg.

Ebenso gilt ein Bericht ohne jede Abhängigkeit nicht als bestanden, sondern als
nicht lesbar: Er würde sonst alle Abhängigkeiten auf einmal als geprüft
ausweisen.

Ausdrücklich ausgeschlossen sind:

- `AGPL` in allen Fassungen und `SSPL`. Beide dehnen ihre Pflichten auf die
  Nutzung über das Netz aus. SoSeBaMa ist eine gehostete Webanwendung; eine
  solche Abhängigkeit im Laufzeitpfad könnte zur Offenlegung des eigenen
  Quellcodes verpflichten.
- `GPL` und `LGPL` in allen Fassungen. Sie sind nicht grundsätzlich
  unvereinbar, verlangen aber eine Einzelbewertung der Einbindungsart und
  deshalb eine ausdrückliche Entscheidung.

## Sicherheitswarnung

Die Prüfung ersetzt keine Rechtsberatung. Sie stellt lediglich sicher, dass
keine unbewertete Lizenzart unbemerkt in das Repository gelangt. Eine Lizenz
wird nicht durch Anpassen der Allowlist zugelassen, um einen fehlgeschlagenen
Lauf zu beenden.

## Verifikation

1. Abhängigkeiten aus dem Lockfile installieren:

   ```sh
   pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies
   ```

2. Die Lizenzen prüfen:

   ```sh
   pnpm licenses:check
   ```

   Erwartet wird Exit-Code `0` ohne Ausgabe. Ein Verstoß nennt Paket, Version
   und die gefundene Lizenz und endet mit Exit-Code `1`.

3. Bei Bedarf den tatsächlichen Bestand ansehen:

   ```sh
   node tools/check-licenses.mjs --list
   ```

   Der Befehl verändert nichts und kann jederzeit wiederholt werden.

Die Prüfung ist Teil von `pnpm check` und läuft damit auch in der
Pull-Request-Stufe der CI.

## Fehlerbehandlung

- **Neue, nicht zugelassene Lizenz:** Die Abhängigkeit wird nicht übernommen,
  solange keine Entscheidung vorliegt. Zuerst wird geprüft, ob eine
  gleichwertige Alternative unter einer zugelassenen Lizenz existiert.
- **Unbekannte oder fehlende Lizenzangabe:** Wie eine nicht zugelassene Lizenz
  behandeln. Eine fehlende Angabe ist keine Freigabe.
- **Prüfung kann den Abhängigkeitsbaum nicht lesen:** Der Lauf endet mit
  Exit-Code `1`. Zuerst die Installation wiederholen; ein Werkzeugfehler gilt
  nicht als bestandene Prüfung.
- **Sichere Abbruchbedingung:** Bei unklarer Lizenzlage wird die Abhängigkeit
  nicht aufgenommen und die Entscheidung dem Projekteigentümer vorgelegt.

## Ausnahmeverfahren

Eine Ausnahme ist nur als ausdrücklich dokumentierte Entscheidung des
Projekteigentümers zulässig. Sie enthält nach
[Projekt-Governance](../GOVERNANCE.md):

- betroffenes Paket, Version und Lizenz,
- Begründung und geprüfte Alternativen,
- Einbindungsart, insbesondere Laufzeit- oder reine Buildverwendung,
- Risikoeinschätzung,
- Ablaufdatum und Rückkehrplan.

Die Entscheidung wird im zugehörigen Issue oder Pull Request verlinkt. Erst
danach wird die Allowlist in `tools/check-licenses.mjs` und diese Tabelle
gemeinsam ergänzt.

## Rollback

Die Richtlinie erzeugt keine Daten- oder Laufzeitfolgen. Ein Rückbau besteht aus
dem Revert der Dokumentations-, Werkzeug- und Skriptänderung. Bereits
aufgelöste Abhängigkeiten bleiben davon unberührt.

## Pflege

Der Projekteigentümer prüft diese Richtlinie bei jeder Ergänzung der Allowlist,
bei einer Änderung des Ausnahmeverfahrens und bei einer Änderung der eigenen
Repositorylizenz.
