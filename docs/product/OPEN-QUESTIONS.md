# Produktfragen und Entscheidungen

## Status und Entscheidungsregel

Dieses Dokument konkretisiert offene und inzwischen entschiedene Produktfragen
aus GitHub-Issue #3.

Einträge ohne ausdrücklich abweichenden Status sind **Offen**. Optionen offener
Einträge sind keine Empfehlung oder Eigentümerentscheidung. Entschiedene
Einträge bleiben unter ihrer stabilen `OQ-xxx`-Kennung erhalten und
dokumentieren die tatsächliche Produktentscheidung sowie ihre Auswirkungen.

## Statusübersicht

**Entschieden:** `OQ-001`, `OQ-002`, `OQ-003`, `OQ-012`, `OQ-013`, `OQ-021`.

**Offen:** `OQ-004` bis `OQ-011` sowie `OQ-014` bis `OQ-020`.

Die entschiedenen Fragen definieren verbindliche Grenzen für alle offenen
Optionen. Eine spätere Entscheidung darf insbesondere das Song- und
Inhaltsmodell, private Overlays, die Bandbereichstrennung, den Check-out-Schutz
oder die Setlist-Historisierung nicht still abschwächen.

## Fragen

### OQ-001: Mitgliedschaft in mehreren Bandbereichen

**Entscheidungsstatus:** Entschieden durch die Eigentümerentscheidung zur
Bandbereichsstruktur.

**Produktentscheidung:** Ein Benutzer kann gleichzeitig Mitglied mehrerer Bands
und damit mehrerer Bandbereiche sein.

Bandbezogene Rollen und Rechte werden für jeden Bandbereich getrennt
ausgewertet. Eine Mitgliedschaft oder höhere Rolle in einer Band vermittelt
keine Rechte in einer anderen Band. Ausdrücklich globale Rollen und Rechte
bleiben davon getrennt.

**Auswirkungen:** Navigation, Berechtigungsprüfung, Offlineauswahl,
Konfliktanzeige und Datentrennung müssen den aktiven Bandbereich eindeutig
anzeigen. Mehrfachmitgliedschaft darf keine stillen Querzugriffe oder
Rechteübertragung zwischen Bands erzeugen.

### OQ-002: Anzahl Bandbereiche je Installation

**Entscheidungsstatus:** Entschieden durch die Eigentümerentscheidung zur
Bandbereichsstruktur.

**Produktentscheidung:** Eine Installation kann mehrere fachlich und
berechtigungsseitig getrennte Bandbereiche enthalten.

Jede Band besitzt genau einen Bandbereich und jeder Bandbereich gehört genau
einer Band. Die Entscheidung legt keine technische Mandanten-, Datenbank- oder
Deploymentarchitektur fest.

**Auswirkungen:** Administration, Navigation, Ressourcenplanung,
Berechtigungsprüfung, Offlineauswahl und Datenzugriff müssen mehrere strikt
getrennte Bandbereiche berücksichtigen.

### OQ-003: Standardsichtbarkeit neuer Inhalte

**Entscheidungsstatus:** Entschieden durch die Produktentscheidung aus
GitHub-Issue #5 und die Review-Präzisierung in Pull Request #6.

**Produktentscheidung:** Neue Inhalte sind standardmäßig privat. Jeder Benutzer
darf in seinen persönlichen Einstellungen privat, eine bestimmte Band oder
öffentlich als persönliche Standardsichtbarkeit hinterlegen. Bei jeder
Erstellung darf diese Voreinstellung überschrieben werden.

Eine Band darf nur gewählt werden, wenn der Benutzer in ihrem Bandbereich die
erforderliche Veröffentlichungsberechtigung besitzt. Verliert der Benutzer
diese Berechtigung, darf die Band nicht weiter als Ziel der
Standardsichtbarkeit verwendet werden.

**Abgrenzung:** Inhaltssichtbarkeit und Overlay-Auswahl sind getrennte
fachliche Dimensionen. `OQ-003` trifft keine Entscheidung über ein
Standard-Overlay.

**Auswirkungen:** Erstellung, persönliche Einstellungen und Rechteentzug müssen
die wirksame Standardsichtbarkeit eindeutig zeigen. Eine ungültig gewordene
Band darf keine stille Bandpublikation auslösen. Eigentum, Overlay-Auswahl und
Bearbeitungsberechtigungen bleiben getrennt.

### OQ-004: Detailmatrix für Rollen und Direktrechte

**Bereits entschieden:**

- Rechte erlauben konkret benannte fachliche Aktionen.
- Rollen bündeln mehrere Rechte und können mehreren Personen zugewiesen werden.
- Rollen gelten entweder global oder innerhalb genau eines Bandbereichs.
- Rechte können zusätzlich unmittelbar einzelnen Personen als Direktrechte
  zugewiesen werden.
- SoSeBaMa stellt Standardrollen mit Standardrechten bereit.
- Bandbezogene Standardrechte dürfen pro Band angepasst werden.
- Eine Band darf globale Rollen und globale Rechte nicht verändern.
- Mitgliedschaft, Sichtbarkeit und Eigentum vermitteln keine nicht ausdrücklich
  vorhandenen Änderungsrechte.
- Gemeinsam bearbeitbare Inhalte und Overlays benötigen bei bestehender
  Verbindung einen wirksamen Check-out.
- Ein berechtigter Bandadministrator darf Check-outs ausschließlich im eigenen
  Bandbereich nachvollziehbar zurücknehmen.

**Offene Fragen:**

1. Welche abschließenden Standardrollen werden bereitgestellt?
2. Welche Standardrechte besitzt jede dieser Rollen?
3. Dürfen Direktrechte Rollenrechte nur ergänzen oder auch ausdrücklich
   einschränken?
4. Wie wird ein Konflikt zwischen Rollenrecht, Direktrecht,
   Eigentumsbeschränkung und objektbezogener Freigabe fachlich aufgelöst?
5. Welche administrativen Rechte dürfen Bandadministratoren delegieren?
6. Welche zusätzlichen Zustimmungen oder Schutzgrenzen gelten für Löschen,
   Eigentumsübertragung, Veröffentlichung und globale Overlays?
7. Welche Rollen dürfen Check-outs außer dem eigenen beenden oder
   administrativ zurücknehmen?

**Zu entscheiden:** Eine spätere Rollen- und Aktionsmatrix ordnet die
unterschiedenen Rechte den Standardrollen zu und definiert die Konflikt- und
Delegationsregeln. Bis dahin entsteht aus einer Rollenbezeichnung kein nicht
ausdrücklich dokumentiertes Recht.

**Auswirkungen:** Autorisierung, Bedienbarkeit, Nachvollziehbarkeit,
Administration, Offlineverhalten und Testumfang. Die offene Detailentscheidung
darf Bandbereichsgrenzen, private Overlays, Eigentumsgrenzen, Check-out-Schutz
oder bereits beschlossene Zustimmungspflichten nicht abschwächen.

### OQ-005: Konkreter erster MVP-Zuschnitt

**Frage:** Welcher zusätzliche fachliche Funktionsschnitt ergänzt die in
[Funktionaler Scope](FUNCTIONAL-SCOPE.md) verbindlich festgelegte Basis
`FR-001` bis `FR-007` zum ersten produktiv nutzbaren MVP?

**Feststehende Grenzen:**

- Die verbindliche Basis und die Querschnittsanforderungen `FR-058` bis
  `FR-060` gehören zu jeder Variante.
- Mehrfachmitgliedschaft, mehrere Bandbereiche und die Eins-zu-eins-Zuordnung
  von Band und Bandbereich sind durch `FR-054`, `FR-055`, `OQ-001`, `OQ-002`
  und `OQ-021` entschieden.
- `FR-047` bis `FR-053` bleiben ausdrücklich ausgeschlossen.
- `FR-056` und `FR-057` bleiben offene Produktgrenzen.
- Gemeinsame Onlinebearbeitung folgt unabhängig von der Variante dem
  verbindlichen Check-out-Modell mit first come, first save.
- Gemeinsame Inhalte sowie Band- und globale Overlays dürfen nicht offline
  kollaborativ bearbeitet werden.
- Keine Variante legt eine Technologie fest oder gilt ohne
  Eigentümerentscheidung als beschlossen.

#### Variante A: PDF- und Setlist-Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060`, grundlegende Zusammenarbeit
  `FR-008` bis `FR-009`, Song- und Inhaltsverwaltung `FR-011` bis `FR-014`,
  PDF-Funktionen `FR-015` bis `FR-020`, Setlists `FR-028` bis `FR-032` sowie
  lesender Offlinebetrieb mit Status und kontrollierter lokaler Entfernung
  `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  Text-/Chord-Funktionen `FR-021` bis `FR-027`, private
  Offlineänderungswarteschlange und Konfliktbehandlung `FR-035` bis `FR-036`
  sowie spätere Erweiterungen `FR-038` bis `FR-046`.
- **Offene Abhängigkeiten:** `OQ-004`, `OQ-006` bis `OQ-008`, `OQ-010`,
  `OQ-011`, `OQ-015` und `OQ-016`.
- **Produktiver Nutzen:** Eine Band kann Songs, PDF-Inhalte, mehrere Overlays
  und Setlists gemeinsam verwalten und für Probe oder Auftritt vorbereiten.
  Berechtigte Mitglieder können PDFs online annotieren und vorbereitete Inhalte
  ohne Netzwerk lesen.
- **Fachliche Hauptrisiken:** Rollen- und Aktionsmatrix, verständliche
  Overlay-Auswahl und eingeschränkter Nutzen für Mitglieder, die überwiegend
  mit Text-/Chord-Inhalten arbeiten.
- **Technische Hauptrisiken:** sichere Dateiverarbeitung, Originalerhalt,
  Touch- und Stifteignung sowie zuverlässige lesende Offlinebereitstellung.
- **Lieferreihenfolge:** Zusammenarbeit und Songs, danach PDF-Inhalte und
  Overlays, anschließend Setlists und lesender Offlinebetrieb.

#### Variante B: Text-/Chord- und Setlist-Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060`, grundlegende Zusammenarbeit
  `FR-008` bis `FR-009`, Song- und Inhaltsverwaltung `FR-011` bis `FR-014`,
  Text-/Chord-Funktionen `FR-021` bis `FR-027`, Setlists `FR-028` bis `FR-032`
  sowie lesender Offlinebetrieb mit Status und kontrollierter lokaler
  Entfernung `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  PDF-Funktionen `FR-015` bis `FR-020`, private
  Offlineänderungswarteschlange und Konfliktbehandlung `FR-035` bis `FR-036`
  sowie spätere Erweiterungen `FR-038` bis `FR-046`.
- **Offene Abhängigkeiten:** `OQ-004`, `OQ-006` bis `OQ-008`, `OQ-010`,
  `OQ-011`, `OQ-015` und `OQ-016`.
- **Produktiver Nutzen:** Songs, Text-/Chord-Inhalte, Transpositions- und
  Chord-Overlays sowie Setlists können bei Probe oder Auftritt mit Autoscroll
  genutzt werden.
- **Fachliche Hauptrisiken:** uneinheitliche Chord-Schreibweisen,
  Rollenabgrenzung und geringerer Nutzen für Bands mit überwiegend
  PDF-basiertem Repertoire.
- **Technische Hauptrisiken:** zuverlässige Chord-Erkennung, kontrollierte
  Transposition, Importgrenzen, Autoscroll und konsistente Darstellung.
- **Lieferreihenfolge:** Zusammenarbeit und Songs, danach Text-/Chord-Inhalte
  und Overlays, anschließend Setlists und lesender Offlinebetrieb.

#### Variante C: Integrierter Grundumfang

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060`, grundlegende Zusammenarbeit
  `FR-008` bis `FR-009` sowie Song-, PDF-, Text-/Chord-, Setlist- und
  Offline-/Synchronisationsfunktionen `FR-011` bis `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`
  und sämtliche späteren Erweiterungen `FR-038` bis `FR-046`. Offline
  entstehende Änderungen bleiben auf die durch `OQ-006` ausdrücklich
  freigegebenen privaten Objekte und Aktionen begrenzt.
- **Offene Abhängigkeiten:** `OQ-004`, `OQ-006` bis `OQ-008`, `OQ-010`,
  `OQ-011`, `OQ-015` und `OQ-016`.
- **Produktiver Nutzen:** Eine Band erhält einen durchgängigen Grundumfang für
  PDF-, Text-/Chord-, Overlay- und Setlistnutzung mit sichtbaren Offline- und
  Synchronisationszuständen.
- **Fachliche Hauptrisiken:** Der breite Funktionsschnitt kann Bedienkonzepte,
  Rollenabgrenzung und private Offlinekonflikte gleichzeitig überlasten.
- **Technische Hauptrisiken:** größter Integrations- und Testaufwand durch
  Dateiverarbeitung, musikalische Darstellung, Overlays, Check-outs und
  kontrollierte Synchronisation.
- **Lieferreihenfolge:** gemeinsame Basis und Songs, danach lesende PDF- und
  Text-/Chord-Pfade, anschließend Overlays und Setlists, zuletzt ausdrücklich
  freigegebene private Offlineänderungen.

**Entscheidungsstatus:** Offen. Der Projekteigentümer wählt, verwirft oder
verändert eine Variante in einem separaten freigegebenen
Produktentscheidungsarbeitspaket.

### OQ-006: Offline zulässige private Änderungen im MVP

**Frage:** Welche Änderungen an eigenen privaten Objekten dürfen ohne Netzwerk
entstehen?

Gemeinsam verwaltete Inhalte sowie Band- und globale Overlays sind von dieser
Entscheidung ausgeschlossen. Sie benötigen bei bestehender Verbindung einen
wirksamen Check-out und dürfen offline nicht kollaborativ bearbeitet werden.

**Optionen:**

1. **Ausschließlich lesend:** Offline entstehen keine Änderungen.
2. **Nur private Overlays:** Eigene private Annotationen, Notizen,
   Transpositionen und Chord-Anpassungen dürfen offline entstehen.
3. **Erweiterte private Bearbeitung:** Zusätzlich zu privaten Overlays dürfen
   ausdrücklich freigegebene Änderungen an eigenen privaten Inhalten und an
   Setlists im alleinigen Eigentum des Benutzers offline entstehen, soweit
   die erforderlichen Rechte fortbestehen.

**Auswirkungen:** Warteschlange, Konfliktbehandlung, Bedienbarkeit bei
Auftritten, Speicherbedarf und Risiko nicht übertragener privater Änderungen.
Die Entscheidung erweitert keine Rechte an Band- oder globalen Objekten.

### OQ-007: Dauer einer offline verwendbaren Sitzung

**Frage:** Wie lange darf eine bereits bestätigte Sitzung ohne erneute
Verbindung verwendbar bleiben?

**Optionen:** kurze feste Frist; ereignisabhängige Frist; begrenzte
Offlineberechtigung je vorbereiteter Veranstaltung.

**Auswirkungen:** Nutzbarkeit ohne Netzwerk, Durchsetzung von Rechteentzug und
Risiko bei Geräteverlust. Ein konkreter Wert ist noch nicht beschlossen.

### OQ-008: Lokale Daten nach Rechteentzug

**Frage:** Wann und wie werden lokale Inhalte, Overlays und ausstehende private
Änderungen nach Rechteentzug behandelt?

**Optionen:** sofort sperren und kontrolliert entfernen; kurze, nicht
verlängerbare Übergangsfrist; administrative Klärung ausstehender privater
Änderungen ohne weiteren Zugriff auf den entzogenen Inhalt.

**Auswirkungen:** Datenschutz, Verlust noch nicht synchronisierter privater
Arbeit, Nachvollziehbarkeit und Verhalten bei länger offline befindlichen
Geräten. Ein früherer Check-out oder lokaler Stand darf keine entzogenen Rechte
wiederherstellen.

### OQ-009: Erreichbarkeit von TST

**Frage:** Muss TST ausschließlich in einem privaten Betriebsnetz erreichbar
bleiben?

**Optionen:** ausschließlich privater Zugang; separat freigegebener gehärteter
Zugang für benannte Prüfrollen.

**Auswirkungen:** Netzwerkgrenzen, Testzugänglichkeit und Betriebsaufwand. Die
Entscheidung benötigt gegebenenfalls ein separates Architektur- und
Betriebsarbeitspaket.

### OQ-010: Unterstützte Geräte und Browsergenerationen

**Frage:** Welche Geräteklassen und Browsergenerationen werden verbindlich
unterstützt?

**Optionen:** enger geprüfter Korridor; breiter Korridor mit abgestuften
Funktionszusagen.

**Auswirkungen:** Testmatrix, Touch- und Stiftqualität, Offlineverhalten und
Wartungsaufwand.

### OQ-011: Messbare Reaktions- und Performanceziele

**Frage:** Welche messbaren Zielwerte gelten für Anzeige, Suche, Navigation,
Autoscroll, Offlineöffnung und Synchronisationsfeedback?

**Optionen:** Zielwerte je Kernablauf; abgestufte Ziele nach Geräteklasse;
gemeinsamer Basiskorridor.

**Auswirkungen:** Abnahmekriterien, Ressourcenbedarf und Gerätekompatibilität.
Es ist noch kein Zahlenwert beschlossen.

### OQ-012: Verhältnis von Song, Inhalt und Änderungshistorie

**Entscheidungsstatus:** Entschieden durch die aktuelle Eigentümerentscheidung
zum Song- und Inhaltsmodell.

**Produktentscheidung:** Ein Song ist der normalisierte fachliche
Metadateneintrag für ein Musikstück. Ein konkreter Inhalt ist genau einem Song
zugeordnet und kann insbesondere ein PDF oder ein Text-/Chord-Inhalt sein.

Ein Song kann mehreren konkreten Inhalten zugrunde liegen. Ein Inhalt darf
eigene Metadaten besitzen, die von den normalisierten Songmetadaten abweichen.

Songs und Inhalte werden nicht in auswählbaren Fassungen, Versionen oder
Revisionen geführt. Jeder Inhalt besitzt genau einen aktuellen Stand. Fachlich
relevante Änderungen werden ausschließlich über eine nachvollziehbare
Änderungshistorie festgehalten.

**Auswirkungen:** Erstellung, Suche, Metadatenanzeige, Bearbeitung und
Historisierung müssen Song und konkreten Inhalt eindeutig unterscheiden. Eine
Änderungshistorie darf keine frühere Fassung als auswählbaren Inhalt,
Setlisteintrag oder alternatives Original verfügbar machen. Die Entscheidung
legt weder Speichertechnik noch Datenbankschema fest.

### OQ-013: Historisierung von Setlists

**Entscheidungsstatus:** Entschieden durch die aktuelle Eigentümerentscheidung
zum Setlistmodell.

**Produktentscheidung:** Eine Setlist enthält eine geordnete Auswahl konkreter
Inhalte. Sie besitzt genau einen aktuellen Stand und eine vollständige
Änderungshistorie. Sie wird nicht in parallel auswählbaren Versionen geführt und
verwendet keine Rolling-, Pinned- oder sonstigen Referenzstrategien.

Für einen unabhängigen neuen Planungsstand wird die Setlist bewusst kopiert. Die
Kopie besitzt eigenes Eigentum und eine eigene Änderungshistorie. Zugeordnete
Inhalte und Overlays werden dabei nicht kopiert.

**Auswirkungen:** Frühere Änderungen bleiben nachvollziehbar, während der
aktuelle Setliststand eindeutig bleibt. Eigentümer ist ein Benutzer oder eine
Band; bei Bandeigentum richtet sich die Bearbeitung nach den wirksamen Rollen
und Direktrechten des Bandbereichs. Offlineabgleich, Speicherbedarf und
Bedienung berücksichtigen die vollständige Historie, ohne ein technisches
Verfahren festzulegen.

### OQ-014: Export von Inhalten und Overlays

**Frage:** Ist Export Bestandteil des MVP und welche Inhalte oder Overlays
dürfen exportiert werden?

**Optionen:**

1. kein Export im MVP,
2. Export ausschließlich eigener privater Overlays,
3. kontrollierter Export ausdrücklich freigegebener Inhalte und Overlays mit
   eigener Exportberechtigung.

**Auswirkungen:** Urheberrecht, Datenschutz, Rechteprüfung, Bandbereichsgrenzen,
sichere Dateierzeugung und nachvollziehbare Weitergabe. Sichtbarkeit oder
Leserecht allein vermittelt kein Exportrecht.

### OQ-015: Erster Zielbetrieb

**Frage:** Soll der erste produktive Einsatz trotz Unterstützung mehrerer
Bandbereiche zunächst auf genau einen aktiv genutzten Bandbereich begrenzt
werden?

**Optionen:** zunächst ein produktiv genutzter Bandbereich mit nachgewiesener
späterer Mehrfachnutzung; mehrere Bandbereiche bereits im ersten produktiven
Einsatz.

**Auswirkungen:** MVP-Zuschnitt, Administration, Testfälle, Ressourcenbedarf
und erforderlicher Nachweis der Bandbereichstrennung. Die fachliche Fähigkeit
zu mehreren Bandbereichen ist durch `OQ-001`, `OQ-002` und `OQ-021` bereits
entschieden.

### OQ-016: Ressourcenbudget auf der Synology

**Frage:** Welche messbaren Obergrenzen gelten für Ressourcenverbrauch und
Speicherwachstum im vorgesehenen Betrieb?

**Optionen:** Budget je aktivem Benutzer; Budget je Bandbereich; gemeinsam
definierter Betriebskorridor.

**Auswirkungen:** Kapazitätsprüfung, Beobachtbarkeit und spätere
Technologiebewertung. Es ist noch kein Wert beschlossen.

### OQ-017: Zielniveau der Barrierearmut

**Frage:** An welchem überprüfbaren Zielniveau wird Barrierearmut gemessen?

**Optionen:** definierter Basiskatalog für Kernabläufe; weitergehender
Prüfkatalog für alle vorgesehenen Ansichten.

**Auswirkungen:** Akzeptanzkriterien, Gestaltung, Testumfang und unterstützte
Bedienhilfen.

### OQ-018: Wiederherstellungsziele

**Frage:** Welche messbaren Ziele gelten für tolerierbaren Datenverlust und
Wiederherstellungsdauer?

**Optionen:** gemeinsame Ziele für alle fachlichen Daten; strengere Ziele für
zentrale Inhalte als für erneut erzeugbare lokale Kopien.

**Auswirkungen:** Betriebs-, Sicherungs- und Verifikationskonzept. Konkrete
Werte bleiben einem späteren freigegebenen Arbeitspaket vorbehalten.

### OQ-019: Sicherheitsrelevante Nachweisaufbewahrung

**Frage:** Welche sicherheitsrelevanten Ereignisse werden wie lange für
berechtigte Prüfungen aufbewahrt?

**Optionen:** minimaler Ereignissatz mit kurzer Frist; risikobasierte Fristen je
Ereignisklasse.

**Auswirkungen:** Datenschutz, Aufklärbarkeit, Ressourcenverbrauch und
Betriebsverantwortung. Inhalte und Fristen sind noch nicht entschieden.

### OQ-020: Einsatz eines zusätzlichen Authentifizierungsfaktors

**Frage:** Für welche Rollen oder Situationen soll ein optionaler zusätzlicher
Faktor angeboten oder verlangt werden?

**Optionen:** freiwillig für alle; verbindlich für privilegierte Rollen;
risikobasiert nach geschützter Aktion.

**Auswirkungen:** Schutzwirkung, Zugänglichkeit, Wiederherstellung und
Bedienaufwand. Weder Produkt noch Verfahren sind festgelegt.

### OQ-021: Fachliche Zuordnung von Band und Bandbereich

**Entscheidungsstatus:** Entschieden durch die Eigentümerentscheidung zur
Bandbereichsstruktur.

**Produktentscheidung:**

- Jede Band besitzt genau einen Bandbereich.
- Jeder Bandbereich gehört genau einer Band.
- Eine Installation kann mehrere Bandbereiche enthalten.
- Ein Benutzer kann Mitglied mehrerer Bands und Bandbereiche sein.
- Bandbezogene Rollen und Rechte werden je Bandbereich getrennt ausgewertet.
- Ausdrücklich globale Rollen und Rechte bleiben davon getrennt.

Der Bandbereich ist die fachliche Verwaltungs-, Mitgliedschafts- und
Berechtigungsgrenze der zugehörigen Band. Er ist kein zusätzlicher
Organisationstyp neben der Band.

**Auswirkungen:**

- **Rollen und Berechtigungen:** Bandrollen gelten immer innerhalb genau eines
  Bandbereichs.
- **Navigation:** Der aktive Bandbereich muss bei Mehrfachmitgliedschaft
  eindeutig erkennbar sein.
- **Song-, Inhalts- und Setlistzuordnung:** private Objekte benötigen keine
  Bandzuordnung; bandbezogene Sichtbarkeit und Verwaltung werden dem jeweiligen
  Bandbereich zugeordnet.
- **Offlineauswahl:** Auswahl, Rechteentzug und lokale Behandlung müssen den
  Bandbereich berücksichtigen.
- **Daten- und Inhaltsgrenzen:** Querzugriffe zwischen Bandbereichen sind
  unzulässig.
- **Technologieoffenheit:** Die Entscheidung legt keine konkrete Mandanten-,
  Datenbank-, Speicher- oder Deploymentarchitektur fest.
