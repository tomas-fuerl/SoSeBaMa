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
sein. Bandbezogene Rechte werden je Bandbereich getrennt ausgewertet und
vermitteln keinen impliziten Querzugriff.

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

Normale Benutzer benötigen für geschützte Aktionen globales Aktionsrecht und
Objektberechtigung. Plattformadministratoren sind fachliche Superuser. Rechte
werden Benutzern oder globalen beziehungsweise bandbezogenen Gruppen positiv
zugewiesen und additiv ausgewertet; negative Rechte und
Gruppenverschachtelung existieren nicht.

Objektberechtigungen sind Anzeigen, Bearbeiten, Löschen, Berechtigungen
verwalten, Eigentum übertragen und Sonderrechte. Bearbeiten beinhaltet
Anzeigen; Löschen beinhaltet global und objektbezogen Bearbeiten und Anzeigen;
die beiden administrativen Rechte beinhalten jeweils Anzeigen, aber
untereinander keine weiteren Rechte.

Eine Band ist Eigentums- und Berechtigungsprinzipal. Berechtigte Bandmitglieder
verwalten Mitglieder, bandbezogene Gruppen und delegierbare Rechte nur in der
eigenen Band. Plattformadministratoren verwalten globale Gruppen, globale
Rechte und Systemgruppen. Ausdrückliche Freigaben über Bandgrenzen sind
zulässig und verändern Eigentum nicht.

### OQ-005: Konkreter erster MVP-Zuschnitt

**Status:** Entschieden.

Der MVP ist ein früh nutzbarer PDF-zentrierter Produktstand. Er umfasst:

- Benutzer, Bands, Gruppen und Plattformadministration,
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
werden samt Pflichtfeldern und Songzuordnung serverseitig erneut geprüft.

Das Zielmodell nach dem MVP erlaubt gemeinsame Offlinebearbeitung nur nach
bewusstem Online-Check-out mit technischer Revisionskennung und fester
Offline-Lease. Gemeinsame Inhalte, dynamisch gekoppelte Overlays und gemeinsame
Setlists sind damit erfasst. Automatisches Merge und stilles Überschreiben
bleiben ausgeschlossen.

### OQ-007: Dauer einer Offlinesitzung und Leases

**Status:** Entschieden mit später technisch zu belegenden Konfigurationswerten.

Maximale Offlinesitzung, Online-Inaktivitätsfrist und Offline-Lease sind global
konfigurierbar. Online- und Offline-Frist sind getrennt. Eine Offline-Lease darf
die maximale Offlinesitzung nicht überschreiten und kann offline nicht
verlängert werden. Konkrete Werte werden erst mit Architektur und
Risikobewertung festgelegt.

### OQ-008: Lokale Daten nach Rechteentzug und Offlinekonflikte

**Status:** Entschieden.

Vorbereitete Daten bleiben bis zur nächsten erfolgreichen Rechteprüfung offline
lesbar. Danach werden Basisinhalt und Overlays entfernt; minimale
Setlistinformationen dürfen verbleiben. Abmeldung warnt vor dem Verlust nicht
synchronisierter Entwürfe, erlaubt vorherige Synchronisation und entfernt
lokale Daten sowie Sitzungsschlüssel kontrolliert.

Private Offlineobjekte verwenden technische Revisionskennungen. Veraltete
Änderungen werden abgelehnt und dürfen verworfen, separat gesichert oder
manuell übertragen werden. Lokale Daten müssen verschlüsselt sein; das Verfahren
bleibt Architekturentscheidung.

### OQ-009: Erreichbarkeit und Diagnose von TST

**Status:** Entschieden.

TST darf extern erreichbar sein. Geschützte detaillierte Logs, Traces,
Statusendpunkte, Backend-API-Zugriff und definierte Test-/Prüfschnittstellen
sind zulässig, wenn nur benannte technische Identitäten mit eigener
Authentifizierung und minimalen Rechten zugreifen, kein pauschaler
Autorisierungs-Bypass besteht, keine Secrets offengelegt werden und Zugriffe
auditiert sind. Diese Wege müssen in PRD technisch fehlen oder nachweislich
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
genau zu einem Song und besitzt genau einen aktuellen Basisinhalt. Songs und
Inhalte haben keine auswählbaren Versionen oder Revisionen. Songänderungen
gelten global; bei Songs existiert nur das nicht editierbare Audit, keine
fachliche Änderungshistorie. Inhalte und Setlists zeigen aktuelle
Songmetadaten.

### OQ-013: Setlistreferenzen und Historie

**Status:** Entschieden.

Setlists referenzieren aktuellen Basisinhalt, aktuelle Songmetadaten und aktuell
berechtigte Overlays. Es gibt keine Snapshots oder eingefrorenen
Auftrittsstände. Nach endgültiger Inhaltslöschung wird die aktuelle Referenz
entfernt und nur Zeitpunkt, frühere Position, letzter Songtitel, letzter
Komponist und der nicht anklickbare Hinweis `Inhalt endgültig gelöscht`
gespeichert.

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

Security-Audit speichert keine Basisinhalte, Dateien oder unnötigen
Inhaltsdaten. Auditexport gehört nicht zum MVP.

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
