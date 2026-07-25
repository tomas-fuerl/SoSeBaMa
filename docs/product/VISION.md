# Produktvision

## Bezug und Geltungsbereich

Dieses Dokument konkretisiert die Produktvision aus GitHub-Issue #3. Es
beschreibt das fachliche Ziel von SoSeBaMa, ohne Architektur, Technologie oder
Betriebsprodukt festzulegen. Verbindliche Begriffe stehen im
[Glossar](GLOSSARY.md); offene und abgeschlossene Produktentscheidungen in den
[Produktfragen](OPEN-QUESTIONS.md).

## Produktname

**SoSeBaMa** ist der Kurzname für den **Song-Setlist-Band-Manager**.
Es ist als moderne, langfristig wartbare Progressive Web App für Musiker, Bands
und Ensembles vorgesehen. Diese bereits in Issue #3 festgelegte Produktform
trifft keine Auswahl von Programmiersprache, Framework oder konkreter
Webtechnologie.

## Problemstellung

Musiker, Bands und Ensembles verwalten Songs, Dokumente, Akkordblätter und
Setlists häufig verteilt. Für Probe und Auftritt müssen relevante Inhalte
schnell auffindbar, auf Tablets gut bedienbar und auch ohne Netzwerk verfügbar
sein. Getrennte Ablagen erschweren gemeinsame Pflege, nachvollziehbare
Änderungen, Rechteentzug und den sicheren Umgang mit Offlinekopien.

## Zielgruppen

- Bands und Ensembles mit gemeinsam gepflegtem Repertoire,
- Personen, die Songs, Dokumente und Setlists organisieren,
- Musiker, die Inhalte bei Probe und Auftritt lesen, annotieren oder bedienen,
- Mitglieder mit bewusst eingeschränktem oder rein lesendem Zugriff.

Die fachlichen Rollen und ihre Grenzen sind in
[Benutzer und Rollen](USERS-AND-ROLES.md) beschrieben.

## Nutzenversprechen

SoSeBaMa stellt einen verständlichen, zentral verwalteten Arbeitsbereich für
Songs, zugehörige Dokumente und Setlists bereit. Berechtigte Benutzer können
relevante Inhalte gezielt offline vorbereiten und deren Speicher-, Änderungs-
und Synchronisationszustand erkennen. Inhalte besitzen genau ein Original und
werden über Freigaben, Setlists sowie persönliche oder Gruppen-Overlays
referenziert statt kopiert. Annotationen und bearbeitbare Inhalte werden
kontrolliert und nachvollziehbar behandelt.

## Produktprinzipien

1. **Gemeinsame, maßgebliche Datenbasis:** Die zentrale Datenhaltung ist der
   fachlich maßgebliche Stand.
2. **Offline mit sichtbarem Zustand:** Ausgewählte Inhalte sind offline nutzbar;
   lokaler Stand, ausstehende Änderungen, Fehler und Konflikte bleiben
   verständlich sichtbar.
3. **Ein Original, viele Referenzen:** Ein Inhalt besitzt genau ein Original.
   Freigaben, Setlists und Overlays referenzieren dieses Original oder eine
   festgelegte Revision, ohne gruppenspezifische Inhaltskopien zu erzeugen.
4. **Musikalische Nutzung zuerst:** PDF-Anzeige, Touch- und Stiftannotation,
   Akkorddarstellung, Transposition, Autoscroll und Setlists unterstützen Probe
   und Auftritt.
5. **Kontrollierte Zusammenarbeit:** Eigentum, Sichtbarkeit und differenzierte
   Berechtigungen bleiben getrennt. Gruppenpublizierte Inhalte werden nur im
   ausdrücklich erlaubten Umfang verwaltet; Publikationsänderungen benötigen
   nachvollziehbare Gruppenadmin-Zustimmung.
6. **Anbieterunabhängige Inhalte:** Text- und Akkordinhalte bleiben unabhängig
   von einem bestimmten Drittanbieter verwaltbar.
7. **Benutzergesteuerter Import:** Übernahme erfolgt bewusst, etwa durch
   Einfügen oder Dateiimport; Herkunft und Nutzungsrechte bleiben in der
   Verantwortung der berechtigten Benutzer.
8. **Security und Datenschutz als Produkteigenschaft:** Schutz, Trennung,
   sichere Offlinehaltung und verständliche Fehlerbilder gelten in allen
   Produktabläufen.
9. **Verständlichkeit:** Oberfläche und Dokumentation richten sich auch an
   Benutzer ohne tiefes technisches Vorwissen.
10. **Technologie folgt Anforderungen:** Technische Entscheidungen werden erst
    nach dokumentierter, ergebnisoffener Bewertung getroffen.

Das verbindliche fachliche Modell für Eigentum, Freigaben, Overlays,
Songfassungen, Revisionen und Setlisten steht im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md).

## Abgrenzung

SoSeBaMa ist mehr als eine reine Dateiablage, weil Songs, Fassungen, Dokumente,
Annotationen, Rollen, Setlists und Offlinezustände fachlich zusammengeführt
werden. Es ist jedoch weder professionelle Notensatzsoftware noch eine Digital
Audio Workstation. Es ist kein öffentliches Musikportal, kein soziales
Musiknetzwerk und kein Handelsplatz für Musikdokumente.

Automatisiertes Scraping, das Umgehen von Zugriffsbeschränkungen oder
Schutzmaßnahmen und die unkontrollierte Weitergabe urheberrechtlich geschützter
Inhalte sind ausdrücklich nicht vorgesehen. Die vollständige Scope-Abgrenzung
steht in [Funktionaler Scope](FUNCTIONAL-SCOPE.md).

## Kriterien für späteren Produkterfolg

Der Produkterfolg wird daran bewertet, ob:

- die in [Kernabläufe](CORE-WORKFLOWS.md) definierten Aufgaben für die
  vorgesehenen Rollen vollständig und verständlich durchführbar sind,
- Probe und Auftritt mit gezielt vorbereiteten Inhalten ohne Netzwerk
  fortgesetzt werden können,
- Benutzer Offline-, Synchronisations- und Konfliktzustände korrekt erkennen
  und behandeln können,
- Originale, Referenzen, Overlays, Eigentum und fachliche
  Berechtigungsgrenzen nachweislich konsistent bleiben,
- die Qualitäts- und Sicherheitsanforderungen reproduzierbar verifiziert sind,
- eine berechtigte Person Betrieb und Nutzung ohne implizites Spezialwissen
  nachvollziehen kann.

Konkrete Zielwerte werden nicht in dieser Vision erfunden. Noch fehlende
Messwerte sind in [Offene Fragen](OPEN-QUESTIONS.md) gekennzeichnet und müssen
vor ihrer verbindlichen Verwendung durch den Projekteigentümer entschieden
werden.
