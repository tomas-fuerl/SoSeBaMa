# Produktfragen und Entscheidungen

## Status und Entscheidungsregel

Entschiedene Einträge bleiben unter ihrer stabilen `OQ-xxx`-Kennung erhalten.
Sie dokumentieren die verbindliche Produktentscheidung, keine technische
Umsetzung.

## Statusübersicht

**Entschieden:** `OQ-001` bis `OQ-015` sowie `OQ-017` bis `OQ-021`.

**Offen:** ausschließlich `OQ-016` Ressourcenbudget.

## Entscheidungen und offene Frage

### OQ-001: Mitgliedschaft in mehreren Bandbereichen

**Status:** Entschieden.

Benutzer dürfen gleichzeitig Mitglied mehrerer Bands, Bandbereiche und Gruppen
sein. Globales Benutzerkonto und Bandmitgliedschaften besitzen unabhängige
Zustände: Nur Plattformadministratoren verwalten Konten; berechtigte
Bandmitglieder verwalten ausschließlich Mitgliedschaften der eigenen Band.
Bandbezogene Rechte werden je Bandbereich getrennt ausgewertet und vermitteln
keinen impliziten Querzugriff.

### OQ-002: Anzahl Bandbereiche je Installation

**Status:** Entschieden.

Eine Installation muss mehrere getrennte Bandbereiche unterstützen. Die
Entscheidung legt keine Mandanten-, Datenbank- oder Deploymentarchitektur fest.

### OQ-003: Standard für neue Inhalte und breite Lesbarkeit

**Status:** Entschieden; die frühere Standardsichtbarkeit ist ersetzt.

Neue Inhalte entstehen ohne Freigaben. Es gibt keinen eigenständigen Zustand
für öffentliche Sichtbarkeit. Breite Lesbarkeit für alle angemeldeten aktiven
Benutzer entsteht ausschließlich durch `Anzeigen` für die Systemband
`Öffentlich`. Eigentümer oder berechtigte Bearbeiter stellen einen Antrag; nur
Plattformadministratoren genehmigen, lehnen ab, setzen oder entfernen das
Recht. Diese Ereignisse werden auditiert. Anonymer Internetzugriff und eine
ungeprüfte direkte Standardfreigabe durch normale Benutzer sind ausgeschlossen.

### OQ-004: Gruppen- und Objektberechtigungsmodell

**Status:** Entschieden; das frühere Rollen-/Direktrechtemodell ist ersetzt.

Normale Benutzer benötigen für Aktionen auf bestehenden Objekten globales
Aktionsrecht und Objektberechtigung. Bei Anlagen existiert noch keine
Objektberechtigung; globales Anlagerecht, Eigentümerfähigkeit und gegebenenfalls
Bandvertretung werden geprüft, Eigentum und anfängliche Rechte entstehen
atomar. Berechtigungsanfragen benötigen keine Zielberechtigung;
Songänderungsanträge benötigen Sichtbarkeit und das globale Sonderrecht, aber
kein Song-Bearbeitungsrecht. Plattformadministratoren sind fachliche
Superuser. Rechte werden positiv und additiv ausgewertet; negative Rechte und
Gruppenverschachtelung existieren nicht.

Objektberechtigungen sind Anzeigen, Bearbeiten, Löschen, Berechtigungen
verwalten, Eigentum übertragen und Sonderrechte. Bearbeiten beinhaltet
Anzeigen; Löschen beinhaltet global und objektbezogen Bearbeiten und Anzeigen;
die beiden administrativen Rechte beinhalten jeweils Anzeigen, aber
untereinander keine weiteren Rechte.

Globale Aktionsrechte dürfen nur aktiven Benutzern direkt oder globalen
Gruppen zugewiesen werden. Bands und bandbezogene Gruppen tragen nur
bandbezogene Rechte und Objektberechtigungen. Eine Band ist Eigentums- und
Berechtigungsprinzipal. Ihre automatischen Eigentümerrechte werden nicht an
Mitglieder vererbt. Wird Inhalt, Setlist oder nicht gekoppeltes Overlay durch
Anlage oder Übertragung bandeigen, erhält der Bandprinzipal atomar die normale
Berechtigung Anzeigen; gekoppelte Overlays erben Lesen ausschließlich vom
Inhalt. Höhere Aktionen benötigen ausdrückliche Objekt-, globale und
bandbezogene Vertretungsrechte. Plattformadministratoren verwalten globale
Rechte und global rechtevermittelnde Gruppenmitgliedschaften.

Die geschützte globale Systemgruppe `Alle Benutzer` enthält jeden aktiven
Benutzer. Ihr administrativ nicht reduzierbarer Basissatz umfasst globales
Anzeigen und Bearbeiten innerhalb wirksamer Objektberechtigungen, eigene
Inhalts-, Overlay- und Setlistanlagen samt atomarer Songanlage, direkte
gekoppelte Overlayanlage, Overlay-Einreichung und -Privatkopie, Antrag auf
`Öffentlich`, Setlistbefüllung und Selbstanfrage. Nicht enthalten sind
Songänderung, Löschen, Berechtigungsverwaltung, Eigentumsübertragung,
Bandanfrage, Overlay-Prüfung und Administration. Globale Rechte begrenzen nicht
auf eigene Objekte; die Objektberechtigung bildet die Objektgrenze. Die Gruppe
ist kein Eigentümer und von `Öffentlich` getrennt. Ausdrückliche Freigaben über
Bandgrenzen sind zulässig und verändern Eigentum nicht.

### OQ-005: Konkreter erster MVP-Zuschnitt

**Status:** Entschieden.

Der MVP ist ein früh nutzbarer PDF-zentrierter Produktstand. Er umfasst:

- Benutzer, Bands, Gruppen, die Systemgruppe `Alle Benutzer` und
  Plattformadministration,
- die Systemband `Öffentlich`,
- globale und objektbezogene Berechtigungen,
- Eigentum, Eigentümerlosigkeit, Löschung und Wiederherstellung,
- Songanlage, Prüfung, Anträge und Dublettenverwaltung,
- PDF-Inhalte und Inhaltsmetadaten,
- PDF-Navigation, Zoom und die festgelegten PDF-Overlay-Werkzeuge,
- Setlists, Berechtigungsanfragen, Audit und fachliche Historien,
- Suche und Filter,
- Offlineanzeige und private Offlinebearbeitung.

Vollständige Text-/Chord-Funktionen und gemeinsame Offlinebearbeitung folgen
nach dem MVP. Es gibt keinen reduzierten Texteditor im MVP.

### OQ-006: Offlinebearbeitung

**Status:** Entschieden.

Im MVP dürfen eigene, nur durch einen Benutzer beschreibbare Inhalte, Overlays
und Setlists sowie persönliche Setlisteinstellungen offline bearbeitet werden.
Offline angelegte Inhalte gehören dem Benutzer, bleiben ohne Freigaben und
werden samt Pflichtfeldern und Songzuordnung gegen alle Songs serverseitig
erneut geprüft, ohne unsichtbare Beziehungen offenzulegen. Wird ein vorbereitetes
privates Objekt serverseitig gemeinsam bearbeitbar, ist Synchronisation ohne
Check-out abzulehnen; wurde es endgültig gelöscht, darf seine technische
Identität nicht wiederbelebt werden. Zulässige lokale Stände können bewusst als
neues privates Objekt gerettet werden. Neue Rechte laden nichts automatisch.

Das Zielmodell nach dem MVP erlaubt gemeinsame Offlinebearbeitung nur nach
bewusstem Online-Check-out mit technischer Revisionskennung und fester
Offline-Lease. Gemeinsame Inhalte, dynamisch gekoppelte Overlays und gemeinsame
Setlists sind damit erfasst. Automatisches Merge und stilles Überschreiben
bleiben ausgeschlossen.

### OQ-007: Dauer einer Offlinesitzung und Leases

**Status:** Entschieden mit später technisch zu belegenden Konfigurationswerten.

Maximale Offlinesitzung, Online-Inaktivitätsfrist und Offline-Lease sind global
konfigurierbar. Online- und Offline-Frist sind getrennt. Nach Ablauf der
maximalen Offlinesitzung sind geschützte lokale Basisinhalte und Overlays bis
zur erneuten Onlineanmeldung beziehungsweise Rechteprüfung gesperrt. Minimale
Setlistinformationen und klar getrennte eigene Entwürfe dürfen bleiben; sie
werden nicht automatisch synchronisiert und verlängern keine Berechtigung.

Eine Offline-Lease darf die maximale Offlinesitzung nicht überschreiten und
kann offline nicht verlängert werden. Nach Lease-Ablauf darf ein lokaler
Entwurf fortgeführt werden, besitzt aber keine Serverreservierung. Konkrete
Werte werden erst mit Architektur und Risikobewertung festgelegt.

### OQ-008: Lokale Daten nach Rechteentzug und Offlinekonflikte

**Status:** Entschieden.

Vorbereitete geschützte Daten bleiben höchstens bis zur nächsten erfolgreichen
Rechteprüfung oder zum Ablauf der maximalen Offlinesitzung lesbar. Danach
werden Basisinhalt und Overlays gesperrt beziehungsweise entfernt; minimale
Setlistinformationen dürfen verbleiben. Eigene Entwürfe dürfen nur klar
getrennt erhalten bleiben. Abmeldung warnt vor Verlust, erlaubt vorherige
Synchronisation und entfernt lokale Daten sowie Sitzungsschlüssel kontrolliert.

Private Offlineobjekte verwenden technische Revisionskennungen. Veraltete
Änderungen sowie Speichern eines inzwischen gemeinsam bearbeitbaren Objekts
ohne Check-out werden abgelehnt. Ein endgültig gelöschtes Serverobjekt wird
lokal entfernt und darf nur unter neuer Identität als privates Objekt gerettet
werden. Verwerfen, neues privates Objekt und manuelles Übertragen bleiben
bewusste Wege; automatisches Merge und Überschreiben sind ausgeschlossen. Neue
Rechte benötigen bewusste Synchronisation oder Offlinevorbereitung. Lokale
Daten müssen verschlüsselt sein; das Verfahren bleibt Architekturentscheidung.

### OQ-009: Erreichbarkeit und Diagnose von TST

**Status:** Entschieden.

TST darf extern erreichbar sein. Geschützte detaillierte Logs, Traces,
Statusendpunkte, Backend-API-Zugriff und definierte Test-/Prüfschnittstellen
sind zulässig, wenn nur benannte technische Identitäten mit eigener
Authentifizierung und minimalen Rechten zugreifen, kein pauschaler
Autorisierungs-Bypass besteht, keine Secrets offengelegt werden, Zugriffe
auditiert sind und widerrufen werden können. Diese Wege müssen in PRD technisch
fehlen oder nachweislich
unerreichbar sein. PRD besitzt keine Debugports, -tunnel oder -schnittstellen.

### OQ-010: Unterstützte Geräte und Browser

**Status:** Entschieden.

Tablets, Notebooks und Desktoprechner sind vollständig unterstützte
Primärgeräte. Unterstützt werden aktuelle und vorherige Hauptversion von
Chrome, Edge, Firefox und Safari einschließlich Safari auf iPadOS/iOS.
Eingebettete Browser und herstellerspezifische WebViews sind nicht verbindlich.

Smartphones unterstützen Anmeldung, Navigation, Suche, Metadaten,
Berechtigungsanfragen, einfache Administration, lesende Setlists und
Statusanzeigen. PDF-Annotation, vollständige Setlistbearbeitung,
Auftrittsansicht und Offlinebearbeitung sind dort nicht verbindlich. Touch,
Maus, Tastatur und standardisierte Pointer-Events für Stifte werden
unterstützt; herstellerspezifische Stiftfunktionen werden nicht vorausgesetzt.

### OQ-011: Reaktions- und Performanceziele

**Status:** Entschieden als initialer Basiskorridor.

- Navigation geladener Ansichten: höchstens 300 ms im 95. Perzentil,
- Suchergebnis: höchstens 1 s im 95. Perzentil,
- lokal vorbereiteten Inhalt öffnen: höchstens 1 s,
- erste Seite eines normalen Online-PDFs: höchstens 2 s,
- Wechsel geladener PDF-Seiten: höchstens 300 ms,
- sichtbare Rückmeldung nach Synchronisationsstart: höchstens 1 s,
- Rückmeldung nach geschützter Aktion: höchstens 500 ms,
- Stiftdarstellung: Ziel höchstens 50 ms Eingabelatenz.

Langsame Verbindungen und große Dateien benötigen Fortschrittszustände.
Referenzgerät, Datenbestand, PDF-Größe, Parallelität und Netzbedingungen werden
später mit dem Ressourcenbudget festgelegt. Bis dahin werden Messwerte
beobachtet und nicht als abschließende Abnahme dargestellt. Zieländerungen
müssen dokumentiert und begründet sein.

### OQ-012: Verhältnis von Song und Inhalt

**Status:** Entschieden und durch das aktuelle Modell präzisiert.

Ein Song ist das plattformweite normalisierte Metadatenobjekt. Ein Inhalt gehört
genau zu einem Song und besitzt genau einen aktuellen Basisinhalt. Normale
Benutzer sehen Songs im Katalog, in Suche und Inhaltsanlage nur über mindestens
einen lesbaren Inhalt; die minimale Setlistanzeige erweitert diese Sichtbarkeit
nicht. Songs und Inhalte haben keine auswählbaren Versionen oder Revisionen.
Songänderungen gelten global; bei Songs existiert nur das nicht editierbare
Audit, keine fachliche Änderungshistorie. Inhalte und Setlists zeigen aktuelle
Songmetadaten.

### OQ-013: Setlistreferenzen und Historie

**Status:** Entschieden.

Setlists referenzieren aktuellen Basisinhalt, aktuelle Songmetadaten und aktuell
berechtigte Overlays. Sie besitzen genau einen aktuellen Stand; auswählbare
Versionen, Snapshots oder eingefrorene Auftrittsstände existieren nicht.
Fachlich relevante gemeinsame Änderungen an Einträgen, Reihenfolge, gemeinsamer
Overlay-Auswahl und -Reihenfolge, Metadaten, Eigentum und gemeinsamen
Berechtigungen werden vollständig historisiert; persönliche Einstellungen
nicht.

Für einen unabhängigen Planungsstand darf eine Setlist bewusst als normale neue
Objektanlage kopiert werden. Standardmäßig wird der Kopierende Eigentümer; eine
Band benötigt globales Setlist-Anlagerecht und passendes bandbezogenes
Vertretungs- oder Anlagerecht, `Öffentlich` ist nur administrativ zulässig.
Eigentum und anfängliche Rechte entstehen atomar. Die Kopie besitzt eigene
Berechtigungen und Historie und referenziert dieselben berechtigten Inhalte und
Overlays, kopiert sie aber nicht. Nach endgültiger Inhaltslöschung wird die
aktuelle Referenz entfernt und
innerhalb der vollständigen Historie nur Zeitpunkt, frühere Position, letzter
Songtitel, letzter Komponist und der nicht anklickbare Hinweis `Inhalt
endgültig gelöscht` gespeichert; Datei, Basisinhalt, vollständige Metadaten,
Berechtigungen, früherer Benutzereigentümer und Overlays fehlen.

### OQ-014: Export

**Status:** Entschieden.

Export gehört nicht zum MVP. Offlinebereitstellung innerhalb der Anwendung ist
kein Export. Später sind globales und objektbezogenes `Exportieren`
erforderlich; Anzeigen oder Bearbeiten genügt nicht. Formate,
Overlayeinbeziehung und Setlistpakete werden später entschieden.

### OQ-015: Erster produktiver Zielbetrieb

**Status:** Entschieden.

Der erste produktive Betrieb umfasst mindestens zwei unabhängige reguläre
Bands, zusätzlich die Systemband `Öffentlich`, Benutzer mit
Mehrfachmitgliedschaften und einen nachgewiesenen Test der
Berechtigungstrennung.

### OQ-016: Ressourcenbudget auf der Synology

**Status:** Offen; einzige verbleibende Produktfrage.

**Frage:** Welche messbaren Obergrenzen gelten für Ressourcenverbrauch,
Speicherwachstum, Hintergrundaufgaben und Synchronisation auf der vorgesehenen
Synology?

**Bis zur Entscheidung:** Der Betrieb auf der vorgesehenen Synology bleibt
Ziel. Ressourcenverbrauch, Speicherwachstum, Hintergrundaufgaben und
Synchronisation müssen mess- und beobachtbar sein. Ein konkretes Budget wird
erst nach Festlegung von Referenzhardware und Betriebsdaten beschlossen.

### OQ-017: Barrierearmut

**Status:** Entschieden.

Die MVP-Kernabläufe Anmeldung, Navigation, Suche, Inhaltsverwaltung, Setlists,
Berechtigungsanfragen und Administration orientieren sich verbindlich an WCAG
2.2 AA. Tastaturbedienung, Fokusdarstellung, Beschriftungen und Kontraste sind
verbindlich. Freihandannotation darf dokumentierte fachliche Grenzen besitzen;
ihre Steuerelemente müssen zugänglich sein.

### OQ-018: Wiederherstellungsziele

**Status:** Entschieden.

RPO beträgt 4 Stunden, RTO 8 Stunden. Das konkrete Sicherungs- und
Wiederherstellungsverfahren bleibt eine spätere Betriebs- und
Architekturentscheidung und muss in TST verifiziert werden.

### OQ-019: Audit- und Historienaufbewahrung

**Status:** Entschieden.

- administrative, Eigentums-, Berechtigungs-, Lösch-, Wiederherstellungs- und
  Check-out-Ereignisse: 365 Tage,
- abgelehnte Zugriffe, Anmeldung und technische Security-Ereignisse: 90 Tage,
- fachliche Historie vorhandener Objekte: solange das Objekt besteht,
- minimale Auditnachweise nach endgültiger Objektlöschung: 90 Tage.

Jedes Ereignis enthält mindestens Ereignisart, Akteur, serverseitigen
Zeitpunkt, Gegenstand beziehungsweise technische Objektkennung, Ergebnis und
soweit zulässig fachlichen Bezug. Song-, Eigentums-, Check-out- und
Offlineereignisse enthalten die festgelegten Zusatzfelder einschließlich
unterscheidbarer lokaler Aktions- und serverseitiger Synchronisationszeit sowie
technischer datensparsamer Gerätekennung. Automatische endgültige Löschung und
Ausführungsfehler werden auditiert.

Audit speichert keine Secrets, Basisinhalte, Dateien, unnötigen Inhalts- oder
Personendaten und keine auswählbaren alten Stände. Auditexport gehört nicht zum
MVP.

### OQ-020: MFA

**Status:** Entschieden.

MFA ist für Plattformadministratoren verpflichtend und für andere Benutzer
optional. Änderung und Wiederherstellung werden auditiert. Für den letzten
Administrator besteht ein dokumentierter Wiederherstellungsweg. Das konkrete
Verfahren bleibt Architekturentscheidung.

### OQ-021: Band und Bandbereich

**Status:** Entschieden.

Jede Band besitzt genau einen Bandbereich; jeder Bandbereich gehört genau einer
Band. Eine Band ist Eigentums- und Berechtigungsprinzipal und darf Mitglieder
sowie zusätzliche bandbezogene Gruppen besitzen. Bandbereiche verhindern
implizite Querzugriffe. Ausdrückliche Objektfreigaben über Bandgrenzen sind
zulässig, übertragen kein Eigentum und vermitteln keine automatische
Bandadministration.
