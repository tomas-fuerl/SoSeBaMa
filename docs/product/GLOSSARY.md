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

Ein aktiver Benutzer mit Mitgliedschaft in einer Band. Mitgliedschaft allein
vermittelt keine Objektberechtigung.

### Gruppe

Ein globaler oder genau einem Bandbereich zugeordneter
Berechtigungsprinzipal. Gruppen dürfen nicht verschachtelt werden und sind keine
Eigentümer. Eine bandbezogene Gruppe darf nur Mitglieder ihrer Band enthalten.

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

Die erste notwendige Autorisierungsebene für eine geschützte Aktion. Normale
Benutzer benötigen zusätzlich eine passende Objektberechtigung.

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

Ausnahme von der Regel, dass globales Aktionsrecht und Objektberechtigung
gemeinsam erforderlich sind. Er gilt ausschließlich für Mitglieder der
Systemgruppe `Plattformadministratoren`.

### Berechtigungsanfrage

In-App-Antrag auf Anzeigen oder Bearbeiten für den Antragsteller selbst oder,
mit dem erforderlichen bandbezogenen Recht, für eine Band. Bearbeiter benötigen
globales Verwaltungsrecht und `Berechtigungen verwalten` am Objekt. Fehlt ein
solcher Empfänger oder ist das Objekt eigentümerlos, ist die
Plattformadministration zuständig.

## Songs und Inhalte

### Song

Ein plattformweites normalisiertes Metadatenobjekt eines Musikstücks. Es ist
weder PDF noch Text- oder Chord-Inhalt. Es besitzt Titel, Komponist,
Gemeinfreiheitsstatus und Prüfstatus.

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

Antrag eines normalen Benutzers mit dem globalen Recht
`Songänderung beantragen`. Nur Plattformadministratoren dürfen den Antrag
genehmigen oder ablehnen und bestehende Songmetadaten ändern.

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
gehört nicht zur automatischen Songidentität.

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
Löschung vorgemerkten Band. Eine Annahme ist nicht erforderlich; bestehende
Anzeige- und Bearbeitungsberechtigungen bleiben unverändert. Nur
Plattformadministratoren dürfen an `Öffentlich` übertragen.

### Eigentümerlos

Objektzustand nach Löschung des Eigentümers oder ausdrücklicher administrativer
Sonderaktion. Vorhandene wirksame Lese- und Schreibrechte bleiben bestehen; nur
Plattformadministratoren dürfen Eigentum und Berechtigungen ändern.

### Zur Löschung vorgemerkt

Vom Zustand `Eigentümerlos` getrennte Markierung mit global konfigurierbarer
Wiederherstellungsfrist. Lesen bleibt erlaubt; Bearbeiten, neue Freigaben und
neue Setlistreferenzen sind gesperrt. Nur Plattformadministratoren dürfen
wiederherstellen oder endgültig löschen.

### Endgültige Löschung

Nicht wiederherstellbare Entfernung nach administrativer Bestätigung. Bei
Inhalten werden Overlays gelöscht und aktuelle Setlistreferenzen atomar
entfernt. Betroffene Anzahlen werden vorher angezeigt.

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
separat übertragen werden.

### Overlay-Übernahme

Umwandlung desselben eigenen Overlays in ein dynamisch gekoppeltes Overlay nach
Genehmigung. Das Eigentum geht an den Inhaltseigentümer und das bisherige
persönliche Schreibrecht entfällt. Bei Ablehnung bleibt das Overlay unverändert.

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
Eigentümer. Sie referenziert aktuelle Basisinhalte, aktuelle Songmetadaten und
aktuell berechtigte Overlays. Snapshots oder eingefrorene Auftrittsstände
existieren nicht.

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
oder einer Setlist. Songs benötigen keinen Check-out. Speichern beendet den
Check-out nicht, solange die Bearbeitungssitzung geöffnet bleibt.

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

### Nicht synchronisierter Entwurf

Lokale Änderung, die wegen abgelaufener Lease oder Konflikt nicht still
übernommen werden darf. Sie kann verworfen, manuell übertragen oder soweit
zulässig als neues eigenes Objekt gespeichert werden.

### Offlinebereitstellung

Kontrollierte lokale Bereitstellung innerhalb der Anwendung. Sie ist kein
Export.

## Nachvollziehbarkeit

### Audit

Nicht editierbarer, datensparsamer Nachweis administrativer und
sicherheitsrelevanter Ereignisse. Plattformadministratoren erhalten eine
durchsuchbare Ansicht; normale Benutzer sehen keine globalen Security-Ereignisse.

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
