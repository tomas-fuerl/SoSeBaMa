# ADR-0019: Dauerhaft abgesicherte lokale Entwicklungszugänge

- Status: Vorgeschlagen
- Datum: 2026-11-24
- Eigentümer: Projekteigentümer
- Bezogenes Issue: [#94](https://github.com/tomas-fuerl/SoSeBaMa/issues/94)
- Zuordnung: [AP-01 (#9)](https://github.com/tomas-fuerl/SoSeBaMa/issues/9)
- Geltungsbereich: Entwicklungsbetrieb AP-00 bis AP-11

## Kontext und Problem

Die bisherige Regel legt die Synology als Speicherort für sämtliche Secrets
fest. Für die getrennte GitHub App werden laut Decision Issue bereits lokale
Schlüsselverwahrung, automatische Token-Erneuerung und eine serverseitige
Merge-Sperre genutzt. Die lokale Verwahrung braucht eine ausdrückliche Regel
mit nachprüfbaren Schutzmaßnahmen. Die Speicherortregel betrifft die Verwahrung
von Zugangsdaten. Die [befristete Codex-Rahmenfreigabe](../../GOVERNANCE.md#rahmenfreigabe)
regelt separat die Nutzung autonomer Schreibbefugnisse.

## Ziele und Nicht-Ziele

Dedizierte Entwicklungs- und Automatisierungszugänge für SoSeBaMa dürfen auf
ausdrücklich zugelassenen Geräten verwahrt werden, sofern ihre Verwendung
überprüfbar und widerrufbar ist. Die Änderung umfasst die Speicherortregel
und die Sicherheitsauflagen. Neue Netzwerk- oder Laufzeitzugänge, Änderungen
an GitHub-Berechtigungen, die Aktivierung der Rahmenfreigabe und Deployments
liegen außerhalb dieser Entscheidung.

## Entscheidungskriterien

Die Optionen werden nach funktionaler Eignung, Verfügbarkeit, Sicherheit und
Isolation, Betriebsaufwand, Wiederverwendung und Integration, Portabilität,
Kosten und Lizenz sowie Testbarkeit, Beobachtbarkeit und Rückbaubarkeit
bewertet. Die vollständige Vergleichsmatrix steht im
[Decision Issue #94](https://github.com/tomas-fuerl/SoSeBaMa/issues/94).

## Betrachtete Optionen

| Option | Abwägung |
| --- | --- |
| A – Alle Secrets auf der Synology | Zentraler Entzug und weniger Schlüsselkopien. Ein isolierter Dienst für Signierung und Token-Ausgabe erhöht Betriebsaufwand und schafft eine zusätzliche Verfügbarkeitsabhängigkeit. |
| B – Befristete Ausnahme für die lokale Verwahrung | Bestehende Mechanismen bleiben befristet nutzbar. Die Ausnahme erfordert eine gesonderte Frist, wiederholte Eigentümerprüfung und einen vorbereiteten Rückbau. |
| C – Dauerhaft zwischen Umgebungssecrets und dedizierten Entwicklungszugängen unterscheiden | Die vorhandenen App-, Token- und Schutzmechanismen sind wiederverwendbar. Gerätefreigaben, Schlüsselrotation und die Durchsetzung separater Schreibfreigaben müssen nachweisbar sein. |

## Entscheidung und Begründung

Option C ist der Vorschlag für die Regeländerung. Sie beseitigt den
Speicherortkonflikt und erlaubt die Wiederverwendung der vorhandenen App und
ihres Erneuerungsmechanismus. Der
[Eigentümerkommentar](https://github.com/tomas-fuerl/SoSeBaMa/issues/94#issuecomment-7127927833)
benennt Option C und den Geltungsbereich. Für den Statuswechsel gilt die
[Verifikation von Eigentümeraktionen](../../GOVERNANCE.md#eigentümeraktionen-verifizieren).

### Geräte und Schlüssel

- Der Projekteigentümer genehmigt Gerät, Identität, Zugangszweck und
  Berechtigungsumfang ausdrücklich. Er benennt die zuständige Rolle und
  einen Überprüfungstermin.
- macOS-Geräte benötigen aktives FileVault, aktuellen Sicherheits-Patchstand
  und automatische Bildschirmsperre. Andere Plattformen benötigen einen
  vom Eigentümer akzeptierten Nachweis gleichwertiger Maßnahmen.
- Entwicklungs- und Eigentümeridentität sind getrennt. Entwicklung und
  Automatisierung laufen unter einem dedizierten Betriebssystemkonto ohne
  administrative Rechte. Nur der vorgesehene Signierprozess erhält
  Zugriff auf den privaten App-Schlüssel.
- Schlüssel werden restriktiv, außerhalb von Arbeitskopien und
  synchronisierten Ordnern verwahrt. Zugriff und Kopien unterliegen denselben
  Auflagen. Die Freigabe umfasst den sicheren Wiederanlauf bei Geräteverlust.
- Die GitHub App ist auf das freigegebene Repository und den erforderlichen
  Rechteumfang begrenzt. Leserechte sind der Standard. Die serverseitige
  Merge-Sperre und die Schutzregeln des Repositorys gelten weiter.
- Installationstokens werden kurzlebig ausgestellt und kontrolliert erneuert.
  Schlüssel werden planmäßig und bei Verdacht auf Offenlegung rotiert.
  Bei Verlust oder Kompromittierung sperrt die zuständige Rolle die
  Ausstellung und widerruft bereits ausgestellte Tokens.

### Autonome Schreibaktionen

Die dauerhafte Speicherortregel aktiviert keine Rahmenfreigabe. Für autonome
Schreibaktionen führt ein vom Codex-Prozess technisch getrennter, vom
Eigentümer kontrollierter Pfad die freigegebene Aktion selbst aus und hält
Schreibcredentials außerhalb des Codex-Prozesses. Vor jeder Aktion prüft er
den aktuellen GitHub-Eigentümernachweis, Repository, Ziel, Operation, Scope,
Beginn, Überprüfungstermin, Ablauf und Widerruf.

Bei fehlendem, unklarem oder unerreichbarem Nachweis sowie bei Fälligkeit,
Ablauf oder Widerruf verweigert der Pfad autonome Schreibaktionen und die
Neuausstellung von Schreibcredentials. Der Eigentümer braucht einen
unmittelbaren Sperrweg. Bereits ausgestellte Schreibcredentials sind
einzubeziehen. Danach gilt wieder die Einzelfreigabe. Die technische
Durchsetzung ist vor einer autonomen Aktivierung nachzuweisen.

## Folgen und Risiken

FileVault schützt ruhende Daten. Auch bei entsperrtem Gerät sind die
Benutzertrennung und der Zugriffsschutz des Schlüssels erforderlich.
Geräteausfall und Verlust des Freigabenachweises können die Automatisierung
unterbrechen. Der Eigentümer verantwortet Freigabe und Widerruf. Die benannte
betriebsverantwortliche Rolle pflegt Geräteauflagen, Erneuerung und Rückbau.

Die [Prüfungen der Software-Lieferkette](ADR-0013-teststrategie-und-software-lieferkette.md)
einschließlich Secret Scanning und Push Protection werden weiterverwendet.
Secret-Werte, persönliche Zugangsdaten und private Infrastrukturdetails bleiben
aus Arbeitskopien, GitHub-Inhalten, Logs, Prompts und Artefakten ausgeschlossen.
Vor Veröffentlichung sind auch Issues, PR-Texte und Nachweise zu prüfen.

## Security sowie DEV/TST/PRD

Die lokalen Zugangsdaten sind ausschließlich für ihren freigegebenen
Entwicklungs- oder Automatisierungszweck bestimmt. Betriebs- und
Anwendungssecrets für DEV, TST und PRD bleiben getrennt auf der Synology.
Produktive Secrets, Daten und Konfigurationswerte bleiben für Codex
unzugänglich. PRD erhält keinen Debugzugang. Die Datenbank bleibt
ausschließlich aus dem App-Backend erreichbar. Die dokumentierten
DEV-Zugriffswege für code-server gelten weiter. Die Betriebs- und Netzgrenzen
aus [ADR-0017](ADR-0017-nginx-application-gateway.md) gelten weiter.

## Migration, Verifikation und Rückbau

1. Der Eigentümer benennt Geräte, Zugänge, zuständige Rolle und Prüftermin.
   Öffentlich dokumentierte Nachweise verwenden neutrale Angaben.
2. Die zuständige Rolle weist Geräteschutz, Benutzertrennung,
   Repository-Scope, Merge-Sperre, Token-Erneuerung und Wiederanlauf ohne
   produktive Daten nach. Bestehende Mechanismen werden zuerst geprüft.
3. Vor autonomen Schreibaktionen weist die zuständige Rolle einen
   zulässigen Schreibvorgang und Ablehnungen bei falscher Identität oder
   überschrittenem Scope, fehlendem Nachweis, Fälligkeit, Ablauf und
   Widerruf nach. Die Prüfung schließt alternative Schreibpfade und
   bereits ausgestellte Credentials ein. Ergebnisse enthalten nur
   Zeitpunkt, Aktion und Ergebnis.
4. Bei Verlust oder Entzug der Gerätefreigabe sperrt die zuständige Rolle
   den Zugang, widerruft Schlüssel und Tokens und entfernt lokale Kopien.
   Überprüfung und Wiederanlauf erfolgen mit nicht produktiven Mitteln.
5. Beim Rückbau der Speicherortregel widerruft der Eigentümer zuerst eine
   betroffene aktive Rahmenfreigabe. Anschließend veranlasst er die
   kontrollierte Rückkehr zur Synology-Speicherpflicht und führt die
   Dokumentation über einen Revert-PR zurück.

## Offene Annahmen

Der technisch getrennte Schreibpfad und die Wirksamkeit des sofortigen
Widerrufs bereits ausgestellter Schreibcredentials sind noch nachzuweisen.
Konkrete Betriebs- und Lizenzkosten zusätzlicher Komponenten sind offen.
Eine technische Erweiterung wird separat beauftragt und nach dem
[Reuse-first-Standard](../../REUSE-FIRST.md) bewertet.
