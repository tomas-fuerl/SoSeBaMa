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
Funktionsschnitt und dessen Lieferreihenfolge. Die Entscheidung kann keine
Anforderung der verbindlichen Basis abwählen oder auf eine spätere Erweiterung
verschieben.

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

## Fachliche Kandidaten für den ersten MVP-Funktionsschnitt

`FR-008` bis `FR-037` gehören zum vorgesehenen Produktumfang. `OQ-005`
entscheidet, welche dieser zusätzlichen Anforderungen den ersten
Funktionsschnitt bilden. Abhängige Detailentscheidungen sind jeweils genannt.

### Benutzer und Zusammenarbeit

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-008 | Eine berechtigte Administration muss Benutzer einladen und Mitgliedschaften deaktivieren können. | Umfang und Ablauf der Einladung bleiben technologieoffen. |
| FR-009 | SoSeBaMa muss private und gemeinsam sichtbare Inhalte eindeutig unterscheiden und berechtigen können. | Standardsichtbarkeit und Änderungsrechte: `OQ-003`, `OQ-004`. |
| FR-010 | SoSeBaMa soll einen optionalen zusätzlichen Authentifizierungsfaktor ermöglichen, ohne ein Produkt oder Verfahren festzulegen. | Rollen, Auslöser und Verbindlichkeit: `OQ-020`. |

### Songs

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-011 | Ein berechtigter Benutzer muss einen Song mit Titel und fachlich erforderlichen Metadaten anlegen können. | Der genaue Metadatenkatalog wird in einem späteren Facharbeitspaket bestimmt. |
| FR-012 | Songs müssen gesucht, gefiltert und sortiert werden können. | Konkrete Suchfelder und Sortierregeln folgen aus dem Metadatenkatalog. |
| FR-013 | Ein Song muss mehrere zugehörige Dokumente und unterscheidbare alternative Fassungen aufnehmen können. | Verhältnis von Fassung und Revision: `OQ-012`. |
| FR-014 | Aktualisierungen an gemeinsam genutzten Songinhalten müssen für berechtigte Benutzer nachvollziehbar sein. | Tiefe und Dauer der Historie: `OQ-012`. |

### PDF-Dokumente

| ID | Anforderung | Offene Abgrenzung |
| --- | --- | --- |
| FR-015 | Ein berechtigter Benutzer muss ein zulässiges PDF hinzufügen und anzeigen können. | Uploadgrenzen werden aus Security- und Qualitätsanforderungen abgeleitet. |
| FR-016 | Die PDF-Anzeige muss eine eindeutige Seitennavigation unterstützen. | Konkrete Bediengesten sind keine Entscheidung dieses Arbeitspakets. |
| FR-017 | Die PDF-Anzeige muss eine für das Lesen geeignete Vergrößerung und Verkleinerung unterstützen. | Messbare Geräte- und Reaktionsziele: `OQ-010`, `OQ-011`. |
| FR-018 | Berechtigte Benutzer müssen PDFs per Touch oder Stift annotieren können. | Unterstützte Werkzeuge und Geräteklassen: `OQ-010`. |
| FR-019 | Annotationen müssen privat oder ausdrücklich gemeinsam sichtbar geführt werden können. | Standardwert: `OQ-003`; Bearbeitungsrechte: `OQ-004`. |
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
| FR-028 | Berechtigte Benutzer müssen Setlists anlegen können. | Historisierung oder Versionierung: `OQ-013`. |
| FR-029 | Songs müssen einer Setlist hinzugefügt, daraus entfernt und in eine eindeutige Reihenfolge gebracht werden können. | Gemeinsame Änderungsrechte: `OQ-004`. |
| FR-030 | Eine Setlist muss eine für Probe oder Auftritt geeignete, ablenkungsarme Nutzung der freigegebenen Inhalte ermöglichen. | Konkrete Oberflächengestaltung ist nicht Bestandteil dieses Arbeitspakets. |
| FR-031 | Eine Setlist und ihre erforderlichen Dokumente müssen gemeinsam für die Offlineverwendung vorbereitet werden können. | Genauer MVP-Inhalt: `OQ-005`; Offline-Schreibumfang: `OQ-006`. |
| FR-032 | Versions-, Freigabe- und Synchronisationszustände einer Setlist müssen für Benutzer unterscheidbar sein. | Umfang der Versionierung: `OQ-013`. |

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
