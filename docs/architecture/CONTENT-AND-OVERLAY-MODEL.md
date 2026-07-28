# Inhalts- und Overlaymodell

## Zweck und Geltungsbereich

Dieses Dokument beschreibt das verbindliche fachliche Referenzmodell für
Songs, Inhalte, Inhaltsmetadaten, Berechtigungen, Eigentum, Overlays, Setlists,
Check-outs, Offlinebetrieb, Löschung und Historien. Es legt weder Datenmodell,
API, Speichertechnik, Synchronisationsverfahren noch
Implementierungsarchitektur fest.

Die zugehörigen Anforderungen stehen im
[funktionalen Scope](../product/FUNCTIONAL-SCOPE.md), verbindliche Begriffe im
[Glossar](../product/GLOSSARY.md) und der Status der Produktentscheidungen in
den [Produktfragen](../product/OPEN-QUESTIONS.md).

In diesem Dokument bedeuten:

- **MVP:** Bestandteil des früh nutzbaren PDF-zentrierten Produktstands.
- **Zielmodell nach dem MVP:** fachlich beschlossen, aber nicht Bestandteil des
  MVP.
- **Spätere Anforderung:** vorgemerkt, jedoch noch nicht für den MVP
  einzuplanen.
- **Architekturentscheidung:** technisches Verfahren, das erst nach dem
  [ADR-Verfahren](../ADR.md) festgelegt werden darf.

## Songmodell

### Song und Metadaten

Ein Song ist ein plattformweites normalisiertes Metadatenobjekt. Er ist weder
PDF noch Text- oder Chord-Inhalt.

Jeder Song muss folgende Felder besitzen:

- **Titel:** Pflichtfeld.
- **Komponist:** Pflichtfeld und genau ein String. Mehrere Namen dürfen
  gemeinsam in diesem String stehen. `Unbekannt` und `Traditionell` sind
  zulässige Werte.
- **Gemeinfreiheitsstatus:** `Unbekannt`, `Gemeinfrei` oder
  `Nicht gemeinfrei`.
- **Prüfstatus:** `Ungeprüft` oder `Geprüft`.

Normale Benutzer dürfen einen Song nur atomar zusammen mit einem neuen Inhalt
anlegen. Ein dabei neu erzeugter Song erhält den Prüfstatus `Ungeprüft`.
Plattformadministratoren dürfen zusätzlich einen Song ohne Inhalt anlegen.

Bestehende Songmetadaten dürfen ausschließlich Plattformadministratoren
ändern. Ein anderer Benutzer benötigt das globale Recht
`Songänderung beantragen`, um einen Änderungsantrag zu stellen.
Plattformadministratoren dürfen:

- Songmetadaten ändern und Songs prüfen,
- Änderungsanträge genehmigen oder ablehnen,
- Dubletten zusammenführen,
- Inhalte atomar auf einen anderen Song umhängen,
- einen referenzfreien Song löschen.

Ein Song darf nicht gelöscht werden, solange mindestens ein Inhalt auf ihn
verweist.

### Aktueller Stand und Audit

Songänderungen gelten global. Inhalte und Setlists zeigen immer die aktuellen
Songmetadaten. Es gibt keine auswählbaren Songversionen und keine fachliche
Songhistorie.

Ein nicht editierbares Audit-Protokoll muss mindestens folgende Ereignisse
enthalten:

- Anlage und Prüfung,
- Änderungsantrag sowie Genehmigung oder Ablehnung,
- direkte Änderung,
- Zusammenführung,
- Verschiebung von Inhalten,
- Löschung.

Für Songs gilt im MVP kein Check-out. Mehrere Plattformadministratoren dürfen
parallel speichern; der zuletzt gespeicherte Stand gilt. Jede Speicherung wird
auditiert.

Eine optimistische Konkurrenzprüfung ist eine spätere Anforderung: Ein
Speicherversuch, der dann auf einem veralteten Songstand basiert, soll
abgelehnt werden.

### Zuordnung und Dubletten

Bei der Inhaltsanlage darf ein Benutzer:

- einen für ihn sichtbaren Song auswählen oder
- Titel, Komponist und Gemeinfreiheitsstatus eingeben.

Eine automatische Zuordnung zu einem bestehenden Song darf nur erfolgen, wenn
Titel und Komponist nach allen folgenden Regeln übereinstimmen:

1. Groß- und Kleinschreibung ignorieren.
2. Unicode normalisieren.
3. Äußere Leerzeichen entfernen.
4. Mehrere Leerzeichen zusammenfassen.
5. Titel und Komponist müssen beide übereinstimmen.

Satzzeichen, Namensreihenfolge und sonstige Schreibweise bleiben relevant. Der
Gemeinfreiheitsstatus gehört nicht zur Songidentität. Ein gleicher Titel allein
reicht niemals aus. Ähnliche Werte dürfen nur als möglicher Prüfhinweis
erscheinen.

Die Dublettenprüfung darf keine fremden Inhalte, Eigentümer,
Bandmitgliedschaften oder Berechtigungen offenlegen.

Bei einer Offlineanlage erfolgt die verbindliche Songzuordnung erst während der
Serversynchronisation. Der Benutzer erfährt nur, ob ein vorhandener Song
zugeordnet oder ein neuer ungeprüfter Song angelegt wurde.

## Inhalt und Inhaltsmetadaten

### Inhalt und Basisinhalt

Ein Inhalt ist eine konkrete musikalische Darstellung genau eines Songs. Im MVP
ist dies ein PDF; Text- und Chord-Inhalte folgen vollständig nach dem MVP.

Für jeden Inhalt gilt:

- Er gehört genau zu einem Song.
- Er besitzt genau einen aktuellen Basisinhalt.
- Er besitzt keine auswählbaren Versionen oder Revisionen.
- Er ist ein eigenständiges berechtigtes und eigentumsfähiges Objekt.

Der **Basisinhalt** ist der aktuelle Inhalt ohne angewendete Overlays. Eine
ersetzte PDF oder eine bearbeitete Textfassung ersetzt den bisherigen
Basisinhalt. Die zuerst importierte Datei wird nicht zusätzlich als dauerhaft
unveränderlicher Ausgangsstand geführt.

### Inhaltsmetadaten

Jeder Inhalt muss `Arrangeur/Interpret` als Textfeld besitzen. `Unbekannt` ist
zulässig. Bei der Anlage wird der Anzeigename des Erstellers nur als
vorausgefüllter Vorschlag verwendet. Der Benutzer muss ihn bestätigen oder
ändern; er darf nicht ungeprüft als fachliche Urheberschaft gespeichert werden.

Folgende Felder sind optional:

- **Tonart:** strukturierter musikalischer Wert.
- **Tempo:** BPM-Zahl.
- **Dauer:** intern Sekunden; Darstellung unter einer Stunde als `MM:SS`,
  darüber als `H:MM:SS`.
- **Niveau:** `1 = Leicht`, `2 = Mittel`, `3 = Schwer`, zusätzlich mit
  Symbolik dargestellt.
- **Genre:** kommagetrennter String.
- **Beschreibung:** Text.

Genres werden wie folgt normalisiert:

- Leerzeichen um Einzelwerte entfernen,
- leere Einträge verwerfen,
- Dubletten ohne Beachtung der Groß- und Kleinschreibung vermeiden,
- kein zentraler Genre-Katalog im aktuellen Scope,
- ein einzelnes Genre darf kein Komma enthalten.

Das frühere Feld `Bewertung` entfällt. Ein optionales Bewertungssystem ist nur
als spätere mögliche Erweiterung festgehalten.

## Berechtigungsmodell

### Zwei notwendige Autorisierungsebenen

Für eine geschützte Aktion müssen grundsätzlich beide Ebenen erfüllt sein:

1. das passende globale Aktionsrecht und
2. die Berechtigung am konkreten Objekt.

Plattformadministratoren besitzen fachlichen Superuserstatus und bilden die
ausdrückliche Ausnahme.

Globale Rechte und Objektberechtigungen dürfen Benutzern oder Gruppen
zugewiesen werden. Alle positiven Zuweisungen werden additiv ausgewertet; der
höchste positive Autorisierungsstatus gilt. Es gibt keine negativen oder
verweigernden Rechte.

Objektberechtigungen sind Anzeigen, Bearbeiten, Löschen, Berechtigungen
verwalten, Eigentum übertragen und objektspezifische Sonderrechte. Dabei gilt:

- Bearbeiten beinhaltet Anzeigen.
- Löschen beinhaltet global und objektbezogen Bearbeiten und Anzeigen.
- Berechtigungen verwalten beinhaltet Anzeigen.
- Eigentum übertragen beinhaltet Anzeigen.
- Die administrativen Rechte implizieren untereinander keine weiteren Rechte.

### Gruppen, Bands und Bandbereiche

Ein Benutzer darf mehreren Gruppen angehören. Eine Gruppe ist entweder global
oder genau einem Bandbereich zugeordnet. Gruppen dürfen nicht verschachtelt
werden. Eine bandbezogene Gruppe darf nur Mitglieder der zugehörigen Band
enthalten.

Eine Band ist Eigentums- und Berechtigungsprinzipal, verhält sich bei
Berechtigungen wie eine Gruppe, besitzt genau einen Bandbereich und darf
Mitglieder und zusätzliche bandbezogene Gruppen besitzen.

Die Bandbereichstrennung verhindert alle impliziten Querzugriffe. Eine
ausdrückliche Objektfreigabe über Bandgrenzen ist zulässig und verändert das
Eigentum nicht. Ohne diese Freigabe vermittelt eine andere Bandmitgliedschaft
keinen Zugriff. Bandadministration darf fremde Objekte nicht allein wegen
einer Mitgliedschaft oder Freigabe verwalten.

Plattformadministratoren dürfen Bands anlegen und umbenennen,
Bandlöschungen endgültig bestätigen, globale Gruppen und Systemgruppen
verwalten sowie globale Rechte vergeben.

Berechtigte Bandmitglieder dürfen innerhalb der eigenen Band Mitglieder
einladen, deaktivieren oder entfernen, bandbezogene Gruppen verwalten,
Mitglieder Gruppen zuordnen und delegierbare bandbezogene Rechte vergeben. Sie
dürfen keine globalen Gruppen, globalen Rechte oder fremden Bandbereiche
verwalten.

### Plattformadministratoren

Es gibt keine fachliche Rolle `Plattform-Redakteur`. Es gibt genau eine
geschützte Systemgruppe `Plattformadministratoren`.

Plattformadministratoren dürfen alle Objekte und Bands sehen und administrieren,
Songmetadaten verwalten, Eigentum beliebiger Objekte ändern, eigentümerlose
Objekte administrieren, Löschungen wiederherstellen oder endgültig durchführen,
Check-outs administrativ zurücknehmen und die Systemband `Öffentlich`
verwalten.

Nur Plattformadministratoren dürfen die Mitgliedschaft ihrer Systemgruppe
ändern. Der letzte aktive Plattformadministrator darf nicht entfernt,
deaktiviert, seiner Administratorrechte beraubt oder durch einen normalen
Verwaltungsablauf dauerhaft ausgesperrt werden.

MFA ist für Plattformadministratoren verpflichtend und für andere Benutzer
optional. Das konkrete Verfahren bleibt eine Architekturentscheidung.
MFA-Änderungen und -Wiederherstellung werden auditiert. Für den letzten
Administrator muss ein dokumentierter Wiederherstellungsweg bestehen.
Technischer Betrieb und fachliche Plattformadministration bleiben getrennt.

## Eigentum, Eigentümerlosigkeit und Löschung

### Zulässige Eigentümer

Regulärer Eigentümer eines Inhalts, einer Setlist oder eines Overlays ist genau
ein aktiver Benutzer oder eine bestehende Band. Die Plattform und normale
Gruppen sind keine regulären Eigentümer. Die Systemband `Öffentlich` darf
Eigentümer sein; nur Plattformadministratoren dürfen Eigentum an sie übertragen
oder für sie verwalten.

Eigentümer erhalten automatisch und nicht entziehbar Anzeigen, Bearbeiten,
Löschen, Berechtigungen verwalten und Eigentum übertragen. Die Ausübung setzt
weiterhin das erforderliche globale Aktionsrecht voraus. Bei Bandeigentum hält
die Band diese Rechte; Bandmitglieder erhalten sie nicht automatisch. Für die
Vertretung sind die getrennten bandbezogenen Rechte `Bandobjekte bearbeiten`,
`Bandobjekte löschen`, `Berechtigungen von Bandobjekten verwalten` und
`Eigentum von Bandobjekten übertragen` erforderlich.

Eine Eigentumsübertragung benötigt keine Annahme und verändert bestehende
Anzeige- und Bearbeitungsberechtigungen nicht. Zulässige Ziele sind ein aktiver
Benutzer, eine bestehende und nicht zur Löschung vorgemerkte Band oder
administrativ die Systemband `Öffentlich`.

### Eigentümerlosigkeit

Eigentümerlosigkeit entsteht ausschließlich durch Löschung des Eigentümers oder
durch eine ausdrückliche administrative Sonderaktion.

Bei Benutzerlöschung werden dessen Objekte eigentümerlos. Eine Bandlöschung
muss ein Plattformadministrator bestätigen. Danach entfallen das Eigentum der
Band und unmittelbar an die Band oder ihre gelöschten Gruppen vergebene Rechte;
andere Rechte bleiben bestehen und betroffene Objekte werden eigentümerlos.

Eigentümerlose Objekte behalten vorhandene wirksame Lese- und Schreibrechte.
Nur Plattformadministratoren dürfen Eigentum und Berechtigungen ändern;
Berechtigungsanfragen gehen an die Plattformadministration. Vorhandene
Berechtigte dürfen das Objekt gemäß ihren wirksamen Rechten weiter verwenden.

### Löschvormerkung und endgültige Löschung

`Eigentümerlos` und `zur Löschung vorgemerkt` sind getrennte Zustände. Nur
ausdrücklich zur Löschung vorgemerkte Objekte erhalten eine global
konfigurierbare Wiederherstellungsfrist.

Während der Frist bleiben Leserechte wirksam. Bearbeitung, neue Freigaben und
neue Setlistreferenzen sind gesperrt. Der Zustand wird deutlich angezeigt.
Nur Plattformadministratoren dürfen wiederherstellen oder sofort endgültig
löschen.

Vor endgültiger Inhaltslöschung muss die Anzahl betroffener Overlays und
aktueller Setlistreferenzen angezeigt werden. Bei Bestätigung werden die
Overlays gelöscht und die Referenzen atomar entfernt.

## Systemband `Öffentlich`

Es gibt keine eigenständige Berechtigung oder einen Zustand `öffentlich
sichtbar`. Stattdessen existiert genau eine geschützte Systemband:

- Name `Öffentlich`, nicht löschbar und nicht umbenennbar,
- jeder aktive Benutzer ist automatisch Mitglied,
- die Mitgliedschaft kann nicht verlassen oder durch normale
  Bandadministration entfernt werden,
- neue aktive Benutzer werden automatisch hinzugefügt,
- deaktivierte oder gelöschte Benutzer verlieren den Zugriff,
- die Standardmitgliedschaft vermittelt nur Lesen,
- kein anonymer Internetzugriff,
- Verwaltung der Band und ihrer Grundrechte nur durch
  Plattformadministratoren.

Ein Inhalt wird für alle angemeldeten aktiven Benutzer lesbar, indem die
Systemband am Inhalt `Anzeigen` erhält. Dafür gilt:

1. Eigentümer oder berechtigte Bearbeiter stellen einen Antrag.
2. Ein Plattformadministrator prüft ihn.
3. Nur ein Plattformadministrator setzt oder entfernt das Anzeigerecht.
4. Genehmigung, Ablehnung und Entfernung werden auditiert.

Zusätzliche Schreibrechte bleiben zulässig. Neue Inhalte bleiben standardmäßig
ohne Freigabe. Normale Benutzer dürfen `Öffentlich` nicht als ungeprüfte
direkte Standardsichtbarkeit anwenden.

## Berechtigungsanfragen

Ein Benutzer darf für sich `Anzeigen` oder `Bearbeiten` beantragen. Er darf
dies für eine Band tun, wenn er `Berechtigung für Band anfragen` besitzt.
Empfänger müssen gleichzeitig das globale Verwaltungsrecht und am Objekt
`Berechtigungen verwalten` besitzen. Fehlt ein solcher Empfänger oder ist das
Objekt eigentümerlos, geht die Anfrage an die Plattformadministration.

Fehlt Inhaltszugriff in einer Setlist, werden nur Titel, Komponist,
Eigentümer-Anzeigename oder Bandname, `Inhalt nicht verfügbar` und die
Anfrageaktion gezeigt. E-Mail-Adresse, Benutzer-ID und
Mitgliedschaftsinformationen bleiben verborgen. Bei Eigentümerlosigkeit wird
`Plattformadministration` angezeigt.

Der MVP bietet In-App-Anfragen mit den Zuständen `offen`, `genehmigt` und
`abgelehnt`, eine Arbeitsliste und einen sichtbaren Antragstellerstatus. E-Mail-
oder Push-Benachrichtigungen sind nicht erforderlich.

## Overlaymodell

### Normales Objekt statt fester Reichweitentypen

Ein Overlay ist ein normales berechtigtes Objekt und gehört genau zu einem
Inhalt. Eigentümer ist ein Benutzer oder eine Band. Es gibt keine festen
fachlichen Overlay-Typen nach Reichweite.

Ein Benutzer darf zu jedem lesbaren Inhalt beliebig viele eigene Overlays
anlegen. Ein zunächst nicht vererbendes Overlay gehört ihm, ist zunächst nur
für ihn les- und bearbeitbar und benötigt keinen Check-out, solange nur er
potenziell schreiben darf. Besitzt er Schreibrecht am Inhalt, darf er alternativ
unmittelbar ein dynamisch vererbendes Overlay anlegen.

### Dynamisch gekoppeltes Overlay

Ein dynamisch gekoppeltes Overlay:

- besitzt immer denselben Eigentümer wie der Inhalt,
- erbt dynamisch alle Leseberechtigungen des Inhalts,
- erbt keine Bearbeitungs-, Lösch-, Verwaltungs- oder Übertragungsrechte,
- darf ausschließlich zusätzliche Bearbeitungsrechte erhalten,
- darf zusätzliche Bearbeiter nur erhalten, wenn diese den Basisinhalt lesen,
- darf keine zusätzlichen Leserechte erhalten,
- darf nicht entkoppelt oder separat übertragen werden.

Bei Eigentumsübertragung oder Eigentümerlosigkeit des Inhalts folgen die
gekoppelten Overlays atomar.

Ein Benutzer ohne Schreibrecht am Inhalt darf ein eigenes Overlay zur
Übernahme einreichen. Bei Genehmigung wird dasselbe Overlay ohne Kopie
umgewandelt: Eigentum geht an den Inhaltseigentümer, dynamische
Leserechtevererbung wird aktiviert und das bisherige persönliche Schreibrecht
des Erstellers entfällt. Ein Schreibrecht muss bei Bedarf neu vergeben werden.
Der Benutzer muss persönliche Inhalte vor der Einreichung entfernen.

Prüfen dürfen der Inhaltseigentümer mit wirksamen Rechten, ausdrücklich
berechtigte Prüfer und bei eigentümerlosen Inhalten Plattformadministratoren.
Bei Ablehnung bleibt das Overlay unverändert beim Benutzer. Ein gekoppeltes
Overlay darf für persönliche Weiterverwendung kopiert werden; die Kopie gehört
dem kopierenden Benutzer und ist zunächst nur für ihn verfügbar.

Mehrere lesbare Overlays dürfen gleichzeitig in festgelegter Reihenfolge
dargestellt werden. Overlay-Aktionen verändern den Basisinhalt nicht.

## Check-out und gemeinsame Bearbeitung

### Online-Check-out

Check-out gilt für jedes gemeinsam bearbeitbare Objekt außer Songs. Ein Objekt
ist gemeinsam bearbeitbar, sobald mehr als ein Benutzer potenziell
Schreibrecht besitzt. Ein Schreibrecht für eine Band oder Gruppe erfüllt diese
Bedingung unabhängig von ihrer Mitgliederzahl. Gemeinsam bearbeitbare Inhalte,
Overlays und Setlists benötigen einen Check-out; Einzelbenutzerobjekte nicht.

Ein Check-out gehört genau einer Bearbeitungssitzung. Er beginnt beim Öffnen
des Bearbeitungsmodus und endet durch bewusstes Verlassen oder Abbrechen,
ausdrückliches Beenden, administrative Rücknahme, Rechteentzug,
Löschvormerkung oder Lease-Ablauf.

Speichern beendet ihn nicht, solange die Sitzung geöffnet bleibt. Die
Online-Inaktivitätsfrist ist global konfigurierbar. Nur die aktive verbundene
Bearbeitungssitzung verlängert sie. Schreibberechtigte Benutzer sehen
Anzeigename, Beginn und erwarteten Ablauf, aber keine E-Mail-Adresse oder
zusätzlichen Profildaten.

Zur Rücknahme berechtigt sind Inhaber, Objekteigentümer mit erforderlichen
Rechten, ausdrücklich berechtigte Benutzer oder Gruppen und
Plattformadministratoren. Bandadministratoren dürfen fremde oder nur lesbar
freigegebene Objekte nicht aufgrund ihrer Bandfunktion entsperren.
Plattformadministratoren müssen zurücknehmen und anschließend selbst
auschecken; sie dürfen einen Check-out nicht umgehen.

Bei Rechteentzug wird Speichern abgelehnt und der Check-out beendet. Lokale
Eingaben dürfen kopiert oder verworfen werden. Eigentumsübertragung bleibt
zulässig; der Check-out bleibt nur bei fortbestehenden Rechten wirksam.
Löschvormerkung beendet ihn sofort.

Eine Warteschlange gehört nicht zum MVP. Eine Freigabebenachrichtigung ist eine
spätere Komfortanforderung.

### Offline-Check-out als Zielmodell nach dem MVP

Im Zielmodell sind eigene Einzelbenutzerobjekte, persönliche
Setlisteinstellungen sowie online ausdrücklich ausgecheckte gemeinsame
Inhalte, dynamisch gekoppelte Overlays und Setlists offline bearbeitbar.

Der Offline-Check-out wird online bewusst angefordert. Rechte, Löschstatus und
konkurrierende Sperre werden geprüft; Objekt und technische Revisionskennung
werden lokal vorbereitet und eine feste, global konfigurierbare Offline-Lease
vergeben. Online- und Offline-Fristen sind getrennt. Die Offline-Lease darf die
maximale Offlinesitzung nicht überschreiten, kann offline nicht verlängert
werden, blockiert Bearbeitung durch andere, erlaubt Lesen, zeigt Bearbeiter und
Ablauf und kann administrativ zurückgenommen werden.

Nach bekanntem Ablauf ist Weiterarbeit nur als nicht synchronisierter Entwurf
zulässig. Bei Wiederverbindung gilt:

- wirksamer Check-out und unveränderte Revision: atomar speichern,
- abgelaufen, unverändert und frei: neuen Check-out bewusst anbieten,
- verändert oder anderweitig ausgecheckt: Speichern ablehnen,
- niemals automatisch zusammenführen oder still überschreiben,
- lokale Änderung verwerfen, manuell übertragen oder soweit zulässig als
  neues eigenes Objekt speichern.

Nach Erfolg endet der Offline-Check-out oder geht in einen Online-Check-out
derselben Sitzung über. Administrative Rücknahme wird bei Wiederverbindung
wirksam und auditiert.

## Offlinebetrieb im MVP

Der MVP umfasst Offlineanzeige und private Offlinebearbeitung. Eigene, nur durch
den Benutzer beschreibbare Inhalte, Overlays und Setlists sowie persönliche
Setlisteinstellungen dürfen offline bearbeitet werden. Vollständige gemeinsame
Offlinebearbeitung über Offline-Check-outs folgt nach dem MVP.

Offline angelegte Inhalte gehören dem Benutzer und bleiben zunächst ohne
Freigaben. Basisinhalt und Metadaten werden lokal gespeichert. Pflichtfelder
und Songzuordnung werden serverseitig erneut geprüft; bei Fehler bleibt der
Entwurf erhalten. Freigaben sind erst nach erfolgreicher Synchronisation
möglich.

Private Offlineobjekte tragen eine technische Revisionskennung. Veraltete
Änderungen werden abgelehnt; der lokale Stand darf verworfen, separat gesichert
oder manuell übertragen werden. Automatisches Merge und Last-write-wins sind
unzulässig.

Bei Rechteentzug bleiben vorbereitete Daten bis zur nächsten erfolgreichen
Rechteprüfung offline lesbar. Danach werden Basisinhalt und Overlays entfernt;
eine minimale Setlistanzeige darf verbleiben. Die maximale Offlinesitzung
begrenzt das Risiko.

Abmeldung warnt vor der Löschung nicht synchronisierter Entwürfe, erlaubt
vorherige Synchronisation und entfernt lokale Inhalte und Sitzungsschlüssel
kontrolliert. Lokale Daten müssen verschlüsselt gespeichert werden; das
Verfahren bleibt Architekturentscheidung.

## Setlists

Eine Setlist ist ein eigenständiges berechtigtes Objekt mit Benutzer oder Band
als Eigentümer. Eine benutzereigene Setlist gehört dem Ersteller und ist
zunächst nur für ihn les- und bearbeitbar. Eine bandeigene Setlist erfordert
globales und bandbezogenes Anlagerecht. Die Eigentumsrechte der Band schlagen
nicht auf Mitglieder durch. Ihre Mitglieder erhalten über den Bandprinzipal
standardmäßig Anzeigen; weitere Mitgliederrechte werden ausdrücklich vergeben. `Öffentlich` darf nur
administrativ Eigentümer werden.

Jeder Setlistbearbeiter darf jeden selbst lesbaren Inhalt einfügen, unabhängig
von dessen Eigentümerband. Benutzer ohne Inhaltsrecht sehen die minimale
Anzeige und dürfen Berechtigung anfragen.

Setlists referenzieren stets aktuellen Basisinhalt, aktuelle Songmetadaten und
aktuell berechtigte Overlays. Es gibt keine Snapshots oder eingefrorenen
Auftrittsstände.

Je Eintrag enthält die gemeinsame Auswahl aktive Overlays und Reihenfolge.
Persönliche Einstellungen dürfen Overlays zusätzlich ein- oder ausblenden, die
Reihenfolge überschreiben und Einträge ausblenden; sie benötigen keinen
Setlist-Check-out. Nicht lesbare gemeinsame Overlays werden nicht dargestellt
und als nicht verfügbar markiert.

Setlists dürfen unvollständig genutzt und offline vorbereitet werden. Anzahl
und Warnung nicht verfügbarer Inhalte erscheinen vor Offlinevorbereitung oder
Auftritt, blockieren die Nutzung aber nicht automatisch.

Endgültig gelöschte Inhalte werden aus dem aktuellen Stand entfernt. Die
Historie speichert nur Zeitpunkt, frühere Position, letzten Songtitel, letzten
Komponisten und `Inhalt endgültig gelöscht`. Sie speichert keine Datei, keinen
Basisinhalt, keine vollständigen Metadaten, Berechtigungen, früheren
Benutzereigentümer oder Overlays. Der Eintrag ist nicht anklickbar und nicht
wiederherstellbar.

## Audit, Historien und Export

Audit ist nicht editierbar. Plattformadministratoren erhalten eine
durchsuchbare Auditansicht. Eigentümer sehen die fachliche Änderungshistorie
ihrer Objekte im Rahmen ihrer Berechtigung. Normale Benutzer sehen keine
globalen Security-Ereignisse. Auditexport gehört nicht zum MVP.

Aufbewahrung:

- administrative, Eigentums-, Berechtigungs-, Lösch-, Wiederherstellungs- und
  Check-out-Ereignisse: 365 Tage,
- abgelehnte Zugriffe, Anmeldung und technische Security-Ereignisse: 90 Tage,
- fachliche Historie vorhandener Objekte: solange das Objekt besteht,
- minimale Auditnachweise nach endgültiger Objektlöschung: 90 Tage.

Security-Audit enthält keine Basisinhalte, Dateien oder unnötigen
Inhaltsdaten.

Export gehört nicht zum MVP; Offlinebereitstellung ist kein Export. Späterer
Export benötigt global und objektbezogen `Exportieren`. Anzeigen oder
Bearbeiten vermittelt dieses Recht nicht. Formate, Overlays und Setlistpakete
werden später entschieden.

## Integritätsregeln

Das Produkt muss insbesondere verhindern:

1. Inhalt ohne genau einen Song oder Basisinhalt.
2. automatische Songzuordnung ohne Übereinstimmung von Titel und Komponist.
3. Offenlegung fremder Daten durch Dubletten- oder Berechtigungsprüfung.
4. auswählbare Song-, Inhalts- oder Setlistversion.
5. Overlay ohne Inhalt oder Änderung des Basisinhalts durch Overlayaktion.
6. festen Overlay-Typ außerhalb des Berechtigungsmodells.
7. gekoppeltes Overlay mit abweichendem Eigentümer oder zusätzlichem Leserecht.
8. geschützte Aktion ohne beide Autorisierungsebenen.
9. negatives Recht oder impliziten Querzugriff zwischen Bandbereichen.
10. reguläres Eigentum der Plattform oder einer normalen Gruppe.
11. automatische Eigentümerrechte für Mitglieder einer Eigentümerband.
12. Löschung eines referenzierten Songs.
13. Vermischung von Eigentümerlosigkeit und Löschvormerkung.
14. Bearbeitung, Freigabe oder neue Referenz während Löschvormerkung.
15. anonymen Zugriff oder ungeprüfte Freigabe über `Öffentlich`.
16. Bearbeitung eines gemeinsamen Objekts ohne sitzungsgebundenen Check-out.
17. Umgehung eines Check-outs durch Administration.
18. stilles Überschreiben oder automatisches Merge eines Offlinekonflikts.
19. Setlist-Snapshot oder Wiederherstellung gelöschter Inhalte aus Historie.

Die Regeln sind technologieoffen zu verifizieren. Ihre technische Abbildung
benötigt eine gesonderte Entscheidung, sobald die Kriterien des
[ADR-Verfahrens](../ADR.md) erfüllt sind.
