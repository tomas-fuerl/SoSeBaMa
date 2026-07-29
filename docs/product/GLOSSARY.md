# Verbindliches Produktglossar

## Bezug und Verwendung

Dieses Glossar definiert die bevorzugten Fachbegriffe. Ein Synonym führt keine
zusätzliche Bedeutung ein. Das zusammenhängende Modell steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## Akteure und Berechtigungen

### Benutzer

Eine identifizierte Person, die nach erfolgreicher Authentifizierung und gemäß
ihren wirksamen Berechtigungen mit SoSeBaMa interagiert. Ein Benutzer ist aktiv,
deaktiviert oder gelöscht.

### Mitglied

Ein aktiver Benutzer mit Mitgliedschaft in einer Band. Bandmitgliedschaft
allein vermittelt kein Objektrecht. Zugriff entsteht durch eine dem
Bandprinzipal ausdrücklich oder standardmäßig zugewiesene
Objektberechtigung.

### Gruppe

Ein globaler oder genau einem Bandbereich zugeordneter
Berechtigungsprinzipal. Gruppen dürfen nicht verschachtelt werden und sind keine
Eigentümer. Eine bandbezogene Gruppe darf nur Mitglieder ihrer Band enthalten
und ausschließlich bandbezogene Rechte sowie Objektberechtigungen tragen.
Globale Aktionsrechte dürfen nur aktiven Benutzern direkt oder globalen Gruppen
zugewiesen werden.

### Systemgruppe `Alle Benutzer`

Geschützte globale Systemgruppe, der jeder aktive Benutzer automatisch
angehört. Nur Plattformadministratoren verwalten ihren verbindlichen Basissatz
globaler Funktionsrechte. Deaktivierte oder gelöschte Benutzer verlieren die
wirksamen Rechte; die Gruppe ist kein Eigentümer. Sie ist von der Systemband
`Öffentlich` getrennt.

### Band

Ein Eigentums- und Berechtigungsprinzipal für ein Ensemble. Eine Band verhält
sich bei Berechtigungen wie eine Gruppe, darf aber Eigentümer sein. Sie besitzt
genau einen Bandbereich, Mitglieder und optional weitere bandbezogene Gruppen.

### Bandbereich

Die genau einer Band zugeordnete Mitgliedschafts- und Verwaltungsgrenze. Sie
verhindert implizite Querzugriffe, verbietet aber keine ausdrückliche
Objektfreigabe an eine andere Band.

### Systemgruppe `Plattformadministratoren`

Die einzige geschützte administrative Systemgruppe. Ihre Mitglieder besitzen
fachlichen Superuserstatus. Nur sie dürfen die Mitgliedschaft der Gruppe
verändern. Technischer Betrieb ist davon getrennt.

### Systemband `Öffentlich`

Eine geschützte, nicht löschbare und nicht umbenennbare Band. Jeder aktive
Benutzer ist automatisch Mitglied und erhält über die Grundmitgliedschaft nur
Lesen. Sie ermöglicht keinen anonymen Internetzugriff. Nur
Plattformadministratoren verwalten sie und setzen oder entfernen auf Antrag ihr
Anzeigerecht an einem Inhalt.

### Globales Aktionsrecht

Funktionsrecht für eine Aktionsart. Bei Aktionen auf bestehenden Objekten
benötigen normale Benutzer zusätzlich eine passende Objektberechtigung. Bei
einer Objektanlage existiert diese noch nicht; Eigentum und anfängliche Rechte
entstehen atomar. Berechtigungs- und Songänderungsanträge folgen ihren
festgelegten Sonderregeln. Globale Aktionsrechte dürfen nur direkt aktiven
Benutzern oder globalen Gruppen zugewiesen werden.

### Objektberechtigung

Die zweite notwendige Autorisierungsebene für eine Aktion an einem konkreten
Objekt. Allgemeine Objektberechtigungen sind Anzeigen, Bearbeiten, Löschen,
Berechtigungen verwalten und Eigentum übertragen; objektspezifische
Sonderrechte sind möglich.

Bearbeiten beinhaltet Anzeigen. Löschen beinhaltet global und objektbezogen
Bearbeiten und Anzeigen. Berechtigungen verwalten sowie Eigentum übertragen
beinhalten jeweils Anzeigen, aber keine weiteren administrativen Rechte.

### Additive Berechtigung

Auswertung ausschließlich positiver Zuweisungen an Benutzer und Gruppen. Der
höchste positive Autorisierungsstatus gilt. Negative oder verweigernde Rechte
existieren nicht.

### Fachlicher Superuserstatus

Ausnahme von den für normale Benutzer je Aktionsart geltenden
Autorisierungsregeln. Er gilt ausschließlich für Mitglieder der Systemgruppe
`Plattformadministratoren`.

### Berechtigungsanfrage

In-App-Antrag auf Anzeigen oder Bearbeiten für den Antragsteller selbst oder,
mit `Berechtigung für Band anfragen`, für eine Band. Er setzt keine bestehende
Zielberechtigung voraus. Bearbeiter benötigen globales Verwaltungsrecht und
`Berechtigungen verwalten` am Objekt. Fehlt ein solcher Empfänger oder ist das
Objekt eigentümerlos, ist die Plattformadministration zuständig. Offline darf
nur ein Entwurf `noch nicht gesendet` entstehen; `offen` wird er erst nach
erfolgreicher serverseitiger Prüfung und Übermittlung.

## Songs und Inhalte

### Song

Ein plattformweites normalisiertes Metadatenobjekt eines Musikstücks. Es ist
weder PDF noch Text- oder Chord-Inhalt. Es besitzt Titel, Komponist,
Gemeinfreiheitsstatus und Prüfstatus. Ein normaler Benutzer sieht es im
allgemeinen Katalog, in der Suche oder Inhaltsanlage nur, wenn er mindestens
einen zugehörigen Inhalt lesen darf; Plattformadministratoren sehen alle
Songs.

### Sichtbarer Song

Song, zu dem ein normaler Benutzer mindestens einen Inhalt aufgrund von
Eigentum, direkter Benutzer-, Gruppen-, Band- oder `Öffentlich`-Berechtigung
lesen darf. Die minimale Anzeige in einer sichtbaren Setlist macht einen Song
nicht allgemein sichtbar oder suchbar.

### Songmetadaten

- Titel als Pflichtfeld,
- Komponist als genau ein Pflicht-String,
- Gemeinfreiheitsstatus `Unbekannt`, `Gemeinfrei` oder `Nicht gemeinfrei`,
- Prüfstatus `Ungeprüft` oder `Geprüft`.

Der Komponisten-String darf mehrere Namen enthalten; `Unbekannt` und
`Traditionell` sind zulässig.

### Songidentität

Normalisierte Übereinstimmung von Titel und Komponist. Groß- und Kleinschreibung
wird ignoriert, Unicode normalisiert, äußere Leerzeichen werden entfernt und
mehrere Leerzeichen zusammengefasst. Satzzeichen, Namensreihenfolge und andere
Schreibweisen bleiben relevant. Der Gemeinfreiheitsstatus gehört nicht zur
Identität.

### Änderungsantrag für Songmetadaten

Antrag eines normalen Benutzers mit dem globalen Sonderrecht
`Songänderung beantragen` für einen sichtbaren Song. Eine
Objektbearbeitungsberechtigung am Song ist nicht erforderlich. Nur
Plattformadministratoren dürfen den Antrag genehmigen oder ablehnen und
bestehende Songmetadaten ändern.

### Inhalt

Eine konkrete Darstellung genau eines Songs. Ein Inhalt besitzt genau einen
aktuellen Basisinhalt, Inhaltsmetadaten, Berechtigungen und einen zulässigen
Eigentümer. Im MVP ist der Inhalt PDF-zentriert; Text-/Chord-Inhalte folgen
vollständig nach dem MVP.

### Basisinhalt

Der aktuelle Inhalt ohne angewendete Overlays. Eine ersetzte PDF oder
bearbeitete Textfassung ersetzt den vorherigen Basisinhalt. Der zuerst
importierte Stand bleibt nicht als dauerhaft unveränderlicher zusätzlicher
Stand erhalten.

### Inhaltsmetadaten

Fachliche Angaben eines Inhalts. `Arrangeur/Interpret` ist Pflicht. Tonart,
Tempo, Dauer, Niveau, Genre und Beschreibung sind optional. Songmetadaten und
Inhaltsmetadaten bleiben getrennt.

### Gemeinfreiheitsstatus

Songfeld mit den Werten `Unbekannt`, `Gemeinfrei` oder `Nicht gemeinfrei`. Es
gehört nicht zur automatischen Songidentität. Weicht es bei ansonsten exakter
normalisierter Zuordnung ab, bleibt der bestehende Status unverändert und die
Abweichung wird als administrativer Prüfhinweis erfasst.

### Prüfstatus

Songfeld mit den Werten `Ungeprüft` oder `Geprüft`. Neue Songs normaler Benutzer
sind ungeprüft.

## Eigentum und Lebenszyklus

### Eigentum

Fachliche Verantwortung genau eines aktiven Benutzers oder genau einer
bestehenden Band für Inhalt, Setlist oder Overlay. Die Plattform und normale
Gruppen sind keine regulären Eigentümer. Die Systemband `Öffentlich` ist ein
zulässiger administrativer Eigentümer.

### Eigentümerrechte

Automatische und nicht entziehbare Objektberechtigungen Anzeigen, Bearbeiten,
Löschen, Berechtigungen verwalten und Eigentum übertragen. Ihre Ausübung
erfordert weiterhin globale Aktionsrechte. Bei Bandeigentum hält die Band die
Rechte; Mitglieder erhalten sie nicht automatisch.

### Eigentumsübertragung

Bewusster Wechsel zu einem aktiven Benutzer oder einer bestehenden, nicht zur
Löschung vorgemerkten Band. Eine Annahme ist nicht erforderlich. Alle
ausdrücklich vergebenen Objektberechtigungen und Sonderrechte bleiben
unverändert; nur die automatischen Eigentümerrechte wechseln. Gekoppelte
Overlays folgen einem Inhalt atomar. Nur Plattformadministratoren dürfen an
`Öffentlich` übertragen.

### Eigentümerlos

Objektzustand nach Löschung des Eigentümers oder ausdrücklicher administrativer
Sonderaktion. Vorhandene wirksame Lese- und Schreibrechte bleiben bestehen; nur
Plattformadministratoren dürfen Eigentum und Berechtigungen ändern.

### Zur Löschung vorgemerkt

Vom Zustand `Eigentümerlos` getrennte Markierung mit global konfigurierbarer
Wiederherstellungsfrist. Lesen bleibt erlaubt; Bearbeiten, neue Freigaben und
neue Setlistreferenzen sind gesperrt. Plattformadministratoren dürfen vor
Ablauf wiederherstellen oder sofort endgültig löschen; nach Ablauf beginnt die
automatische endgültige Löschung.

### Ausstehende endgültige Löschung

Sichtbarer Zustand nach Ablauf der fachlichen Wiederherstellungsfrist, solange
die automatische technische Entfernung noch nicht abgeschlossen ist. Eine
Verzögerung verlängert die Wiederherstellbarkeit nicht; Fehler bleiben sichtbar
und erneut behandelbar.

### Endgültige Löschung

Nicht wiederherstellbare automatische Entfernung nach Fristablauf oder sofortige
administrative Entfernung. Bei Inhalten werden Overlays gelöscht, aktuelle
Setlistreferenzen atomar entfernt und minimale Historienhinweise erzeugt.
Betroffene Anzahlen werden vorher angezeigt.

## Overlays

### Overlay

Ein normales berechtigtes Objekt mit Benutzer oder Band als Eigentümer, das
genau zu einem Inhalt gehört. Es verändert den Basisinhalt nicht. Feste
fachliche Reichweitentypen existieren nicht.

### Zunächst nicht vererbendes Overlay

Eigenes Overlay eines Benutzers, das zunächst nur er lesen und bearbeiten darf.
Solange nur er potenziell schreiben darf, benötigt es keinen Check-out.

### Dynamisch gekoppeltes Overlay

Overlay mit stets demselben Eigentümer wie sein Inhalt. Es erbt dynamisch alle
Leseberechtigungen des Inhalts, aber keine Schreib-, Lösch-, Verwaltungs- oder
Übertragungsrechte. Es darf ausschließlich zusätzliche Bearbeitungsrechte für
bereits am Basisinhalt Leseberechtigte erhalten und weder entkoppelt noch
separat übertragen werden. Bei direkter gekoppelter Anlage erhält der
Ersteller atomar ein entziehbares zusätzliches Bearbeitungsrecht, sofern er
nicht bereits Eigentümer ist.

### Temporärer Overlay-Prüfzugriff

Zweckgebundener Lesezugriff, der atomar mit der Einreichung eines bis dahin
privaten Overlays ausschließlich für zuständige Prüfer entsteht. Er vermittelt
kein reguläres Bearbeiten und endet bei Ablehnung oder Rücknahme; bei
Genehmigung wird er durch die endgültigen Rechte ersetzt.

### Overlay-Übernahme

Umwandlung desselben eigenen Overlays in ein dynamisch gekoppeltes Overlay nach
Genehmigung. Das Eigentum geht an den Inhaltseigentümer und das bisherige
persönliche Schreibrecht entfällt. Anders als bei direkter gekoppelter Anlage
entsteht kein automatisches Ersteller-Schreibrecht. Bei Ablehnung bleibt das
Overlay privat.

### Overlay-Auswahl

Auswahl und Reihenfolge der sichtbaren Overlays. Eine gemeinsame Auswahl darf
je Setlisteintrag bestehen; persönliche Einstellungen dürfen sie für den
Benutzer ergänzend übersteuern, ohne allgemeine Berechtigungen zu verändern.

### Annotation

Grafische oder textuelle Ergänzung in einem Overlay. PDF-Annotationen im MVP
umfassen Freihandstift, Radierer, Textnotiz, Textmarker sowie Auswahl,
Verschieben und Löschen.

## Setlists und Bearbeitung

### Setlist

Eigenständiges berechtigtes Planungsobjekt mit Benutzer oder Band als
Eigentümer und genau einem aktuellen Stand. Sie referenziert aktuelle
Basisinhalte, aktuelle Songmetadaten und aktuell berechtigte Overlays.
Auswählbare Versionen, Snapshots oder eingefrorene Auftrittsstände existieren
nicht; relevante gemeinsame Änderungen werden vollständig historisiert.

### Setlistkopie

Bewusst angelegtes neues Setlistobjekt für einen unabhängigen Planungsstand mit
eigenem Eigentum, eigenen Berechtigungen und neuer Historie. Es übernimmt nur
Referenzen auf dieselben lesbaren Inhalte und berechtigten Overlays, nicht die
Inhalte oder Overlays selbst.

### Setlisteintrag

Referenz eines Inhalts in einer Setlist mit Position sowie gemeinsamer
Overlay-Auswahl und Reihenfolge. Fehlende Inhaltsrechte führen zur minimalen
Anzeige und ermöglichen eine Berechtigungsanfrage.

### Persönliche Setlisteinstellung

Persönliches Ein- oder Ausblenden von Overlays, persönliche Reihenfolge oder
persönliches Ausblenden eines Eintrags. Diese Einstellungen verändern den
gemeinsamen Setliststand nicht und benötigen keinen Setlist-Check-out.

### Gemeinsam bearbeitbar

Objektzustand, sobald mehr als ein Benutzer potenziell Schreibrecht besitzt.
Ein Schreibrecht für Band oder Gruppe genügt unabhängig von der aktuellen
Mitgliederzahl.

### Check-out

Sitzungsgebundene Reservierung eines gemeinsam bearbeitbaren Inhalts, Overlays
oder einer Setlist. Beim Inhalt umfasst sie Basisinhalt beziehungsweise PDF und
alle Inhaltsmetadaten, nicht jedoch eigene, nicht vererbende Overlayobjekte oder
administrative Eigentums-, Berechtigungs-, Lösch- und Rücknahmeaktionen. Eine
zweite Sitzung desselben Benutzers darf die Reservierung nicht mitbenutzen.
Wird ein Objekt während der Bearbeitung gemeinsam bearbeitbar, erhält eine
eindeutig bekannte aktive Sitzung atomar die Reservierung; andernfalls ist vor
Speichern ein neuer Check-out nötig. Wird es wieder allein bearbeitbar, bleibt
die bestehende Sperre bis zum Sitzungsende erhalten. Songs benötigen keinen
Check-out. Speichern beendet den Check-out nicht, solange die
Bearbeitungssitzung geöffnet bleibt.

### Online-Lease

Global konfigurierbare Inaktivitätsfrist eines Online-Check-outs. Nur die
aktive verbundene Bearbeitungssitzung verlängert sie.

### Offline-Check-out

Nach dem MVP vorgesehene bewusste Online-Reservierung eines gemeinsamen Objekts
für Offlinebearbeitung mit technischer Revisionskennung und fester,
nicht offline verlängerbarer Lease.

### Technische Revisionskennung

Nicht auswählbare technische Konfliktkennung für Synchronisation. Sie ist keine
fachliche Version oder Revision.

### Maximale Offlinesitzung

Global begrenzter Zeitraum, nach dessen Ablauf geschützte lokale Basisinhalte
und Overlays bis zur erneuten Onlineanmeldung beziehungsweise Rechteprüfung
gesperrt werden. Minimale Setlistinformationen und klar getrennte eigene,
nicht synchronisierte Entwürfe dürfen verbleiben; lokaler Zustand verlängert
keine Berechtigung.

### Nicht synchronisierter Entwurf

Klar von leseberechtigten Serverinhalten getrennte lokale Änderung, die wegen
abgelaufener Sitzung oder Lease beziehungsweise Konflikt nicht automatisch
übernommen werden darf. Sie kann verworfen, manuell übertragen oder soweit
zulässig als neues eigenes Objekt gespeichert werden. Nach Ablauf einer
Offline-Lease besitzt sie keine Serverreservierung.

### Offlinebereitstellung

Kontrollierte lokale Bereitstellung innerhalb der Anwendung. Sie ist kein
Export.

## Nachvollziehbarkeit

### Audit

Nicht editierbarer, datensparsamer Nachweis mit mindestens Ereignisart, Akteur,
serverseitigem Zeitpunkt, Gegenstand oder technischer Objektkennung und
Ergebnis sowie zulässigem fachlichem Bezug. Für Song-, Eigentums-, Check-out-
und Offlineereignisse gelten die zusätzlichen festgelegten Kontextfelder.
Plattformadministratoren erhalten eine durchsuchbare Ansicht; normale Benutzer
sehen keine globalen Security-Ereignisse. Audit erzeugt keine fachliche
Versionierung.

### Fachliche Änderungshistorie

Nachvollziehbare Ereignisse eines vorhandenen Objekts für berechtigte
Eigentümer. Sie erzeugt keine auswählbare Version und wird solange aufbewahrt,
wie das Objekt besteht.

### Aktueller Stand

Der genau eine fachlich wirksame Basisinhalt beziehungsweise Setliststand. Bei
Songs gelten stets die aktuellen globalen Metadaten.

## Liefergrenzen

### MVP

Früh nutzbarer PDF-zentrierter Produktstand mit Benutzer-, Band-, Gruppen-,
Berechtigungs-, Eigentums-, Song-, PDF-, Overlay-, Setlist-, Anfrage-, Audit-,
Such-, Offlineanzeige- und privater Offlinebearbeitungsfunktion.

### Zielmodell nach dem MVP

Fachlich beschlossene Fortführung, insbesondere vollständige gemeinsame
Offlinebearbeitung über Offline-Check-outs und die Text-/Chord-Funktionsgruppe.

### Spätere Anforderung

Vorgemerkte Funktion außerhalb des MVP, etwa optimistische Konkurrenzprüfung
für Songs, Check-out-Freigabebenachrichtigung, Export oder optionales
Bewertungssystem.

### Architekturentscheidung

Noch festzulegendes technisches Verfahren, etwa für MFA, lokale
Verschlüsselung oder Synchronisation. Eine solche Entscheidung ändert die
fachliche Anforderung nicht.

## Ausdrücklich ersetzte Altbegriffe

Folgende Ausdrücke dürfen nur noch zur Kennzeichnung des verworfenen Modells
verwendet werden:

- `Original` als dauerhaft unveränderlicher erster Inhaltsstand: ersetzt durch
  `Basisinhalt`.
- `öffentliche Sichtbarkeit`, `öffentlich sichtbar`, `globale
  Veröffentlichung` und `Bandpublikation`: ersetzt durch ausdrückliche
  Objektberechtigungen; breite Lesbarkeit erfolgt über die Systemband
  `Öffentlich`.
- `Plattform als Eigentümer`: verworfen; nur Benutzer und Bands sind reguläre
  Eigentümer.
- `Plattform-Redakteur`: verworfen; es gibt nur die Systemgruppe
  `Plattformadministratoren`.
- `private Overlays`, `Band-Overlays` und `globale Overlays` als feste Typen:
  ersetzt durch normale berechtigte Overlays und optionale dynamische Kopplung.
- `Rollen und Direktrechte`: ersetzt durch Gruppen, globale Aktionsrechte und
  Objektberechtigungen.
- `first come, first save`: ersetzt durch den sitzungsgebundenen
  Check-out-Lebenszyklus.

Öffentliche Freigabelinks bleiben als gesonderte spätere Funktion zulässig und
sind keine Freigabe über die Systemband `Öffentlich`.
