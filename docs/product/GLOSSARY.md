# Verbindliches Produktglossar

## Bezug und Verwendung

Dieses Glossar definiert die bevorzugten Fachbegriffe. Ein Synonym führt keine
zusätzliche Bedeutung ein. Das zusammenhängende Modell steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## Akteure und Berechtigungen

### Benutzer

Eine identifizierte Person mit einem globalen Benutzerkonto im Zustand
`aktiv`, `deaktiviert` oder `gelöscht`. Nur Plattformadministratoren dürfen
Konten global aktivieren, deaktivieren oder löschen. Ein deaktivierter Benutzer
bleibt Eigentümer und behält seine Beziehungen, darf aber keine Rechte ausüben;
Reaktivierung macht sie wieder wirksam. Erst Löschung oder eine ausdrückliche
administrative Sonderaktion erzeugt Eigentümerlosigkeit. Neuer Eigentümer oder
Übertragungsziel darf nur ein aktiver Benutzer sein.

### Bandmitgliedschaft

Von einem globalen Benutzerkonto unabhängige Beziehung zu genau einer Band im
Zustand `aktiv`, `deaktiviert` oder `entfernt`. Berechtigte Bandmitglieder dürfen
nur Mitgliedschaften ihrer eigenen Band einladen, aktivieren, deaktivieren oder
entfernen. Das ändert weder das globale Konto noch Beziehungen in anderen
Bands. Bandmitgliedschaft allein vermittelt kein Objektrecht; Zugriff entsteht
durch eine dem Bandprinzipal ausdrücklich oder standardmäßig zugewiesene
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
angehört. Ihr administrativ nicht reduzierbarer Basissatz umfasst globales
`Anzeigen` und `Bearbeiten` im Rahmen wirksamer Objektberechtigungen, die Anlage
eigener Inhalte, zunächst nicht vererbender Overlays und Setlists samt atomarer
Songanlage, direkte gekoppelte Overlayanlage bei Inhalts-Bearbeitungsrecht,
Overlay-Einreichung und -Privatkopie, Antrag auf Freigabe an `Öffentlich`,
Setlistbefüllung mit selbst lesbaren Inhalten sowie Selbstanfragen. Nicht
enthalten sind Songänderungsantrag, Löschen, Berechtigungsverwaltung,
Eigentumsübertragung, Bandanfragen, Overlay-Prüfung oder Administration. Nur
Plattformadministratoren verwalten die Gruppe; eine Reduktion des Basissatzes
erfordert eine neue Produktentscheidung. Deaktivierte oder gelöschte Benutzer
verlieren die wirksamen Rechte. Die Gruppe ist kein Eigentümer und von der
Systemband `Öffentlich` getrennt.

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

### Eigentümerspezifische Sonderbefugnis

Eng begrenzte Ausnahme von der Zwei-Ebenen-Regel am eigenen Objekt. Ein aktiver
persönlicher Inhaltseigentümer darf eine Overlay-Übernahme für diesen Inhalt
entscheiden; ein aktiver persönlicher Objekteigentümer darf einen Check-out des
eigenen Objekts zurücknehmen. Bei Bandeigentum handeln nur ausdrücklich für die
jeweilige Aktion vertretungsberechtigte aktive Benutzer oder bandbezogene
Gruppen. Die Befugnis ist kein globales Recht, gehört nicht zum Basissatz von
`Alle Benutzer` und erweitert keine Rechte an anderen Objekten.

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
Identität. Bei der Serversynchronisation einer Offlineanlage wird die exakte
Übereinstimmung gegen alle vorhandenen Songs geprüft; das Ergebnis darf keine
für den Benutzer unsichtbaren Inhaltsbeziehungen offenlegen.

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

### Administrative Song-Prüfarbeitsliste

Gemeinsame MVP-Arbeitsliste für Plattformadministratoren mit ungeprüften Songs,
offenen Songänderungsanträgen, möglichen Dubletten und abweichenden
Gemeinfreiheitsangaben bei exakter Zuordnung. Sie ermöglicht die bereits
berechtigten Prüf-, Korrektur-, Entscheidungs-, Zusammenführungs-, Umhängungs-
und Löschaktionen, ohne private Basisinhalte öffnen oder anzeigen zu müssen.

## Eigentum und Lebenszyklus

### Eigentum

Fachliche Verantwortung genau eines nicht gelöschten Benutzers oder genau
einer bestehenden Band für Inhalt, Setlist oder Overlay. Ein deaktivierter
Benutzer darf bestehender Eigentümer bleiben, seine Rechte aber nicht ausüben.
Neuer Eigentümer darf nur ein aktiver Benutzer sein. Die Plattform und normale
Gruppen sind keine regulären Eigentümer. Die Systemband `Öffentlich` ist ein
zulässiger administrativer Eigentümer.

### Eigentümerrechte

Automatische und nicht entziehbare Objektberechtigungen Anzeigen, Bearbeiten,
Löschen, Berechtigungen verwalten und Eigentum übertragen. Ihre Ausübung
erfordert weiterhin globale Aktionsrechte. Bei Bandeigentum hält die Band die
Rechte; Mitglieder erhalten sie nicht automatisch. Wird ein Inhalt, eine
Setlist oder ein nicht gekoppeltes Overlay durch Anlage oder Übertragung
bandeigen, erhält die Band atomar zusätzlich die normale Objektberechtigung
`Anzeigen`, die aktiven Mitgliedern Lesen vermittelt.

### Eigentumsübertragung

Bewusster Wechsel zu einem aktiven Benutzer oder einer bestehenden, nicht zur
Löschung vorgemerkten Band. Eine Annahme ist nicht erforderlich. Alle
ausdrücklich vergebenen Objektberechtigungen und Sonderrechte bleiben
unverändert; nur die automatischen Eigentümerrechte wechseln. Eine neue
Eigentümerband erhält atomar ihr Standard-Anzeigenrecht. Gekoppelte Overlays
folgen einem Inhalt atomar und erhalten kein separates Band-Anzeigenrecht; sie
erben Lesen dynamisch vom Inhalt. Nur Plattformadministratoren dürfen an
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
privaten Overlays ausschließlich für zuständige Prüfer entsteht. Zuständig sind
der aktive persönliche Inhaltseigentümer, ausdrücklich für die Eigentümerband
vertretungsberechtigte Prüfer, andere Prüfer mit globalem und objektspezifischem
`Overlay-Übernahme prüfen` oder bei Eigentümerlosigkeit ausschließlich
Plattformadministratoren. Der Zugriff vermittelt kein reguläres Bearbeiten und
endet bei Ablehnung oder Rücknahme; bei Genehmigung wird er durch die
endgültigen Rechte ersetzt.

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
Verschieben und Löschen. Geometrische Formen, Bild- oder Stempelelemente und
Ebenen- beziehungsweise Layergruppen gehören nicht zum MVP und sind dadurch
nicht als Post-MVP-Funktionen eingeplant.

## Setlists und Bearbeitung

### Setlist

Eigenständiges berechtigtes Planungsobjekt mit Benutzer oder Band als
Eigentümer und genau einem aktuellen Stand. Sie referenziert aktuelle
Basisinhalte, aktuelle Songmetadaten und aktuell berechtigte Overlays.
Auswählbare Versionen, Snapshots oder eingefrorene Auftrittsstände existieren
nicht; relevante gemeinsame Änderungen werden vollständig historisiert.

### Setlistkopie

Bewusst angelegtes neues Setlistobjekt für einen unabhängigen Planungsstand.
Standardmäßig wird der Kopierende Eigentümer; eine Band ist nur mit globalem
Setlist-Anlagerecht und passendem bandbezogenem Vertretungs- oder Anlagerecht
zulässig, `Öffentlich` nur administrativ. Eigentum und anfängliche Rechte
entstehen atomar. Die Kopie besitzt eigene Berechtigungen und neue Historie und
übernimmt nur Referenzen auf dieselben lesbaren Inhalte und berechtigten
Overlays, nicht die Inhalte oder Overlays selbst.

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
oder einer Setlist. Check-outs sind je Objekt getrennt: Ein Inhalts-Check-out
umfasst Basisinhalt beziehungsweise PDF und alle Inhaltsmetadaten, blockiert
aber kein Overlay; ein gemeinsam bearbeitbares Overlay benötigt einen eigenen
Check-out. Administrative Eigentums-, Berechtigungs-, Lösch- und
Rücknahmeaktionen bleiben atomar geprüft zulässig. Eine zweite Sitzung desselben
Benutzers darf die Reservierung nicht mitbenutzen. Wird ein Objekt während der
Bearbeitung gemeinsam bearbeitbar, erhält eine eindeutig bekannte aktive
Sitzung atomar die Reservierung; andernfalls ist vor Speichern ein neuer
Check-out nötig. Wird es wieder allein bearbeitbar, bleibt die Sperre bis zum
Sitzungsende. Songs benötigen keinen Check-out. Speichern beendet den
Check-out nicht. Leser sehen nur den letzten gespeicherten Serverstand.

### Online-Lease

Global konfigurierbare Inaktivitätsfrist eines Online-Check-outs. Nur die
aktive verbundene Bearbeitungssitzung verlängert sie; vor Ablauf wird gewarnt.
Nach Ablauf darf die alte Sitzung weder still speichern noch still neu
reservieren. Netzwerkverlust wandelt den Online-Check-out nicht in einen
Offline-Check-out um. Lokale Eingaben dürfen als Entwurf bleiben; bei
Wiederverbindung werden Sitzung und Check-out-Kennung, Lease, Rechte, Revision
beziehungsweise Serverstand und Löschstatus erneut geprüft.

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

### Offline-Songauswahl

Auswahl ausschließlich aus bereits lokal bekannten Songs, die für den Benutzer
nach dem Sichtbarkeitsmodell sichtbar sind. Unsichtbare Songs sind kein lokaler
Katalog- oder Vorschlagsbestand. Freie Eingaben bleiben bis zur
Serversynchronisation unaufgelöst; erst dort darf die exakte Zuordnung auch zu
einem unsichtbaren Song erfolgen, ohne Beziehungen offenzulegen.

### Gerätesitzungswiderruf

Serverseitiger Widerruf durch Plattformadministratoren. Er wird beim nächsten
Serverkontakt wirksam und verhindert dann weitere geschützte Zugriffe und
Synchronisationen. Bis dahin begrenzt die maximale Offlinesitzung das Risiko
eines dauerhaft getrennten Geräts. Widerruf und abgelehnte Folgeverwendung
werden auditiert; das technische Verfahren bleibt Architekturentscheidung.

### Offlinebereitstellung

Kontrollierte lokale Bereitstellung innerhalb der Anwendung. Sie ist kein
Export und keine zentrale Sicherung. Offlinekopien und nicht synchronisierte
Entwürfe belegen weder RPO noch RTO.

### Export

Spätere, nicht zum MVP gehörende Ausgabe mit globalem und objektbezogenem
`Exportieren`. Anzeigen oder Bearbeiten vermittelt weder Exportrecht noch
pauschale Weitergabeberechtigung. Der exportierende Benutzer bleibt für
Nutzungsrechte, zulässige Weitergabe und geltende Beschränkungen verantwortlich;
Formate und technische DRM-Verfahren sind nicht festgelegt.

### MFA-Wiederherstellung

Globaler, auditierter Wiederherstellungsprozess für
Plattformadministrator-Zugänge. Bandadministration und Bandmitgliedschaft
vermitteln keine Befugnis, MFA anderer Benutzer oder eines
Plattformadministrators zu deaktivieren oder zurückzusetzen. Der letzte
Plattformadministrator darf nicht dauerhaft ausgesperrt werden; das konkrete
MFA-Verfahren bleibt Architekturentscheidung.

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
