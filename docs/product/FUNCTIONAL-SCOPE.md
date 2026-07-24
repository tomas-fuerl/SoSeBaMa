# Funktionaler Scope

## Bezug und Leseregel

Dieses Dokument konkretisiert GitHub-Issue #3. Jede funktionale Anforderung
besitzt eine stabile `FR-xxx`-Kennung. Eine Kennung wird nicht wiederverwendet;
ersetzte oder verworfene Anforderungen bleiben nachvollziehbar markiert.

Jeder produktiv nutzbare SoSeBaMa-MVP besteht aus zwei Ebenen:

1. der verbindlichen produktweiten Basis `FR-001` bis `FR-007`, die immer
   vollständig erfüllt sein muss,
2. einem zusätzlichen fachlichen Funktionsschnitt aus den nachfolgend
   beschriebenen Kandidaten.

`OQ-005` entscheidet ausschließlich über diesen zusätzlichen fachlichen
Funktionsschnitt und dessen Lieferreihenfolge. Zusätzlich gelten die
verbindlichen fachlichen Querschnittsanforderungen `FR-058` bis `FR-060`.
Die Entscheidung kann weder eine Anforderung der verbindlichen Basis noch eine
Querschnittsanforderung abwählen oder auf eine spätere Erweiterung verschieben.

Das zugrunde liegende fachliche Modell ist im
[Inhalts-, Versions- und Referenzmodell](../architecture/CONTENT-VERSION-REFERENCE-MODEL.md)
zusammenhängend beschrieben.

## Verbindliche Basis jedes produktiven MVP

`FR-001` bis `FR-007` sind weder optional noch MVP-Kandidaten. Jeder
produktive MVP muss sie nachweisbar erfüllen, unabhängig davon, welche
fachlichen Funktionen durch `OQ-005` zusätzlich ausgewählt werden.

| ID | Anforderung | Verifikation |
| --- | --- | --- |
| FR-001 | SoSeBaMa muss mehrere Benutzer mit getrennten fachlichen Berechtigungen unterstützen. | Mindestens zwei Benutzer können im selben Arbeitsbereich unterschiedliche erlaubte und verbotene Aktionen nachvollziehbar ausführen. |
| FR-002 | Die zentrale Datenhaltung muss der fachlich maßgebliche Datenbestand sein. | Nach erfolgreichem Abgleich ist der zentrale Stand eindeutig erkennbar; lokale Kopien werden nicht still zum konkurrierenden Hauptbestand. |
| FR-003 | Jede geschützte Aktion muss anhand der aktuell wirksamen Rolle im betroffenen Arbeitsbereich erlaubt oder abgelehnt werden. | Rollenbasierte Positiv- und Negativfälle sind für jeden geschützten Kernablauf nachweisbar. |
| FR-004 | Berechtigte Benutzer müssen ausgewählte Inhalte gezielt für eine erlaubte Offlineverwendung vorbereiten können. | Auswahl, Vorbereitungszustand und erfolgreiche Offlineöffnung sind ohne implizite Gesamtkopie nachvollziehbar. |
| FR-005 | Offline-, Speicher-, Synchronisations-, Fehler- und Konfliktzustände müssen verständlich sichtbar sein. | Ein Benutzer kann in den zugehörigen Kernabläufen Zustand und erforderliche nächste Handlung bestimmen. |
| FR-006 | Annotation oder Bearbeitung darf ein Originaldokument nicht unbemerkt zerstören. | Original und zusätzliche oder bearbeitete Inhalte bleiben unterscheidbar; ein unbeabsichtigtes Überschreiben wird verhindert. |
| FR-007 | Import muss benutzergesteuert erfolgen und darf keine automatisierte unkontrollierte Inhaltsübernahme auslösen. | Jeder Import beginnt mit einer bewussten Benutzeraktion und zeigt Ergebnis oder Fehler eindeutig an. |

## Verbindliche fachliche Querschnittsanforderungen

`FR-058` bis `FR-060` präzisieren das verbindliche Inhaltsmodell. Sie gelten
für jeden produktiv nutzbaren SoSeBaMa-MVP zusätzlich zu `FR-001` bis `FR-007`
und sind keine durch `OQ-005` auswählbaren Funktionskandidaten.

| ID | Anforderung | Verifikation |
| --- | --- | --- |
| FR-058 | Jeder Inhalt muss genau ein Original besitzen. Freigaben, Setlists, Songfassungen und persönliche oder Gruppen-Overlays müssen dieses Original beziehungsweise eine festgelegte Revision referenzieren, statt gruppenspezifische Kopien zu erzeugen. | Mehrfachfreigaben, Setlisteinträge und Overlays verweisen nachweislich auf dasselbe Original; Änderungen eines Overlays verändern das Original nicht. |
| FR-059 | Eigentümer eines Inhalts muss ein Benutzer, eine Gruppe oder die Plattform sein. Bei Benutzerlöschung werden private Inhalte entfernt und Gruppeninhalte an die Gruppe übertragen; bei Gruppenlöschung gehen Gruppeninhalte an den verantwortlichen Administrator oder einen beim Löschen bestimmten Nachfolger. Eine freiwillige Übertragung an die Plattform muss möglich sein. Ein zuvor privater Inhalt bleibt danach privat und wird als privater Inhalt des Plattformeigentümers geführt. | Für jede Eigentümerart sowie Benutzerlöschung, Gruppenlöschung und freiwillige Plattformübertragung ist der resultierende Eigentümer beziehungsweise die Entfernung eindeutig und nachvollziehbar; eine Plattformübertragung veröffentlicht einen privaten Inhalt nicht. |
| FR-060 | Eigentum, Sichtbarkeit und Berechtigungen müssen unabhängig behandelt werden. Ein Inhalt darf mehreren Gruppen freigegeben und zugleich öffentlich sichtbar sein, während der Eigentümer ihn verwaltet. Gruppenpublizierte Inhalte müssen durch den ursprünglichen Ersteller, Gruppenadministratoren und ausdrücklich berechtigte weitere Gruppenrollen differenziert verwaltbar sein. Spätere Änderungen der Sichtbarkeit oder Gruppenzuordnung benötigen die nachvollziehbare Zustimmung eines Gruppenadministrators. Für neue Revisionen sind weiterhin Eigentümererlaubnis und wirksames Gruppenrecht erforderlich. | Kombinierte Mehrgruppen- und öffentliche Freigaben verändern das Eigentum nicht. Bearbeiten, Revisionserstellung, Auslösen oder Beantragen einer Sichtbarkeitsänderung, Freigabeverwaltung, Archivieren, Löschen und Rollenzuweisung lassen sich getrennt erlauben oder ablehnen. Rücknahme, externe Veröffentlichung, weitere Gruppenfreigabe und Gruppenwechsel werden ohne Gruppenadmin-Zustimmung verhindert; jede Zustimmung ist nachvollziehbar. |

## Fachliche Kandidaten für den ersten MVP-Funktionsschnitt

`FR-008` bis `FR-037` gehören zum vorgesehenen Produktumfang. `OQ-005`
entscheidet, welche dieser zusätzlichen Anforderungen den ersten
Funktionsschnitt bilden. Abhängige Detailentscheidungen sind jeweils genannt.

### Benutzer und Zusammenarbeit

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-008 | Eine berechtigte Administration muss Benutzer einladen und Mitgliedschaften deaktivieren können. | Umfang und Ablauf der Einladung bleiben technologieoffen. |
| FR-009 | SoSeBaMa muss private, gruppenbezogene und öffentliche Sichtbarkeit unabhängig von Eigentum, Overlay-Ziel und Änderungsberechtigungen behandeln. Neue Inhalte sind standardmäßig privat. Jeder Benutzer darf privat, eine bestimmte Gruppe oder öffentlich als persönliche Standardsichtbarkeit hinterlegen und die Voreinstellung bei jeder Erstellung überschreiben. | Eine Gruppe ist nur bei vorhandener Veröffentlichungsberechtigung auswählbar und darf nach deren Entzug nicht weiter als Ziel der Standardsichtbarkeit verwendet werden; Detailumfang der Gruppenrollen: `OQ-004`. |
| FR-010 | SoSeBaMa soll einen optionalen zusätzlichen Authentifizierungsfaktor ermöglichen, ohne ein Produkt oder Verfahren festzulegen. | Rollen, Auslöser und Verbindlichkeit: `OQ-020`. |

### Songs

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-011 | Ein berechtigter Benutzer muss einen Song mit Titel und fachlich erforderlichen Metadaten anlegen können. | Der genaue Metadatenkatalog wird in einem späteren Facharbeitspaket bestimmt. |
| FR-012 | Songs müssen gesucht, gefiltert und sortiert werden können. | Konkrete Suchfelder und Sortierregeln folgen aus dem Metadatenkatalog. |
| FR-013 | Ein Song muss mehrere unterscheidbare Songfassungen besitzen können; jede Songfassung muss eine eigene nachvollziehbare Folge von Revisionen führen. | Fassungen bleiben voneinander unterscheidbar; jede Änderung ist genau einer Fassung und Revision zugeordnet. |
| FR-014 | Benutzer, Gruppen und Setlists müssen für ihre zulässigen Referenzen zwischen einer Rolling Reference auf die aktuelle Revision und einer Pinned Reference auf eine bestimmte Revision wählen können. Eine Setlist muss zusätzlich immer aktuell oder stabil beziehungsweise festgesetzt als Standardstrategie vorgeben; jeder Song darf diese Vorgabe überschreiben. | Ein Setlisteintrag erbt die Setliststrategie oder besitzt eine eindeutige Rolling beziehungsweise ausdrücklich Pinned Überschreibung. Eine neue Revision aktualisiert Rolling References, während Pinned References unverändert bleiben; keine Strategie kopiert Songinhalte. |

### PDF-Dokumente

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-015 | Ein berechtigter Benutzer muss ein zulässiges PDF hinzufügen und anzeigen können. | Uploadgrenzen werden aus Security- und Qualitätsanforderungen abgeleitet. |
| FR-016 | Die PDF-Anzeige muss eine eindeutige Seitennavigation unterstützen. | Konkrete Bediengesten sind keine Entscheidung dieses Arbeitspakets. |
| FR-017 | Die PDF-Anzeige muss eine für das Lesen geeignete Vergrößerung und Verkleinerung unterstützen. | Messbare Geräte- und Reaktionsziele: `OQ-010`, `OQ-011`. |
| FR-018 | Berechtigte Benutzer müssen PDFs per Touch oder Stift annotieren können. | Unterstützte Werkzeuge und Geräteklassen: `OQ-010`. |
| FR-019 | Annotationen und andere Zusatzinformationen müssen als persönlich zugeordnetes oder Gruppen-Overlay getrennt vom referenzierten Original geführt werden können. | Persönliche Zuordnung, Eigentümer, Ersteller, Sichtbarkeit und Bearbeitungsberechtigung bleiben unterscheidbar; Detailumfang der Gruppenbearbeitung: `OQ-004`. |
| FR-020 | Ausgewählte PDFs und berechtigte Annotationen müssen offline bereitgestellt und angezeigt werden können. | Offline-Schreibumfang und Sitzungsdauer: `OQ-006`, `OQ-007`. |

### Texte und Akkorde

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-021 | Berechtigte Benutzer müssen Text- und Akkordblätter manuell anlegen können. | Gemeinsame Änderungsrechte: `OQ-004`. |
| FR-022 | Text- und Akkordblätter müssen im erlaubten Umfang bearbeitbar sein. | Offline- und Rollenabgrenzung: `OQ-004`, `OQ-006`. |
| FR-023 | Text- und Akkordinhalte müssen durch benutzergesteuertes Copy-and-paste importiert werden können. | Weitere Importwege sind nicht Teil dieser Anforderung. |
| FR-024 | Akkorde müssen erkannt oder strukturiert dargestellt werden können, ohne die freie Verwaltung des Inhalts an einen Drittanbieter zu binden. | Unterstützte Schreibweisen werden später fachlich festgelegt. |
| FR-025 | Strukturierte Akkorde müssen kontrolliert transponiert werden können, ohne den Ausgangsinhalt unbemerkt zu zerstören. | Darstellung alternativer Tonarten bleibt fachlich zu präzisieren. |
| FR-026 | Text- und Akkordblätter müssen für Probe oder Auftritt automatisch scrollen können; Start, Stopp und Kontrolle bleiben beim Benutzer. | Messbare Reaktion und Bedienung: `OQ-011`. |
| FR-027 | Ausgewählte Text- und Akkordblätter müssen offline verfügbar sein. | Offline-Schreibumfang und Sitzungsdauer: `OQ-006`, `OQ-007`. |

### Setlists

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-028 | Berechtigte Benutzer müssen Setlists im Eigentum eines Benutzers oder einer Gruppe anlegen und als eigenständige Setlist kopieren können. | Die neue Setlist besitzt den bestimmten Eigentümer; eine Kopie ist keine Version und besitzt eine eigene Historie. |
| FR-029 | Songs beziehungsweise Songfassungen müssen einer Setlist hinzugefügt, daraus entfernt und eindeutig geordnet werden können. Die Setlist muss immer aktuell oder stabil beziehungsweise festgesetzt als Standardstrategie besitzen. Hinzugefügte Songs erben diese Strategie, dürfen sie aber einzeln durch eine Rolling Reference oder eine ausdrücklich Pinned Reference überschreiben. | Reihenfolge, Setliststandard, Vererbung und jede Eintragsüberschreibung sind eindeutig. Änderungen des Standards betreffen nur erbende Einträge; Setlisteinträge kopieren keinen Songinhalt. |
| FR-030 | Eine Setlist muss eine für Probe oder Auftritt geeignete, ablenkungsarme Nutzung der freigegebenen Inhalte ermöglichen. | Konkrete Oberflächengestaltung ist nicht Bestandteil dieses Arbeitspakets. |
| FR-031 | Eine Setlist und ihre erforderlichen Dokumente müssen gemeinsam für die Offlineverwendung vorbereitet werden können. | Genauer MVP-Inhalt: `OQ-005`; Offline-Schreibumfang: `OQ-006`. |
| FR-032 | Eine Setlist muss genau einen aktuellen Stand und eine vollständige Änderungshistorie besitzen; parallel auswählbare Setlistversionen sind nicht vorgesehen. | Zu jedem Zeitpunkt ist genau ein aktueller Stand bestimmbar und jede Änderung nachvollziehbar; ein unabhängiger Stand entsteht ausschließlich durch Kopieren. |

### Offline und Synchronisation

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-033 | SoSeBaMa muss für ausgewählte Inhalte anzeigen, ob sie lokal vollständig, unvollständig oder nicht vorbereitet sind. | Geräte- und Speichergrenzen folgen aus `OQ-010` und `OQ-016`. |
| FR-034 | SoSeBaMa muss den aktuellen Synchronisationszustand verständlich anzeigen. | Messbare Rückmeldezeiten: `OQ-011`. |
| FR-035 | Noch nicht übertragene lokale Änderungen müssen in einer erkennbaren Warteschlange verbleiben, bis sie erfolgreich behandelt oder bewusst verworfen wurden. | Zulässige Änderungstypen: `OQ-006`. |
| FR-036 | Fehler und fachliche Konflikte müssen sichtbar sein und dürfen nicht als erfolgreicher Abgleich erscheinen. | Konfliktlösungsregeln werden je Änderungstyp später fachlich definiert. |
| FR-037 | Lokale Inhalte müssen bei Abmeldung, Geräteverlust oder Rechteentzug kontrolliert gesperrt oder entfernt werden können. | Fristen und Umgang mit offenen Änderungen: `OQ-007`, `OQ-008`. |

## Spätere Erweiterungen

Diese Anforderungen sind mögliche Erweiterungen und für den ersten produktiv
sinnvollen Stand nicht vorausgesetzt. Eine spätere Aufnahme benötigt ein
eigenes freigegebenes Arbeitspaket.

| ID | Mögliche Erweiterung |
| --- | --- |
| FR-038 | Kalender und Probenplanung. |
| FR-039 | Benachrichtigungen zu fachlich relevanten Änderungen. |
| FR-040 | Audio- oder Übungsdateien als zusätzliche Songdokumente. |
| FR-041 | Optische Zeichenerkennung für benutzergesteuert eingebrachte Dokumente. |
| FR-042 | Weitergehender automatischer Dokumentimport aus ausdrücklich erlaubten Quellen. |
| FR-043 | Anbindung externer Cloudspeicher nach separater Security- und Datenschutzbewertung. |
| FR-044 | Echtzeit-Kollaboration an gemeinsam bearbeitbaren Inhalten. |
| FR-045 | Öffentliche Freigabelinks mit gesonderter Rechte- und Ablaufkontrolle. |
| FR-046 | Erweiterte fachliche Statistiken. |

## Ausdrücklich nicht vorgesehen

| ID | Ausschluss |
| --- | --- |
| FR-047 | Automatisiertes Scraping fremder Musikplattformen. |
| FR-048 | Umgehung von Zugriffsbeschränkungen, technischen Schutzmaßnahmen oder DRM. |
| FR-049 | Öffentlicher Handel mit Musikdokumenten. |
| FR-050 | Vollständiger Ersatz professioneller Notensatzsoftware. |
| FR-051 | Funktion einer Digital Audio Workstation. |
| FR-052 | Öffentliches soziales Musiknetzwerk. |
| FR-053 | Unkontrollierte Weitergabe urheberrechtlich geschützter Inhalte. |

## Weitere noch nicht entschiedene Produktgrenzen

| ID | Offene funktionale Grenze | Entscheidung |
| --- | --- | --- |
| FR-054 | Mitgliedschaft eines Benutzers in mehreren Arbeitsbereichen. | `OQ-001` |
| FR-055 | Ein oder mehrere Arbeitsbereiche je Installation. | `OQ-002` |
| FR-056 | Umfang exportierbarer Dokumente und Annotationen. | `OQ-014` |
| FR-057 | Erster Zielbetrieb für eine oder mehrere Bands. | `OQ-015` |

## Übergreifende Grenzen

- Inhalte werden nur aufgrund einer bewussten Benutzeraktion importiert.
- Benutzer bleiben für Herkunft, Nutzungsrecht und zulässige Weitergabe der von
  ihnen eingebrachten Inhalte verantwortlich.
- Weder eine funktionale Anforderung noch ein offener Punkt legt
  Programmiersprache, Framework, Datenbank, Authentifizierungsprodukt,
  Synchronisationstechnologie oder Deploymentarchitektur fest.
- Security-Anforderungen stehen in
  [Security-Anforderungen](SECURITY-REQUIREMENTS.md), messbare Qualität in
  [Qualitätsanforderungen](QUALITY-ATTRIBUTES.md).
