# Offene Produktfragen

## Status und Entscheidungsregel

Dieses Dokument konkretisiert die in GitHub-Issue #3 noch nicht entschiedenen
Produktfragen. Alle Einträge haben den Status **Offen**. Optionen sind keine
Empfehlung oder Eigentümerentscheidung. Eine Entscheidung trifft ausschließlich
der Projekteigentümer; anschließend werden betroffene Anforderungen und der
Eintrag nachvollziehbar aktualisiert.

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

### OQ-003: Standardsichtbarkeit von Annotationen

**Frage:** Sind neue Annotationen standardmäßig privat oder gemeinsam sichtbar?

**Optionen:** privat als sicherer Standard; gemeinsam für direkte
Zusammenarbeit; bewusste Auswahl bei jeder Erstellung.

**Auswirkungen:** Datenschutz, Bedienaufwand, Erwartbarkeit und Risiko
unbeabsichtigter Veröffentlichung.

### OQ-004: Änderungsrechte regulärer Mitglieder

**Frage:** Welche gemeinsamen Inhalte dürfen reguläre Mitglieder bearbeiten?

**Optionen:** nur persönliche Annotationen; zusätzlich ausgewählte Text- und
Akkordblätter; alle explizit freigegebenen Inhalte.

**Auswirkungen:** Rollenmodell, Nachvollziehbarkeit, Konfliktrisiko und Aufwand
für Freigaben.

### OQ-005: Konkreter erster MVP-Zuschnitt

**Frage:** Welcher zusätzliche fachliche Funktionsschnitt ergänzt die in
[Funktionaler Scope](FUNCTIONAL-SCOPE.md) verbindlich festgelegte Basis
`FR-001` bis `FR-007` zum ersten produktiv nutzbaren MVP?

Die verbindliche Basis gehört zu jeder Variante und kann durch diese
Entscheidung weder abgewählt noch verschoben werden. `FR-047` bis `FR-053`
bleiben ausdrücklich ausgeschlossen; `FR-054` bis `FR-057` bleiben offene
Produktgrenzen. Keine Variante legt eine Technologie fest oder gilt ohne
Eigentümerentscheidung als beschlossen.

#### Variante A: Dokumentenorientierter Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`, grundlegende
  Zusammenarbeit `FR-008` bis `FR-009`, Songverwaltung `FR-011` bis `FR-014`,
  PDF-Anzeige und -Annotation `FR-015` bis `FR-020`, Setlists `FR-028` bis
  `FR-032` sowie lesender Offlinebetrieb mit Status und kontrollierter lokaler
  Entfernung `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  Text- und Akkordfunktionen `FR-021` bis `FR-027`, Offline-
  Änderungswarteschlange und Konfliktbehandlung `FR-035` bis `FR-036` sowie
  spätere Erweiterungen `FR-038` bis `FR-046`.
- **Abhängigkeiten:** `OQ-001` bis `OQ-004`, `OQ-006` bis `OQ-008`, `OQ-010` bis
  `OQ-013`, `OQ-015` und `OQ-021`; insbesondere müssen Annotationssichtbarkeit,
  Rollen, Offlinefrist und Band-Arbeitsbereich-Zuordnung geklärt werden.
- **Produktiver Nutzen:** Eine Band oder ein Ensemble kann Songs, PDF-Dokumente
  und Setlists gemeinsam verwalten und für Probe oder Auftritt vorbereiten.
  Berechtigte Mitglieder können PDFs online grundlegend annotieren und
  vorbereitete Unterlagen ohne Netzwerk lesen.
- **Fachliche Hauptrisiken:** Unklare Sichtbarkeit von Annotationen, noch offene
  Fassungshistorie und eingeschränkter Nutzen für Mitglieder, die primär mit
  Text- oder Akkordblättern arbeiten.
- **Technische Hauptrisiken:** sichere Dateiverarbeitung, Erhalt der
  Originaldokumente, Touch- und Stifteignung sowie konsistente lesende
  Offlinebereitstellung auf den später festgelegten Geräten.
- **Testumfang und Lieferreihenfolge:** zuerst Zusammenarbeit und Songs, danach
  PDF-Anzeige und Annotation, anschließend Setlist und lesender Offlinebetrieb.
  Der Schwerpunkt liegt auf Upload-Negativfällen, Dokumentrechten,
  Originalerhalt, Eingabegeräten und vollständiger Offlinevorbereitung.

#### Variante B: Text- und Setlist-Einstieg

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`, grundlegende
  Zusammenarbeit `FR-008` bis `FR-009`, Songverwaltung `FR-011` bis `FR-014`,
  Text- und Akkordfunktionen `FR-021` bis `FR-027`, Setlists `FR-028` bis
  `FR-032` sowie lesender Offlinebetrieb mit Status und kontrollierter lokaler
  Entfernung `FR-033`, `FR-034` und `FR-037`.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`,
  PDF-Funktionen `FR-015` bis `FR-020`, Offline-Änderungswarteschlange und
  Konfliktbehandlung `FR-035` bis `FR-036` sowie spätere Erweiterungen
  `FR-038` bis `FR-046`.
- **Abhängigkeiten:** `OQ-001`, `OQ-002`, `OQ-004`, `OQ-006` bis `OQ-008`,
  `OQ-010` bis `OQ-013`, `OQ-015` und `OQ-021`; insbesondere müssen
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

- **Eingeschlossen:** verbindliche Basis `FR-001` bis `FR-007`, grundlegende
  Zusammenarbeit `FR-008` bis `FR-009` sowie Song-, PDF-, Text-/Akkord-,
  Setlist- und Offline-/Synchronisationsfunktionen `FR-011` bis `FR-037`.
  Gemeinsame und Offlinebearbeitung bleiben auf die später ausdrücklich
  freigegebenen Änderungstypen begrenzt.
- **Bewusst nicht enthalten:** zusätzlicher Authentifizierungsfaktor `FR-010`
  und sämtliche späteren Erweiterungen `FR-038` bis `FR-046`. Weitergehende
  gemeinsame oder Offlinebearbeitung ist ohne Entscheidungen zu `OQ-004` und
  `OQ-006` nicht enthalten.
- **Abhängigkeiten:** `OQ-001` bis `OQ-004`, `OQ-006` bis `OQ-008`, `OQ-010` bis
  `OQ-013`, `OQ-015` und `OQ-021`; diese Variante benötigt vor allem klare
  Grenzen für gemeinsame Änderungen, Offlineänderungen und Konfliktbehandlung.
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

**Frage:** Werden unterscheidbare Songfassungen, eine Änderungshistorie oder
beides benötigt?

**Optionen:** nur benannte Fassungen; nur nachvollziehbare Revisionen; Fassungen
mit eigener Revisionierung.

**Auswirkungen:** Inhaltsmodell, Auswahl in Setlists, Konfliktbehandlung und
Rückkehr zu früheren Ständen.

### OQ-013: Historisierung oder Versionierung von Setlists

**Frage:** Müssen Setlists historisiert oder ausdrücklich versioniert werden?

**Optionen:** nur aktueller Stand mit Änderungsnachweis; unveränderliche
Freigabestände; vollständige Versionierung.

**Auswirkungen:** Nachvollziehbarkeit bei Auftritten, Offlineabgleich,
Speicherbedarf und Bedienaufwand.

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
