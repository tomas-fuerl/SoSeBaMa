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
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md)
zusammenhängend beschrieben.

## Verbindliche Basis jedes produktiven MVP

`FR-001` bis `FR-007` sind weder optional noch MVP-Kandidaten. Jeder
produktive MVP muss sie nachweisbar erfüllen, unabhängig davon, welche
fachlichen Funktionen durch `OQ-005` zusätzlich ausgewählt werden.

| ID | Anforderung | Verifikation |
| --- | --- | --- |
| FR-001 | SoSeBaMa muss mehrere Benutzer, mehrere Bands und mehrere voneinander getrennte Bandbereiche unterstützen. Ein Benutzer darf Mitglied mehrerer Bands sein. | Mindestens zwei Benutzer können in mehreren Bandbereichen unterschiedliche Mitgliedschaften und Berechtigungen besitzen, ohne dass Rechte zwischen Bands übertragen werden. |
| FR-002 | Die zentrale Datenhaltung muss der fachlich maßgebliche Datenbestand sein. | Nach erfolgreichem Abgleich ist der zentrale aktuelle Stand eindeutig erkennbar; lokale Kopien werden nicht still zum konkurrierenden Hauptbestand. |
| FR-003 | Jede geschützte Aktion muss anhand der aktuell wirksamen globalen oder bandbezogenen Rollen, Direktrechte, Objektfreigaben und Schutzgrenzen erlaubt oder abgelehnt werden. | Positive und negative Autorisierungsfälle sind für jeden geschützten Kernablauf, jeden relevanten Bandbereich sowie Rollen- und Direktrechte nachweisbar. |
| FR-004 | Berechtigte Benutzer müssen ausgewählte Inhalte gezielt für eine erlaubte Offlineverwendung vorbereiten können. | Auswahl, Vorbereitungszustand und erfolgreiche Offlineöffnung sind ohne implizite Gesamtkopie nachvollziehbar. |
| FR-005 | Offline-, Speicher-, Synchronisations-, Fehler-, Check-out- und Konfliktzustände müssen verständlich sichtbar sein. | Ein Benutzer kann in den zugehörigen Kernabläufen den Zustand und die erforderliche nächste Handlung eindeutig bestimmen. |
| FR-006 | Annotationen, Transpositionen oder sonstige Overlay-Änderungen dürfen das Original eines Inhalts nicht unbemerkt verändern oder zerstören. | Original, aktueller Inhaltsstand und angewendete Overlays bleiben unterscheidbar; ein unbeabsichtigtes Überschreiben wird verhindert. |
| FR-007 | Import muss benutzergesteuert erfolgen und darf keine automatisierte unkontrollierte Inhaltsübernahme auslösen. | Jeder Import beginnt mit einer bewussten Benutzeraktion und zeigt Erfolg oder Fehler eindeutig an. |

## Verbindliche fachliche Querschnittsanforderungen

`FR-058` bis `FR-060` präzisieren das verbindliche Inhalts-, Rechte- und
Kollaborationsmodell. Sie gelten für jeden produktiv nutzbaren SoSeBaMa-MVP
zusätzlich zu `FR-001` bis `FR-007` und sind keine durch `OQ-005`
abwählbaren Funktionskandidaten.

| ID | Anforderung | Verifikation |
| --- | --- | --- |
| FR-058 | Jeder konkrete Inhalt muss genau einem Song zugeordnet sein, genau einen aktuellen Stand und genau ein Original ohne angewendete Overlays besitzen. Ein Song darf mehreren konkreten Inhalten zugrunde liegen. Frühere Änderungen werden historisiert, bilden aber keine auswählbaren Fassungen oder Versionen. Setlists und Overlays referenzieren konkrete Inhalte und erzeugen keine inhaltsgleichen Bandkopien. | Song und Inhalt sind eindeutig unterscheidbar. Jeder Inhalt besitzt genau einen Songbezug und aktuellen Stand. Frühere Historieneinträge können nicht als alternativer Inhalt oder Setlisteintrag ausgewählt werden. Setlists und Overlays verweisen nachweislich auf bestehende konkrete Inhalte. |
| FR-059 | Eigentümer eines Inhalts muss genau ein Benutzer, eine Band oder die Plattform sein. Bei Benutzerlöschung werden ausschließlich private Inhalte gemäß dem beschlossenen Löschmodell entfernt; bereits als Bandinhalt geführte Inhalte gehen an die zuständige Band über. Bei Bandlöschung muss für jeden verbleibenden Inhalt ein eindeutiger Nachfolger bestimmt werden. Eine freiwillige Übertragung an die Plattform muss möglich sein; ein zuvor privater Inhalt bleibt danach privat. | Für jede Eigentümerart, Benutzerlöschung, Bandlöschung und freiwillige Plattformübertragung ist der resultierende Eigentümer beziehungsweise die Entfernung eindeutig und nachvollziehbar. Kein Eigentumswechsel erweitert still die Sichtbarkeit. |
| FR-060 | Eigentum, Ersteller, Songzuordnung, Sichtbarkeit, Rollen, Direktrechte, Objektfreigaben, Overlay-Reichweite und Bearbeitungsberechtigung müssen getrennt behandelt werden. Ein Inhalt darf ausschließlich privat bleiben, einer oder mehreren Bands bereitgestellt oder öffentlich sichtbar sein. Zu einem Inhalt dürfen mehrere private, Band- und globale Overlays bestehen und gleichzeitig dargestellt werden. Gemeinsam bearbeitbare Inhalte sowie Band- und globale Overlays müssen bei bestehender Verbindung vor einer Änderung ausgecheckt werden. Es gilt first come, first save; parallele Bearbeitung, stilles Überschreiben und automatisches Zusammenführen sind ausgeschlossen. Ein berechtigter Bandadministrator darf einen Check-out ausschließlich im eigenen Bandbereich nachvollziehbar zurücknehmen. | Kombinierte Sichtbarkeiten verändern das Eigentum nicht. Rollen- und Direktrechte lassen sich getrennt erlauben oder ablehnen. Private Inhalte benötigen keine Bandzuordnung. Mehrere Overlays können gleichzeitig und überlappend dargestellt werden, ohne das Original zu verändern. Ein zweiter Bearbeiter wird während eines wirksamen Check-outs blockiert; Rechteentzug und administrative Rücknahme verhindern weiteres Speichern und sind nachvollziehbar. |

## Fachliche Kandidaten für den ersten MVP-Funktionsschnitt

`FR-008` bis `FR-037` gehören zum vorgesehenen Produktumfang. `OQ-005`
entscheidet, welche dieser zusätzlichen Anforderungen den ersten
Funktionsschnitt bilden. Abhängige Detailentscheidungen sind jeweils genannt.

### Benutzer, Bands und Zusammenarbeit

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-008 | Eine berechtigte Administration muss Benutzer in einen Bandbereich einladen, Mitgliedschaften deaktivieren sowie zulässige Bandrollen und Direktrechte zuweisen oder entziehen können. | Umfang und Ablauf der Einladung bleiben technologieoffen; abschließende Rollen- und Aktionsmatrix: `OQ-004`. |
| FR-009 | SoSeBaMa muss private, bandbezogene und öffentliche Sichtbarkeit unabhängig von Eigentum, Overlay-Reichweite und Änderungsberechtigungen behandeln. Neue Inhalte sind standardmäßig privat. Jeder Benutzer darf privat, eine bestimmte berechtigte Band oder öffentlich als persönliche Standardsichtbarkeit hinterlegen und die Voreinstellung bei jeder Erstellung überschreiben. | Eine Band ist nur bei vorhandener Veröffentlichungsberechtigung auswählbar und darf nach deren Entzug nicht weiter als Ziel der Standardsichtbarkeit verwendet werden; Detailmatrix: `OQ-004`. |
| FR-010 | SoSeBaMa soll einen optionalen zusätzlichen Authentifizierungsfaktor ermöglichen, ohne ein Produkt oder Verfahren festzulegen. | Rollen, Auslöser und Verbindlichkeit: `OQ-020`. |

### Songs und Inhalte

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-011 | Ein berechtigter Benutzer muss einen Song mit Titel und fachlich erforderlichen normalisierten Metadaten anlegen und bearbeiten können. | Der genaue Metadatenkatalog wird in einem späteren Facharbeitspaket bestimmt. |
| FR-012 | Songs und ihre zugeordneten konkreten Inhalte müssen gesucht, gefiltert und sortiert werden können. | Konkrete Suchfelder und Sortierregeln folgen aus dem Metadatenkatalog. |
| FR-013 | Ein Song darf ohne konkreten Inhalt bestehen und mehreren konkreten Inhalten zugrunde liegen. Jeder konkrete Inhalt muss genau einem Song zugeordnet sein und darf ausschließlich privat bleiben. | Unterstützte Inhaltsarten und Pflichtmetadaten werden in den jeweils zugehörigen Anforderungen festgelegt. |
| FR-014 | Songs und Inhalte müssen genau einen aktuellen Stand sowie eine nachvollziehbare Änderungshistorie besitzen. Ein Inhalt darf eigene Metadaten führen, die von den normalisierten Songmetadaten abweichen. Frühere Änderungen dürfen nicht als auswählbare Fassung, Version oder alternatives Original angeboten werden. | Anzeige und Herkunft abweichender Inhaltsmetadaten müssen eindeutig sein; die konkrete technische Historisierung bleibt offen. |

### PDF-Inhalte

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-015 | Ein berechtigter Benutzer muss ein zulässiges PDF als konkreten Inhalt genau einem Song zuordnen, hinzufügen und anzeigen können. | Uploadgrenzen werden aus Security- und Qualitätsanforderungen abgeleitet. |
| FR-016 | Die PDF-Anzeige muss eine eindeutige Seitennavigation unterstützen. | Konkrete Bediengesten sind keine Entscheidung dieses Arbeitspakets. |
| FR-017 | Die PDF-Anzeige muss eine für das Lesen geeignete Vergrößerung und Verkleinerung unterstützen. | Messbare Geräte- und Reaktionsziele: `OQ-010`, `OQ-011`. |
| FR-018 | Berechtigte Benutzer müssen PDF-Inhalte per Touch oder Stift über ein geeignetes Overlay annotieren können. | Unterstützte Werkzeuge und Geräteklassen: `OQ-010`; Rollen- und Aktionsmatrix: `OQ-004`. |
| FR-019 | Zu einem PDF-Inhalt müssen mehrere private, Band- und globale Overlays angelegt, ausgewählt und gleichzeitig dargestellt werden können. Überlappungen sind zulässig; jedes Overlay bleibt vom Original und von anderen Overlays getrennt. | Globale Overlays werden durch den Inhaltseigentümer bereitgestellt. Bearbeitungsrechte und administrative Grenzen folgen aus `OQ-004`. |
| FR-020 | Ausgewählte PDF-Inhalte und berechtigte Overlays müssen offline bereitgestellt und angezeigt werden können. | Offline-Schreibumfang privater Overlays und Sitzungsdauer: `OQ-006`, `OQ-007`. |

### Text- und Chord-Inhalte

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-021 | Berechtigte Benutzer müssen Text- und Chord-Inhalte manuell anlegen und genau einem Song zuordnen können. | Konkrete Pflichtstruktur und Inhaltsmetadaten werden später fachlich präzisiert. |
| FR-022 | Private Text- und Chord-Inhalte müssen im erlaubten Umfang bearbeitbar sein. Gemeinsam verwaltete Inhalte müssen bei bestehender Verbindung vor der Bearbeitung ausgecheckt werden; parallele gemeinsame Bearbeitung ist zu blockieren. | Abschließende Rollen- und Direktrechte: `OQ-004`; zulässige private Offlineänderungen: `OQ-006`. |
| FR-023 | Text- und Chord-Inhalte müssen durch benutzergesteuertes Copy-and-paste importiert werden können. | Weitere Importwege sind nicht Teil dieser Anforderung. |
| FR-024 | Chords müssen erkannt oder strukturiert dargestellt werden können, ohne die freie Verwaltung des Inhalts an einen Drittanbieter zu binden. | Unterstützte Schreibweisen werden später fachlich festgelegt. |
| FR-025 | Strukturierte Chords müssen über ein Overlay kontrolliert transponiert, einzeln geändert oder vereinfacht werden können, ohne das Original zu verändern. | Darstellungs- und Bedienregeln für mehrere gleichzeitig aktive Chord-Overlays werden später präzisiert. |
| FR-026 | Text- und Chord-Inhalte müssen für Probe oder Auftritt automatisch scrollen können; Start, Stopp und Kontrolle bleiben beim Benutzer. | Messbare Reaktion und Bedienung: `OQ-011`. |
| FR-027 | Ausgewählte Text- und Chord-Inhalte sowie berechtigte Overlays müssen offline verfügbar sein. | Offline-Schreibumfang privater Overlays und Sitzungsdauer: `OQ-006`, `OQ-007`. |

### Setlists

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-028 | Berechtigte Benutzer müssen Setlists im Eigentum eines Benutzers oder einer Band anlegen und als eigenständige Setlist kopieren können. | Eine Kopie besitzt eigenes Eigentum und eine eigene Änderungshistorie; Inhalte und Overlays werden nicht kopiert. |
| FR-029 | Konkrete Inhalte müssen einer Setlist hinzugefügt, daraus entfernt und eindeutig geordnet werden können. Für jeden Setlisteintrag müssen eine bandweite und eine persönliche Overlay-Auswahl unterscheidbar sein. Berechtigte Benutzer dürfen Setlisteinträge nur für ihre persönliche Ansicht ausblenden, ohne die bandweite Setlist zu verändern. | Abschließende Rechte für bandweite Overlay-Auswahl, persönliche Ausblendung und Setlistverwaltung: `OQ-004`. |
| FR-030 | Eine Setlist muss eine für Probe oder Auftritt geeignete, ablenkungsarme Nutzung der freigegebenen konkreten Inhalte und aktiven Overlays ermöglichen. | Konkrete Oberflächengestaltung ist nicht Bestandteil dieses Arbeitspakets. |
| FR-031 | Eine Setlist, ihre konkreten Inhalte und die dafür berechtigten ausgewählten Overlays müssen gemeinsam für die Offlineverwendung vorbereitet werden können. | Genauer MVP-Inhalt: `OQ-005`; Offline-Schreibumfang: `OQ-006`. |
| FR-032 | Eine Setlist muss genau einen aktuellen Stand und eine vollständige Änderungshistorie besitzen. Parallel auswählbare Setlistversionen und Referenzstrategien sind nicht vorgesehen. | Zu jedem Zeitpunkt ist genau ein aktueller Stand bestimmbar; ein unabhängiger Planungsstand entsteht ausschließlich durch Kopieren. |

### Offline und Synchronisation

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-033 | SoSeBaMa muss für ausgewählte Inhalte und Overlays anzeigen, ob sie lokal vollständig, unvollständig oder nicht vorbereitet sind. | Geräte- und Speichergrenzen folgen aus `OQ-010` und `OQ-016`. |
| FR-034 | SoSeBaMa muss den aktuellen Synchronisationszustand verständlich anzeigen. | Messbare Rückmeldezeiten: `OQ-011`. |
| FR-035 | Noch nicht übertragene zulässige private Änderungen müssen in einer erkennbaren Warteschlange verbleiben, bis sie erfolgreich behandelt oder bewusst verworfen wurden. Gemeinsam verwaltete Inhalte sowie Band- und globale Overlays dürfen offline nicht kollaborativ bearbeitet werden. | Zulässige private Änderungstypen: `OQ-006`. |
| FR-036 | Fehler und fachliche Konflikte müssen sichtbar sein und dürfen nicht als erfolgreicher Abgleich erscheinen. Für gemeinsam verwaltete Objekte dürfen weder automatisches Zusammenführen noch stilles Überschreiben einen Check-out-Konflikt umgehen. | Konfliktlösungsregeln für zulässige private Offlineänderungen werden je Änderungstyp später fachlich definiert. |
| FR-037 | Lokale Inhalte und Overlays müssen bei Abmeldung, Geräteverlust oder Rechteentzug kontrolliert gesperrt oder entfernt werden können. | Fristen und Umgang mit offenen privaten Änderungen: `OQ-007`, `OQ-008`. |

## Spätere Erweiterungen

Diese Anforderungen sind mögliche Erweiterungen und für den ersten produktiv
sinnvollen Stand nicht vorausgesetzt. Eine spätere Aufnahme benötigt ein
eigenes freigegebenes Arbeitspaket.

| ID | Mögliche Erweiterung |
| --- | --- |
| FR-038 | Kalender und Probenplanung. |
| FR-039 | Benachrichtigungen zu fachlich relevanten Änderungen. |
| FR-040 | Audio- oder Übungsdateien als zusätzliche konkrete Inhaltsarten. |
| FR-041 | Optische Zeichenerkennung für benutzergesteuert eingebrachte Inhalte. |
| FR-042 | Weitergehender automatischer Inhaltsimport aus ausdrücklich erlaubten Quellen. |
| FR-043 | Anbindung externer Cloudspeicher nach separater Security- und Datenschutzbewertung. |
| FR-044 | Gleichzeitige Echtzeit-Kollaboration jenseits des verbindlichen Check-out-Modells. |
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

## Entschiedene Produktgrenzen

| ID | Verbindliche Grenze | Entscheidung |
| --- | --- | --- |
| FR-054 | Ein Benutzer darf gleichzeitig Mitglied mehrerer Bands und Bandbereiche sein. Bandbezogene Rollen und Rechte bleiben je Bandbereich getrennt. | `OQ-001`, `OQ-021` |
| FR-055 | Eine Installation darf mehrere fachlich und berechtigungsseitig getrennte Bandbereiche enthalten. Jede Band besitzt genau einen Bandbereich und jeder Bandbereich gehört genau einer Band. | `OQ-002`, `OQ-021` |

## Weitere offene Produktgrenzen

| ID | Offene funktionale Grenze | Entscheidung |
| --- | --- | --- |
| FR-056 | Umfang exportierbarer Inhalte und Overlays. | `OQ-014` |
| FR-057 | Erster produktiver Zielbetrieb mit einem oder mehreren aktiv genutzten Bandbereichen. | `OQ-015` |

## Übergreifende Grenzen

- Inhalte werden nur aufgrund einer bewussten Benutzeraktion importiert.
- Benutzer bleiben für Herkunft, Nutzungsrecht und zulässige Weitergabe der von
  ihnen eingebrachten Inhalte verantwortlich.
- Private Inhalte benötigen keine Bandzuordnung.
- Gemeinsame Bearbeitung erfordert eine bestehende Verbindung und einen
  wirksamen Check-out.
- Weder eine funktionale Anforderung noch ein offener Punkt legt
  Programmiersprache, Framework, Datenbank, Authentifizierungsprodukt,
  Synchronisationstechnologie oder Deploymentarchitektur fest.
- Security-Anforderungen stehen in
  [Security-Anforderungen](SECURITY-REQUIREMENTS.md), messbare Qualität in
  [Qualitätsanforderungen](QUALITY-ATTRIBUTES.md).
