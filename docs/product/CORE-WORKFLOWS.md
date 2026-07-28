# Kernabläufe

## Bezug und Leseregel

Jeder Ablauf besitzt eine stabile `WF-xxx`-Kennung. Bestehende Kennungen
behalten soweit möglich ihren fachlichen Gegenstand. Die Abläufe beschreiben
Produktverhalten und keine technische Umsetzung.

Begriffe folgen dem [Glossar](GLOSSARY.md), Berechtigungen
[Benutzer, Gruppen und Berechtigungen](USERS-AND-ROLES.md) und das Gesamtmodell
dem
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## WF-001: Benutzer einladen oder Zugriff erteilen

- **Ausgangszustand:** Eine Band besteht; der vorgesehene Benutzer ist noch
  kein aktives Mitglied.
- **Berechtigungen:** Einladender mit dem globalen Aktionsrecht und dem
  delegierbaren bandbezogenen Verwaltungsrecht.
- **Ablauf:** Der Einladende startet die Einladung. Nach Bestätigung wird die
  Mitgliedschaft aktiv und der Benutzer darf bandbezogenen Gruppen zugeordnet
  werden.
- **Ergebnis:** Nur ausdrücklich zugewiesene positive Rechte werden wirksam.
  Mitgliedschaft allein vermittelt keinen Objektzugriff.
- **Fehler:** Ungültige oder abgelaufene Einladungen und fremde
  Bandbereichszuordnungen werden ohne Offenlegung anderer Mitgliedschaften
  abgelehnt.

## WF-002: Band, Gruppen und Mitgliedschaften verwalten

- **Ausgangszustand:** Die handelnde Person besitzt die erforderlichen Rechte
  in der eigenen Band.
- **Berechtigungen:** Berechtigtes Bandmitglied oder Plattformadministrator.
- **Ablauf:** Mitglieder werden eingeladen, deaktiviert oder entfernt;
  bandbezogene Gruppen und Zuordnungen werden verwaltet und nur delegierbare
  Rechte vergeben. Plattformadministratoren dürfen Bands anlegen, umbenennen
  und eine Bandlöschung endgültig bestätigen.
- **Ergebnis:** Änderungen wirken nur im bezeichneten Bandbereich. Globale
  Gruppen und Rechte bleiben der Plattformadministration vorbehalten.
- **Fehler:** Gruppenverschachtelung, fremde Mitglieder, globale Vergabe durch
  Bandverwaltung und dauerhafte Aussperrung des letzten aktiven
  Plattformadministrators werden abgelehnt.
- **Löschung:** Nach administrativer Bestätigung werden Bandobjekte
  eigentümerlos; direkte Rechte der Band und ihrer gelöschten Gruppen entfallen,
  andere Rechte bleiben bestehen.

## WF-003: Song anlegen, prüfen oder bereinigen

- **Ausgangszustand:** Ein Benutzer legt einen Inhalt an oder ein
  Plattformadministrator verwaltet Songs.
- **Berechtigungen:** Normale Benutzer dürfen einen Song nur atomar mit Inhalt
  anlegen; Plattformadministratoren dürfen Songs ohne Inhalt anlegen, prüfen,
  ändern, zusammenführen, Inhalte umhängen und referenzfreie Songs löschen.
- **Ablauf:** Der Benutzer wählt einen sichtbaren Song oder gibt Titel,
  Komponist und Gemeinfreiheitsstatus ein. Titel und Komponist werden für die
  automatische Zuordnung hinsichtlich Groß-/Kleinschreibung, Unicode sowie
  äußeren und mehrfachen Leerzeichen normalisiert.
- **Ergebnis:** Nur bei Übereinstimmung beider Felder wird automatisch
  zugeordnet; sonst entsteht atomar ein ungeprüfter Song. Ähnliche Werte sind
  nur Prüfhinweise.
- **Fehler und Datenschutz:** Gleicher Titel allein genügt nicht. Satzzeichen,
  Namensreihenfolge und sonstige Schreibweise bleiben relevant. Die Prüfung
  zeigt keine fremden Inhalte, Eigentümer, Objektberechtigungen oder
  Mitgliedschaften. Ein referenzierter Song darf nicht gelöscht werden.
- **Änderung:** Normale Benutzer benötigen `Songänderung beantragen`.
  Plattformadministratoren genehmigen oder lehnen ab. Alle Ereignisse werden
  auditiert; Songs haben im MVP keinen Check-out und der letzte gespeicherte
  Stand gilt.

## WF-004: PDF-Inhalt anlegen und anzeigen

- **Ausgangszustand:** Der Benutzer besitzt das globale Anlagerecht und darf
  Eigentümer des neuen Inhalts werden.
- **Ablauf:** Er wählt ein PDF, ordnet einen sichtbaren Song zu oder erfasst die
  Songfelder und bestätigt `Arrangeur/Interpret`. Sein Anzeigename ist nur ein
  Vorschlag. Optionale Metadaten werden validiert und Genres normalisiert.
- **Ergebnis:** Inhalt und gegebenenfalls Song entstehen atomar. Der Inhalt
  gehört dem Benutzer, besitzt genau einen Song und Basisinhalt und bleibt ohne
  Freigaben. Die PDF-Anzeige bietet Navigation und Zoom.
- **Offlineanlage:** Basisinhalt und Metadaten bleiben lokal; Songzuordnung und
  Pflichtfelder werden erst bei Serversynchronisation verbindlich geprüft.
  Fehler erhalten den lokalen Entwurf.
- **Fehler:** Unsicheres PDF, fehlende Pflichtfelder, unzulässige Metadaten oder
  fehlende Rechte erzeugen keinen erfolgreichen Teilimport.

## WF-005: PDF über Overlays annotieren

- **Ausgangszustand:** Der Benutzer kann einen PDF-Inhalt lesen.
- **Ablauf:** Er legt beliebig viele eigene, zunächst nicht vererbende Overlays
  an. Mit Schreibrecht am Inhalt darf er alternativ ein dynamisch gekoppeltes
  Overlay anlegen. Er nutzt Freihandstift, Radierer, Textnotiz, Textmarker,
  Auswahl, Verschieben oder Löschen; Strichstärke und begrenzte Farben sind
  konfigurierbar.
- **Ergebnis:** Mehrere berechtigte Overlays können gleichzeitig sichtbar sein.
  Der Basisinhalt bleibt unverändert.
- **Check-out:** Ein Overlay benötigt einen Check-out, sobald mehr als ein
  Benutzer potenziell schreiben darf. Ein Einzelbenutzer-Overlay benötigt
  keinen.
- **Fehler:** Fehlende Rechte, nicht lesbarer Basisinhalt oder bestehender
  Check-out verhindern Speichern ohne Änderung anderer Overlays.

## WF-006: Text- oder Chord-Inhalt anlegen oder importieren

- **Liefergrenze:** Dieser vollständige Ablauf folgt nach dem MVP; es gibt
  keinen reduzierten Texteditor im MVP.
- **Ablauf:** Der Benutzer legt Text-/Chord-Inhalt manuell oder per
  Copy-and-paste an, ordnet ihn genau einem Song zu und bestätigt Metadaten.
- **Ergebnis:** Ein aktueller Basisinhalt ohne auswählbare Version entsteht.
- **Fehler:** Unklare Struktur, fehlende Pflichtfelder und Konflikte bleiben
  sichtbar; automatisiertes Scraping ist unzulässig.

## WF-007: Chords anpassen oder transponieren

- **Liefergrenze:** Chorderkennung, Korrektur, Transposition und Vereinfachung
  folgen vollständig nach dem MVP.
- **Ablauf:** Ein berechtigter Benutzer ändert erkannte Chords kontrolliert in
  einem Overlay.
- **Ergebnis:** Basisinhalt und Anpassung bleiben getrennt. Mehrdeutige Chords
  werden nicht still verändert.

## WF-008: Autoscroll verwenden

- **Liefergrenze:** Autoscroll für Text-/Chord-Inhalte folgt nach dem MVP.
- **Ablauf:** Der leseberechtigte Benutzer startet, pausiert, ändert die
  Geschwindigkeit oder beendet Autoscroll.
- **Ergebnis:** Die Darstellung bleibt kontrollierbar und verändert weder
  Inhalt noch Overlay; sie funktioniert auch für vorbereitete Offlineinhalte.

## WF-009: Setlist anlegen und pflegen

- **Ausgangszustand:** Der Benutzer besitzt globale und objektbezogene Rechte;
  bei Bandeigentum zusätzlich das bandbezogene Anlagerecht.
- **Ablauf:** Eine benutzereigene Setlist startet nur für den Ersteller les- und
  bearbeitbar. Die Eigentumsrechte einer bandeigenen Setlist schlagen nicht
  auf Mitglieder durch; diese erhalten über den Bandprinzipal standardmäßig
  Anzeigen. Der Bearbeiter fügt jeden selbst lesbaren Inhalt ein und verwaltet
  Reihenfolge, gemeinsame Overlay-Auswahl und Overlay-Reihenfolge.
- **Ergebnis:** Setlistreferenzen zeigen aktuellen Basisinhalt, aktuelle
  Songmetadaten und aktuell berechtigte Overlays. Es entstehen keine Snapshots.
- **Persönlich:** Benutzer dürfen Overlays persönlich ein- oder ausblenden,
  deren Reihenfolge überschreiben und Einträge persönlich ausblenden. Dies
  benötigt keinen Setlist-Check-out.
- **Unvollständig:** Fehlende Inhalte oder Overlays werden gezählt und
  markiert, blockieren Probe, Auftritt oder Offlinevorbereitung aber nicht.

## WF-010: Inhalte für Offlineverwendung vorbereiten

- **Ausgangszustand:** Der Benutzer ist online, berechtigt und wählt Inhalte
  oder eine Setlist bewusst aus.
- **Ablauf:** Umfang, Leserechte, Löschstatus und verfügbare Overlays werden
  geprüft. Vollständige, unvollständige und fehlgeschlagene Vorbereitung wird
  angezeigt.
- **MVP:** Offlineanzeige und private Offlinebearbeitung werden vorbereitet.
- **Nach dem MVP:** Gemeinsame Bearbeitung erfordert zuvor `WF-021`.
- **Fehler:** Fehlender Speicher, Verbindungsabbruch oder Rechteänderung darf
  keinen vollständigen Status vortäuschen.

## WF-011: Setlist und Inhalte ohne Netzwerk verwenden

- **Ausgangszustand:** Die Daten wurden vorbereitet und die maximale
  Offlinesitzung ist nicht abgelaufen.
- **Ablauf:** Der Benutzer liest Setlist, Basisinhalte und berechtigte Overlays
  und bearbeitet im MVP nur eigene Einzelbenutzerobjekte und persönliche
  Setlisteinstellungen.
- **Ergebnis:** Offlinezustand, Einschränkungen und nicht verfügbare Elemente
  sind sichtbar.
- **Rechteentzug:** Vorbereitete Daten bleiben bis zur nächsten erfolgreichen
  Rechteprüfung lesbar. Danach werden Basisinhalt und Overlays entfernt; eine
  minimale Setlistanzeige darf verbleiben.

## WF-012: Private Offlineänderungen synchronisieren

- **Ausgangszustand:** Eigene Inhalte, Overlays, Setlists, persönliche
  Einstellungen oder offline neu angelegte Inhalte wurden geändert.
- **Ablauf:** Identität, Rechte, Pflichtfelder, Songzuordnung und technische
  Revisionskennung werden serverseitig geprüft.
- **Ergebnis:** Unveränderte Ausgangsrevision wird atomar gespeichert.
  Offlineanlage wird einem sichtbaren Song zugeordnet oder erzeugt einen neuen
  ungeprüften Song; nur dieses Ergebnis wird dem Benutzer mitgeteilt.
- **Fehler:** Ein veralteter Stand wird abgelehnt. Der Entwurf bleibt erhalten
  und darf verworfen, separat gesichert oder manuell übertragen werden.

## WF-013: Synchronisationskonflikt behandeln

- **Ausgangszustand:** Revision, Rechte, Löschstatus oder Check-out verhindern
  die Synchronisation.
- **Ablauf:** Das Produkt zeigt Objekt, Fehlerklasse und zulässige nächste
  Aktionen ohne fremde Daten oder interne Details.
- **Ergebnis:** Der Benutzer verwirft den lokalen Stand, sichert ihn soweit
  zulässig als eigenes Objekt oder überträgt ihn manuell.
- **Grenze:** Es gibt kein automatisches Zusammenführen, kein stilles
  Überschreiben und kein Last-write-wins für private Offlineobjekte.

## WF-014: Berechtigungen ändern oder entziehen

- **Ausgangszustand:** Die handelnde Person besitzt globales Verwaltungsrecht
  und `Berechtigungen verwalten` am Objekt oder handelt als
  Plattformadministrator.
- **Ablauf:** Positive Benutzer- oder Gruppenrechte werden hinzugefügt oder
  entfernt. Negative Rechte werden nicht erzeugt.
- **Ergebnis:** Additive Berechtigungen werden sofort neu ausgewertet.
- **Check-out:** Fehlt danach ein erforderliches Recht, wird Speichern
  abgelehnt und der Check-out beendet. Lokale Eingaben dürfen kopiert oder
  verworfen werden.
- **Bandgrenze:** Eine Bandverwaltung darf keine globalen Rechte oder fremden
  Objekte verwalten.

## WF-015: Lokale Daten bei Abmeldung oder Rechteentzug behandeln

- **Ausgangszustand:** Das Gerät enthält vorbereitete Daten oder nicht
  synchronisierte Entwürfe.
- **Abmeldung:** Das Produkt warnt vor Löschung offener Entwürfe und erlaubt
  vorherige Synchronisation. Danach werden Inhalte und Sitzungsschlüssel
  kontrolliert entfernt.
- **Rechteentzug:** Bei der nächsten erfolgreichen Prüfung werden Basisinhalt
  und Overlays entfernt; minimale Setlistinformationen dürfen verbleiben.
- **Security:** Lokale Daten müssen verschlüsselt gespeichert werden. Das
  Verfahren bleibt Architekturentscheidung.

## WF-016: Inhalt bearbeiten, freigeben oder breit lesbar machen

- **Ausgangszustand:** Der Benutzer besitzt globales Aktionsrecht und passende
  Objektberechtigung.
- **Ablauf:** Er ersetzt Basisinhalt, ändert Inhaltsmetadaten, verwaltet
  ausdrückliche Benutzer-, Gruppen- oder Bandrechte oder beantragt die Freigabe
  an `Öffentlich`.
- **Ergebnis:** Neue Inhalte bleiben zunächst ohne Freigaben. Ausdrückliche
  Freigaben über Bandgrenzen verändern Eigentum nicht.
- **Systemband:** Nur ein Plattformadministrator genehmigt, lehnt ab, setzt
  oder entfernt `Anzeigen` für `Öffentlich`; alles wird auditiert. Es entsteht
  kein anonymer Zugriff.
- **Check-out:** Basisinhaltsbearbeitung benötigt bei mehreren potenziellen
  Bearbeitern `WF-018`. Berechtigungsverwaltung und Eigentumsübertragung
  umgehen oder beenden einen Check-out nicht automatisch.

## WF-017: Eigentum übertragen, Eigentümer löschen oder Objekt löschen

- **Eigentumsübertragung:** Ein berechtigter Benutzer wählt aktiven Benutzer
  oder bestehende, nicht vorgemerkte Band. Annahme ist nicht erforderlich;
  Anzeige- und Bearbeitungsrechte bleiben. `Öffentlich` ist nur administrativ
  zulässig.
- **Eigentümerlöschung:** Benutzerobjekte werden eigentümerlos. Bei
  administrativ bestätigter Bandlöschung entfallen direkte Band- und gelöschte
  Gruppenrechte; andere Rechte bleiben.
- **Löschvormerkung:** Lesen bleibt erlaubt, Bearbeitung, neue Freigabe und neue
  Setlistreferenz werden gesperrt; ein Check-out endet sofort.
- **Wiederherstellung:** Nur Plattformadministratoren dürfen innerhalb der
  global konfigurierbaren Frist wiederherstellen.
- **Endgültige Inhaltslöschung:** Vor Bestätigung werden Overlay- und
  Referenzanzahl angezeigt. Overlays werden gelöscht und aktuelle
  Setlistreferenzen atomar entfernt. Die Setlist-Historie erhält nur den
  minimalen, nicht anklickbaren Löschhinweis.

## WF-018: Gemeinsam bearbeitbares Objekt online auschecken

- **Ausgangszustand:** Mehr als ein Benutzer besitzt potenziell Schreibrecht;
  bei Gruppen- oder Bandschreibrecht gilt dies unabhängig von Mitgliederzahl.
- **Ablauf:** Beim Öffnen des Bearbeitungsmodus wird für die Sitzung ein
  Check-out vergeben. Nur die aktive verbundene Sitzung verlängert die global
  konfigurierte Lease. Speichern beendet sie nicht.
- **Anzeige:** Schreibberechtigte sehen Anzeigename, Beginn und erwarteten
  Ablauf, keine E-Mail-Adresse oder weiteren Profildaten.
- **Ende:** Bewusstes Verlassen, Abbrechen, ausdrückliches Ende,
  administrative Rücknahme, Rechteentzug, Löschvormerkung oder Lease-Ablauf.
- **Rücknahme:** Inhaber, Eigentümer mit Rechten, ausdrücklich Berechtigte und
  Plattformadministratoren dürfen zurücknehmen. Bandverwaltung allein genügt
  nicht. Plattformadministratoren dürfen nicht umgehen, sondern müssen danach
  selbst auschecken.
- **Eigentumsübertragung:** Sie bleibt zulässig. Der Check-out bleibt nur bei
  fortbestehenden Rechten wirksam.

## WF-019: Eigenes Overlay zur Übernahme einreichen

- **Ausgangszustand:** Ein Benutzer besitzt ein eigenes Overlay zu einem
  lesbaren Inhalt, aber kein Schreibrecht am Inhalt.
- **Ablauf:** Er entfernt persönliche Inhalte und reicht dasselbe Overlay ein.
  Inhaltseigentümer mit Rechten, ausdrücklich Berechtigte oder bei
  Eigentümerlosigkeit Plattformadministratoren prüfen es.
- **Genehmigung:** Keine Kopie entsteht. Eigentum wechselt zum
  Inhaltseigentümer, dynamische Leserechtevererbung wird aktiv und das
  persönliche Schreibrecht des Erstellers entfällt. Es muss bei Bedarf neu
  vergeben werden.
- **Ablehnung:** Das Overlay bleibt unverändert beim Benutzer.
- **Kopie:** Ein gekoppeltes Overlay darf als neues, zunächst nur für den
  kopierenden Benutzer verfügbares Overlay kopiert werden.

## WF-020: Inhaltsberechtigung anfragen

- **Ausgangszustand:** Ein Benutzer kann ein Objekt oder einen Setlistinhalt
  nicht lesen oder bearbeiten.
- **Ablauf:** Er beantragt Anzeigen oder Bearbeiten für sich oder mit
  `Berechtigung für Band anfragen` für eine Band.
- **Empfänger:** Benutzer mit globalem Verwaltungsrecht und
  `Berechtigungen verwalten` am Objekt. Fehlen solche Empfänger oder ist das
  Objekt eigentümerlos, ist die Plattformadministration zuständig.
- **MVP-Ergebnis:** In-App-Arbeitsliste sowie Status `offen`, `genehmigt` oder
  `abgelehnt`; keine E-Mail- oder Push-Pflicht.
- **Datensparsamkeit:** Bei fehlendem Setlistinhalt erscheinen nur Titel,
  Komponist, Eigentümer-Anzeigename oder Bandname, `Inhalt nicht verfügbar` und
  Anfrageaktion. Bei Eigentümerlosigkeit erscheint
  `Plattformadministration`.

## WF-021: Gemeinsames Objekt für Offlinebearbeitung auschecken

- **Liefergrenze:** Verbindliches Zielmodell nach dem MVP.
- **Ablauf online:** Benutzer wählt `Für Offline-Bearbeitung auschecken`.
  Rechte, Löschstatus und konkurrierender Check-out werden geprüft; Objekt und
  technische Revisionskennung werden lokal vorbereitet und eine feste
  Offline-Lease vergeben.
- **Offline:** Die Lease kann nicht verlängert werden, darf die maximale
  Offlinesitzung nicht überschreiten, blockiert andere Bearbeiter und erlaubt
  weiter Lesen. Nach bekanntem Ablauf bleibt nur ein nicht synchronisierter
  Entwurf.
- **Synchronisation:** Wirksame Lease plus unveränderte Revision speichert
  atomar. Bei abgelaufener Lease und unverändertem freien Objekt wird ein neuer
  Check-out angeboten. Bei Änderung oder anderer Sperre wird abgelehnt.
- **Ergebnis:** Nach Erfolg endet der Offline-Check-out oder wird in einen
  Online-Check-out derselben Sitzung überführt. Administrative Rücknahme wird
  bei Wiederverbindung wirksam und auditiert.

## Abdeckungsregel

Die nummerierten funktionalen, qualitativen und Sicherheitsanforderungen gelten
auch dann, wenn ein Ablauf sie nicht wiederholt. Neue eigenständige Abläufe
erhalten die nächste freie `WF-xxx`-Kennung.
