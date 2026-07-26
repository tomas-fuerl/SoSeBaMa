# Kernabläufe

## Bezug und Leseregel

Dieses Dokument konkretisiert GitHub-Issue #3. Jeder Ablauf besitzt eine
stabile `WF-xxx`-Kennung. Rollenbezeichnungen folgen
[Benutzer und Rollen](USERS-AND-ROLES.md), Begriffe dem
[Glossar](GLOSSARY.md). Das verbindliche Song-, Inhalts-, Eigentums- und
Overlaymodell steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

Die Abläufe beschreiben beobachtbares Produktverhalten, keine technische
Umsetzung oder Oberflächengestaltung. Bestehende Kennungen werden nicht
umgedeutet; zusätzliche Abläufe erhalten die nächste freie Kennung.

## WF-001: Benutzer einladen oder Zugriff erteilen

- **Ausgangszustand:** Ein Bandbereich besteht; der vorgesehene Benutzer ist dort
  noch kein aktives Mitglied.
- **Beteiligte Rollen:** Bandadministrator und vorgesehener Benutzer.
- **Normaler Ablauf:** Der Bandadministrator startet eine Einladung und ordnet
  nur die für den vorgesehenen Zweck erforderlichen Bandrollen oder Direktrechte
  zu. Der Benutzer bestätigt seinen Zugang; die Mitgliedschaft wird für genau
  diesen Bandbereich aktiv.
- **Erwartetes Ergebnis:** Der Benutzer sieht ausschließlich die durch
  Mitgliedschaft, wirksame Rollen, Direktrechte und Objektfreigaben erlaubten
  Bereiche und Aktionen. Mitgliedschaften in anderen Bands bleiben getrennt.
- **Fehler und Ausnahmen:** Ungültige, abgelaufene oder bereits verwendete
  Einladungen werden ohne Preisgabe bestehender Mitgliedschaften abgelehnt.
  Doppelte Mitgliedschaften und unzulässige globale Rechte werden nicht still
  erzeugt.
- **Security und Offline:** Vor bestätigter Mitgliedschaft entsteht keine
  Offlineberechtigung. Ein zusätzlicher Authentifizierungsfaktor bleibt gemäß
  `OQ-020` offen.

## WF-002: Band und Bandbereich verwalten

- **Ausgangszustand:** Eine aktive Bandadministration besitzt die erforderlichen
  Rechte in genau einem Bandbereich.
- **Beteiligte Rollen:** Bandadministrator; betroffene Mitglieder nur im Rahmen
  ihrer eigenen Sicht und Zustimmung.
- **Normaler Ablauf:** Der Bandadministrator prüft Mitglieder, Bandrollen,
  anpassbare Rollenrechte und zulässige Direktrechte. Er ändert genau eine
  erlaubte Zuordnung und bestätigt ihre fachliche Wirkung.
- **Erwartetes Ergebnis:** Der zentrale Stand zeigt die neue Zuordnung für genau
  diesen Bandbereich. Erlaubte und verbotene Aktionen entsprechen ihr
  nachvollziehbar; andere Bandbereiche bleiben unverändert.
- **Fehler und Ausnahmen:** Unzulässige Selbstentziehung der letzten
  erforderlichen Administration, Querzugriffe, Änderung globaler Rollen oder
  widersprüchliche gleichzeitige Änderungen werden abgelehnt oder eindeutig als
  Konflikt ausgewiesen.
- **Security und Offline:** Bandrollen und Bandrechte gelten ausschließlich im
  betroffenen Bandbereich. Auswirkungen auf Offlinegeräte folgen `WF-014` und
  `WF-015`.

## WF-003: Song mit normalisierten Metadaten anlegen

- **Ausgangszustand:** Der Benutzer besitzt das Recht, Songs und normalisierte
  Songmetadaten anzulegen.
- **Beteiligte Rollen:** Inhaltsredakteur oder eine direkt berechtigte Person.
- **Normaler Ablauf:** Der Benutzer sucht zunächst nach einem bereits
  vorhandenen Song. Ist kein passender Song vorhanden, erfasst er die
  erforderlichen normalisierten Metadaten, prüft mögliche Dubletten und
  speichert den Song bewusst.
- **Erwartetes Ergebnis:** Ein eindeutig auffindbarer Song-Metadateneintrag mit
  nachvollziehbarer Änderungshistorie besteht. Durch diesen Ablauf wird noch
  kein PDF-, Text- oder Chord-Inhalt angelegt.
- **Fehler und Ausnahmen:** Fehlende Pflichtangaben, unzulässige Werte,
  widersprüchliche Dubletten oder ein zwischenzeitlich entzogener Zugriff führen
  zu einer verständlichen Ablehnung ohne stillen Teilstand.
- **Security und Offline:** Ein Song-Metadateneintrag allein erweitert weder die
  Sichtbarkeit konkreter Inhalte noch erzeugt er Bearbeitungsrechte an ihnen.
  Offlineanlage ist von `OQ-006` abhängig.

## WF-004: PDF als konkreten Inhalt hinzufügen und anzeigen

- **Ausgangszustand:** Ein Song besteht; der Benutzer besitzt das Recht, einen
  Inhalt anzulegen und ein bewusst ausgewähltes PDF einzubringen.
- **Beteiligte Rollen:** Inhaltsredakteur oder direkt berechtigte Person für das
  Hinzufügen; berechtigte Benutzer für die Anzeige.
- **Normaler Ablauf:** Der Benutzer wählt genau einen bestehenden Song, wählt die
  PDF-Datei, erfasst bei Bedarf abweichende Inhaltsmetadaten und prüft die
  vorgesehene Sichtbarkeit. SoSeBaMa prüft die Datei sicher und speichert sie
  anschließend als neuen konkreten Inhalt.
- **Erwartetes Ergebnis:** Ein PDF-Inhalt ist genau einem Song zugeordnet,
  besitzt genau einen aktuellen Stand, ein unverändertes Original, einen
  eindeutigen Eigentümer und eine nachvollziehbare Änderungshistorie. Er ist nur
  entsprechend seiner wirksamen Sichtbarkeit zugänglich.
- **Fehler und Ausnahmen:** Ein fehlender oder mehrdeutiger Songbezug, ein
  unzulässiger Dateityp, ein beschädigter oder nicht sicher verarbeitbarer
  Inhalt, fehlende Rechte oder eine abgebrochene Übertragung erzeugen keinen als
  erfolgreich dargestellten Teilimport.
- **Security und Offline:** Der Import ist benutzergesteuert und folgt
  `SEC-006` und `SEC-007`. Offlinebereitstellung erfolgt getrennt über
  `WF-010`.

## WF-005: PDF mit einem oder mehreren Overlays annotieren

- **Ausgangszustand:** Ein berechtigter PDF-Inhalt ist geöffnet. Mindestens ein
  nutzbares Overlay besteht oder der Benutzer darf ein neues Overlay anlegen.
- **Beteiligte Rollen:** Musiker, Bandmitglieder, Inhaltsredakteure,
  Inhaltseigentümer und direkt berechtigte Personen im jeweils erlaubten Umfang.
- **Normaler Ablauf:** Der Benutzer wählt oder erstellt eines von beliebig vielen
  privaten, Band- oder globalen Overlays. Er fügt Annotationen per Touch oder
  Stift hinzu, prüft das Ergebnis und speichert ausschließlich im gewählten
  Overlay. Weitere berechtigte Overlays können gleichzeitig ein- oder
  ausgeblendet werden.
- **Erwartetes Ergebnis:** Jede Annotation ist genau einem Overlay und dieses
  genau einem Inhalt zugeordnet. Mehrere Overlays können gleichzeitig und auch
  überlappend dargestellt werden. Das Original bleibt unverändert.
- **Fehler und Ausnahmen:** Fehlende Sicht- oder Bearbeitungsrechte, ein
  bestehender Check-out, nicht unterstützte Eingabe, Speicherfehler oder eine
  konkurrierende Änderung werden sichtbar. Kein Fehler verändert das Original
  oder ein anderes Overlay.
- **Security und Offline:** Private Overlays sind nur für ihren Benutzer
  sichtbar. Band- und globale Overlays umgehen weder Inhaltssichtbarkeit noch
  Bearbeitungsrechte. Gemeinsame Bearbeitung folgt `WF-018`;
  Offlinebearbeitung privater Overlays bleibt von `OQ-006` abhängig.

## WF-006: Text- oder Chord-Inhalt anlegen oder importieren

- **Ausgangszustand:** Ein Song besteht; der Benutzer besitzt die erforderlichen
  Inhaltsrechte und hat den einzubringenden Inhalt sowie dessen Nutzungsrecht
  geprüft.
- **Beteiligte Rollen:** Inhaltsredakteur oder direkt berechtigte Person.
- **Normaler Ablauf:** Der Benutzer wählt genau einen Song, erstellt den Inhalt
  manuell oder fügt ihn bewusst per Copy-and-paste ein, prüft Struktur,
  Songzuordnung, abweichende Inhaltsmetadaten und Sichtbarkeit und speichert ihn
  als neuen konkreten Inhalt.
- **Erwartetes Ergebnis:** Ein anbieterunabhängig verwaltbarer Text- oder
  Chord-Inhalt besitzt genau einen aktuellen Stand, ein Original, einen
  eindeutigen Eigentümer und eine Änderungshistorie. Er ist genau einem Song
  zugeordnet. Es wird keine Fassung oder auswählbare Revision erzeugt.
- **Fehler und Ausnahmen:** Ein fehlender oder mehrdeutiger Songbezug, nicht
  erkennbare Chord-Struktur, ungültige Eingabe, fehlende Rechte oder ein
  Speicherkonflikt werden ohne Verlust des Ausgangsinhalts angezeigt.
- **Security und Offline:** Kein automatisiertes Scraping oder Umgehen von
  Schutzmaßnahmen. Individuelle Änderungen wie Transposition, Austausch
  einzelner Chords oder Vereinfachungen werden in einem Overlay geführt und
  verändern das Original nicht. Gemeinsame Bearbeitung folgt `WF-018`;
  Offlinebearbeitung hängt von `OQ-006` ab.

## WF-007: Chords über ein Overlay anpassen oder transponieren

- **Ausgangszustand:** Ein berechtigter Chord-Inhalt enthält ausreichend
  strukturierte Chords. Der Benutzer besitzt Zugriff auf ein geeignetes Overlay
  oder darf eines anlegen.
- **Beteiligte Rollen:** Musiker, Inhaltseigentümer, Inhaltsredakteure und direkt
  berechtigte Personen.
- **Normaler Ablauf:** Der Benutzer wählt ein privates oder entsprechend seinen
  Rechten ein Band- beziehungsweise globales Overlay. Er führt eine automatische
  Transposition durch, ändert einzelne Chords für einen Auftritt oder
  vereinfacht komplexe Chords und prüft die resultierende Darstellung.
- **Erwartetes Ergebnis:** Die Anpassung ist im gewählten Overlay gespeichert.
  Ausgangsinhalt, angewendete Anpassung und aktives Overlay bleiben eindeutig
  unterscheidbar. Das Original wird nicht verändert.
- **Fehler und Ausnahmen:** Nicht erkennbare oder mehrdeutige Chords werden
  markiert und nicht still falsch verändert. Fehlende Overlay-Rechte, ein
  bestehender Check-out oder ein Speicherkonflikt führen zu einer verständlichen
  Ablehnung.
- **Security und Offline:** Private Anpassungen bleiben privat. Gemeinsame
  Band- oder globale Overlays werden nur mit wirksamem Recht und gemäß `WF-018`
  bearbeitet. Ob private Overlay-Anpassungen offline gespeichert werden dürfen,
  entscheidet `OQ-006`.

## WF-008: Autoscroll bei Probe oder Auftritt verwenden

- **Ausgangszustand:** Ein berechtigter Text- oder Chord-Inhalt ist geöffnet und
  für die aktuelle Nutzung verfügbar.
- **Beteiligte Rollen:** Musiker und andere leseberechtigte Benutzer.
- **Normaler Ablauf:** Der Benutzer startet Autoscroll, kontrolliert den Verlauf
  und kann Geschwindigkeit, Pause, Fortsetzung und Ende bewusst steuern.
- **Erwartetes Ergebnis:** Der Inhalt bewegt sich vorhersehbar, bleibt lesbar
  und unter unmittelbarer Kontrolle des Benutzers.
- **Fehler und Ausnahmen:** Ressourcen- oder Darstellungsfehler stoppen sicher
  und lassen manuelle Navigation zu; ein Fehler verändert weder Inhalt noch
  Overlay.
- **Security und Offline:** Autoscroll benötigt keine zusätzlichen
  Bearbeitungsrechte und funktioniert für vorbereitete Offlineinhalte; konkrete
  Reaktionsziele folgen aus `OQ-011`.

## WF-009: Setlist anlegen, pflegen, kopieren und freigeben

- **Ausgangszustand:** Berechtigte konkrete Inhalte bestehen; der Benutzer
  besitzt Setlist-Rechte.
- **Beteiligte Rollen:** Setlist-Verantwortlicher, Inhaltsredakteure und
  berechtigte lesende Benutzer.
- **Normaler Ablauf:** Der Verantwortliche legt die Setlist im Eigentum eines
  Benutzers oder einer Band an. Er fügt konkrete Inhalte hinzu, entfernt oder
  ordnet sie und legt je Setlisteintrag die bandweit vorgesehene Overlay-Auswahl
  fest. Danach veröffentlicht oder aktualisiert er den aktuellen Stand. Für
  einen unabhängigen Planungsstand kopiert er die Setlist bewusst.
- **Erwartetes Ergebnis:** Die Setlist enthält eine geordnete Auswahl konkreter
  Inhalte, genau einen aktuellen Stand und eine vollständige
  Änderungshistorie. Eine Kopie besitzt eigenes Eigentum und eine eigene
  Änderungshistorie; die enthaltenen Inhalte und Overlays werden nicht kopiert.
- **Fehler und Ausnahmen:** Fehlende Inhaltsrechte, entfernte Inhalte,
  unzulässige Overlay-Auswahl, konkurrierende Änderung oder unvollständige
  Freigabe werden sichtbar und nicht als vollständiger Stand ausgegeben.
- **Security und Offline:** Setlistfreigabe erweitert keine Inhalts- oder
  Overlay-Rechte. Berechtigte Benutzer dürfen rollenabhängig einzelne
  Setlisteinträge nur für ihre persönliche Ansicht ausblenden und ihre
  persönliche Overlay-Auswahl ändern; dadurch wird die bandweite Setlist nicht
  verändert. Offlinevorbereitung folgt `WF-010`.

## WF-010: Inhalte für Offlineverwendung vorbereiten

- **Ausgangszustand:** Der Benutzer ist online, berechtigt und hat einzelne
  Inhalte oder eine Setlist bewusst ausgewählt.
- **Beteiligte Rollen:** Alle Rollen mit expliziter Offlineberechtigung.
- **Normaler Ablauf:** SoSeBaMa ermittelt die konkreten Inhalte sowie die dafür
  berechtigten und ausgewählten Overlays, zeigt Umfang und Zustand, der Benutzer
  startet die Vorbereitung und prüft den Abschluss.
- **Erwartetes Ergebnis:** Vollständige, unvollständige und fehlgeschlagene
  Offlineinhalte sind unterscheidbar. Nur erlaubte Inhalte und Overlays liegen
  lokal vor.
- **Fehler und Ausnahmen:** Fehlender Speicher, Verbindungsabbruch,
  Rechteänderung, entfernter Inhalt oder fehlerhaftes Dokument hinterlässt
  keinen fälschlich als vollständig markierten Stand.
- **Security und Offline:** Lokale Inhalte folgen `SEC-008`. Eine
  Offlinevorbereitung erzeugt kein Check-out und erlaubt keine gemeinsame
  Offlinebearbeitung. Sitzungsgültigkeit und Entfernung richten sich nach
  `OQ-007` und `OQ-008`.

## WF-011: Setlist und Inhalte ohne Netzwerk verwenden

- **Ausgangszustand:** Inhalte und zulässige Overlays wurden erfolgreich
  vorbereitet; Netzwerk ist nicht verfügbar und die Offlineberechtigung ist
  noch wirksam.
- **Beteiligte Rollen:** Musiker und andere offline berechtigte Benutzer.
- **Normaler Ablauf:** Der Benutzer öffnet die vorbereitete Setlist, navigiert
  durch konkrete Inhalte und nutzt erlaubte Anzeige-, Overlay- und
  Bedienfunktionen.
- **Erwartetes Ergebnis:** Vorbereitete Inhalte funktionieren im zugesagten
  Umfang. Offlinezustand, aktive Overlays und mögliche Einschränkungen sind
  sichtbar.
- **Fehler und Ausnahmen:** Nicht vorbereitete, abgelaufene oder entzogene
  Inhalte und Overlays werden sicher und verständlich behandelt; es entsteht
  keine irreführende Onlinebestätigung.
- **Security und Offline:** Keine Verbindung erzeugt keine zusätzlichen Rechte.
  Gemeinsame Inhalte und gemeinsame Overlays können offline nicht kollaborativ
  bearbeitet werden. Zulässige private Overlay-Änderungen und Sitzungsdauer
  entscheiden `OQ-006` und `OQ-007`.

## WF-012: Nach Wiederherstellung der Verbindung synchronisieren

- **Ausgangszustand:** Das Gerät ist wieder verbunden. Zulässige lokale private
  Overlay-Änderungen oder veraltete lokale Inhalte können vorhanden sein.
- **Beteiligte Rollen:** Betroffener Benutzer; fachlich Verantwortliche nur bei
  einem berechtigten Klärungsfall.
- **Normaler Ablauf:** SoSeBaMa prüft aktuelle Identität, Rechte,
  Objektzuordnung und zentralen Stand. Zulässige private Änderungen werden
  kontrolliert abgeglichen; Fortschritt und Ergebnis bleiben sichtbar.
- **Erwartetes Ergebnis:** Erfolgreich übernommene private Änderungen sind
  zentral nachvollziehbar. Lokale Inhalte entsprechen dem erlaubten aktuellen
  Stand oder bleiben eindeutig als offen beziehungsweise gesperrt
  gekennzeichnet.
- **Fehler und Ausnahmen:** Verbindungsabbruch, Rechteentzug, ungültige lokale
  Änderung, geänderte Objektzuordnung oder Konflikt bleiben sichtbar und erneut
  behandelbar. Nichts wird still verworfen oder als gemeinsame Änderung
  übernommen.
- **Security und Offline:** Autorisierung wird vor jeder Übernahme erneut
  geprüft. Offline entstandene Änderungen dürfen kein Check-out vortäuschen und
  nicht in ein Band- oder globales Overlay geschrieben werden. Entzogene Rechte
  blockieren die Übertragung und lösen `WF-015` aus.

## WF-013: Konflikt oder fehlgeschlagene Synchronisation behandeln

- **Ausgangszustand:** Eine Synchronisation meldet mindestens einen Fehler oder
  einen nicht automatisch lösbaren Konflikt.
- **Beteiligte Rollen:** Ändernder Benutzer und, soweit erforderlich und
  berechtigt, zuständige Inhalts- oder Setlist-Verantwortliche.
- **Normaler Ablauf:** SoSeBaMa zeigt betroffenen Inhalt oder betroffenes
  Overlay, Fehlerklasse und sichere Optionen. Eine berechtigte Person
  wiederholt, verwirft oder klärt den Vorgang bewusst.
- **Erwartetes Ergebnis:** Der Fall endet in einem eindeutigen zentralen Stand
  oder bleibt sichtbar offen. Original, Overlay und Ausgangsstand werden nicht
  unbemerkt zerstört.
- **Fehler und Ausnahmen:** Fehlende Entscheidungsrechte, erneuter
  Verbindungsfehler, ein wirksamer Check-out oder ein weiterer konkurrierender
  Stand verhindert die Bestätigung eines falschen Erfolgs.
- **Security und Offline:** Anzeigen und Optionen sind auf berechtigte Objekte
  begrenzt. Ein Konflikt führt weder zu automatischem Zusammenführen
  kollaborativer Änderungen noch zu stillem Überschreiben. Fehlermeldungen
  enthalten keine internen Details gemäß `SEC-015`.

## WF-014: Zugriffsrechte ändern oder entziehen

- **Ausgangszustand:** Ein berechtigter globaler Administrator oder
  Bandadministrator verwaltet einen Benutzer, eine Rolle oder ein Direktrecht
  im eigenen Geltungsbereich.
- **Beteiligte Rollen:** Zuständige Administration und betroffener Benutzer.
- **Normaler Ablauf:** Die Administration wählt die konkrete Änderung, prüft
  Bandbereich, betroffene Objekte, bestehende Check-outs und Offlinefolgen und
  bestätigt die Änderung. Der zentrale Berechtigungsstand wird wirksam.
- **Erwartetes Ergebnis:** Neue geschützte Aktionen entsprechen sofort dem
  zentralen Stand. Der Entzug und die Behandlung betroffener Check-outs sind
  nachvollziehbar.
- **Fehler und Ausnahmen:** Fehlende Administrationsrechte, Querzugriff,
  widersprüchliche gleichzeitige Änderung oder unzulässige Rollenlage wird
  abgelehnt.
- **Security und Offline:** Ein Rechteentzug verhindert weitere Speicherung und
  Synchronisation entzogener Inhalte. Ein Check-out vermittelt nach
  Rechteentzug kein Speicherrecht. Offlinefolgen werden über `WF-015`,
  `OQ-007` und `OQ-008` behandelt.

## WF-015: Lokale Daten bei Abmeldung, Geräteverlust oder Rechteentzug behandeln

- **Ausgangszustand:** Ein Gerät enthält Offlineinhalte oder zulässige lokale
  private Änderungen; Abmeldung, gemeldeter Geräteverlust oder Rechteentzug
  tritt ein.
- **Beteiligte Rollen:** Betroffener Benutzer, zuständiger Bandadministrator und
  gegebenenfalls separat berechtigter technischer Betrieb.
- **Normaler Ablauf:** SoSeBaMa beendet weitere geschützte Nutzung, markiert oder
  sperrt lokale Inhalte und führt die beschlossene kontrollierte Entfernung
  beziehungsweise Klärung offener privater Änderungen aus.
- **Erwartetes Ergebnis:** Entzogene Inhalte und Overlays sind nicht weiter
  nutzbar. Lokale Daten und ausstehende Änderungen besitzen einen eindeutigen,
  prüfbaren Zustand.
- **Fehler und Ausnahmen:** Ein dauerhaft offline befindliches oder verlorenes
  Gerät kann die zentrale Bestätigung verzögern; es erhält nach
  Wiederverbindung keine entzogenen Rechte zurück.
- **Security und Offline:** Fristen und genaue Behandlung sind in `OQ-007` und
  `OQ-008` offen. Bis zur Entscheidung darf keine Umsetzung still einen
  dauerhaften Offlinezugriff annehmen.

## WF-016: Inhalt verwalten, bearbeiten und Freigaben ändern

- **Ausgangszustand:** Ein Inhalt besitzt genau ein Original, einen eindeutigen
  Eigentümer und genau einen zugeordneten Song. Er kann ausschließlich privat,
  für eine oder mehrere Bands oder öffentlich sichtbar sein.
- **Beteiligte Rollen:** Inhaltseigentümer, ursprünglicher Ersteller,
  Inhaltsredakteure, Bandadministratoren und direkt berechtigte Personen im
  jeweils erlaubten Umfang.
- **Normaler Ablauf:** Die handelnde Person wählt genau eine erlaubte Aktion:
  Inhalt oder Inhaltsmetadaten bearbeiten, Sichtbarkeitsänderung auslösen oder
  beantragen, Freigaben verwalten, archivieren, löschen oder eine
  Eigentumsübertragung einleiten. Ein gemeinsam bearbeitbarer Inhalt wird vor
  der Änderung gemäß `WF-018` ausgecheckt. Betrifft eine Änderung eine
  bestehende Bandpublikation, prüft und bestätigt ein berechtigter
  Bandadministrator der betroffenen Band den Vorgang nachvollziehbar.
- **Erwartetes Ergebnis:** Der Inhalt bleibt genau einem Song und einem
  eindeutigen Eigentümer zugeordnet. Eigentum, Sichtbarkeit, Rollenrechte,
  Direktrechte und Bearbeitungsrechte bleiben getrennt. Nur die bestätigte
  Aktion wird wirksam; andere Freigaben bleiben unverändert. Die
  Änderungshistorie wird ergänzt, ohne eine auswählbare Version zu erzeugen.
- **Fehler und Ausnahmen:** Fehlendes Aktionsrecht, fehlender Check-out,
  widersprüchliche Eigentumsgrenze oder fehlende Zustimmung für eine bestehende
  Bandpublikation führt zur Ablehnung. Ein privater Inhalt benötigt keine
  Bandzuordnung und darf nicht allein wegen fehlender Bandmitgliedschaft
  abgelehnt werden.
- **Security und Offline:** Berechtigung, Check-out und erforderliche Zustimmung
  werden aktuell geprüft und nachvollziehbar festgehalten. Gemeinsame
  Inhaltsbearbeitung ist offline nicht zulässig. Folgen eines Rechteentzugs
  richten sich nach `WF-014` und `WF-015`.

## WF-017: Benutzer oder Band löschen und Eigentum übertragen

- **Ausgangszustand:** Ein Benutzer oder eine Band soll gelöscht werden oder ein
  Eigentümer will einen Inhalt freiwillig an die Plattform übertragen. Private,
  bandeigene oder freigegebene Inhalte können betroffen sein.
- **Beteiligte Rollen:** Zuständige Administration, betroffener Benutzer und
  gegebenenfalls der bestimmte Nachfolger.
- **Normaler Ablauf:** SoSeBaMa zeigt Eigentums-, Sichtbarkeits-, Overlay- und
  Check-out-Folgen vor Bestätigung. Bei Benutzerlöschung werden ausschließlich
  private Inhalte gemäß dem beschlossenen Löschmodell entfernt; bereits als
  Bandinhalt geführte Inhalte gehen an die zuständige Band über. Bei
  Bandlöschung wird für jeden verbleibenden Inhalt ein eindeutiger Nachfolger
  bestimmt. Bei freiwilliger Plattformübertragung wechselt nur das Eigentum; ein
  privater Inhalt bleibt privat.
- **Erwartetes Ergebnis:** Jeder verbleibende Inhalt besitzt genau einen
  eindeutigen Eigentümer. Zu entfernende private Inhalte sind entfernt und jede
  Übertragung ist nachvollziehbar. Ein an die Plattform übertragener privater
  Inhalt ist weiterhin privat.
- **Fehler und Ausnahmen:** Eine Bandlöschung ohne eindeutigen Nachfolger für
  verbleibende Inhalte wird abgelehnt. Mehrdeutige Eigentumszuordnung,
  unkontrollierte Check-outs oder unvollständige Übertragung dürfen nicht als
  erfolgreiche Löschung erscheinen.
- **Security und Offline:** Sichtbarkeit und Berechtigungen werden durch die
  Eigentumsübertragung nicht still erweitert. Lokale Daten folgen zusätzlich
  `OQ-007`, `OQ-008` und `WF-015`.

## WF-018: Gemeinsam bearbeitbaren Inhalt oder Overlay auschecken

- **Ausgangszustand:** Der Benutzer ist verbunden, besitzt das erforderliche
  Bearbeitungsrecht und möchte einen gemeinsam verwalteten Inhalt oder ein
  Band- beziehungsweise globales Overlay bearbeiten.
- **Beteiligte Rollen:** Inhaltsredakteure, Inhaltseigentümer,
  Bandadministratoren und direkt berechtigte Personen im jeweils erlaubten
  Umfang.
- **Normaler Ablauf:** SoSeBaMa prüft den aktuellen Stand und vergibt den
  Check-out an den ersten berechtigten Benutzer, sofern kein anderer wirksamer
  Check-out besteht. Der Benutzer bearbeitet und speichert den Gegenstand oder
  beendet den Check-out bewusst.
- **Erwartetes Ergebnis:** Genau ein Benutzer kann den bezeichneten Gegenstand
  gleichzeitig bearbeiten. Nach erfolgreichem Speichern ist die Änderung
  nachvollziehbar und der Check-out beendet oder eindeutig weitergeführt.
- **Fehler und Ausnahmen:** Ein späterer Bearbeitungsversuch wird blockiert.
  Verliert der Bearbeiter seine Rechte oder wurde der Check-out administrativ
  zurückgenommen, darf er nicht speichern und muss den aktuellen Stand neu
  laden. Stilles Überschreiben und automatisches Zusammenführen sind
  ausgeschlossen.
- **Security und Offline:** Es gilt **first come, first save**. Ein berechtigter
  Bandadministrator darf einen Check-out ausschließlich im eigenen
  Bandbereich bewusst und nachvollziehbar zurücknehmen. Die Rücknahme ist für
  den bisherigen Bearbeiter sichtbar und darf keinen stillen Datenverlust
  verursachen. Gemeinsame Bearbeitung ist ohne Verbindung nicht zulässig.

## Abdeckungsregel

Funktionale Anforderungen aus
[Funktionaler Scope](FUNCTIONAL-SCOPE.md),
[Qualitätsanforderungen](QUALITY-ATTRIBUTES.md) und
[Security-Anforderungen](SECURITY-REQUIREMENTS.md) gelten auch dann, wenn ein
Ablauf sie nicht einzeln wiederholt. Neue Kernabläufe erhalten die nächste
freie `WF-xxx`-Kennung; bestehende Kennungen werden nicht umgedeutet.
