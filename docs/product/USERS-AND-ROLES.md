# Benutzer und fachliche Rollen

## Bezug und Grundsatz

Dieses Dokument konkretisiert GitHub-Issue #3. Es beschreibt fachliche Rollen
innerhalb von SoSeBaMa. Es legt weder ein technisches Rollenmodell noch ein
Identitäts- oder Authentifizierungsprodukt fest.

Ein [Benutzer](GLOSSARY.md#benutzer) kann abhängig von der späteren
Eigentümerentscheidung in einem oder mehreren Arbeitsbereichen unterschiedliche
Rollen besitzen. Berechtigungen gelten stets für den jeweiligen
Arbeitsbereich und folgen dem Minimalprinzip.

## Band- beziehungsweise Arbeitsbereichsadministration

**Ziele:** Mitgliedschaft, Verantwortlichkeiten und sichere Zusammenarbeit im
Arbeitsbereich verwalten.

**Typische Aufgaben:** Benutzer einladen, Mitgliedschaften deaktivieren,
fachliche Rollen zuweisen oder entziehen und gemeinsam sichtbare Inhalte
überblicken.

**Benötigte Rechte:** Mitglieder- und Rollenzuordnung des eigenen
Arbeitsbereichs verwalten sowie erforderliche Verwaltungsinformationen lesen.

**Nicht erlaubt:** Rechte anderer Arbeitsbereiche vergeben, technische
Betriebsrechte ableiten, Schutzgrenzen umgehen oder Inhalte ohne fachliche
Notwendigkeit einsehen.

**Bei Rechteentzug:** Zentrale Berechtigungen enden für die entzogene Rolle.
Offene Sitzungen und lokale Offline-Daten werden kontrolliert behandelt; die
genaue Frist und Löschstrategie sind in `OQ-007` und `OQ-008` offen.

## Setlist-Verantwortliche

**Ziele:** Für Probe oder Auftritt geeignete, nachvollziehbare Setlists
bereitstellen.

**Typische Aufgaben:** Setlists erstellen, Songs ergänzen oder entfernen,
Reihenfolge pflegen, Freigabezustand setzen und Offlinevorbereitung prüfen.

**Benötigte Rechte:** Zugeordnete Setlists und die dafür freigegebenen
Songinformationen bearbeiten; erforderliche Dokumentzustände lesen.

**Nicht erlaubt:** Mitgliedschaften verwalten, nicht freigegebene private
Inhalte verändern oder Berechtigungsprüfungen umgehen.

**Bei Rechteentzug:** Bearbeitung und Freigabe enden; bereits rechtmäßig
freigegebene Setlists bleiben gemäß ihrer eigenen Berechtigung nutzbar.

## Inhaltsverantwortliche

**Ziele:** Songs, Fassungen, Dokumente, Text- und Akkordblätter fachlich korrekt
und nachvollziehbar pflegen.

**Typische Aufgaben:** Metadaten anlegen, Dokumente hinzufügen, Text- oder
Akkordinhalte bearbeiten, Import auslösen und Sichtbarkeit verwalten.

**Benötigte Rechte:** Zugeordnete Inhalte erstellen und ändern sowie zulässige
gemeinsame Fassungen freigeben.

**Nicht erlaubt:** Rechte administrieren, Originaldokumente unbemerkt ersetzen,
fremde private Annotationen verändern oder urheberrechtliche Schutzmaßnahmen
umgehen.

**Bei Rechteentzug:** Schreibrechte enden. Nachvollziehbar veröffentlichte
Inhalte bleiben erhalten; private lokale Inhalte folgen der noch zu
entscheidenden Behandlung aus `OQ-008`.

## Musiker beziehungsweise reguläres Mitglied

**Ziele:** Freigegebene Songs und Setlists in Probe und Auftritt zuverlässig
nutzen und im erlaubten Umfang persönlich bearbeiten.

**Typische Aufgaben:** Inhalte suchen, PDFs anzeigen, Annotationen anlegen,
Akkorde transponieren, Autoscroll verwenden und Offlineinhalte vorbereiten.

**Benötigte Rechte:** Freigegebene Inhalte lesen und eindeutig erlaubte
persönliche oder gemeinsame Änderungen ausführen.

**Nicht erlaubt:** Arbeitsbereich administrieren, fremde private Inhalte lesen,
ungeklärte gemeinsame Inhalte verändern oder nicht freigegebene Dokumente
exportieren.

**Bei Rechteentzug:** Zentraler Zugriff und weitere Synchronisation enden.
Lokale Daten und offene Änderungen werden sichtbar und kontrolliert nach
`SEC-010` behandelt. Welche gemeinsamen Änderungen reguläre Mitglieder
ausführen dürfen, entscheidet `OQ-004`.

## Lesender oder eingeschränkter Zugriff

**Ziele:** Explizit freigegebene Inhalte ohne weitergehende Änderungsrechte
nutzen.

**Typische Aufgaben:** Freigegebene Songs, Dokumente oder Setlists anzeigen und
gegebenenfalls für die erlaubte Offlineverwendung vorbereiten.

**Benötigte Rechte:** Ausschließlich die konkret freigegebenen Lese- und
gegebenenfalls Offlineberechtigungen.

**Nicht erlaubt:** Gemeinsame Inhalte, Metadaten, Rollen oder Freigaben ändern;
aus einer Leseberechtigung entsteht kein Export- oder Weitergaberecht.

**Bei Rechteentzug:** Zugriff, Synchronisation und Offlineverwendung enden nach
den verbindlichen Security-Regeln; die konkrete lokale Behandlung bleibt Teil
von `OQ-008`.

## Technischer Betrieb außerhalb der App-Rollen

Technischer Betrieb ist keine fachliche App-Rolle. Betriebsverantwortliche
erhalten durch ihre technische Aufgabe keine implizite Berechtigung, fachliche
Inhalte zu lesen oder zu verändern. Notwendige Betriebszugriffe werden separat,
minimal und je Umgebung nach
[Umgebungsmodell](../ENVIRONMENTS.md) und
[Netzwerkgrenzen](../NETWORK-BOUNDARIES.md) freigegeben.

## Rollenübergreifende Regeln

- Jede geschützte Aktion wird gegen die aktuell wirksame fachliche
  Berechtigung geprüft.
- Private und gemeinsam sichtbare Inhalte bleiben unterscheidbar.
- Eine höhere Rolle in einem Arbeitsbereich erteilt keine Rechte in einem
  anderen Arbeitsbereich oder im technischen Betrieb.
- Rechteänderung und -entzug müssen nachvollziehbar sein.
- Ungeklärte Rollenentscheidungen bleiben in
  [Offene Fragen](OPEN-QUESTIONS.md) offen und werden nicht durch Umsetzung
  vorweggenommen.
