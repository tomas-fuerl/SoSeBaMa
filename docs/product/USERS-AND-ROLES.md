# Benutzer, Gruppen und Berechtigungen

## Bezug und Grundsatz

Dieses Dokument beschreibt das verbindliche fachliche Autorisierungsmodell.
Der historische Dateiname bleibt für stabile Links erhalten; fachliche Rollen
und Direktrechte werden nicht mehr als eigenes Produktmodell verwendet.

Das vollständige Verhältnis von Song, Inhalt, Eigentum, Bandbereich, Overlay,
Setlist und Check-out steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).
Begriffe stehen im [Glossar](GLOSSARY.md).

Die Dokumentation legt weder Autorisierungssoftware noch Identitätsprodukt oder
Speicherverfahren fest.

## Autorisierungsregel

Eine geschützte Aktion ist für normale Benutzer nur erlaubt, wenn beide
notwendigen Ebenen positiv erfüllt sind:

1. globales Aktionsrecht und
2. Berechtigung am konkreten Objekt.

Plattformadministratoren besitzen fachlichen Superuserstatus und sind die
ausdrückliche Ausnahme.

Rechte dürfen Benutzern oder Gruppen zugewiesen werden. Positive Zuweisungen
werden additiv ausgewertet; der höchste positive Autorisierungsstatus gilt.
Negative oder verweigernde Rechte existieren nicht.

| Objektberechtigung | Eingeschlossene Objektberechtigungen |
| --- | --- |
| Anzeigen | keine |
| Bearbeiten | Anzeigen |
| Löschen | Bearbeiten und Anzeigen |
| Berechtigungen verwalten | Anzeigen |
| Eigentum übertragen | Anzeigen |
| objektspezifisches Sonderrecht | nur die ausdrücklich dokumentierte Wirkung |

Auf globaler Ebene beinhaltet `Löschen` ebenfalls `Bearbeiten` und `Anzeigen`.
Die Verwaltungsrechte `Berechtigungen verwalten` und `Eigentum übertragen`
implizieren untereinander kein weiteres Verwaltungsrecht. Eigentum,
Mitgliedschaft oder eine Freigabe ersetzt das erforderliche globale
Aktionsrecht nicht.

## Benutzer und Gruppen

Ein Benutzer ist aktiv, deaktiviert oder gelöscht. Nur ein aktiver Benutzer
darf regulärer Eigentümer werden und neue geschützte Aktionen beginnen.

Ein Benutzer darf mehreren globalen oder bandbezogenen Gruppen angehören,
Mitglied mehrerer Bands sein und über eigene und Gruppenrechte additive
Berechtigungen erhalten.

Eine Gruppe ist entweder global oder genau einem Bandbereich zugeordnet.
Gruppen dürfen nicht verschachtelt werden. Bandbezogene Gruppen dürfen nur
Mitglieder der zugehörigen Band enthalten. Normale Gruppen dürfen globale
Rechte und Objektberechtigungen tragen, aber kein Eigentum.

Plattformadministratoren verwalten globale Gruppen, globale Rechte und
Systemgruppen. Berechtigte Bandmitglieder verwalten nur bandbezogene Gruppen
der eigenen Band und nur delegierbare bandbezogene Rechte.

## Band und Bandbereich

Jede Band besitzt genau einen Bandbereich; jeder Bandbereich gehört genau einer
Band. Eine Installation darf mehrere Bandbereiche enthalten.

Eine Band ist Eigentums- und Berechtigungsprinzipal, verhält sich für
Berechtigungen wie eine Gruppe und darf Mitglieder sowie zusätzliche
bandbezogene Gruppen besitzen.

Bandmitgliedschaft vermittelt keine automatische Berechtigung an bandeigenen
oder für die Band freigegebenen Objekten. Die Bandbereichstrennung verhindert
implizite Querzugriffe.

Ausdrückliche Objektfreigaben über Bandgrenzen sind zulässig. Eine Freigabe an
Band B verändert weder das Eigentum von Band A noch erlaubt sie der
Bandadministration von Band B automatisch, Berechtigungen oder Eigentum zu
verwalten.

## Bandverwaltung

Berechtigte Bandmitglieder dürfen innerhalb der eigenen Band:

- Mitglieder einladen, deaktivieren oder entfernen,
- bandbezogene Gruppen anlegen, ändern oder entfernen,
- Mitglieder diesen Gruppen zuordnen,
- ausdrücklich delegierbare bandbezogene Rechte vergeben.

Sie dürfen nicht:

- globale Gruppen, globale Rechte oder Systemgruppen verwalten,
- Mitglieder oder Gruppen eines fremden Bandbereichs verwalten,
- fremde oder lediglich freigegebene Objekte allein aufgrund ihrer
  Bandfunktion bearbeiten, entsperren oder administrieren,
- eine Bandlöschung endgültig bestätigen.

Für die Vertretung einer Eigentümerband sind voneinander getrennte
bandbezogene Rechte erforderlich:

- `Bandobjekte bearbeiten`,
- `Bandobjekte löschen`,
- `Berechtigungen von Bandobjekten verwalten`,
- `Eigentum von Bandobjekten übertragen`,
- `Berechtigung für Band anfragen`.

Diese Rechte gelten nur zusammen mit dem erforderlichen globalen Aktionsrecht
und den von der Band gehaltenen Objektberechtigungen.

## Systemgruppe `Plattformadministratoren`

Es gibt genau eine geschützte Systemgruppe `Plattformadministratoren`. Es gibt
keine Rolle `Plattform-Redakteur`.

Mitglieder besitzen fachlichen Superuserstatus und dürfen:

- alle Objekte und Bands sehen und administrieren,
- Bands anlegen und umbenennen,
- Bandlöschungen endgültig bestätigen,
- globale Gruppen, globale Rechte und Systemgruppen verwalten,
- Songmetadaten ändern, Songs prüfen und Dubletten verwalten,
- Eigentum beliebiger und eigentümerloser Objekte ändern,
- eigentümerlose Objekte administrieren,
- Löschungen wiederherstellen oder endgültig durchführen,
- Check-outs administrativ zurücknehmen,
- die Systemband `Öffentlich` und ihre Grundrechte verwalten.

Nur Plattformadministratoren dürfen die Mitgliedschaft dieser Systemgruppe
ändern. Der letzte aktive Plattformadministrator darf durch normale
Verwaltungsabläufe weder entfernt noch deaktiviert, seiner Administratorrechte
beraubt oder dauerhaft ausgesperrt werden.

MFA ist für Plattformadministratoren verpflichtend und für andere Benutzer
optional. Änderungen und Wiederherstellung werden auditiert. Für den letzten
Administrator muss ein dokumentierter Wiederherstellungsweg bestehen. Das
konkrete MFA-Verfahren bleibt eine Architekturentscheidung.

Technischer Betrieb ist keine fachliche Plattformadministration. Die
Berechtigungen bleiben getrennt, auch wenn dieselbe reale Person beide
Funktionen ausübt.

## Systemband `Öffentlich`

Die Systemband `Öffentlich` ist ein geschützter Berechtigungsprinzipal:

- nicht löschbar und nicht umbenennbar,
- jeder aktive Benutzer ist automatisch Mitglied,
- Mitgliedschaft ist nicht verlassbar oder durch normale Bandadministration
  entziehbar,
- deaktivierte oder gelöschte Benutzer verlieren den Zugriff,
- Grundrecht der Mitgliedschaft ist ausschließlich Lesen,
- kein anonymer Internetzugriff,
- Verwaltung ausschließlich durch Plattformadministratoren.

Nur Plattformadministratoren dürfen auf Antrag die Objektberechtigung
`Anzeigen` für diese Systemband setzen oder entfernen. Eine Freigabe an
`Öffentlich` ist kein eigenständiger Sichtbarkeitszustand und vermittelt keine
Schreibberechtigung.

Die Systemband darf regulärer Eigentümer sein. Eigentum darf ihr nur durch
Plattformadministratoren übertragen und nur durch diese verwaltet werden.

## Eigentum

Regulärer Eigentümer eines Inhalts, einer Setlist oder eines Overlays ist genau
ein aktiver Benutzer oder genau eine bestehende Band. Normale Gruppen und die
Plattform selbst sind keine regulären Eigentümer.

Der Eigentümer hält automatisch und nicht entziehbar Anzeigen, Bearbeiten,
Löschen, Berechtigungen verwalten und Eigentum übertragen. Die Ausübung
erfordert weiterhin das globale Aktionsrecht. Bei Bandeigentum hält die Band
diese Rechte; ihre Mitglieder erhalten sie nicht automatisch.

Eine Eigentumsübertragung benötigt keine Annahme, lässt vorhandene Anzeige- und
Bearbeitungsberechtigungen unverändert und darf an einen aktiven Benutzer oder
eine bestehende, nicht zur Löschung vorgemerkte Band erfolgen. Die Übertragung
an `Öffentlich` ist nur administrativ zulässig.

Eigentümerlosigkeit darf nur durch Löschung des Eigentümers oder ausdrückliche
administrative Sonderaktion entstehen.

## Eigentümerlose Objekte und Löschung

Bei Benutzerlöschung werden dessen Objekte eigentümerlos. Bei bestätigter
Bandlöschung entfallen das Bandeigentum und unmittelbar an die Band oder ihre
gelöschten Gruppen vergebene Rechte. Andere Benutzer-, Gruppen- und Bandrechte
bleiben bestehen.

Eigentümerlose Objekte behalten ihre wirksamen Lese- und Schreibrechte. Nur
Plattformadministratoren dürfen ihr Eigentum oder ihre Berechtigungen ändern.
Berechtigungsanfragen gehen immer an die Plattformadministration.

Eigentümerlosigkeit ist keine Löschvormerkung und startet keine
Wiederherstellungsfrist. Während einer Löschvormerkung bleiben Leserechte
wirksam; Bearbeitung, neue Freigaben und neue Setlistreferenzen sind gesperrt.
Nur Plattformadministratoren dürfen wiederherstellen oder endgültig löschen.

## Objektbezogene Sonderrechte

Neben den allgemeinen Objektberechtigungen bestehen fachlich unterscheidbare
Sonderrechte.

### Songs

- `Songänderung beantragen`,
- Song ohne Inhalt anlegen,
- Songmetadaten ändern und Song prüfen,
- Songänderungsantrag entscheiden,
- Dubletten zusammenführen,
- Inhalt auf anderen Song umhängen,
- referenzfreien Song löschen.

Bis auf `Songänderung beantragen` sind diese Aktionen
Plattformadministratoren vorbehalten.

### Inhalte

- Inhalt anlegen,
- Basisinhalt ersetzen,
- Inhaltsmetadaten bearbeiten,
- Freigabe an `Öffentlich` beantragen,
- Overlay-Übernahme prüfen,
- zur Löschung vormerken,
- endgültige Löschung oder Wiederherstellung administrieren.

### Overlays

- Overlay anlegen,
- dynamisch gekoppeltes Overlay anlegen,
- zusätzliche Overlay-Bearbeiter verwalten,
- eigenes Overlay zur Übernahme einreichen,
- Overlay-Übernahme prüfen,
- gekoppeltes Overlay für eigene Nutzung kopieren.

Ein dynamisch gekoppeltes Overlay erbt ausschließlich Leserechte des Inhalts
und darf nur zusätzliche Bearbeitungsrechte erhalten. Ein zusätzlicher
Bearbeiter muss den Basisinhalt bereits lesen dürfen.

### Setlists

- Setlist anlegen und bearbeiten,
- Inhalt einfügen oder entfernen,
- gemeinsame Overlay-Auswahl und -Reihenfolge ändern,
- persönliche Setlisteinstellungen ändern.

Persönliche Einstellungen benötigen keinen Check-out.

### Check-outs und Export

- gemeinsam bearbeitbares Objekt auschecken,
- eigenen Check-out beenden,
- fremden Check-out ausdrücklich zurücknehmen,
- Offline-Check-out nach dem MVP anfordern.

Bandverwaltung beinhaltet keine automatische Check-out-Rücknahme fremder
Objekte.

Ein späterer Export erfordert zusätzlich zur Objektberechtigung `Exportieren`
das globale Aktionsrecht `Exportieren`. Anzeigen, Bearbeiten oder
Offlinebereitstellung vermittelt kein Exportrecht.

## Berechtigungsanfragen

Benutzer dürfen für sich `Anzeigen` oder `Bearbeiten` beantragen. Für eine Band
dürfen sie dies mit `Berechtigung für Band anfragen`. Empfänger müssen
gleichzeitig das globale Verwaltungsrecht und am Objekt
`Berechtigungen verwalten` besitzen. Fehlt ein solcher Empfänger oder ist das
Objekt eigentümerlos, geht die Anfrage an die Plattformadministration.

Im MVP erfolgen Anfrage und Bearbeitung in der Anwendung. Die Zustände sind
`offen`, `genehmigt` und `abgelehnt`; Antragsteller sehen den Status. E-Mail-
oder Push-Benachrichtigungen sind nicht erforderlich.

Fehlt Zugriff auf einen Setlistinhalt, dürfen nur Songtitel, Komponist,
Eigentümer-Anzeigename oder Bandname, `Inhalt nicht verfügbar` und die
Anfrageaktion erscheinen. E-Mail-Adresse, Benutzer-ID und
Mitgliedschaftsinformationen bleiben verborgen. Bei Eigentümerlosigkeit wird
`Plattformadministration` angezeigt.

## Check-out-Autorisierung

Ein Check-out ersetzt weder globales Aktionsrecht noch Objektberechtigung. Ein
Objekt benötigt einen Check-out, sobald mehr als ein Benutzer potenziell
Schreibrecht besitzt. Gruppen- oder Bandschreibrecht erfüllt diese Bedingung
unabhängig von der Mitgliederzahl.

Zur Rücknahme berechtigt sind der Inhaber der Bearbeitungssitzung, der
Objekteigentümer mit erforderlichen Rechten, ausdrücklich berechtigte Benutzer
oder Gruppen und Plattformadministratoren.

Plattformadministratoren müssen einen fremden Check-out zurücknehmen und
anschließend selbst auschecken; sie dürfen ihn nicht umgehen. Rechteentzug
beendet den Check-out und verhindert Speichern. Eine Eigentumsübertragung
beendet ihn nur, wenn dem Bearbeiter danach eine erforderliche Berechtigung
fehlt. Eine Löschvormerkung beendet ihn immer.

## Übergreifende Sicherheitsregeln

- Berechtigungen werden serverseitig und aktuell geprüft.
- Eine ausgeblendete Bedienaktion ersetzt keine Autorisierung.
- Bandmitgliedschaft vermittelt keinen impliziten Objektzugriff.
- Ausdrückliche Freigaben über Bandgrenzen sind zulässig; andere Querzugriffe
  bleiben verboten.
- Eigentum, Freigabe, Ersteller und Berechtigung bleiben getrennt.
- Die Dublettenprüfung offenbart keine fremden Inhalte oder Beziehungen.
- Die Systemband `Öffentlich` ermöglicht keinen anonymen Zugriff.
- Sicherheitsereignisse und fachliche Historien sind datensparsam getrennt.
- Nicht festgelegte technische Verfahren bleiben Architekturentscheidungen.
