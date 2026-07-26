# Produktvision

## Bezug und Geltungsbereich

Dieses Dokument konkretisiert die Produktvision aus GitHub-Issue #3. Es
beschreibt das fachliche Ziel von SoSeBaMa, ohne Architektur, Technologie oder
Betriebsprodukt festzulegen.

Verbindliche Begriffe stehen im [Glossar](GLOSSARY.md). Offene und entschiedene
Produktfragen stehen in
[Produktfragen und Entscheidungen](OPEN-QUESTIONS.md).

## Produktname

**SoSeBaMa** ist der Kurzname für den **Song-Setlist-Band-Manager**.

SoSeBaMa ist als moderne, langfristig wartbare Progressive Web App für Musiker,
Bands und Ensembles vorgesehen. Diese Produktform trifft keine Auswahl von
Programmiersprache, Framework, Datenbank oder konkreter Webtechnologie.

## Problemstellung

Musiker, Bands und Ensembles verwalten Songinformationen, PDFs, Text- und
Chord-Inhalte, persönliche Notizen, gemeinsame Hinweise und Setlists häufig in
getrennten Ablagen.

Für Probe und Auftritt müssen die benötigten Inhalte schnell auffindbar, auf
Tablets gut bedienbar und gezielt offline verfügbar sein. Verteilte Ablagen
erschweren die gemeinsame Pflege, eindeutige Zuständigkeiten, nachvollziehbare
Änderungen, Rechteentzug und den sicheren Umgang mit lokalen Kopien.

## Zielgruppen

- Bands und Ensembles mit gemeinsam gepflegtem Repertoire,
- Personen, die Songs, Inhalte, Overlays und Setlists verwalten,
- Musiker, die Inhalte bei Probe und Auftritt lesen, annotieren oder anpassen,
- Setlist-Verantwortliche,
- Mitglieder mit bewusst eingeschränktem oder rein lesendem Zugriff.

Die fachlichen Rollen und ihre Grenzen sind in
[Benutzer und fachliche Rollen](USERS-AND-ROLES.md) beschrieben.

## Nutzenversprechen

SoSeBaMa stellt eine verständliche, zentral verwaltete Produktbasis für Songs,
konkrete Inhalte, Overlays und Setlists bereit.

Ein Song bündelt normalisierte Metadaten eines Musikstücks. Konkrete PDF- oder
Text-/Chord-Inhalte werden genau einem Song zugeordnet. Benutzer dürfen eigene
private Inhalte führen; Bands dürfen Inhalte in ihrem Bandbereich gemeinsam
verwalten.

Zusätzliche Annotationen, Transpositionen, geänderte Chords und Hinweise werden
als Overlays geführt, ohne das Original des Inhalts zu verändern. Mehrere
berechtigte Overlays können gleichzeitig und überlappend dargestellt werden.

Berechtigte Benutzer können konkrete Inhalte und Overlays für eine erlaubte
Offlineverwendung vorbereiten und ihren Speicher-, Synchronisations- und
Berechtigungszustand erkennen.

## Produktprinzipien

1. **Song und Inhalt bleiben getrennt:** Ein Song ist der normalisierte
   Metadateneintrag. Ein konkreter Inhalt ist eine PDF- oder
   Text-/Chord-Darstellung genau eines Songs.
2. **Ein aktueller Stand statt auswählbarer Versionen:** Inhalte und Setlists
   besitzen genau einen aktuellen Stand. Änderungen bleiben über eine
   nachvollziehbare Historie sichtbar, erzeugen aber keine auswählbaren
   Fassungen, Revisionen oder Referenzstrategien.
3. **Original und Overlays bleiben getrennt:** Ein Inhalt besitzt genau ein
   Original ohne angewendete Overlays. Private, Band- und globale Overlays
   verändern dieses Original nicht.
4. **Mehrere Overlays sind gleichzeitig nutzbar:** Berechtigte Overlays dürfen
   gleichzeitig und überlappend dargestellt werden. Aktive Overlays und ihre
   Reihenfolge müssen erkennbar sein.
5. **Setlists enthalten konkrete Inhalte:** Eine Setlist ordnet konkrete Inhalte
   für Probe oder Auftritt und unterscheidet bandweite von persönlichen
   Overlay-Auswahlen.
6. **Bandbereiche bilden klare Grenzen:** Jede Band besitzt genau einen
   Bandbereich. Eine Installation darf mehrere Bandbereiche enthalten und ein
   Benutzer Mitglied mehrerer Bands sein. Rechte werden nicht zwischen
   Bandbereichen übertragen.
7. **Rollen und Direktrechte sind explizit:** Geschützte Aktionen werden über
   globale oder bandbezogene Rollen, Direktrechte und objektbezogene Grenzen
   autorisiert. Mitgliedschaft, Sichtbarkeit oder Eigentum allein vermittelt
   kein Änderungsrecht.
8. **Gemeinsame Bearbeitung ist kontrolliert:** Gemeinsam bearbeitbare Inhalte
   sowie Band- und globale Overlays benötigen online einen wirksamen Check-out.
   Es gilt first come, first save. Parallele Bearbeitung, stilles Überschreiben
   und automatisches Zusammenführen sind ausgeschlossen.
9. **Offlinezustände bleiben sichtbar:** Ausgewählte Inhalte sind im erlaubten
   Umfang offline nutzbar. Lokaler Stand, Einschränkungen, ausstehende private
   Änderungen, Fehler und Konflikte bleiben verständlich sichtbar.
10. **Import bleibt benutzergesteuert:** Inhalte werden bewusst durch Dateiimport
    oder Einfügen übernommen. Herkunft und Nutzungsrechte bleiben in der
    Verantwortung des einbringenden Benutzers.
11. **Security und Datenschutz sind Produkteigenschaften:** Private Inhalte und
    private Overlays bleiben geschützt. Rechteentzug, Geräteverlust,
    Bandbereichstrennung und sichere Fehlerbilder werden in allen Abläufen
    berücksichtigt.
12. **Technologie folgt Anforderungen:** Technische Entscheidungen werden erst
    nach dokumentierter, ergebnisoffener Bewertung getroffen.

Das verbindliche fachliche Modell steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## Abgrenzung

SoSeBaMa ist mehr als eine reine Dateiablage, weil Songs, konkrete Inhalte,
Overlays, Rollen, Direktrechte, Setlists, Check-outs und Offlinezustände
fachlich zusammengeführt werden.

SoSeBaMa ist jedoch weder professionelle Notensatzsoftware noch eine Digital
Audio Workstation. Es ist kein öffentliches Musikportal, kein soziales
Musiknetzwerk und kein Handelsplatz für Musikdokumente.

Automatisiertes Scraping, das Umgehen von Zugriffsbeschränkungen oder
Schutzmaßnahmen und die unkontrollierte Weitergabe urheberrechtlich geschützter
Inhalte sind ausdrücklich nicht vorgesehen. Die vollständige Scope-Abgrenzung
steht im [Funktionalen Scope](FUNCTIONAL-SCOPE.md).

## Kriterien für späteren Produkterfolg

Der Produkterfolg wird daran bewertet, ob:

- die in [Kernabläufe](CORE-WORKFLOWS.md) definierten Aufgaben für die
  vorgesehenen Rollen vollständig und verständlich durchführbar sind,
- Songs und konkrete Inhalte eindeutig unterscheidbar und auffindbar bleiben,
- Originale durch Overlay-Aktionen nicht unbemerkt verändert werden,
- mehrere private, Band- und globale Overlays kontrolliert nutzbar sind,
- Setlists konkrete Inhalte und eindeutige Overlay-Auswahlen bereitstellen,
- Bandbereichs-, Eigentums-, Sichtbarkeits- und Berechtigungsgrenzen
  nachweislich konsistent bleiben,
- konkurrierende gemeinsame Bearbeitung sicher blockiert und nachvollziehbar
  behandelt wird,
- Probe und Auftritt mit gezielt vorbereiteten Inhalten ohne Netzwerk
  fortgesetzt werden können,
- Benutzer Offline-, Synchronisations-, Check-out- und Konfliktzustände korrekt
  erkennen und behandeln können,
- die Qualitäts- und Sicherheitsanforderungen reproduzierbar verifiziert sind.

Konkrete Zielwerte werden nicht in dieser Vision erfunden. Noch fehlende
Messwerte und Produktgrenzen sind in
[Produktfragen und Entscheidungen](OPEN-QUESTIONS.md) gekennzeichnet und müssen
vor ihrer verbindlichen Verwendung durch den Projekteigentümer entschieden
werden.
