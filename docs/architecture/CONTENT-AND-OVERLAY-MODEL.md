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
ändern. `Songänderung beantragen` ist ein globales Sonderrecht. Ein normaler
Benutzer darf damit für einen nach dem folgenden Sichtbarkeitsmodell sichtbaren
Song einen Änderungsantrag stellen; eine Objektberechtigung zum Bearbeiten des
Songs ist dafür weder erforderlich noch ausreichend.

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

### Sichtbarkeit von Songs

Ein normaler Benutzer darf einen Song im allgemeinen Songkatalog, in der Suche
oder bei der Inhaltsanlage nur sehen, wenn er mindestens einen zugehörigen
Inhalt lesen darf. Inhaltslesbarkeit darf aus Eigentümerrecht, direkter
Benutzerberechtigung, Gruppenberechtigung, Bandberechtigung oder dem
Anzeigerecht der Systemband `Öffentlich` entstehen. Plattformadministratoren
dürfen alle Songs sehen.

Eine sichtbare Setlist darf für einen nicht lesbaren Inhalt ausschließlich
Songtitel, Komponist, Eigentümer-Anzeigename oder Bandname, `Inhalt nicht
verfügbar` und die Berechtigungsanfrage anzeigen. Diese zweckgebundene
Minimalanzeige macht weder den Song allgemein suchbar noch dessen Beziehungen
im Songkatalog sichtbar. Plattformadministratoren dürfen Songmetadaten
verwalten, ohne dass normale Benutzer dadurch private Inhaltsbeziehungen
sehen.

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

Stimmen Titel und Komponist normalisiert exakt überein, muss der Inhalt auch bei
abweichend eingegebenem Gemeinfreiheitsstatus dem vorhandenen Song zugeordnet
werden. Der vorhandene Status darf nicht automatisch geändert werden; die
Abweichung wird in der administrativen Prüfarbeitsliste erfasst. Ihre spätere
Bearbeitung wird auditiert.

Die serverseitige Dublettenprüfung darf auch für den Benutzer unsichtbare Songs
berücksichtigen. Ergebnis und Prüfhinweis dürfen jedoch keine fremden Inhalte,
Eigentümer, Bands, Bandmitgliedschaften, Berechtigungen oder Beziehungen
offenlegen.

Bei einer Offlineanlage erfolgt die verbindliche Songzuordnung erst während der
Serversynchronisation. Der Server prüft die normalisierte Übereinstimmung gegen
alle vorhandenen Songs, auch wenn sie für den Benutzer nicht katalogsichtbar
sind. Ein exakter Titel-/Komponisten-Treffer ordnet den vorhandenen Song zu;
ohne Treffer entsteht ein neuer ungeprüfter Song. Der Benutzer erfährt nur
dieses Ergebnis und keine Inhalte, Eigentümer, Bands, Berechtigungen oder
Beziehungen.

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

### Autorisierung nach Aktionsart

Plattformadministratoren besitzen fachlichen Superuserstatus und bilden die
ausdrückliche Ausnahme. Für normale Benutzer gelten vier klar getrennte Fälle:

1. **Aktion auf einem bestehenden Objekt:** Erforderlich sind das passende
   globale Aktionsrecht und die passende Berechtigung am konkreten Objekt.
2. **Anlage eines neuen Objekts:** Da noch kein Objekt existiert, ist keine
   Objektberechtigung voraussetzbar. Erforderlich sind das globale Anlagerecht,
   bei Anlage für eine Band zusätzlich das passende bandbezogene Vertretungs-
   oder Anlagerecht sowie die Berechtigung, Eigentümer zu werden oder für die
   Band zu handeln. Eigentum und anfängliche Objektberechtigungen entstehen
   atomar mit Inhalt, Setlist oder Overlay. Dieselbe Regel gilt für die atomare
   Anlage eines Songs mit Inhalt; Plattformadministratoren dürfen einen Song
   ohne Inhalt anlegen.
3. **Berechtigungsanfrage:** Sie setzt gerade keine bestehende
   Zielberechtigung voraus. Erforderlich ist das globale beziehungsweise
   systemseitige Recht zum Stellen einer Anfrage; für eine Band zusätzlich
   `Berechtigung für Band anfragen`.
4. **Songänderungsantrag:** `Songänderung beantragen` ist ein globales
   Sonderrecht. Der Song muss für den Antragsteller sichtbar sein; eine
   Objektberechtigung zum Bearbeiten des Songs ist nicht erforderlich.

Globale Aktionsrechte dürfen ausschließlich direkt aktiven Benutzern oder
globalen Gruppen zugewiesen werden. Bands und bandbezogene Gruppen dürfen keine
globalen Aktionsrechte tragen. Sie dürfen nur bandbezogene Rechte und
Objektberechtigungen erhalten. Alle positiven Zuweisungen werden additiv
ausgewertet; der höchste positive Autorisierungsstatus gilt. Es gibt keine
negativen oder verweigernden Rechte.

Objektberechtigungen sind Anzeigen, Bearbeiten, Löschen, Berechtigungen
verwalten, Eigentum übertragen und objektspezifische Sonderrechte. Dabei gilt:

- Bearbeiten beinhaltet Anzeigen.
- Löschen beinhaltet global und objektbezogen Bearbeiten und Anzeigen.
- Berechtigungen verwalten beinhaltet Anzeigen.
- Eigentum übertragen beinhaltet Anzeigen.
- Die administrativen Rechte implizieren untereinander keine weiteren Rechte.

### Benutzerkonto und Bandmitgliedschaft

Ein globales Benutzerkonto ist `aktiv`, `deaktiviert` oder `gelöscht`. Nur
Plattformadministratoren dürfen es global aktivieren, deaktivieren oder
löschen. Ein deaktiviertes Konto darf bestehender Eigentümer bleiben, aber
keine neuen geschützten Aktionen beginnen und keine Rechte ausüben. Seine
Eigentums- und Berechtigungsbeziehungen bleiben bestehen und werden nach
Reaktivierung wieder wirksam. Nur die Löschung des Kontos oder eine
administrative Sonderaktion macht seine Objekte eigentümerlos. Neuer
Eigentümer oder Übertragungsziel darf weiterhin nur ein aktiver Benutzer sein.

Eine Bandmitgliedschaft besitzt unabhängig vom globalen Benutzerkonto den
Zustand `aktiv`, `deaktiviert` oder `entfernt`. Berechtigte Bandmitglieder
dürfen ausschließlich Mitgliedschaften der eigenen Band einladen, aktivieren,
deaktivieren oder entfernen. Dies verändert weder das globale Benutzerkonto
noch Mitgliedschaften und Rechte in anderen Bands.

### Gruppen, Bands und Bandbereiche

Es gibt genau eine geschützte globale Systemgruppe `Alle Benutzer`. Jeder
aktive Benutzer ist automatisch Mitglied. Die Mitgliedschaft kann nicht
manuell verlassen oder durch normale Bandadministration verändert werden;
deaktivierte oder gelöschte Benutzer verlieren ihre wirksamen Rechte. Nur
Plattformadministratoren verwalten die Gruppe. Sie darf kein Eigentümer sein
und ist von der Systemband `Öffentlich` getrennt: `Alle Benutzer` vermittelt
globale Funktionsrechte, `Öffentlich` objektbezogene Lesbarkeit.

Der verbindliche, administrativ nicht reduzierbare Basissatz von `Alle
Benutzer` umfasst:

- globales `Anzeigen` für Objekte mit wirksamer Objektberechtigung,
- globales `Bearbeiten` für eigene oder ausdrücklich zur Bearbeitung
  freigegebene Objekte,
- eigene Inhalte, zunächst nicht vererbende eigene Overlays und eigene Setlists
  anlegen,
- atomar mit einem Inhalt einen ungeprüften Song anlegen,
- mit Inhalts-Bearbeitungsrecht ein dynamisch gekoppeltes Overlay anlegen,
- ein eigenes zunächst nicht vererbendes Overlay zur Übernahme einreichen,
- ein lesbares gekoppeltes Overlay als neues zunächst nicht vererbendes eigenes
  Overlay kopieren,
- bei Eigentum oder passender Inhaltsberechtigung eine Freigabe an die
  Systemband `Öffentlich` beantragen,
- selbst lesbare Inhalte zu bearbeitbaren Setlists hinzufügen,
- Berechtigung für sich selbst anfragen.

Globale Rechte begrenzen nicht auf eigene Objekte; die Objektberechtigung setzt
die konkrete Objektgrenze. Globales `Bearbeiten` erlaubt daher nur die
Bearbeitung eines Objekts, an dem `Bearbeiten` wirksam ist. Nicht im Basissatz
enthalten sind `Songänderung beantragen`, Löschen, Berechtigungen verwalten,
Eigentum übertragen, Berechtigung für eine Band anfragen, Overlay-Übernahme
prüfen sowie globale oder bandbezogene Administration. Eine Reduktion des
Mindestbasissatzes benötigt eine neue dokumentierte Produktentscheidung.

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

Berechtigte Bandmitglieder dürfen innerhalb der eigenen Band
Bandmitgliedschaften einladen, aktivieren, deaktivieren oder entfernen,
bandbezogene Gruppen verwalten, aktive Bandmitglieder Gruppen zuordnen und
delegierbare bandbezogene Rechte vergeben. Sie
dürfen keine globalen Gruppen, globalen Rechte oder fremden Bandbereiche
verwalten. Nur Plattformadministratoren dürfen globale Rechte sowie
Mitgliedschaften globaler Gruppen verwalten, soweit diese globale Rechte
vermitteln. Eine Änderung der Bandgruppenmitgliedschaft darf deshalb niemals
globale Rechte erteilen oder entziehen.

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
ein nicht gelöschtes Benutzerkonto oder eine bestehende Band. Ein deaktiviertes
Konto darf bestehender Eigentümer bleiben, kann seine Rechte aber erst nach
Reaktivierung wieder ausüben. Neuer Eigentümer oder Übertragungsziel darf nur
ein aktiver Benutzer sein. Die Plattform und normale Gruppen sind keine
regulären Eigentümer. Die Systemband `Öffentlich` darf Eigentümer sein; nur
Plattformadministratoren dürfen Eigentum an sie übertragen oder für sie
verwalten.

Eigentümer erhalten automatisch und nicht entziehbar Anzeigen, Bearbeiten,
Löschen, Berechtigungen verwalten und Eigentum übertragen. Die Ausübung setzt
weiterhin das erforderliche globale Aktionsrecht voraus.

Bei Bandeigentum hält die Band diese automatischen Eigentümerrechte; sie werden
nicht an Bandmitglieder vererbt. Immer wenn ein Inhalt, eine Setlist oder ein
nicht gekoppeltes Overlay durch Anlage oder Eigentumsübertragung bandeigen
wird, erhält die neue Eigentümerband atomar zusätzlich die normale
Objektberechtigung `Anzeigen`, die ihren aktiven Mitgliedern Leserecht
vermittelt. Bandmitgliedschaft allein vermittelt kein Objektrecht; Zugriff
entsteht durch eine dem Bandprinzipal ausdrücklich oder standardmäßig
zugewiesene Objektberechtigung. Bearbeiten, Löschen,
Berechtigungsverwaltung und Eigentumsübertragung werden nur durch ausdrücklich
berechtigte bandbezogene Gruppen oder Benutzer ausgeübt. Zusätzlich bleiben
das globale Aktionsrecht und das passende bandbezogene Vertretungsrecht
notwendig. Die Systemband `Öffentlich` bleibt der ausschließlich durch
Plattformadministratoren verwaltete Sonderfall.

Eine Eigentumsübertragung benötigt keine Annahme. Alle ausdrücklich vergebenen
Objektberechtigungen und objektspezifischen Sonderrechte bleiben unverändert,
beispielsweise Anzeigen, Bearbeiten, Löschen, Berechtigungen verwalten,
Eigentum übertragen, Overlay-Bearbeitungs- und -Prüfrechte sowie
Check-out-Rücknahmerechte. Nur die automatischen Eigentümerrechte entfallen
beim bisherigen Eigentümer und entstehen beim neuen. Wird ein Objekt bandeigen,
entsteht zusätzlich das Standard-Anzeigenrecht der neuen Eigentümerband.
Dynamisch gekoppelte Overlays wechseln atomar mit dem Inhalt den Eigentümer,
erhalten aber kein direktes Band-Anzeigenrecht: Sie vermitteln Lesen
ausschließlich durch die dynamische Vererbung vom Inhalt. Zulässige Ziele sind
ein aktiver Benutzer, eine bestehende und nicht zur Löschung vorgemerkte Band
oder administrativ die Systemband `Öffentlich`.

### Eigentümerlosigkeit

Eigentümerlosigkeit entsteht ausschließlich durch Löschung des Eigentümers oder
durch eine ausdrückliche administrative Sonderaktion.

Vor einer Benutzerlöschung müssen die Anzahl eigentumsbetroffener Objekte,
die drohende Eigentümerlosigkeit, der Fortbestand anderer Benutzer-, Gruppen-
und Bandrechte sowie die danach ausschließlich administrative Änderbarkeit von
Eigentum und Berechtigungen deutlich angezeigt werden. Die Oberfläche muss die
vorherige Eigentumsübertragung anbieten und eine ausdrückliche Bestätigung der
Folgen verlangen; danach bleibt die Benutzerlöschung zulässig.

Eine Bandlöschung muss ein Plattformadministrator bestätigen. Vorher müssen
die Auswirkungen auf Eigentum und unmittelbar an die Band oder ihre zu
löschenden Gruppen vergebene Rechte sichtbar sein. Danach entfallen diese
Rechte und das Eigentum; andere Rechte bleiben bestehen und betroffene Objekte
werden eigentümerlos.

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
Plattformadministratoren dürfen vor Ablauf wiederherstellen oder sofort
endgültig löschen.

Nach Fristablauf muss das Objekt automatisch endgültig gelöscht werden. Ist die
technische Ausführung noch nicht abgeschlossen, muss der Zustand `ausstehende
endgültige Löschung` sichtbar sein. Eine technische Verzögerung darf den
fachlichen Wiederherstellungszeitraum nicht verlängern. Fehler der
Hintergrundausführung müssen sichtbar und erneut behandelbar sein; die
automatische endgültige Löschung wird auditiert.

Vor endgültiger Inhaltslöschung muss die Anzahl betroffener Overlays und
aktueller Setlistreferenzen angezeigt werden. Bei endgültiger Löschung werden
die Overlays gelöscht, die Referenzen atomar aus dem aktuellen Setliststand
entfernt und die festgelegten minimalen Setlist-Historienhinweise erzeugt.

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

Eine Berechtigungsanfrage setzt keine bestehende Berechtigung am Zielobjekt
voraus. Ein Benutzer darf mit dem globalen beziehungsweise systemseitigen
Anfragerecht für sich `Anzeigen` oder `Bearbeiten` beantragen. Für eine Band
benötigt er zusätzlich `Berechtigung für Band anfragen`. Empfänger müssen
gleichzeitig das globale Verwaltungsrecht und am Objekt `Berechtigungen
verwalten` besitzen. Fehlt ein solcher Empfänger oder ist das Objekt
eigentümerlos, geht die Anfrage an die Plattformadministration.

Fehlt Inhaltszugriff in einer Setlist, werden nur Titel, Komponist,
Eigentümer-Anzeigename oder Bandname, `Inhalt nicht verfügbar` und die
Anfrageaktion gezeigt. E-Mail-Adresse, Benutzer-ID und
Mitgliedschaftsinformationen bleiben verborgen. Bei Eigentümerlosigkeit wird
`Plattformadministration` angezeigt.

Der MVP bietet In-App-Anfragen mit den Zuständen `offen`, `genehmigt` und
`abgelehnt`, eine Arbeitsliste und einen sichtbaren Antragstellerstatus. E-Mail-
oder Push-Benachrichtigungen sind nicht erforderlich.

Offline darf eine Anfrage nur als lokaler Entwurf mit dem Status `noch nicht
gesendet` erfasst werden. Es entstehen weder serverseitige Anfrage noch
Benachrichtigung. Erst eine erfolgreiche Übermittlung nach serverseitiger
Neuprüfung von Rechten, Zielobjekt, Empfängern und gegebenenfalls
Bandvertretungsrecht wechselt den Status auf `offen`. Versandfehler bleiben
sichtbar und dürfen nicht als erfolgreiche Übermittlung erscheinen.

## Overlaymodell

### Normales Objekt statt fester Reichweitentypen

Ein Overlay ist ein normales berechtigtes Objekt und gehört genau zu einem
Inhalt. Eigentümer ist ein Benutzer oder eine Band. Es gibt keine festen
fachlichen Overlay-Typen nach Reichweite.

Ein Benutzer darf zu jedem lesbaren Inhalt beliebig viele eigene Overlays
anlegen. Ein zunächst nicht vererbendes Overlay gehört ihm, ist zunächst nur
für ihn les- und bearbeitbar und benötigt keinen Check-out, solange nur er
potenziell schreiben darf.

Besitzt er Schreibrecht am Inhalt, darf er alternativ unmittelbar ein
dynamisch gekoppeltes Overlay anlegen. Atomar wird der Inhaltseigentümer auch
Overlayeigentümer, die dynamische Leserechtevererbung aktiviert und dem
Ersteller eine zusätzliche normale Bearbeitungsberechtigung am Overlay
vergeben, sofern er nicht bereits Eigentümer ist. Ein wirksam Berechtigter darf
diese additive Berechtigung später entziehen. Der Ersteller muss den
Basisinhalt weiterhin lesen dürfen.

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
gekoppelten Overlays atomar. Wird der Inhalt bandeigen, entsteht das
Standard-Anzeigenrecht nur am Inhalt. Das gekoppelte Overlay erbt dieses Lesen
dynamisch und darf kein separates direktes Band-Anzeigenrecht erhalten.

Ein Benutzer ohne Schreibrecht am Inhalt darf ein eigenes Overlay zur
Übernahme einreichen. Vor der Einreichung bleibt es ausschließlich privat. Mit
der Einreichung entsteht atomar ein zweckgebundener temporärer Lesezugriff für
die zuständigen Prüfer: Inhaltseigentümer mit wirksamen Rechten, ausdrücklich
berechtigte Prüfer oder bei eigentümerlosen Inhalten
Plattformadministratoren. Dieser Prüfzugriff vermittelt kein reguläres
Bearbeitungsrecht und endet bei Ablehnung oder Rücknahme der Einreichung.

Bei Genehmigung wird dasselbe Overlay ohne Kopie umgewandelt: Eigentum geht an
den Inhaltseigentümer, dynamische Leserechtevererbung wird aktiviert und der
temporäre Prüfzugriff durch die endgültigen geerbten beziehungsweise
zusätzlich vergebenen Rechte ersetzt. Anders als bei der direkten gekoppelten
Anlage entfällt das bisherige persönliche Schreibrecht des Erstellers; ein
Schreibrecht muss bei Bedarf ausdrücklich neu vergeben werden. Der Benutzer
muss persönliche Inhalte vor der Einreichung entfernen. Bei Ablehnung bleibt
das Overlay unverändert privat. Ein gekoppeltes Overlay darf für persönliche
Weiterverwendung kopiert werden; die Kopie gehört dem kopierenden Benutzer und
ist zunächst nur für ihn verfügbar.

Mehrere lesbare Overlays dürfen gleichzeitig in festgelegter Reihenfolge
dargestellt werden. Overlay-Aktionen verändern den Basisinhalt nicht.

## Check-out und gemeinsame Bearbeitung

### Online-Check-out

Check-out gilt für jedes gemeinsam bearbeitbare Objekt außer Songs. Ein Objekt
ist gemeinsam bearbeitbar, sobald mehr als ein Benutzer potenziell
Schreibrecht besitzt. Ein Schreibrecht für eine Band oder Gruppe erfüllt diese
Bedingung unabhängig von ihrer Mitgliederzahl. Gemeinsam bearbeitbare Inhalte,
Overlays und Setlists benötigen einen Check-out; Einzelbenutzerobjekte nicht.

Ein Check-out gehört genau einer Bearbeitungssitzung. Eine zweite Sitzung
desselben Benutzers darf nicht unter der Reservierung der ersten speichern.
Eine bewusste Übernahme durch eine andere eigene Sitzung invalidiert die
vorherige; dort dürfen lokale Eingaben danach nur kopiert oder verworfen
werden. Ein Check-out beginnt beim Öffnen des Bearbeitungsmodus und endet durch
bewusstes Verlassen oder Abbrechen, ausdrückliches Beenden, administrative
Rücknahme, Rechteentzug, Löschvormerkung oder Lease-Ablauf.

Der Check-out eines gemeinsam bearbeitbaren Inhalts sperrt das gesamte
fachlich bearbeitbare Inhaltsobjekt: Basisinhalt beziehungsweise PDF-Datei,
Arrangeur/Interpret, Tonart, Tempo, Dauer, Niveau, Genre und Beschreibung.
Keine andere Sitzung darf einen dieser Bestandteile speichern. Check-outs
bleiben je Inhalt, Overlay und Setlist getrennt. Ein Inhalts-Check-out blockiert
kein Overlay; jedes gemeinsam bearbeitbare Overlay benötigt seinen eigenen
Check-out. Eigene, nicht vererbende Overlayobjekte bleiben eigenständig.

Speichern beendet ihn nicht, solange die Sitzung geöffnet bleibt. Die
Online-Inaktivitätsfrist ist global konfigurierbar. Nur die aktive verbundene
Bearbeitungssitzung verlängert sie. Vor Lease-Ablauf erhält diese Sitzung eine
verständliche Warnung. Nach Ablauf darf ein alter Client weder still speichern
noch still einen neuen Check-out erwerben.

Ein normaler Online-Check-out wird bei Netzwerkverlust niemals automatisch zu
einem Offline-Check-out. Nicht gespeicherte Eingaben dürfen als klar
gekennzeichneter lokaler Entwurf erhalten bleiben. Bei Wiederverbindung prüft
der Server Check-out-Kennung und Sitzung, Lease, aktuelle Rechte, Revision
beziehungsweise Serverstand und Löschzustand erneut. Veraltete oder nicht mehr
autorisierte Speicherung wird ohne automatisches Merge oder stilles
Überschreiben abgelehnt.

Schreibberechtigte Benutzer sehen Anzeigename, Beginn und erwarteten Ablauf,
aber keine E-Mail-Adresse oder zusätzlichen Profildaten. Leser sehen während
einer Bearbeitung ausschließlich den letzten erfolgreich gespeicherten
Serverstand, niemals ungespeicherte Eingaben.

Zur Rücknahme berechtigt sind Inhaber, Objekteigentümer mit erforderlichen
Rechten, ausdrücklich berechtigte Benutzer oder Gruppen und
Plattformadministratoren. Bandadministratoren dürfen fremde oder nur lesbar
freigegebene Objekte nicht aufgrund ihrer Bandfunktion entsperren.
Plattformadministratoren müssen zurücknehmen und anschließend selbst
auschecken; sie dürfen einen Check-out nicht umgehen. Nach administrativer
Rücknahme verliert die frühere Sitzung ausschließlich ihre serverseitige
Speicherberechtigung. Lokale Eingaben dürfen erhalten bleiben. Beim nächsten
Kontakt wird der Benutzer informiert und darf sie kopieren, verwerfen oder
einen neuen Check-out bewusst anfordern.

Berechtigungen ändern, Eigentum übertragen, Löschung vormerken und Check-out
administrativ zurücknehmen werden durch den fachlichen Bearbeitungs-Check-out
nicht gesperrt. Sie benötigen atomare serverseitige Rechte- und Zustandsprüfung
sowie Audit. Ein Rechteentzug darf den Check-out ungültig machen; Speichern wird
dann abgelehnt und lokale Eingaben dürfen kopiert oder verworfen werden. Eine
Eigentumsübertragung lässt ihn nur bei fortbestehenden Rechten wirksam.
Löschvormerkung beendet ihn sofort.

Wird ein Objekt während einer aktiven Bearbeitung gemeinsam bearbeitbar, bleibt
die Berechtigungsänderung zulässig. Ist genau eine aktive Online-Sitzung
eindeutig bekannt, erhält sie atomar den Check-out; neue Bearbeiter werden
blockiert. Andernfalls darf die bestehende Ansicht erst nach Neuladen und
erfolgreichem Check-out speichern. Wird das Objekt wieder allein bearbeitbar,
bleibt ein bestehender Check-out bis zum Verlassen der Bearbeitung erhalten;
erst künftige Bearbeitungen benötigen keinen Check-out. Die Sperre wird nicht
mitten in einer laufenden Bearbeitung entfernt.

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

Nach bekanntem Lease-Ablauf ist Weiterarbeit nur als klar gekennzeichneter,
nicht synchronisierter lokaler Entwurf zulässig; er besitzt keine wirksame
Serverreservierung. Bei Wiederverbindung gilt:

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

Wird ein privat vorbereitetes Objekt während der Offlinezeit serverseitig
zusätzlich zum Bearbeiten freigegeben, bleibt diese Freigabe wirksam. Die
lokale Änderung darf nicht direkt in dasselbe nun gemeinsam bearbeitbare Objekt
synchronisiert werden. Der Server prüft die neue Check-out-Pflicht, lehnt ohne
wirksamen Check-out ab und auditiert das Ergebnis. Der Benutzer lädt den
aktuellen Stand, erwirbt online einen Check-out und überträgt die Änderung
manuell oder rettet sie, soweit zulässig, als neues eigenes Objekt.

Wurde das Serverobjekt während der Offlinezeit endgültig gelöscht, wird es beim
nächsten erfolgreichen Abgleich lokal entfernt und lokale Setlistreferenzen
werden dem aktuellen Serverstand angepasst. Eine lokale Änderung darf dieselbe
technische Objektidentität nicht wiederherstellen. Sind Basisdaten noch lokal
vorhanden und die Rechte ausreichend, darf der Benutzer sie bewusst als neues
privates Objekt retten. Ablehnung und Rettungsweg werden angezeigt und
auditiert.

Neu erteilte Rechte laden Inhalte oder Overlays nicht automatisch auf ein
Gerät. Der Benutzer muss erneut synchronisieren beziehungsweise die
Offlinevorbereitung bewusst aktualisieren.

Bei Rechteentzug bleiben vorbereitete Daten nur bis zur nächsten
erfolgreichen Rechteprüfung oder bis zum Ablauf der maximalen Offlinesitzung
zugänglich. Nach Ablauf der maximalen Offlinesitzung wird der Zugriff auf lokal
vorbereitete geschützte Basisinhalte und Overlays gesperrt; eine erneute
Onlineanmeldung beziehungsweise serverseitige Rechteprüfung ist erforderlich.
Minimale Setlistinformationen nicht verfügbarer Einträge dürfen verbleiben.
Nicht synchronisierte eigene Entwürfe dürfen erhalten bleiben, müssen aber
klar von weiterhin leseberechtigten Serverinhalten getrennt dargestellt
werden. Sie werden nicht automatisch synchronisiert, und lokaler Zustand darf
abgelaufene Offlineberechtigungen nicht verlängern.

Eine Berechtigungsanfrage darf offline als lokaler Entwurf `noch nicht
gesendet` erfasst werden; ihre serverseitige Prüfung und Übermittlung erfolgt
erst online.

Für offline ausgeführte oder synchronisierte persönliche Aktionen protokolliert
der Server mindestens Benutzer, Objekt, lokale Aktionszeit, serverseitige
Synchronisationszeit, technische Gerätekennung und Ergebnis. Ablehnungen,
Revisionskonflikte, Rechteentzug, abgelaufene Sitzung oder Lease sowie nach dem
MVP administrative Rücknahmen von Offline-Check-outs werden ebenfalls
auditiert. Die Gerätekennung ist technisch erzeugt, kein frei eingegebener
vertrauenswürdiger Benutzertext, und enthält keine unnötigen Geräte- oder
Personendaten. Lokale Aktions- und serverseitige Annahmezeit bleiben
unterscheidbar; dieses Audit erzeugt keine fachliche Versionierung.

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

Eine Setlist besitzt genau einen aktuellen Stand; parallel auswählbare
Setlistversionen existieren nicht. Fachlich relevante gemeinsame Änderungen
werden vollständig historisiert, mindestens hinzugefügte oder entfernte
Einträge, geänderte Eintragsreihenfolge, gemeinsame Overlay-Auswahl und
-Reihenfolge, Setlistmetadaten, Eigentum und relevante gemeinsame
Berechtigungsänderungen. Persönliche Setlisteinstellungen gehören nicht zu
dieser gemeinsamen Historie.

Für einen unabhängigen Planungsstand darf eine Setlist bewusst kopiert werden.
Die Kopie ist eine neue Objektanlage. Standardmäßig wird der kopierende
Benutzer Eigentümer. Eine Band darf mit globalem Setlist-Anlagerecht und dem
erforderlichen bandbezogenen Vertretungs- oder Anlagerecht als Eigentümer
gewählt werden; `Öffentlich` nur durch Plattformadministratoren. Eigentum und
anfängliche Rechte entstehen atomar. Die Kopie besitzt eigene Berechtigungen
und eine neue eigene Historie. Sie referenziert dieselben Inhalte und die für
den Kopierenden berechtigten Overlays; Inhalte oder Overlays werden nicht
kopiert.

Endgültig gelöschte Inhalte werden aus dem aktuellen Stand entfernt. Innerhalb
der Setlist-Historie entsteht als besondere Minimalform ein nicht anklickbarer,
nicht wiederherstellbarer Hinweis mit Zeitpunkt, früherer Position, letztem
Songtitel, letztem Komponisten und `Inhalt endgültig gelöscht`. Er speichert
keine Datei, keinen Basisinhalt, keine vollständigen Metadaten,
Berechtigungen, früheren Benutzereigentümer oder Overlays.

## Audit, Historien und Export

Audit ist nicht editierbar. Jedes Auditereignis enthält mindestens
Ereignisart, ausführenden Akteur, serverseitigen Zeitpunkt, betroffenen
Gegenstand beziehungsweise technische Objektkennung und Ergebnis. Soweit
anwendbar darf es einen fachlichen Bezug auf Antrag, Freigabe, Zusammenführung
oder Eigentumsänderung enthalten.

Songereignisse erfassen soweit anwendbar Antragsteller, genehmigenden oder
ablehnenden Plattformadministrator, Quell- und Zielsong einer Zusammenführung,
Zahl oder technische Kennungen atomar umgehängter Inhalte und ob eine Änderung
direkt oder aus einem Antrag erfolgte. Eigentumsübertragungen erfassen
vorherige und neue Eigentümerart mit technischer Referenz. Eingriffe in
Check-outs erfassen bisherige Sitzung, handelnden Akteur, Grund und Ergebnis.
Die oben festgelegten Offlinefelder ergänzen diesen Mindestdatensatz.

Plattformadministratoren erhalten eine durchsuchbare Auditansicht. Eigentümer
sehen die fachliche Änderungshistorie ihrer Objekte im Rahmen ihrer
Berechtigung. Normale Benutzer sehen keine globalen Security-Ereignisse.
Auditexport gehört nicht zum MVP.

Aufbewahrung:

- administrative, Eigentums-, Berechtigungs-, Lösch-, Wiederherstellungs- und
  Check-out-Ereignisse: 365 Tage,
- abgelehnte Zugriffe, Anmeldung und technische Security-Ereignisse: 90 Tage,
- fachliche Historie vorhandener Objekte: solange das Objekt besteht,
- minimale Auditnachweise nach endgültiger Objektlöschung: 90 Tage.

Audit enthält keine Secrets, vollständigen Basisinhalte oder Dateien,
unnötigen Inhaltsdaten beziehungsweise personenbezogenen Daten und keine
auswählbaren alten Song- oder Inhaltsversionen.

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
7. gekoppeltes Overlay mit abweichendem Eigentümer oder direktem zusätzlichem
   Leserecht.
8. Aktion auf einem bestehenden Objekt ohne beide Autorisierungsebenen oder
   Anlage, die unzutreffend eine noch nicht existente Objektberechtigung
   voraussetzt.
9. globales Aktionsrecht auf einer Band oder bandbezogenen Gruppe.
10. negatives Recht oder impliziten Querzugriff zwischen Bandbereichen.
11. reguläres Eigentum der Plattform oder einer normalen Gruppe.
12. automatische Eigentümerrechte für Mitglieder einer Eigentümerband.
13. Löschung eines referenzierten Songs.
14. Vermischung von Eigentümerlosigkeit und Löschvormerkung.
15. Bearbeitung, Freigabe oder neue Referenz während Löschvormerkung oder
   stillschweigende Verlängerung der Wiederherstellungsfrist.
16. anonymen Zugriff oder ungeprüfte Freigabe über `Öffentlich`.
17. Offenlegung unsichtbarer Song- oder Inhaltsbeziehungen durch Suche oder
   Dublettenprüfung.
18. Bearbeitung eines gemeinsam bearbeitbaren Objekts ohne
   sitzungsgebundenen Check-out.
19. Umgehung eines Check-outs durch Administration oder eine zweite Sitzung,
   stilles Speichern beziehungsweise Wiedererwerben nach Lease-Ablauf oder
   automatische Umwandlung in einen Offline-Check-out.
20. Wiederbelebung einer endgültig gelöschten technischen Objektidentität.
21. stilles Überschreiben oder automatisches Merge eines Offlinekonflikts;
   ausgenommen ist ausschließlich das ausdrücklich auditierte
   Last-write-wins-Verhalten für Songs im MVP.
22. Fortgeltung abgelaufener Offlineberechtigungen durch lokalen Zustand.
23. auswählbaren Setlist-Snapshot oder Wiederherstellung gelöschter Inhalte aus
   Historie.

Die Regeln sind technologieoffen zu verifizieren. Ihre technische Abbildung
benötigt eine gesonderte Entscheidung, sobald die Kriterien des
[ADR-Verfahrens](../ADR.md) erfüllt sind.
