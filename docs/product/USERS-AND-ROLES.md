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

Plattformadministratoren besitzen fachlichen Superuserstatus und sind die
ausdrückliche Ausnahme. Für normale Benutzer hängt die Prüfung von der
Aktionsart ab:

- Auf einem bestehenden Objekt sind das globale Aktionsrecht und die passende
  Objektberechtigung erforderlich.
- Bei einer Objektanlage existiert noch keine Objektberechtigung. Erforderlich
  sind das globale Anlagerecht, bei Bandeigentum das bandbezogene Vertretungs-
  oder Anlagerecht sowie die Berechtigung, Eigentümer zu werden oder für die
  Band zu handeln. Eigentum und anfängliche Objektberechtigungen entstehen
  atomar. Dies gilt für Inhalte, Setlists, Overlays und die Songanlage mit
  Inhalt; Plattformadministratoren dürfen Songs auch ohne Inhalt anlegen.
- Eine Berechtigungsanfrage setzt keine bestehende Zielberechtigung voraus.
  Sie benötigt das globale beziehungsweise systemseitige Anfragerecht und für
  eine Band zusätzlich `Berechtigung für Band anfragen`.
- `Songänderung beantragen` ist ein globales Sonderrecht. Ein Benutzer benötigt
  Sichtbarkeit des Songs, aber keine Objektberechtigung zum Bearbeiten.

Positive Zuweisungen werden additiv ausgewertet; der höchste positive
Autorisierungsstatus gilt. Negative oder verweigernde Rechte existieren nicht.

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
Mitglieder der zugehörigen Band enthalten.

Globale Aktionsrechte dürfen ausschließlich direkt aktiven Benutzern oder
globalen Gruppen zugewiesen werden. Bands und bandbezogene Gruppen dürfen keine
globalen Aktionsrechte tragen; sie dürfen ausschließlich bandbezogene Rechte
und Objektberechtigungen erhalten. Normale Gruppen dürfen kein Eigentum halten.

Plattformadministratoren verwalten globale Gruppen, globale Rechte und die
Mitgliedschaften globaler Gruppen, soweit diese globale Rechte vermitteln.
Berechtigte Bandmitglieder verwalten nur bandbezogene Gruppen der eigenen Band
und delegierbare bandbezogene Rechte. Durch eine Änderung von
Bandgruppenmitgliedschaften dürfen sie keine globalen Rechte erteilen oder
entziehen.

## Systemgruppe `Alle Benutzer`

Es gibt genau eine geschützte globale Systemgruppe `Alle Benutzer`. Jeder
aktive Benutzer ist automatisch Mitglied. Die Mitgliedschaft kann weder
manuell verlassen noch durch normale Bandadministration verändert werden;
deaktivierte oder gelöschte Benutzer verlieren ihre wirksamen Rechte. Nur
Plattformadministratoren verwalten die Gruppe und ihren Basissatz. Sie ist kein
Eigentümer.

Der Basissatz umfasst:

- sichtbare Songs, Inhalte und Overlays sowie berechtigte Setlists anzeigen,
- eigene Inhalte anlegen,
- atomar mit einem Inhalt einen ungeprüften Song anlegen,
- eigene Overlays und eigene Setlists anlegen,
- selbst lesbare Inhalte zu bearbeitbaren Setlists hinzufügen,
- Berechtigung für sich selbst anfragen.

Nicht automatisch enthalten sind `Songänderung beantragen`, fremde Objekte
bearbeiten oder löschen, Berechtigungen verwalten, Eigentum übertragen,
Berechtigung für eine Band anfragen, Overlay-Übernahme prüfen sowie globale
oder bandbezogene Administration.

`Alle Benutzer` ist von der Systemband `Öffentlich` getrennt: Die Systemgruppe
vermittelt globale Funktionsrechte, die Systemband ausschließlich
objektbezogene Lesbarkeit.

## Band und Bandbereich

Jede Band besitzt genau einen Bandbereich; jeder Bandbereich gehört genau einer
Band. Eine Installation darf mehrere Bandbereiche enthalten.

Eine Band ist Eigentums- und Berechtigungsprinzipal, verhält sich für
Berechtigungen wie eine Gruppe und darf Mitglieder sowie zusätzliche
bandbezogene Gruppen besitzen.

Bandmitgliedschaft allein vermittelt kein Objektrecht. Zugriff entsteht durch
eine dem Bandprinzipal ausdrücklich oder bei der Anlage eines bandeigenen
Objekts standardmäßig zugewiesene Objektberechtigung `Anzeigen`. Die
Bandbereichstrennung verhindert alle anderen impliziten Querzugriffe.

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
erfordert weiterhin das globale Aktionsrecht.

Bei Bandeigentum hält die Band diese automatischen Eigentümerrechte; ihre
Mitglieder erhalten sie nicht automatisch. Zusätzlich erhält der Bandprinzipal
bei der Anlage standardmäßig die normale Objektberechtigung `Anzeigen`, die
Mitgliedern Leserecht vermittelt. Bearbeiten, Löschen,
Berechtigungsverwaltung und Übertragung üben nur ausdrücklich berechtigte
bandbezogene Gruppen oder Benutzer mit passendem globalem und bandbezogenem
Vertretungsrecht aus. `Öffentlich` ist der nur administrativ verwaltete
Sonderfall.

Eine Eigentumsübertragung benötigt keine Annahme. Sämtliche ausdrücklich
vergebenen Objektberechtigungen und Sonderrechte bleiben unverändert,
einschließlich Lösch-, Verwaltungs-, Übertragungs-, Overlay-Prüf- und
-Bearbeitungs- sowie Check-out-Rücknahmerechten. Nur automatische
Eigentümerrechte entfallen beim bisherigen und entstehen beim neuen
Eigentümer. Dynamisch gekoppelte Overlays wechseln atomar mit dem Inhalt.
Zulässige Ziele sind ein aktiver Benutzer oder eine bestehende, nicht zur
Löschung vorgemerkte Band; die Übertragung an `Öffentlich` ist nur
administrativ zulässig.

Eigentümerlosigkeit darf nur durch Löschung des Eigentümers oder ausdrückliche
administrative Sonderaktion entstehen.

## Eigentümerlose Objekte und Löschung

Vor einer Benutzerlöschung müssen Anzahl und Folgen eigentumsbetroffener
Objekte angezeigt werden: Sie werden ohne vorherige Übertragung eigentümerlos,
andere Rechte bleiben bestehen und nur Plattformadministratoren dürfen danach
Eigentum oder Berechtigungen ändern. Eine vorherige Übertragung wird angeboten;
die Folgen müssen ausdrücklich bestätigt werden. Die Löschung bleibt danach
zulässig.

Vor administrativer Bestätigung einer Bandlöschung müssen die Auswirkungen auf
Eigentum und unmittelbar an die Band oder ihre gelöschten Gruppen vergebene
Rechte sichtbar sein. Diese Rechte und das Bandeigentum entfallen; andere
Benutzer-, Gruppen- und Bandrechte bleiben bestehen.

Eigentümerlose Objekte behalten ihre wirksamen Lese- und Schreibrechte. Nur
Plattformadministratoren dürfen ihr Eigentum oder ihre Berechtigungen ändern.
Berechtigungsanfragen gehen immer an die Plattformadministration.

Eigentümerlosigkeit ist keine Löschvormerkung und startet keine
Wiederherstellungsfrist. Während einer Löschvormerkung bleiben Leserechte
wirksam; Bearbeitung, neue Freigaben und neue Setlistreferenzen sind gesperrt.
Plattformadministratoren dürfen vor Ablauf wiederherstellen oder sofort
endgültig löschen. Nach Ablauf wird automatisch endgültig gelöscht. Bis zur
technischen Ausführung ist `ausstehende endgültige Löschung` sichtbar; eine
Verzögerung verlängert die fachliche Frist nicht und Fehler müssen sichtbar
sowie erneut behandelbar sein.

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

Bei direkter gekoppelter Anlage wird atomar der Inhaltseigentümer Eigentümer,
die dynamische Leserechtevererbung aktiviert und dem Ersteller ein entziehbares
zusätzliches Bearbeitungsrecht gegeben, sofern er nicht bereits Eigentümer ist.
Bei Einreichung eines privaten Overlays entsteht dagegen nur ein temporärer,
zweckgebundener Lesezugriff für zuständige Prüfer. Er endet bei Ablehnung oder
Rücknahme und wird bei Genehmigung durch endgültige Rechte ersetzt. Das private
Schreibrecht des Erstellers entfällt bei Übernahme und wird nicht automatisch
neu vergeben.

Ein dynamisch gekoppeltes Overlay erbt ausschließlich Leserechte des Inhalts
und darf nur zusätzliche Bearbeitungsrechte erhalten. Ein zusätzlicher
Bearbeiter muss den Basisinhalt bereits lesen dürfen.

### Setlists

- Setlist anlegen, bearbeiten und als neues unabhängiges Objekt kopieren,
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

Eine Anfrage setzt keine bestehende Zielberechtigung voraus. Benutzer dürfen
mit dem globalen beziehungsweise systemseitigen Anfragerecht für sich
`Anzeigen` oder `Bearbeiten` beantragen. Für eine Band dürfen sie dies nur mit
`Berechtigung für Band anfragen`. Empfänger müssen
gleichzeitig das globale Verwaltungsrecht und am Objekt
`Berechtigungen verwalten` besitzen. Fehlt ein solcher Empfänger oder ist das
Objekt eigentümerlos, geht die Anfrage an die Plattformadministration.

Im MVP erfolgen Anfrage und Bearbeitung in der Anwendung. Die serverseitigen
Zustände sind `offen`, `genehmigt` und `abgelehnt`; Antragsteller sehen den
Status. Offline darf nur ein lokaler Entwurf `noch nicht gesendet` entstehen.
Er erzeugt keine Serveranfrage und keine Benachrichtigung. Erst nach Verbindung
und erneuter Prüfung von Rechten, Zielobjekt, Empfängern und gegebenenfalls
Bandvertretung wird er übermittelt und `offen`; Fehler bleiben sichtbar. E-Mail-
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
- Bandmitgliedschaft allein vermittelt kein Objektrecht; ein dem Bandprinzipal
  zugewiesenes Objektrecht wirkt dagegen für seine Mitglieder.
- Bands und bandbezogene Gruppen tragen keine globalen Aktionsrechte.
- Ausdrückliche Freigaben über Bandgrenzen sind zulässig; andere Querzugriffe
  bleiben verboten.
- Eigentum, Freigabe, Ersteller und Berechtigung bleiben getrennt.
- Die Dublettenprüfung offenbart keine fremden Inhalte oder Beziehungen.
- Die Systemband `Öffentlich` ermöglicht keinen anonymen Zugriff.
- Sicherheitsereignisse und fachliche Historien sind datensparsam getrennt.
- Nicht festgelegte technische Verfahren bleiben Architekturentscheidungen.
