# Funktionaler Scope

## Bezug und Leseregel

Jede Anforderung besitzt eine stabile `FR-xxx`-Kennung. Frühere Aussagen dieses
Dokuments werden durch die nachstehenden Tabellen vollständig ersetzt. `MVP`,
`Zielmodell nach dem MVP`, `später` und `außerhalb des Scopes` sind verbindlich
voneinander getrennt.

Das fachliche Gesamtmodell steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## PDF-zentrierter MVP

Der MVP ist ein früh nutzbarer Produktstand. Er umfasst Benutzer, Bands,
Gruppen einschließlich der Systemgruppe `Alle Benutzer`,
Plattformadministration, die Systemband `Öffentlich`, globale und
objektbezogene Berechtigungen, Eigentum und Löschung, Songs, PDF-Inhalte,
Inhaltsmetadaten, PDF-Overlays, Setlists, Berechtigungsanfragen, Audit, Suche,
Offlineanzeige und private Offlinebearbeitung.

| ID | Verbindliche Anforderung | Verifikation |
| --- | --- | --- |
| FR-001 | SoSeBaMa muss mehrere Benutzer, mehrere Bands, globale und bandbezogene Gruppen sowie mehrere getrennte Bandbereiche unterstützen. Das globale Benutzerkonto und jede Bandmitgliedschaft müssen getrennte Zustände besitzen. Nur Plattformadministratoren dürfen Konten manuell aktivieren, deaktivieren oder löschen; die automatische normale Kontoaktivierung nach gültiger Einladungsannahme gemäß `FR-071` ist ein Systemworkflow und keine manuelle Befugnis des Einladenden. Bandberechtigte verwalten ausschließlich Mitgliedschaften ihrer eigenen Band. Benutzer dürfen mehreren Bands und Gruppen angehören. | Manuelle und systemgesteuerte Kontoaktivierung, -deaktivierung und -löschung sowie Einladung, Aktivierung, Deaktivierung und Entfernung einer Bandmitgliedschaft werden getrennt geprüft; andere Bands bleiben unverändert. |
| FR-002 | Der zentrale Serverstand muss der fachlich maßgebliche Datenbestand sein. Lokale Kopien und technische Revisionskennungen dürfen keine auswählbaren fachlichen Versionen erzeugen. | Nach Synchronisation ist genau ein aktueller Stand bestimmbar. |
| FR-003 | Auf einem bestehenden Objekt muss jede geschützte Aktion eines normalen Benutzers globales Aktionsrecht und passende Objektberechtigung erfordern. Bei einer Anlage gelten stattdessen Anlagerecht, gegebenenfalls Bandvertretung und Eigentümerfähigkeit; Eigentum und anfängliche Rechte entstehen atomar. Anfragen folgen ihren Sonderregeln. Eng begrenzte Ausnahmen sind ausschließlich die Entscheidung eines aktiven persönlichen Inhaltseigentümers über eine Overlay-Übernahme am eigenen Inhalt und die Check-out-Rücknahme durch den aktiven persönlichen Eigentümer des eigenen Objekts. Bei Bandeigentum ist ausdrückliche Vertretungsbefugnis erforderlich; andere bestellte Prüfer oder Rücknahmeberechtigte benötigen globales und objektspezifisches Recht. Plattformadministratoren sind Superuser. | Zwei-Ebenen-Regel, Anlagen, Anfragen, persönliche Eigentümerausnahme, Bandvertretung und bestellte Sonderberechtigte werden positiv und negativ geprüft. |
| FR-004 | Berechtigte Benutzer müssen ausgewählte Inhalte und Setlists für Offlineanzeige vorbereiten können. | Vollständiger, unvollständiger und fehlgeschlagener Zustand ist sichtbar. |
| FR-005 | Offline-, Speicher-, Synchronisations-, Lösch-, Check-out- und Konfliktzustände müssen verständlich angezeigt werden. Eine aktive Check-out-Sitzung muss vor Lease-Ablauf gewarnt werden; nach Ablauf, Verbindungsverlust oder administrativer Rücknahme müssen lokale Eingaben und fehlende serverseitige Speicherberechtigung klar getrennt sein. | Benutzer können Zustand und sichere nächste Handlung einschließlich Kopieren, Verwerfen oder bewusstem neuen Check-out bestimmen. |
| FR-006 | Overlay-Aktionen müssen vom Basisinhalt getrennt bleiben und dürfen ihn nicht verändern. | Speichern eines Overlays verändert weder Basisinhalt noch andere Overlays. |
| FR-007 | Import muss benutzergesteuert erfolgen und Dateien sicher prüfen. | Jeder Import beginnt bewusst; unsichere oder fehlerhafte Dateien erzeugen keinen Teilimport. |
| FR-008 | Berechtigte Bandmitglieder müssen Bandmitgliedschaften der eigenen Band einladen, aktivieren, deaktivieren oder entfernen, bandbezogene Gruppen verwalten und delegierbare bandbezogene Rechte vergeben können. Diese Vorgänge dürfen weder das globale Konto noch andere Bandmitgliedschaften ändern. Globale Aktionsrechte dürfen nur direkt aktiven Benutzern oder globalen Gruppen zugewiesen werden; Bands und bandbezogene Gruppen dürfen nur bandbezogene Rechte und Objektberechtigungen tragen. Nur Plattformadministratoren dürfen Konten, Bands, globale Gruppen, globale Rechte, Systemgruppen und global rechtevermittelnde Gruppenmitgliedschaften verwalten. | Konto- und Mitgliedschaftsstatus bleiben getrennt; Bandverwaltung kann weder globale Rechte erteilen oder entziehen noch fremde Zuordnungen ändern. |
| FR-009 | Neue Inhalte müssen ohne Freigaben angelegt werden. Breite Lesbarkeit muss ausschließlich durch administrativ genehmigtes `Anzeigen` für die Systemband `Öffentlich` entstehen; anonymer Zugriff ist ausgeschlossen. | Normale Benutzer können `Öffentlich` nicht direkt als ungeprüfte Standardfreigabe anwenden. |
| FR-010 | MFA muss für Plattformadministratoren verpflichtend und für andere Benutzer optional sein. Bandadministration oder Bandmitgliedschaft darf keine MFA-Verwaltung für andere Benutzer oder Plattformadministratoren vermitteln. Die auditierte administrative Wiederherstellung eines Plattformadministrator-Zugangs muss ausschließlich über den globalen Wiederherstellungsprozess erfolgen und darf den letzten Administrator nicht dauerhaft aussperren. | Pflicht-, Optional-, Bandgrenz-, Änderungs- und Wiederherstellungsfälle sind nachweisbar; das angenommene technische Verfahren steht in [ADR-0005](../architecture/decisions/ADR-0005-identitaet-authentifizierung-und-sitzungen.md). |
| FR-011 | Normale Benutzer müssen einen neuen Song atomar mit einem Inhalt anlegen dürfen. Plattformadministratoren müssen Songs ohne Inhalt anlegen sowie bestehende Songs ändern, prüfen und verwalten dürfen. Im MVP benötigen sie eine gemeinsame Prüfarbeitsliste mindestens für ungeprüfte Songs, offene Änderungsanträge, mögliche Dubletten und abweichende Gemeinfreiheitsangaben; daraus müssen die bestehenden Korrektur-, Prüf-, Entscheidungs-, Zusammenführungs-, Umhängungs- und Löschaktionen ohne Öffnen privater Basisinhalte möglich sein. Andere Benutzer dürfen mit `Songänderung beantragen` einen Antrag für sichtbare Songs stellen. | Arbeitslistenkategorien und berechtigte Aktionen werden einschließlich Audit und ohne Einsicht in private Basisinhalte geprüft; unsichtbare Songs bleiben für normale Benutzer nicht beantragbar. |
| FR-012 | Normale Benutzer dürfen einen Song im Katalog, in Suche und Inhaltsanlage nur sehen, wenn sie mindestens einen zugehörigen Inhalt lesen; Plattformadministratoren sehen alle. Im MVP müssen Songs nach Titel, Komponist, Gemeinfreiheits- und Prüfstatus, Inhalte nach Songtitel, Komponist, Arrangeur/Interpret, Beschreibung, Eigentümer, Band, Inhaltsart, Tonart, Niveau und Genre sowie Setlists nach Name, Eigentümer, Band und enthaltenen Songtiteln such- oder filterbar sein. Tempo und Dauer müssen angezeigt und sortierbar sein, müssen im MVP aber keine Freitextsuchfelder sein. | Ergebnisse, Vorschläge, Filterwerte und Anzahlen offenbaren keine unsichtbaren Songs oder Inhaltsbeziehungen; die minimale Setlistanzeige erweitert die Katalogsichtbarkeit nicht. |
| FR-013 | Ein Song darf ohne Inhalt bestehen und mehreren Inhalten zugrunde liegen; jeder Inhalt muss genau einem Song gehören. Automatische Zuordnung darf nur bei normalisierter Übereinstimmung von Titel und Komponist erfolgen. Ein abweichender Gemeinfreiheitsstatus ändert weder Identität noch vorhandenen Status, sondern erzeugt einen datensparsamen Hinweis in der administrativen Prüfarbeitsliste, dessen Bearbeitung auditiert wird. | Gleicher Titel allein ordnet nie zu; exakter Titel-/Komponisten-Treffer ordnet auch bei Statusabweichung zu, ohne private Beziehungen offenzulegen. |
| FR-014 | Songs müssen aktuelle globale Metadaten ohne auswählbare Version oder fachliche Historie besitzen. Anlage, Prüfung, Antrag, Entscheidung, Änderung, Zusammenführung, Umhängung und Löschung müssen auditiert werden. | Setlists und Inhalte zeigen aktuelle Songmetadaten; Audit ist nicht editierbar. |
| FR-015 | Ein berechtigter Benutzer muss ein PDF als Basisinhalt genau einem Song zuordnen, Pflichtmetadaten bestätigen und ohne Freigaben anlegen können. | Inhalt, Song und Pflichtfelder entstehen atomar oder gar nicht. |
| FR-016 | Die PDF-Anzeige muss eindeutige Seitennavigation unterstützen. | Vor, zurück und direkte Seitenauswahl sind mit unterstützter Eingabe nutzbar. |
| FR-017 | Die PDF-Anzeige muss geeigneten Zoom unterstützen. | Zoom funktioniert auf den unterstützten Primärgeräten. |
| FR-018 | PDF-Overlays im MVP müssen Freihandstift, Radierer, Textnotiz, Textmarker, Auswahl, Verschieben und Löschen, konfigurierbare Strichstärke, begrenzte Farben sowie Touch- und Stiftbedienung unterstützen. Geometrische Formen, Bild- oder Stempelelemente und Ebenen- beziehungsweise Layergruppen gehören nicht zum MVP und werden dadurch nicht als Post-MVP-Funktionen eingeplant. | Jedes MVP-Werkzeug speichert ausschließlich im gewählten Overlay; die ausgeschlossenen Werkzeuge erscheinen nicht als MVP-Funktion oder geplante spätere Anforderung. |
| FR-019 | Benutzer müssen beliebig viele normale Overlays zu lesbaren Inhalten anlegen und mehrere gleichzeitig anzeigen dürfen. Direkte gekoppelte Anlage muss atomar Inhaltseigentum, dynamische Leserechte und ein entziehbares Ersteller-Bearbeitungsrecht anwenden. Eine Einreichung erzeugt nur temporären Prüf-Lesezugriff. Entscheiden dürfen der aktive persönliche Inhaltseigentümer als begrenzte Eigentümerausnahme, ausdrücklich für die Eigentümerband vertretungsberechtigte aktive Benutzer oder Bandgruppen, andere Prüfer mit globalem und objektspezifischem `Overlay-Übernahme prüfen` oder bei Eigentümerlosigkeit ausschließlich Plattformadministratoren. | Einreichung, temporärer Zugriff, alle Prüferkategorien, Rücknahme, Ablehnung, Genehmigung, Kopie sowie Eigentums- und Rechtefolgen werden positiv und negativ geprüft. |
| FR-020 | Ausgewählte PDF-Inhalte und berechtigte Overlays müssen offline angezeigt werden können. | Vorbereitete PDFs öffnen ohne Netzwerk; fehlende Bestandteile sind erkennbar. |

## Text-/Chord-Funktionsgruppe nach dem MVP

Es gibt keinen reduzierten Texteditor im MVP. Die Gruppe wird vollständig nach
dem MVP geliefert.

| ID | Verbindliche spätere Anforderung |
| --- | --- |
| FR-021 | Berechtigte Benutzer müssen Text- und Chord-Inhalte manuell anlegen und genau einem Song zuordnen können. |
| FR-022 | Text- und Chord-Basisinhalte müssen entsprechend Eigentum, Berechtigungen und Check-out bearbeitbar sein. |
| FR-023 | Text- und Chord-Inhalte müssen benutzergesteuert per Copy-and-paste übernommen werden können. |
| FR-024 | Chords müssen erkannt und strukturiert dargestellt werden können. |
| FR-025 | Erkannte Chords müssen kontrolliert korrigiert, transponiert und vereinfacht werden können. |
| FR-026 | Text- und Chord-Inhalte müssen kontrollierbaren Autoscroll unterstützen. |
| FR-027 | Text-/Chord-Inhalte und ihre berechtigten Overlays müssen offline verwendbar sein. |

## Setlists im MVP

| ID | Verbindliche Anforderung | Verifikation |
| --- | --- | --- |
| FR-028 | Setlists müssen eigenständige Objekte mit genau einem Benutzer oder einer Band als Eigentümer sein. Benutzereigene Setlists starten nur für den Ersteller; bandeigene benötigen globales und bandbezogenes Anlagerecht. Eigentum und anfängliche Rechte entstehen atomar. Die Eigentumsrechte schlagen nicht auf Mitglieder durch; der Bandprinzipal erhält bei jedem Eigentumserwerb standardmäßig Anzeigen. Eine Setlistkopie ist eine normale neue Anlage: Standard-Eigentümer ist der Kopierende, eine Band benötigt globale und bandbezogene Anlagerechte, `Öffentlich` ist nur administrativ zulässig. Die Kopie erhält eigene Rechte und Historie, ohne Inhalte oder Overlays zu kopieren. | Benutzer- und Bandanlage ohne vorbestehende Objektberechtigung, atomare Referenzkopie und administrative Eigentümerschaft von `Öffentlich` werden geprüft. |
| FR-029 | Jeder Setlistbearbeiter muss jeden selbst lesbaren Inhalt unabhängig von Eigentümer oder Band einfügen dürfen. Gemeinsame Overlay-Auswahl und -Reihenfolge sowie persönliche Übersteuerungen müssen getrennt sein. | Setlistberechtigung erweitert keine Inhalts- oder Overlayrechte; persönliche Einstellungen benötigen keinen Check-out. |
| FR-030 | Setlists müssen eine ablenkungsarme Nutzung ermöglichen und auch unvollständig verwendbar bleiben. | Zahl und Warnung nicht verfügbarer Inhalte erscheinen vor Offlinevorbereitung oder Auftritt, ohne automatische Blockade. |
| FR-031 | Setlists, lesbare Inhalte und aktuell berechtigte Overlays müssen gemeinsam für Offlineanzeige vorbereitet werden können. | Nicht lesbare Inhalte und Overlays sind markiert; verfügbare Teile bleiben nutzbar. |
| FR-032 | Setlists müssen genau einen aktuellen Stand ohne auswählbare Versionen oder Snapshots besitzen. Hinzufügen und Entfernen von Einträgen, Reihenfolge, gemeinsame Overlay-Auswahl und -Reihenfolge, Setlistmetadaten, Eigentum und relevante gemeinsame Berechtigungsänderungen müssen vollständig historisiert werden; persönliche Einstellungen nicht. Bei endgültiger Inhaltslöschung entsteht innerhalb dieser Historie nur der festgelegte minimale, nicht anklickbare Löschhinweis. | Vollständige gemeinsame Historie ist nachvollziehbar; der Löschhinweis enthält keine Datei, Basisinhalt, vollständigen Metadaten, Berechtigungen, früheren Benutzereigentümer oder Overlays. |

## Offline und Synchronisation im MVP

| ID | Verbindliche Anforderung | Verifikation |
| --- | --- | --- |
| FR-033 | Für lokale Inhalte und Overlays muss der Vorbereitungszustand vollständig, unvollständig oder nicht vorbereitet sichtbar sein. | Status entspricht dem tatsächlich lokal nutzbaren Umfang. |
| FR-034 | Der Synchronisationszustand muss verständlich und innerhalb des Qualitätskorridors sichtbar sein. | Start, Fortschritt, Erfolg und Fehler sind unterscheidbar. |
| FR-035 | Eigene, nur durch einen Benutzer beschreibbare Inhalte, Overlays und Setlists sowie persönliche Setlisteinstellungen müssen offline bearbeitbar sein. Offline dürfen nur bereits lokal bekannte und sichtbare Songs ausgewählt werden; unsichtbare Songs dürfen kein lokaler Katalog oder Vorschlag sein, freie Angaben bleiben bis zur Serverprüfung unaufgelöst. Offlineanlagen bleiben ohne Freigaben; bei Synchronisation erfolgt die Zuordnung gegen alle Songs ohne Beziehungslecks. Neu erteilte Rechte lösen keinen automatischen Download aus. | Lokale Auswahl, freie Eingabe, serverseitige Zuordnung oder Neuanlage und bewusste Offlinevorbereitung werden ohne Offenlegung unsichtbarer Beziehungen geprüft. |
| FR-036 | Private Offlineobjekte müssen eine technische Revisionskennung verwenden. Veraltete Änderungen, Synchronisation eines inzwischen gemeinsam bearbeitbaren Objekts ohne Check-out und Wiederbelebung eines endgültig gelöschten technischen Objekts müssen abgelehnt werden; Freigabe beziehungsweise Löschung bleiben wirksam. Automatisches Merge, stilles Überschreiben und Last-write-wins sind unzulässig. Der Server muss lokale Aktion, Synchronisation, Ablehnung und zulässigen Rettungsweg mit den festgelegten Offline-Auditfeldern einschließlich technischer datensparsamer Gerätekennung protokollieren. | Neuladen mit bewusstem Check-out, Verwerfen, neues privates Objekt und manuelle Übertragung sind als bewusste Wege verfügbar; lokale und serverseitige Zeit sowie Ablehnungsgrund bleiben unterscheidbar. |
| FR-037 | Eine Abmeldewarnung muss bei nicht synchronisierten Entwürfen ausdrücklich Abbruch oder vorherige Synchronisation erlauben; erst bestätigte Abmeldung entfernt lokale Inhalte und Sitzungsschlüssel. Plattformadministratoren müssen Gerätesitzungen serverseitig widerrufen können; ab dem nächsten Serverkontakt sind geschützte Zugriffe und Synchronisationen gesperrt, während die maximale Offlinesitzung das Restrisiko dauerhaft getrennter Geräte begrenzt. Widerruf und Folgeverwendung werden auditiert. Geschützte Daten, getrennte Entwürfe und endgültig gelöschte Objekte folgen den bestehenden Ablaufregeln. | Abmeldeabbruch, Synchronisation vor Bestätigung, Widerruf online und dauerhaft offline, Audit, Rechteentzug, Sitzungsablauf und Löschung werden geprüft. |

## Spätere mögliche Erweiterungen

Diese Punkte sind nicht Bestandteil des MVP. Ihre Umsetzung benötigt ein
eigenes freigegebenes Arbeitspaket.

| ID | Spätere mögliche Erweiterung |
| --- | --- |
| FR-038 | Kalender und Probenplanung. |
| FR-039 | Benachrichtigung auf Wunsch, wenn ein ausgechecktes Objekt wieder frei wird; keine Check-out-Warteschlange im MVP. |
| FR-040 | Audio- oder Übungsdateien als zusätzliche Inhaltsarten. |
| FR-042 | Weitergehender benutzergesteuerter Import aus ausdrücklich erlaubten Quellen. |
| FR-043 | Externe Cloudspeicher nach eigener Security-, Datenschutz- und Architekturentscheidung. |
| FR-044 | Gleichzeitige Echtzeit-Kollaboration jenseits des Check-out-Modells. |
| FR-045 | Öffentliche Freigabelinks mit gesonderter Rechte- und Ablaufkontrolle. |
| FR-046 | Erweiterte fachliche Statistiken. |

## Ausdrücklich nicht vorgesehen

Handschrift- und Musikerkennung sind keine eingeplanten Post-MVP-Anforderungen.
Sie dürfen frühestens nach Gesamtprodukt-Release als neue Feature Requests
bewertet werden.

| ID | Ausschluss |
| --- | --- |
| FR-041 | Handschrifterkennung ist bis auf Weiteres außerhalb des Scopes. |
| FR-047 | Automatisiertes Scraping fremder Musikplattformen. |
| FR-048 | Umgehung von Zugriffsbeschränkungen, Schutzmaßnahmen oder DRM. |
| FR-049 | Öffentlicher Handel mit Musikdokumenten. |
| FR-050 | Vollständiger Ersatz professioneller Notensatzsoftware. |
| FR-051 | Funktion einer Digital Audio Workstation. |
| FR-052 | Öffentliches soziales Musiknetzwerk. |
| FR-053 | Unkontrollierte Weitergabe urheberrechtlich geschützter Inhalte. |
| FR-061 | Musikerkennung ist bis auf Weiteres außerhalb des Scopes. |

## Entschiedene Querschnittsanforderungen

| ID | Verbindliche Anforderung |
| --- | --- |
| FR-054 | Benutzer dürfen gleichzeitig Mitglied mehrerer Bands und Gruppen sein. Bandbezogene Rechte bleiben je Bandbereich getrennt. |
| FR-055 | Eine Installation muss mehrere Bandbereiche unterstützen. Jede Band besitzt genau einen Bandbereich. Ausdrückliche Objektfreigaben über Bandgrenzen sind zulässig und verändern Eigentum nicht. |
| FR-056 | Export ist nicht Bestandteil des MVP. Später muss er globales und objektbezogenes `Exportieren` erfordern; Anzeigen oder Bearbeiten vermittelt weder Exportrecht noch pauschale Weitergabeberechtigung. Offlinebereitstellung ist kein Export. Der exportierende Benutzer bleibt für Nutzungsrechte, zulässige Weitergabe und geltende Beschränkungen verantwortlich; Format und technisches DRM-Verfahren bleiben unentschieden. |
| FR-057 | Der erste produktive Betrieb muss mindestens zwei unabhängige reguläre Bands, zusätzlich `Öffentlich`, Benutzer mit Mehrfachmitgliedschaften und nachgewiesene Berechtigungstrennung umfassen. |
| FR-058 | Jeder Inhalt muss genau einem Song gehören und genau einen aktuellen Basisinhalt ohne auswählbare Version oder Revision besitzen. Songänderungen gelten global. |
| FR-059 | Regulärer Eigentümer von Inhalt, Setlist oder Overlay muss ein nicht gelöschter Benutzer oder eine bestehende Band sein. Deaktivierung lässt Eigentum und Beziehungen bestehen, sperrt aber ihre Ausübung; nur aktive Benutzer dürfen neues Übertragungsziel sein. Wird Inhalt, Setlist oder nicht gekoppeltes Overlay durch Anlage oder Übertragung bandeigen, muss der Bandprinzipal atomar zusätzlich Anzeigen erhalten. Gekoppelte Overlays folgen dem Inhalt ohne separates Band-Anzeigenrecht. Bei Übertragung bleiben alle ausdrücklichen Objekt- und Sonderrechte erhalten; nur automatische Eigentümerrechte wechseln. Vor administrativer Benutzer- und Bandlöschung müssen Eigentums- und Rechtefolgen angezeigt und bestätigt werden. |
| FR-060 | Globale Aktionsrechte, Objektberechtigungen, Gruppen, Eigentum, Bandbereich, Overlay-Kopplung und Check-out müssen getrennt ausgewertet werden. Feste Overlay-Reichweitentypen und eigenständige Sichtbarkeitszustände sind ausgeschlossen. |
| FR-062 | Jeder Inhalt muss `Arrangeur/Interpret` als bestätigtes Pflichtfeld besitzen. Tonart, BPM-Tempo, Sekundendauer mit formatierter Anzeige, Niveau 1 bis 3 mit Symbolik, normalisierte Genres und Beschreibung müssen optional sein. Das Feld Bewertung entfällt. |
| FR-063 | In-App-Berechtigungsanfragen auf Anzeigen oder Bearbeiten müssen ohne bestehende Zielberechtigung für Benutzer und berechtigte Bands möglich sein. Offline darf ein Entwurf `noch nicht gesendet` erfasst werden; erst serverseitige Neuprüfung und erfolgreiche Übermittlung erzeugt `offen`. Empfänger, Fallback, Fehlerstatus und datensparsame Setlistanzeige müssen dem Referenzmodell folgen. |
| FR-064 | Eigentümerlose Objekte müssen vorhandene wirksame Rechte behalten. Nur Plattformadministratoren dürfen Eigentum und Berechtigungen ändern. Löschvormerkung muss Wiederherstellungsfrist, Lesbarkeit und Schreibsperren besitzen; nach Fristablauf muss automatisch endgültig gelöscht, ein technischer Zwischen- oder Fehlerzustand sichtbar und die fachliche Frist unverändert bleiben. Bei Inhaltslöschung müssen Overlays, aktuelle Setlistreferenzen und minimaler Historienhinweis atomar konsistent behandelt werden. |
| FR-065 | Audit muss nicht editierbar und für Plattformadministratoren durchsuchbar sein. Es muss den festgelegten Mindestdatensatz sowie zusätzliche Song-, Eigentums-, Check-out- und Offlinefelder führen, ohne Secrets, Dateien, Basisinhalte, unnötige Personen- oder Inhaltsdaten und ohne fachliche Versionierung. Fachliche Historien und Aufbewahrungsfristen bleiben getrennt; Auditexport gehört nicht zum MVP. |
| FR-066 | Jedes gemeinsam bearbeitbare Objekt außer Songs muss einen sitzungsgebundenen Check-out verwenden. Der Inhaber darf ihn beenden; ein aktiver persönlicher Eigentümer darf ihn am eigenen Objekt als begrenzte Eigentümerausnahme zurücknehmen. Bei Bandeigentum ist ausdrückliche Vertretungsbefugnis nötig; andere bestellte Rücknehmer benötigen globales und objektspezifisches `Check-out zurücknehmen`; Plattformadministratoren dürfen zurücknehmen, aber nicht umgehen. Inhalt, Overlay und Setlist bleiben getrennt. Lease-, Wiederverbindungs-, Rücknahme-, Mehrfachsitzungs- und dynamische Übergangsregeln gelten vollständig; Rücknahme entzieht nur die alte serverseitige Speicherberechtigung. |
| FR-070 | Es muss genau eine geschützte globale Systemgruppe `Alle Benutzer` geben. Jeder aktive Benutzer ist automatisch und nicht manuell entziehbar Mitglied. Ihr Basissatz muss globales Anzeigen und Bearbeiten innerhalb wirksamer Objektberechtigungen, eigene Inhalts-, Overlay- und Setlistanlagen samt atomarer Songanlage, direkte gekoppelte Overlayanlage, Overlay-Einreichung und -Privatkopie, Antrag auf `Öffentlich`, Setlistbefüllung und Selbstanfrage umfassen. Songänderung, Löschen, Berechtigungsverwaltung, Eigentumsübertragung, Bandanfrage, Overlay-Prüfung, Check-out-Rücknahme und Administration sind ausgeschlossen. Die beiden eigentümerspezifischen Sonderbefugnisse sind keine Rechte dieses Basissatzes. Deaktivierte oder gelöschte Benutzer verlieren die wirksamen Rechte. Nur Plattformadministratoren verwalten die nichteigentumsfähige Gruppe; ihr Mindestbasissatz darf ohne neue Produktentscheidung nicht reduziert werden und bleibt von `Öffentlich` getrennt. |
| FR-071 | Das globale Aktionsrecht `Nutzer einladen` (`user.invite`) muss ausschließlich durch Plattformadministratoren direkt an aktive Benutzer oder über globale Gruppen delegierbar sein. Es darf weder aus `Alle Benutzer` noch aus Band, Bandmitgliedschaft oder Bandgruppe entstehen. Berechtigte Einladende dürfen Einladungen erzeugen und nur eigene offene Einladungen ansehen, erneut senden oder widerrufen. Plattformadministratoren dürfen alle offenen Einladungen widerrufen. Bei gültiger Annahme bestätigt der Empfänger seine E-Mail-Adresse, setzt sein eigenes Passwort und wird durch das System automatisch als normaler Benutzer aktiviert. Das Konto erhält ausschließlich den Basissatz von `Alle Benutzer`; weitere globale Rechte, Gruppen, Bands und Objektberechtigungen werden getrennt vergeben. Der Einladende darf Konten nicht manuell aktivieren, deaktivieren oder löschen, keine Rechte oder Administratorstellung vergeben, MFA anderer Benutzer nicht zurücksetzen und Einladungen anderer nicht verwalten. | Direkte und globale Gruppendelegation, fehlende Bandvermittlung, Eigenverwaltung offener Einladungen, administrativer Gesamtwiderruf, gültige Annahme, ausschließlicher Basissatz und alle ausgeschlossenen Befugnisse werden positiv und negativ geprüft. |

## Verbindliches Zielmodell nach dem MVP

| ID | Anforderung nach dem MVP |
| --- | --- |
| FR-067 | Gemeinsame Inhalte, dynamisch gekoppelte Overlays und gemeinsame Setlists müssen über einen bewusst online angeforderten Offline-Check-out mit technischer Revisionskennung, fester separater Lease und konfliktfreier atomarer Synchronisation offline bearbeitbar werden. |

## Weitere spätere Anforderungen

| ID | Spätere Anforderung |
| --- | --- |
| FR-068 | Für Songs soll eine optimistische Konkurrenzprüfung einen auf veraltetem Stand beruhenden Speicherversuch ablehnen. |
| FR-069 | Ein optionales Bewertungssystem darf in einem späteren Arbeitspaket fachlich konkretisiert werden; im aktuellen Modell existiert kein Bewertungsfeld. |

## Noch nicht nummerierte technische Festlegungen

Folgende Verfahren sind angenommene Architekturentscheidungen und keine
zusätzlichen Produktfunktionen: konkrete MFA-Lösung, lokale Verschlüsselung,
Synchronisationstechnik sowie Referenzmessbedingungen. Sie stehen im
[ADR-Index](../architecture/decisions/README.md). Das initiale
[Ressourcenbudget](../architecture/RESOURCE-BUDGET.md) schließt `OQ-016`; seine
technische TST-Verifikation vor PRD bleibt erforderlich.
