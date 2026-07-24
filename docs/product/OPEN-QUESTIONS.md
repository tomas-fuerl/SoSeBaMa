# Offene Produktfragen

## Status und Entscheidungsregel

Dieses Dokument konkretisiert offene und inzwischen entschiedene Produktfragen
aus GitHub-Issue #3. Einträge ohne ausdrücklich abweichenden Status sind
**Offen**. Optionen offener Einträge sind keine Empfehlung oder
Eigentümerentscheidung. Entschiedene Einträge bleiben unter ihrer stabilen
`OQ-xxx`-Kennung erhalten und dokumentieren die tatsächliche Produktentscheidung
sowie ihre Auswirkungen nachvollziehbar.

## Fragen

### OQ-001: Mitgliedschaft in mehreren Arbeitsbereichen

**Frage:** Kann ein Benutzer gleichzeitig Mitglied mehrerer Arbeitsbereiche
sein?

**Optionen:** genau ein Arbeitsbereich je Benutzer; mehrere Arbeitsbereiche mit
getrennten Rollen.

**Auswirkungen:** Navigation, Berechtigungsprüfung, Offlineauswahl,
Konfliktanzeige und Datentrennung werden bei Mehrfachmitgliedschaft komplexer.

### OQ-002: Anzahl Arbeitsbereiche je Installation

**Frage:** Unterstützt eine Installation genau einen oder mehrere
Arbeitsbereiche?

**Optionen:** Einzelarbeitsbereich; mehrere strikt getrennte Arbeitsbereiche.

**Auswirkungen:** Fachliche Trennung, Administration, Ressourcenplanung und
spätere Betriebsanforderungen. Die Option legt noch keine Architektur fest.
Diese Frage entscheidet ausschließlich über die Anzahl der Arbeitsbereiche je
Installation; die fachliche Zuordnung von Band und Arbeitsbereich klärt
`OQ-021`.

### OQ-003: Standardsichtbarkeit neuer Inhalte

**Entscheidungsstatus:** Entschieden durch die Produktentscheidung aus
GitHub-Issue #5 und die Review-Präzisierung in Pull Request #6.

**Produktentscheidung:** Neue Inhalte sind standardmäßig privat. Jeder Benutzer
darf in seinen persönlichen Einstellungen privat, eine bestimmte Gruppe oder
öffentlich als persönliche Standardsichtbarkeit hinterlegen. Bei jeder
Erstellung darf diese Voreinstellung überschrieben werden. Eine Gruppe darf nur
gewählt werden, wenn der Benutzer dort die erforderliche
Veröffentlichungsberechtigung besitzt. Verliert der Benutzer diese
Berechtigung, darf die Gruppe nicht weiter als Ziel der Standardsichtbarkeit verwendet werden.

**Abgrenzung:** Inhaltssichtbarkeit und Ziel eines Overlays sind getrennte
fachliche Dimensionen. `OQ-003` trifft keine Entscheidung über ein
Standard-Overlay-Ziel. Eine solche offene Frage wird derzeit nicht benötigt und
daher nicht unter einer neuen Kennung angelegt.

**Auswirkungen:** Erstellung, persönliche Einstellungen und Rechteentzug müssen
die wirksame Standardsichtbarkeit eindeutig zeigen. Eine ungültig gewordene
Gruppe darf keine stille Gruppenpublikation auslösen. Eigentum, Overlay-Ziel und
Bearbeitungsberechtigungen bleiben unverändert getrennt.

### OQ-004: Detailumfang der Inhaltsverwaltung durch Gruppenrollen

**Bereits entschieden:** In einer Gruppe publizierte Inhalte dürfen durch den
ursprünglichen Ersteller, Gruppenadministratoren und weitere Gruppenrollen mit
ausdrücklicher Inhaltsberechtigung verwaltet werden. Bearbeiten, neue Revision,
Sichtbarkeitsänderung auslösen oder beantragen, Freigabeverwaltung,
Archivieren, Löschen sowie die Zuweisung von Mitverantwortlichen oder
berechtigten Rollen sind getrennte Aktionen.

Gruppenrollen ersetzen keine inhaltsbezogene Einschränkung durch den
Eigentümer. Für neue Revisionen müssen Eigentümererlaubnis und konkretes
Gruppenrecht gleichzeitig vorliegen. Spätere Änderungen der Sichtbarkeit oder
Gruppenzuordnung eines gruppenpublizierten Inhalts benötigen die
nachvollziehbare Zustimmung eines Gruppenadministrators.

**Offene Frage:** Welche weiteren Gruppenrollen dürfen für welche Inhaltsarten
welche der getrennten Verwaltungsaktionen ausführen, und welche zusätzlichen
inhaltsbezogenen Grenzen gelten für Archivieren, Löschen und die Zuweisung von
Mitverantwortlichen?

**Zu entscheiden:** Die spätere Rollenmatrix ordnet ausdrücklich benannte
Gruppenrollen den einzelnen Verwaltungsaktionen zu. Bis dahin entsteht aus
einer allgemeinen Gruppenrolle kein nicht ausdrücklich dokumentiertes Recht.

**Auswirkungen:** Rollenmodell, Nachvollziehbarkeit, Konfliktrisiko und Aufwand
für Freigaben. Die offene Detailentscheidung darf weder die Gruppenadmin-
Zustimmung für Publikationsänderungen noch die doppelte Prüfung für Revisionen
abschwächen.

### OQ-005: Konkreter erster MVP-Zuschnitt

**Frage:** Welcher zusätzliche fachliche Funktionsschnitt ergänzt die in
[Funktionaler Scope](FUNCTIONAL-SCOPE.md) verbindlich festgelegte Basis
`FR-001` bis `FR-007` zum ersten produktiv nutzbaren MVP?

Die verbindliche Basis sowie die Querschnittsanforderungen `FR-058` bis
`FR-060` gehören zu jeder Variante und können durch diese Entscheidung weder
abgewählt noch verschoben werden. `FR-047` bis `FR-053`
bleiben ausdrücklich ausgeschlossen; `FR-054` bis `FR-057` bleiben offene
Produktgrenzen. Keine Variante legt eine Technologie fest oder gilt ohne
Eigentümerentscheidung als beschlossen.

#### Variante A: Dokumentenorientierter Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060` und grundlegende
  Zusammenarbeit `FR-008` bis `FR-009`, Songverwaltung `FR-011` bis `FR-014`,
  PDF-Anzeige und -Annotation `FR-015` bis `FR-020`, Setlists `FR-028` bis
  `FR-032` sowie lesender Offlinebetrieb mit Status und kontrollierter lokaler
  Entfernung `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  Text- und Akkordfunktionen `FR-021` bis `FR-027`, Offline-
  Änderungswarteschlange und Konfliktbehandlung `FR-035` bis `FR-036` sowie
  spätere Erweiterungen `FR-038` bis `FR-046`.
- **Abhängigkeiten:** `OQ-001`, `OQ-002`, `OQ-004`, `OQ-006` bis `OQ-008`,
  `OQ-010`, `OQ-011`, `OQ-015` und `OQ-021`; insbesondere müssen Rollen,
  Offlinefrist und Band-Arbeitsbereich-Zuordnung geklärt werden.
- **Produktiver Nutzen:** Eine Band oder ein Ensemble kann Songs, PDF-Dokumente
  und Setlists gemeinsam verwalten und für Probe oder Auftritt vorbereiten.
  Berechtigte Mitglieder können PDFs online grundlegend annotieren und
  vorbereitete Unterlagen ohne Netzwerk lesen.
- **Fachliche Hauptrisiken:** Die Bedienbarkeit von Fassungen und Revisionen,
  noch offene Detailrechte für Gruppenrollen sowie eingeschränkter Nutzen für
  Mitglieder, die primär mit Text- oder Akkordblättern arbeiten.
- **Technische Hauptrisiken:** sichere Dateiverarbeitung, Erhalt der
  Originaldokumente, Touch- und Stifteignung sowie konsistente lesende
  Offlinebereitstellung auf den später festgelegten Geräten.
- **Testumfang und Lieferreihenfolge:** zuerst Zusammenarbeit und Songs, danach
  PDF-Anzeige und Annotation, anschließend Setlist und lesender Offlinebetrieb.
  Der Schwerpunkt liegt auf Upload-Negativfällen, Dokumentrechten,
  Originalerhalt, Eingabegeräten und vollständiger Offlinevorbereitung.

#### Variante B: Text- und Setlist-Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060` und grundlegende
  Zusammenarbeit `FR-008` bis `FR-009`, Songverwaltung `FR-011` bis `FR-014`,
  Text- und Akkordfunktionen `FR-021` bis `FR-027`, Setlists `FR-028` bis
  `FR-032` sowie lesender Offlinebetrieb mit Status und kontrollierter lokaler
  Entfernung `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  PDF-Funktionen `FR-015` bis `FR-020`, Offline-Änderungswarteschlange und
  Konfliktbehandlung `FR-035` bis `FR-036` sowie spätere Erweiterungen
  `FR-038` bis `FR-046`.
- **Abhängigkeiten:** `OQ-001`, `OQ-002`, `OQ-004`, `OQ-006` bis `OQ-008`,
  `OQ-010`, `OQ-011`, `OQ-015` und `OQ-021`; insbesondere müssen
  Änderungsrechte, ein zunächst lesender Offlineumfang und die Zuordnung von
  Band und Arbeitsbereich geklärt werden.
- **Produktiver Nutzen:** Songs, Text- und Akkordblätter sowie Setlists können
  gemeinsam gepflegt und bei Probe oder Auftritt mit Transposition und
  Autoscroll genutzt werden; vorbereitete Inhalte bleiben lesend offline
  verfügbar.
- **Fachliche Hauptrisiken:** uneinheitliche Akkordschreibweisen, offene
  Bearbeitungsrechte und geringerer Nutzen für Bands, deren Repertoire
  überwiegend als PDF vorliegt.
- **Technische Hauptrisiken:** zuverlässige Akkorderkennung und Transposition,
  kontrollierter Import, vorhersehbares Autoscroll und konsistente Darstellung
  auf den später unterstützten Geräten.
- **Testumfang und Lieferreihenfolge:** zuerst Zusammenarbeit und Songs, danach
  Text-/Akkordstruktur, Transposition und Autoscroll, anschließend Setlist und
  lesender Offlinebetrieb. Der Schwerpunkt liegt auf musikalischer Korrektheit,
  Importgrenzen, Rollen, Bedienung und Offlinevollständigkeit.

#### Variante C: Integrierter Grundumfang

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`,
  Querschnittsanforderungen `FR-058` bis `FR-060` und grundlegende
  Zusammenarbeit `FR-008` bis `FR-009` sowie Song-, PDF-, Text-/Akkord-,
  Setlist- und Offline-/Synchronisationsfunktionen `FR-011` bis `FR-037`.
  Gemeinsame und Offlinebearbeitung bleiben auf die später ausdrücklich
  freigegebenen Änderungstypen begrenzt.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`
  und sämtliche späteren Erweiterungen `FR-038` bis `FR-046`. Weitergehende
  gemeinsame oder Offlinebearbeitung ist ohne Entscheidungen zu `OQ-004` und
  `OQ-006` nicht enthalten.
- **Abhängigkeiten:** `OQ-001`, `OQ-002`, `OQ-004`, `OQ-006` bis `OQ-008`,
  `OQ-010`, `OQ-011`, `OQ-015` und `OQ-021`; diese Variante benötigt vor
  allem klare Grenzen für gemeinsame Änderungen, Offlineänderungen und
  Konfliktbehandlung.
- **Produktiver Nutzen:** Eine Band oder ein Ensemble erhält einen durchgängigen
  Grundumfang für PDF-, Text-/Akkord- und Setlistnutzung einschließlich gezielt
  begrenzter Offlineänderungen und sichtbarer Synchronisationskonflikte.
- **Fachliche Hauptrisiken:** Der breite Funktionsschnitt kann Bedienkonzepte,
  Rollenabgrenzung und fachliche Konfliktregeln zugleich überlasten.
- **Technische Hauptrisiken:** größter Integrations- und Testaufwand durch
  Dokumentverarbeitung, musikalische Bearbeitung und kontrollierte
  Synchronisation mehrerer Inhaltstypen; eine konkrete Umsetzung bleibt offen.
- **Testumfang und Lieferreihenfolge:** zunächst gemeinsame Basis und Songs,
  dann lesende PDF- und Textpfade, danach Setlists, Bearbeitung und zuletzt die
  begrenzten Offlineänderungs- und Konfliktfälle. Diese Variante benötigt die
  breiteste Rechte-, Geräte-, Fehler-, Offline- und Regressionsmatrix.

**Entscheidungsstatus:** Offen. Der Projekteigentümer wählt, verwirft oder
verändert eine Variante in einem separaten freigegebenen
Produktentscheidungsarbeitspaket.

### OQ-006: Offline zulässige Änderungen im MVP

**Frage:** Welche fachlichen Änderungen dürfen ohne Netzwerk entstehen?

**Optionen:** nur persönliche Annotationen; zusätzlich Text-, Akkord- und
Setliständerungen; Offlinebetrieb zunächst ausschließlich lesend.

**Auswirkungen:** Konfliktbehandlung, Warteschlange, Bedienbarkeit bei Auftritten
und Risiko nicht übertragener Änderungen.

### OQ-007: Dauer einer offline verwendbaren Sitzung

**Frage:** Wie lange darf eine bereits bestätigte Sitzung ohne erneute
Verbindung verwendbar bleiben?

**Optionen:** kurze feste Frist; ereignisabhängige Frist; begrenzte
Offlineberechtigung je vorbereiteter Veranstaltung.

**Auswirkungen:** Nutzbarkeit ohne Netzwerk, Durchsetzung von Rechteentzug und
Risiko bei Geräteverlust. Ein konkreter Wert ist noch nicht beschlossen.

### OQ-008: Lokale Daten nach Rechteentzug

**Frage:** Wann und wie werden lokale Inhalte und ausstehende Änderungen nach
Rechteentzug behandelt?

**Optionen:** sofort sperren und kontrolliert entfernen; kurze, nicht
verlängerbare Übergangsfrist; administrative Klärung ausstehender Änderungen
ohne weiteren Inhaltszugriff.

**Auswirkungen:** Datenschutz, Verlust noch nicht synchronisierter Arbeit,
Nachweisbarkeit und Verhalten bei länger offline befindlichen Geräten.

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

### OQ-012: Songfassungen und Revisionen

**Entscheidungsstatus:** Entschieden durch die Produktentscheidung aus
GitHub-Issue #5.

**Produktentscheidung:** Ein Song besitzt unterscheidbare Songfassungen. Jede
Songfassung führt ihre eigene Folge nachvollziehbarer Revisionen. Benutzer,
Gruppen und Setlists wählen für ihre zulässigen Referenzen zwischen Rolling
Reference auf die aktuelle Revision und Pinned Reference auf eine bestimmte
Revision. Eine Setlist legt immer aktuell oder stabil beziehungsweise
festgesetzt als Standardstrategie fest. Jeder Song erbt diese Strategie oder
überschreibt sie durch Rolling beziehungsweise ausdrücklich Pinned.

**Auswirkungen:** Fassungen, Revisionen und Referenzstrategie müssen eindeutig
erkennbar sein. Eine neue Revision verändert Rolling References, aber keine
Pinned References. Setliststandard, Vererbung und Eintragsüberschreibung
bleiben eindeutig; Setlists kopieren den referenzierten Songinhalt nicht. Das
legt weder Speichertechnik noch Datenbankschema fest.

### OQ-013: Historisierung oder Versionierung von Setlists

**Entscheidungsstatus:** Entschieden durch die Produktentscheidung aus
GitHub-Issue #5.

**Produktentscheidung:** Eine Setlist besitzt genau einen aktuellen Stand und
eine vollständige Änderungshistorie. Sie wird nicht in parallel auswählbaren
Versionen geführt. Für einen unabhängigen neuen Planungsstand wird die Setlist
kopiert; die Kopie besitzt eigenes Eigentum und eine eigene Änderungshistorie.
Die referenzierten Songinhalte werden dabei nicht kopiert.

**Auswirkungen:** Frühere Änderungen bleiben nachvollziehbar, während die
aktuelle Setlist eindeutig bleibt. Eigentümer ist ein Benutzer oder eine Gruppe;
bei Gruppeneigentum richtet sich die Bearbeitung nach den wirksamen
Gruppenrollen. Offlineabgleich, Speicherbedarf und Bedienung müssen die
vollständige Historie berücksichtigen, ohne ein technisches Verfahren
festzulegen.

### OQ-014: Export von Dokumenten und Annotationen

**Frage:** Ist Export Bestandteil des MVP und welche Inhalte dürfen exportiert
werden?

**Optionen:** kein MVP-Export; Export persönlicher Annotationen; kontrollierter
Export ausdrücklich freigegebener Inhalte.

**Auswirkungen:** Urheberrecht, Datenschutz, Rechteprüfung und sichere
Dateierzeugung.

### OQ-015: Erster Zielbetrieb

**Frage:** Ist eine Installation für genau eine Band der erste Zielbetrieb?

**Optionen:** zunächst eine Band mit späterer Erweiterbarkeit; von Beginn an
mehrere Arbeitsbereiche.

**Auswirkungen:** MVP-Zuschnitt, Administration und Testfälle. Die Entscheidung
ist von `OQ-001`, `OQ-002` und `OQ-021` abhängig.

### OQ-016: Ressourcenbudget auf der Synology

**Frage:** Welche messbaren Obergrenzen gelten für Ressourcenverbrauch und
Speicherwachstum im vorgesehenen Betrieb?

**Optionen:** Budget je aktivem Benutzer; Budget je Arbeitsbereich; gemeinsam
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

### OQ-021: Fachliche Zuordnung von Band und Arbeitsbereich

**Frage:** Entspricht ein Arbeitsbereich genau einer Band oder einem Ensemble,
kann eine Band mehrere Arbeitsbereiche für getrennte Zwecke besitzen oder kann
ein Arbeitsbereich mehrere Bands beziehungsweise Ensembles enthalten?

**Optionen:**

1. **Genau eine Band je Arbeitsbereich:** Band und Arbeitsbereich sind fachlich
   eins zu eins zugeordnet.
2. **Mehrere Arbeitsbereiche je Band:** Eine Band trennt Zwecke, Repertoire oder
   Verantwortungsbereiche in eigenständige Arbeitsbereiche.
3. **Mehrere Bands je Arbeitsbereich:** Ein Arbeitsbereich bündelt mehrere Bands
   oder Ensembles unter einer gemeinsamen fachlichen Grenze.

**Auswirkungen:**

- **Rollen und Berechtigungen:** bestimmt, ob Rollen immer für genau eine Band
  gelten oder innerhalb eines Arbeitsbereichs weiter fachlich begrenzt werden
  müssen.
- **Navigation:** beeinflusst Auswahl, Wechsel und sichtbare Zuordnung von Band
  und Arbeitsbereich.
- **Song- und Setlistzuordnung:** legt fest, ob Inhalte genau einer Band, einem
  Arbeitsbereich oder mehreren enthaltenen Bands zugeordnet werden müssen.
- **Offlineauswahl:** bestimmt, nach welcher fachlichen Grenze Inhalte
  vorbereitet, angezeigt und nach Rechteentzug behandelt werden.
- **Daten- und Inhaltsgrenzen:** beeinflusst Trennung, Freigabe und Verhinderung
  unberechtigter Querzugriffe zwischen Bands und Arbeitsbereichen.
- **Spätere Architekturentscheidungen:** liefert fachliche Kriterien für eine
  spätere, technologieoffene Bewertung von Trennungs- und Zuordnungsmodellen,
  ohne ein technisches Modell vorzugeben.

**Entscheidungsstatus:** Offen. Keine Option ist ausgewählt oder empfohlen.
