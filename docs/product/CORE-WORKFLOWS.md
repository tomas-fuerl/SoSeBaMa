# Kernabläufe

## Bezug und Leseregel

Jeder Ablauf besitzt eine stabile `WF-xxx`-Kennung. Bestehende Kennungen
behalten soweit möglich ihren fachlichen Gegenstand. Die Abläufe beschreiben
Produktverhalten und keine technische Umsetzung.

Begriffe folgen dem [Glossar](GLOSSARY.md), Berechtigungen
[Benutzer, Gruppen und Berechtigungen](USERS-AND-ROLES.md) und das Gesamtmodell
dem
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## WF-001: Aktiven Benutzer zu einer Band einladen oder Bandzugriff erteilen

- **Ausgangszustand:** Eine Band besteht. Das globale Benutzerkonto der
  bezeichneten Person existiert bereits und ist aktiv; ausschließlich ihre
  Mitgliedschaft in dieser Band ist noch nicht aktiv.
- **Berechtigungen:** Erforderlich ist ausschließlich die ausdrücklich
  dokumentierte bandbezogene Verwaltungsbefugnis innerhalb der eigenen Band.
  Das globale Aktionsrecht `Nutzer einladen` (`user.invite`) ist für diesen
  Ablauf nicht erforderlich.
- **Ablauf:** Der Bandberechtigte lädt ausschließlich die bezeichnete
  Bandmitgliedschaft ein beziehungsweise aktiviert sie. Der Ablauf erzeugt und
  aktiviert kein globales Benutzerkonto. Nach Aktivierung darf der Benutzer
  bandbezogenen Gruppen dieser Band zugeordnet werden.
- **Ergebnis:** Nur die bezeichnete Bandmitgliedschaft ändert sich. Das globale
  Konto und andere Bandmitgliedschaften bleiben unverändert. Bandmitgliedschaft
  allein vermittelt kein Objektrecht; Zugriff entsteht durch eine dem
  Bandprinzipal ausdrücklich oder standardmäßig zugewiesene
  Objektberechtigung.
- **Abgrenzung:** `WF-022` bleibt der getrennte Ablauf für die globale
  Kontoeinladung und systemgesteuerte Kontoaktivierung.
- **Fehler:** Ungültige oder abgelaufene Bandmitgliedschaftseinladungen und
  fremde Bandbereichszuordnungen werden ohne Offenlegung anderer
  Mitgliedschaften abgelehnt.

## WF-002: Band, Gruppen und Mitgliedschaften verwalten

- **Ausgangszustand:** Die handelnde Person besitzt die erforderlichen Rechte
  in der eigenen Band.
- **Berechtigungen:** Berechtigtes Bandmitglied oder Plattformadministrator.
- **Ablauf:** Bandmitgliedschaften werden eingeladen, aktiviert, deaktiviert
  oder entfernt; bandbezogene Gruppen und Zuordnungen werden verwaltet und nur
  delegierbare Rechte vergeben. Plattformadministratoren dürfen zusätzlich
  globale Benutzerkonten aktivieren, deaktivieren oder löschen sowie Bands
  anlegen, umbenennen und eine Bandlöschung endgültig bestätigen.
- **Ergebnis:** Änderungen wirken nur im bezeichneten Bandbereich. Bands und
  bandbezogene Gruppen tragen ausschließlich bandbezogene Rechte und
  Objektberechtigungen. Globale Gruppen, ihre global
  rechtevermittelnden Mitgliedschaften und globale Rechte bleiben der
  Plattformadministration vorbehalten.
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
  zugeordnet; sonst entsteht atomar ein ungeprüfter Song. Ein abweichender
  Gemeinfreiheitsstatus ändert die Zuordnung und den vorhandenen Songstatus
  nicht, sondern erzeugt einen administrativen Prüfhinweis. Ähnliche Werte sind
  nur Prüfhinweise.
- **Sichtbarkeit und Datenschutz:** Normale Benutzer sehen im Katalog, in der
  Suche und bei der Anlage nur Songs, zu denen sie mindestens einen Inhalt
  lesen dürfen; Plattformadministratoren sehen alle. Die serverseitige Prüfung
  darf unsichtbare Songs berücksichtigen, zeigt aber keine fremden Inhalte,
  Eigentümer, Bands, Objektberechtigungen, Mitgliedschaften oder Beziehungen.
  Gleicher Titel allein genügt nicht; Satzzeichen, Namensreihenfolge und
  sonstige Schreibweise bleiben relevant. Ein referenzierter Song darf nicht
  gelöscht werden.
- **Administrative Arbeitsliste:** Plattformadministratoren sehen im MVP
  gemeinsam mindestens ungeprüfte Songs, offene Songänderungsanträge, mögliche
  Dubletten und abweichende Gemeinfreiheitsangaben bei exakter Zuordnung. Daraus
  dürfen sie Songmetadaten korrigieren, den Prüfstatus setzen, Anträge
  entscheiden, Dubletten atomar zusammenführen, Inhalte atomar umhängen und
  referenzfreie Songs löschen. Private Basisinhalte müssen dafür weder geöffnet
  noch angezeigt werden.
- **Änderung:** Normale Benutzer benötigen das globale Sonderrecht
  `Songänderung beantragen` und Sichtbarkeit des Songs, aber keine
  Objektbearbeitungsberechtigung. Plattformadministratoren genehmigen oder
  lehnen ab. Alle Arbeitslistenentscheidungen und Songereignisse werden mit dem
  Audit-Mindestdatensatz protokolliert; Songs haben im MVP keinen Check-out und
  der letzte gespeicherte Stand gilt.

## WF-004: PDF-Inhalt anlegen und anzeigen

- **Ausgangszustand:** Der Benutzer besitzt das globale Anlagerecht und darf
  Eigentümer des neuen Inhalts werden. Für Bandeigentum benötigt er zusätzlich
  das bandbezogene Vertretungs- oder Anlagerecht; eine Objektberechtigung kann
  vor der Anlage noch nicht existieren.
- **Ablauf:** Er wählt ein PDF, ordnet einen sichtbaren Song zu oder erfasst die
  Songfelder und bestätigt `Arrangeur/Interpret`. Sein Anzeigename ist nur ein
  Vorschlag. Optionale Metadaten werden validiert und Genres normalisiert.
- **Ergebnis:** Inhalt, Eigentum, anfängliche Objektberechtigungen und
  gegebenenfalls Song entstehen atomar. Ein benutzereigener Inhalt bleibt ohne
  Freigaben. Bei Bandeigentum erhält der Bandprinzipal standardmäßig
  `Anzeigen`. Der Inhalt besitzt genau einen Song und Basisinhalt; die
  PDF-Anzeige bietet Navigation und Zoom.
- **Offlineanlage:** Basisinhalt und Metadaten bleiben lokal; Songzuordnung und
  Pflichtfelder werden erst bei Serversynchronisation verbindlich geprüft.
  Fehler erhalten den lokalen Entwurf.
- **Fehler:** Unsicheres PDF, fehlende Pflichtfelder, unzulässige Metadaten oder
  fehlende Rechte erzeugen keinen erfolgreichen Teilimport.

## WF-005: PDF über Overlays annotieren

- **Ausgangszustand:** Der Benutzer kann einen PDF-Inhalt lesen.
- **Ablauf:** Er legt beliebig viele eigene, zunächst nicht vererbende Overlays
  an. Mit Schreibrecht am Inhalt darf er alternativ ein dynamisch gekoppeltes
  Overlay anlegen. Dabei werden atomar der Inhaltseigentümer Eigentümer, die
  dynamische Leserechtevererbung aktiviert und dem Ersteller ein später
  entziehbares Bearbeitungsrecht gegeben, sofern er nicht bereits Eigentümer
  ist. Er nutzt Freihandstift, Radierer, Textnotiz, Textmarker,
  Auswahl, Verschieben oder Löschen; Strichstärke und begrenzte Farben sind
  konfigurierbar. Geometrische Formen, Bild- oder Stempelelemente und Ebenen-
  beziehungsweise Layergruppen gehören nicht zum MVP und sind nicht als
  Post-MVP-Funktionen eingeplant.
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

## WF-009: Setlist anlegen, pflegen oder kopieren

- **Ausgangszustand:** Für die Anlage besitzt der Benutzer das globale
  Anlagerecht; eine Objektberechtigung existiert noch nicht. Bei Bandeigentum
  benötigt er zusätzlich das bandbezogene Vertretungs- oder Anlagerecht.
- **Ablauf:** Eine benutzereigene Setlist startet nur für den Ersteller les- und
  bearbeitbar. Die Eigentumsrechte einer bandeigenen Setlist schlagen nicht
  auf Mitglieder durch; diese erhalten über den Bandprinzipal standardmäßig
  Anzeigen. Der Bearbeiter fügt jeden selbst lesbaren Inhalt ein und verwaltet
  Reihenfolge, gemeinsame Overlay-Auswahl und Overlay-Reihenfolge.
- **Ergebnis:** Eigentum und anfängliche Objektberechtigungen entstehen atomar.
  Setlistreferenzen zeigen aktuellen Basisinhalt, aktuelle Songmetadaten und
  aktuell berechtigte Overlays. Es gibt genau einen aktuellen Stand und keine
  auswählbaren Versionen oder Snapshots.
- **Historie:** Hinzufügen und Entfernen von Einträgen, Eintragsreihenfolge,
  gemeinsame Overlay-Auswahl und -Reihenfolge, Metadaten, Eigentum sowie
  relevante gemeinsame Berechtigungsänderungen werden vollständig
  historisiert. Persönliche Einstellungen gehören nicht dazu.
- **Kopie:** Die Kopie ist eine normale neue Objektanlage. Standardmäßig wird
  der Kopierende Eigentümer. Eine Band darf nur mit globalem Setlist-Anlagerecht
  und passendem bandbezogenem Vertretungs- oder Anlagerecht Eigentümer werden;
  `Öffentlich` nur administrativ. Eigentum und anfängliche Rechte entstehen
  atomar. Das neue Objekt besitzt eigene Berechtigungen und Historie,
  referenziert dieselben für den Kopierenden lesbaren Inhalte und berechtigten
  Overlays, kopiert sie aber nicht.
- **Persönlich:** Benutzer dürfen Overlays persönlich ein- oder ausblenden,
  deren Reihenfolge überschreiben und Einträge persönlich ausblenden. Dies
  benötigt keinen Setlist-Check-out.
- **Unvollständig:** Fehlende Inhalte oder Overlays werden gezählt und
  markiert, blockieren Probe, Auftritt oder Offlinevorbereitung aber nicht. Die
  minimale Setlistanzeige macht einen nicht lesbaren Song weder im allgemeinen
  Katalog noch in der Suche sichtbar.

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

- **Ausgangszustand:** Die Daten wurden vorbereitet. Geschützte Serverinhalte
  sind nur zugänglich, solange die maximale Offlinesitzung nicht abgelaufen
  ist.
- **Ablauf:** Der Benutzer liest Setlist, Basisinhalte und berechtigte Overlays
  und bearbeitet im MVP nur eigene Einzelbenutzerobjekte und persönliche
  Setlisteinstellungen. Für eine Offline-Songauswahl erscheinen ausschließlich
  bereits lokal bekannte, für ihn sichtbare Songs. Unsichtbare Songs dürfen
  weder Katalog noch Vorschlag sein; freie Angaben bleiben lokal unaufgelöst.
- **Ergebnis:** Offlinezustand, Einschränkungen und nicht verfügbare Elemente
  sind sichtbar.
- **Ablaufwirkung:** Bei Rechteentzug oder Ablauf der maximalen Offlinesitzung
  wird der Zugriff auf geschützte Basisinhalte und Overlays gesperrt, bis eine
  Onlineanmeldung beziehungsweise serverseitige Rechteprüfung erfolgreich ist.
  Minimale Setlistinformationen dürfen verbleiben. Eigene nicht synchronisierte
  Entwürfe dürfen klar getrennt erhalten bleiben, werden aber nicht automatisch
  synchronisiert und verlängern keine Offlineberechtigung.

## WF-012: Private Offlineänderungen synchronisieren

- **Ausgangszustand:** Eigene Inhalte, Overlays, Setlists, persönliche
  Einstellungen oder offline neu angelegte Inhalte wurden geändert.
- **Ablauf:** Identität, Rechte, Pflichtfelder, Songzuordnung und technische
  Revisionskennung werden serverseitig geprüft. Der Server auditiert Benutzer,
  Objekt, lokale Aktionszeit, serverseitige Synchronisationszeit, technische
  datensparsame Gerätekennung und Ergebnis.
- **Ergebnis:** Eine unveränderte Ausgangsrevision wird atomar gespeichert. Bei
  einer Offlineanlage bleiben freie Songangaben bis zu dieser Serverprüfung
  unaufgelöst. Der Server prüft die normalisierte Übereinstimmung gegen alle
  Songs, einschließlich für den Benutzer unsichtbarer Songs. Exakter
  Treffer von Titel und Komponist ordnet den bestehenden Song zu; ohne Treffer
  entsteht ein neuer ungeprüfter Song. Der Benutzer erfährt nur Zuordnung oder
  Neuanlage, niemals fremde Beziehungen.
- **Übergang zu gemeinsamer Bearbeitung:** Wurde das private Serverobjekt
  inzwischen zusätzlich zum Bearbeiten freigegeben, bleibt die Freigabe
  wirksam. Die Synchronisation in dasselbe Objekt wird ohne wirksamen Check-out
  auch bei unverändertem Serverstand abgelehnt und auditiert. Der Benutzer muss
  den Serverstand neu laden, online auschecken und manuell übertragen oder den
  Entwurf soweit zulässig als neues privates Objekt retten.
- **Endgültige Löschung:** Wurde das Serverobjekt gelöscht, wird es lokal
  entfernt und Setlistreferenzen werden aktualisiert. Dieselbe technische
  Identität darf nicht wiederhergestellt werden; vorhandene Basisdaten dürfen
  bei ausreichenden Rechten bewusst als neues privates Objekt gerettet werden.
- **Fehler:** Veraltete Stände, fehlende Rechte, Check-out-Pflicht und endgültige
  Löschung werden ohne Merge oder Überschreiben abgelehnt. Der Entwurf bleibt
  für zulässiges Verwerfen, Retten oder manuelles Übertragen erhalten.
  Ablehnung und Rettungsweg sowie Revisionskonflikt, Rechteentzug und
  Sitzungsablauf werden mit unterscheidbarer lokaler und serverseitiger Zeit
  auditiert, ohne eine fachliche Version zu erzeugen.

## WF-013: Synchronisationskonflikt behandeln

- **Ausgangszustand:** Revision, Rechte, Löschstatus oder Check-out verhindern
  die Synchronisation.
- **Ablauf:** Das Produkt zeigt Objekt, Fehlerklasse und zulässige nächste
  Aktionen ohne fremde Daten oder interne Details.
- **Ergebnis:** Der Benutzer verwirft den lokalen Stand, sichert ihn soweit
  zulässig als neues privates Objekt oder überträgt ihn nach Neuladen und,
  sofern nun erforderlich, bewusstem Online-Check-out manuell. Ein endgültig
  gelöschtes Objekt wird lokal entfernt und darf unter derselben technischen
  Identität nicht wiederbelebt werden. Ablehnungsgrund, Rettungsweg, lokale
  Aktionszeit, serverseitige Synchronisationszeit, technische datensparsame
  Gerätekennung und Ergebnis werden serverseitig auditiert.
- **Grenze:** Es gibt kein automatisches Zusammenführen, kein stilles
  Überschreiben und kein Last-write-wins für private Offlineobjekte.

## WF-014: Berechtigungen ändern oder entziehen

- **Ausgangszustand:** Die handelnde Person besitzt globales Verwaltungsrecht
  und `Berechtigungen verwalten` am Objekt oder handelt als
  Plattformadministrator.
- **Ablauf:** Positive Benutzer-, globale Gruppen-, Band- oder bandbezogene
  Gruppenrechte werden innerhalb ihrer zulässigen Ebene hinzugefügt oder
  entfernt. Negative Rechte werden nicht erzeugt. Bands und Bandgruppen dürfen
  keine globalen Aktionsrechte erhalten.
- **Ergebnis:** Additive Berechtigungen werden sofort neu ausgewertet. Wird ein
  aktuell bearbeitetes Objekt dadurch gemeinsam bearbeitbar, erhält eine
  eindeutig bekannte aktive Online-Sitzung atomar den Check-out; andernfalls
  darf die Ansicht erst nach Neuladen und erfolgreichem Check-out speichern.
  Wird es wieder allein bearbeitbar, bleibt die bestehende Sperre bis zum Ende
  der Sitzung erhalten und entfällt erst für künftige Bearbeitungen.
- **Check-out:** Fehlt danach ein erforderliches Recht, wird Speichern
  abgelehnt und der Check-out beendet. Lokale Eingaben dürfen kopiert oder
  verworfen werden.
- **Bandgrenze:** Eine Bandverwaltung darf keine globalen Rechte oder fremden
  Objekte verwalten.

## WF-015: Lokale Daten bei Abmeldung oder Rechteentzug behandeln

- **Ausgangszustand:** Das Gerät enthält vorbereitete Daten oder nicht
  synchronisierte Entwürfe.
- **Abmeldung:** Das Produkt warnt vor Löschung offener Entwürfe und bietet
  ausdrücklich `Abmeldung abbrechen` oder `vor Abmeldung synchronisieren` an.
  Erst nach einer bewusst bestätigten Abmeldung werden lokale Inhalte und
  Sitzungsschlüssel kontrolliert entfernt.
- **Gerätesitzungswiderruf:** Plattformadministratoren dürfen eine
  Gerätesitzung serverseitig widerrufen. Beim nächsten Serverkontakt werden
  weitere geschützte Zugriffe und Synchronisationen dieser Sitzung abgelehnt.
  Ein dauerhaft getrenntes Gerät erkennt den Widerruf nicht; spätestens die
  maximale Offlinesitzung begrenzt das Restrisiko. Widerruf und abgelehnte
  Folgeverwendung werden auditiert. Das angenommene technische Verfahren steht
  in
  [ADR-0005](../architecture/decisions/ADR-0005-identitaet-authentifizierung-und-sitzungen.md).
- **Rechteentzug oder Sitzungsablauf:** Spätestens mit Ablauf der maximalen
  Offlinesitzung werden geschützte Basisinhalte und Overlays gesperrt; erneute
  Onlineanmeldung oder Rechteprüfung ist nötig. Endgültig gelöschte Objekte
  werden beim nächsten erfolgreichen Abgleich lokal entfernt und
  Setlistreferenzen aktualisiert. Neu erteilte Rechte lösen keinen automatischen
  Download aus; Offlinevorbereitung oder Synchronisation muss bewusst
  aktualisiert werden. Minimale Setlistinformationen und klar getrennte eigene
  Entwürfe dürfen verbleiben. Entwürfe verlängern keine Rechte und werden nicht
  automatisch synchronisiert.
- **Security:** Lokale Daten müssen verschlüsselt gespeichert werden. Das
  angenommene Verfahren steht in
  [ADR-0006](../architecture/decisions/ADR-0006-lokale-pwa-daten-und-offline-synchronisation.md).

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
- **Check-out:** Bei mehreren potenziellen Bearbeitern sperrt `WF-018` das
  gesamte fachlich bearbeitbare Inhaltsobjekt: PDF beziehungsweise Basisinhalt,
  Arrangeur/Interpret, Tonart, Tempo, Dauer, Niveau, Genre und Beschreibung.
  Keine andere Sitzung darf diese Bestandteile speichern. Eigenständige private
  Overlays bleiben ungesperrt. Berechtigungen ändern, Eigentum übertragen,
  Löschung vormerken und Check-out zurücknehmen bleiben als atomar geprüfte und
  auditierte administrative Aktionen zulässig; Rechteentzug kann die Sperre
  ungültig machen, Löschvormerkung beendet sie sofort.

## WF-017: Eigentum übertragen, Eigentümer löschen oder Objekt löschen

- **Eigentumsübertragung:** Ein berechtigter Benutzer wählt aktiven Benutzer
  oder bestehende, nicht vorgemerkte Band. Annahme ist nicht erforderlich;
  alle ausdrücklich vergebenen Objektberechtigungen und Sonderrechte bleiben,
  nur automatische Eigentümerrechte wechseln. Eine neue Eigentümerband erhält
  bei Inhalt, Setlist oder nicht gekoppeltem Overlay atomar ihr normales
  `Anzeigen`; gekoppelte Overlays folgen dem Inhalt ohne separates Bandrecht und
  erben dessen Leserechte. `Öffentlich` ist nur administrativ zulässig.
- **Deaktivierung:** Ein deaktiviertes Benutzerkonto bleibt Eigentümer; seine
  Beziehungen werden nach Reaktivierung wieder wirksam. Es kann keine Rechte
  ausüben und kein neues Übertragungsziel sein.
- **Benutzerlöschung:** Ausschließlich ein Plattformadministrator löscht ein
  globales Konto. Vorher werden Anzahl betroffener Eigentumsobjekte,
  drohende Eigentümerlosigkeit, Fortbestand anderer Rechte, ausschließlich
  administrative Änderbarkeit danach und die Möglichkeit vorheriger
  Übertragung angezeigt. Die Folgen müssen ausdrücklich bestätigt werden.
- **Bandlöschung:** Vor administrativer Bestätigung werden Auswirkungen auf
  Eigentum und direkte Band- und gelöschte Gruppenrechte angezeigt. Diese
  entfallen; andere Rechte bleiben.
- **Löschvormerkung:** Lesen bleibt erlaubt, Bearbeitung, neue Freigabe und neue
  Setlistreferenz werden gesperrt; ein Check-out endet sofort.
- **Wiederherstellung und Ablauf:** Plattformadministratoren dürfen vor
  Fristablauf wiederherstellen oder sofort endgültig löschen. Nach Ablauf wird
  automatisch endgültig gelöscht. Bis zur Ausführung ist `ausstehende
  endgültige Löschung` sichtbar; technische Verzögerung verlängert die Frist
  nicht, Fehler bleiben sichtbar und erneut behandelbar. Die automatische
  Löschung wird auditiert.
- **Endgültige Inhaltslöschung:** Vorab werden Overlay- und Referenzanzahl
  angezeigt. Overlays werden gelöscht und aktuelle Setlistreferenzen atomar
  entfernt. Die vollständige Setlist-Historie erhält als besondere Minimalform
  nur Zeitpunkt, frühere Position, letzten Songtitel, letzten Komponisten und
  `Inhalt endgültig gelöscht`.

## WF-018: Gemeinsam bearbeitbares Objekt online auschecken

- **Ausgangszustand:** Mehr als ein Benutzer besitzt potenziell Schreibrecht;
  bei Gruppen- oder Bandschreibrecht gilt dies unabhängig von Mitgliederzahl.
- **Ablauf:** Beim Öffnen des Bearbeitungsmodus wird für die Sitzung ein
  Check-out vergeben. Er sperrt bei Inhalten PDF beziehungsweise Basisinhalt
  und alle Inhaltsmetadaten, nicht aber eigenständige Overlays. Check-outs für
  Inhalt, Overlay und Setlist sind getrennt; ein gemeinsam bearbeitbares Overlay
  benötigt seine eigene Reservierung. Nur die aktive verbundene Sitzung
  verlängert die global konfigurierte Lease. Speichern beendet sie nicht.
  Leser sehen ausschließlich den letzten gespeicherten Serverstand.
- **Eigene Mehrfachsitzungen:** Eine zweite Sitzung desselben Benutzers darf die
  Reservierung nicht mitbenutzen. Bewusste Übernahme invalidiert die erste
  Sitzung; diese darf lokale Eingaben nur kopieren oder verwerfen.
- **Anzeige:** Schreibberechtigte sehen Anzeigename, Beginn und erwarteten
  Ablauf, keine E-Mail-Adresse oder weiteren Profildaten. Die aktive Sitzung
  wird vor Lease-Ablauf verständlich gewarnt.
- **Ende:** Bewusstes Verlassen, Abbrechen, ausdrückliches Ende,
  administrative Rücknahme, Rechteentzug, Löschvormerkung oder Lease-Ablauf.
- **Rücknahme:** Der Inhaber darf den eigenen Check-out bewusst beenden. Ein
  aktiver persönlicher Objekteigentümer darf einen Check-out seines Objekts als
  begrenzte Eigentümerbefugnis zurücknehmen. Bei Bandeigentum darf dies nur ein
  ausdrücklich dafür vertretungsberechtigter aktiver Benutzer oder eine
  bandbezogene Gruppe; normale Bandmitgliedschaft genügt nicht. Andere
  bestellte Rücknahmeberechtigte benötigen das globale Aktionsrecht `Check-out
  zurücknehmen` und die objektspezifische Berechtigung.
  Plattformadministratoren dürfen zurücknehmen, aber nicht umgehen, sondern
  müssen danach selbst auschecken. Die frühere Sitzung verliert nur ihre serverseitige
  Speicherberechtigung; lokale Eingaben bleiben bis zum nächsten Kontakt
  erhalten. Dann wird der Benutzer informiert und kann kopieren, verwerfen oder
  bewusst einen neuen Check-out anfordern.
- **Administrative Aktionen:** Berechtigungsänderung, Eigentumsübertragung,
  Löschvormerkung und Rücknahme bleiben mit atomarer serverseitiger Prüfung und
  Audit zulässig. Der Check-out bleibt nach Rechte- oder Eigentumsänderung nur
  bei fortbestehenden Rechten wirksam; Löschvormerkung beendet ihn sofort.
- **Dynamischer Übergang:** Wird das Objekt gemeinsam bearbeitbar, erhält die
  eindeutig bekannte aktive Sitzung atomar die Sperre; sonst muss vor Speichern
  neu geladen und ausgecheckt werden. Wird es wieder allein bearbeitbar, bleibt
  die Sperre bis zum Verlassen bestehen und entfällt erst für künftige
  Bearbeitungen.
- **Verbindungs- oder Lease-Verlust:** Netzwerkverlust erzeugt keinen
  Offline-Check-out. Ungespeicherte Eingaben dürfen als lokaler Entwurf bleiben.
  Bei Wiederverbindung prüft der Server Check-out-Kennung und Sitzung, Lease,
  Rechte, Revision beziehungsweise Serverstand und Löschstatus. Nach Ablauf darf
  der alte Client weder still speichern noch still neu reservieren; veraltete
  oder unberechtigte Versuche werden ohne Merge oder Überschreiben abgelehnt.

## WF-019: Eigenes Overlay zur Übernahme einreichen

- **Ausgangszustand:** Ein Benutzer besitzt ein eigenes Overlay zu einem
  lesbaren Inhalt, aber kein Schreibrecht am Inhalt.
- **Ablauf:** Er entfernt persönliche Inhalte und reicht dasselbe Overlay ein.
  Atomar entsteht ein zweckgebundener temporärer Lesezugriff ausschließlich für
  zuständige Prüfer. Ein aktiver persönlicher Inhaltseigentümer entscheidet als
  begrenzte Eigentümerbefugnis. Bei Bandeigentum entscheiden nur ausdrücklich
  für Overlay-Übernahmen vertretungsberechtigte aktive Benutzer oder
  bandbezogene Gruppen. Andere bestellte Prüfer benötigen das globale
  Aktionsrecht `Overlay-Übernahme prüfen` und die objektspezifische
  Prüfberechtigung; bei Eigentümerlosigkeit entscheiden ausschließlich
  Plattformadministratoren. Der Zugriff vermittelt kein reguläres Bearbeiten
  und endet bei Rücknahme oder Ablehnung.
- **Genehmigung:** Keine Kopie entsteht. Eigentum wechselt zum
  Inhaltseigentümer, dynamische Leserechtevererbung wird aktiv, der Prüfzugriff
  wird durch endgültige Rechte ersetzt und das persönliche Schreibrecht des
  Erstellers entfällt. Anders als bei direkter gekoppelter Anlage muss es bei
  Bedarf ausdrücklich neu vergeben werden.
- **Ablehnung oder Rücknahme:** Der Prüfzugriff endet; das Overlay bleibt
  unverändert privat beim Benutzer.
- **Kopie:** Ein gekoppeltes Overlay darf als neues, zunächst nur für den
  kopierenden Benutzer verfügbares Overlay kopiert werden.

## WF-020: Inhaltsberechtigung anfragen

- **Ausgangszustand:** Ein Benutzer kann ein Objekt oder einen Setlistinhalt
  nicht lesen oder bearbeiten.
- **Ablauf:** Ohne bestehende Zielberechtigung beantragt er mit dem globalen
  beziehungsweise systemseitigen Anfragerecht Anzeigen oder Bearbeiten für
  sich oder zusätzlich mit `Berechtigung für Band anfragen` für eine Band.
- **Empfänger:** Benutzer mit globalem Verwaltungsrecht und
  `Berechtigungen verwalten` am Objekt. Fehlen solche Empfänger oder ist das
  Objekt eigentümerlos, ist die Plattformadministration zuständig.
- **Offlineentwurf:** Offline lautet der Status `noch nicht gesendet`; es gibt
  noch keine Serveranfrage oder Benachrichtigung. Beim Versand werden Rechte,
  Zielobjekt, Empfänger und gegebenenfalls Bandvertretung neu geprüft. Erst
  danach wird der Status `offen`; Fehler bleiben sichtbar.
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
  Offline-Lease vergeben. Ein gewöhnlicher Online-Check-out wird durch
  Netzwerkverlust niemals in diesen Offline-Check-out umgewandelt.
- **Offline:** Die Lease kann nicht verlängert werden, darf die maximale
  Offlinesitzung nicht überschreiten, blockiert andere Bearbeiter und erlaubt
  weiter Lesen. Nach Lease-Ablauf darf der klar gekennzeichnete lokale Entwurf
  fortgeführt werden, besitzt aber keine Serverreservierung. Nach Ablauf der
  maximalen Offlinesitzung sind geschützte Serverinhalte bis zur erneuten
  Onlineprüfung gesperrt; Entwürfe verlängern die Berechtigung nicht.
- **Synchronisation:** Wirksame Lease plus unveränderte Revision speichert
  atomar. Bei abgelaufener Lease und unverändertem freien Objekt darf der
  Benutzer bewusst einen neuen Check-out anfordern; eine stille Neuerteilung
  ist unzulässig. Bei Änderung oder anderer Sperre wird abgelehnt.
- **Ergebnis:** Nach Erfolg endet der Offline-Check-out oder wird in einen
  Online-Check-out derselben Sitzung überführt. Administrative Rücknahme wird
  bei Wiederverbindung wirksam. Der Server auditiert lokale Aktionszeit,
  Synchronisationszeit, technische datensparsame Gerätekennung, Ergebnis und
  insbesondere Ablehnungen, Konflikte, Rechte- oder Lease-Ablauf sowie
  administrative Rücknahmen.

## WF-022: Globalen Benutzer einladen und Einladung annehmen

- **Ausgangszustand:** Der Einladende ist aktiv und besitzt das von einem
  Plattformadministrator direkt oder über eine globale Gruppe vergebene
  Aktionsrecht `Nutzer einladen`. Es besteht keine offene Einladung für
  dasselbe Ziel.
- **Einladung erzeugen:** Der Einladende erfasst die Ziel-E-Mail-Adresse. Das
  System erzeugt eine einmalige kurz gültige Einladung. Der Einladende darf nur
  seine eigene offene Einladung ansehen, erneut senden oder widerrufen.
  Plattformadministratoren dürfen jede offene Einladung widerrufen.
- **Annahme:** Der Empfänger öffnet die noch gültige Einladung, bestätigt die
  E-Mail-Adresse und setzt sein eigenes Passwort. Das System prüft Status und
  Gültigkeit erneut, verbraucht die Einladung einmalig und aktiviert das Konto
  automatisch als normalen Benutzer.
- **Ergebnis:** Das neue Konto erhält ausschließlich den Basissatz von `Alle
  Benutzer`. Optionale MFA darf anschließend eingerichtet werden. Globale
  Zusatzrechte, Gruppen, Plattformadministratorstatus, Bands,
  Bandmitgliedschaften und Objektberechtigungen werden niemals aus der
  Einladung übernommen und nur in getrennten Abläufen vergeben.
- **Abbruch:** Bricht der Empfänger vor erfolgreichem Abschluss ab, bleibt das
  Konto inaktiv und die Einladung bis zu Widerruf, Verwendung oder Ablauf offen.
  Es entsteht keine Teilaktivierung und keine Teilberechtigung.
- **Ablehnung:** Abgelaufene, widerrufene, bereits verwendete, ersetzte oder
  serverseitig ungültige Einladungen werden ohne E-Mail-Enumeration abgelehnt.
  Doppelte offene Einladungen für dasselbe Ziel werden nicht erzeugt.
- **Berechtigungsgrenze:** Die automatische Systemaktivierung ist keine manuelle
  Aktivierungsbefugnis des Einladenden. Nur Plattformadministratoren dürfen
  Konten manuell aktivieren, deaktivieren oder löschen und die globalen
  Folgerechte verwalten.

## Abdeckungsregel

Die nummerierten funktionalen, qualitativen und Sicherheitsanforderungen gelten
auch dann, wenn ein Ablauf sie nicht wiederholt. Neue eigenständige Abläufe
erhalten die nächste freie `WF-xxx`-Kennung.
