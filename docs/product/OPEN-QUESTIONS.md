# Offene Produktfragen

## Status und Entscheidungsregel

Dieses Dokument konkretisiert die in GitHub-Issue #3 noch nicht entschiedenen
Produktfragen. Alle Einträge haben den Status **Offen**. Optionen sind keine
Empfehlung oder Eigentümerentscheidung. Eine Entscheidung trifft ausschließlich
der Projekteigentümer; anschließend werden betroffene Anforderungen und der
Eintrag nachvollziehbar aktualisiert.

## Fragen

### OQ-001: Mitgliedschaft in mehreren Arbeitsbereichen

**Frage:** Kann ein Benutzer gleichzeitig Mitglied mehrerer Bands oder
Arbeitsbereiche sein?

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

**Frage:** Welche in [Funktionaler Scope](FUNCTIONAL-SCOPE.md) beschriebenen
MVP-Kandidaten bilden den kleinsten produktiv sinnvollen ersten Stand?

**Optionen:** dokumentenorientierter Einstieg; setlistorientierter Einstieg;
integrierter Grundumfang mit bewusst reduzierter Bearbeitung.

**Auswirkungen:** Lieferreihenfolge, Testumfang und Zeitpunkt des ersten
produktiven Nutzens. Verbindliche Produktprinzipien bleiben bei jeder Option
erhalten.

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
ist von `OQ-001` und `OQ-002` abhängig.

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
