# Benutzer und fachliche Rollen

## Bezug und Grundsatz

Dieses Dokument konkretisiert GitHub-Issue #3. Es beschreibt fachliche Rollen
innerhalb von SoSeBaMa. Es legt weder ein technisches Rollenmodell noch ein
Identitäts- oder Authentifizierungsprodukt fest.

Ein [Benutzer](GLOSSARY.md#benutzer) kann abhängig von der späteren
Eigentümerentscheidung in einem oder mehreren Arbeitsbereichen unterschiedliche
Rollen besitzen. Berechtigungen gelten stets für den jeweiligen
Arbeitsbereich und folgen dem Minimalprinzip. Das fachliche Verhältnis von
Eigentum, Gruppen und Berechtigungen ist im
[Inhalts-, Versions- und Referenzmodell](../architecture/CONTENT-VERSION-REFERENCE-MODEL.md)
verbindlich beschrieben.

## Eigentümer und Gruppen

Eigentümer ist keine Rolle, sondern die fachliche Verantwortung für genau einen
Inhalt. Eigentümer kann ein Benutzer, eine Gruppe oder die Plattform sein. Die
Eigentümerschaft erteilt anderen Parteien weder Sichtbarkeit noch Rechte und
wird durch eine Freigabe nicht übertragen.

Eine Gruppe bündelt Benutzer für gemeinsame Sichtbarkeit, Overlays und
Berechtigungen. Ein Inhalt kann mehreren Gruppen gleichzeitig freigegeben sein.
Der Eigentümer entscheidet je Inhalt, ob Gruppen neue Revisionen erstellen
dürfen. Zusätzlich muss die jeweilige Gruppenrolle diese Aktion erlauben. Eine
Erlaubnis ohne passendes Gruppenrecht und ein Gruppenrecht ohne
Eigentümererlaubnis genügen jeweils nicht.

Bei Benutzer- und Gruppenlöschung gelten die verbindlichen Eigentumsübergänge
aus `FR-059` und `WF-017`. Eine freiwillige Eigentumsübertragung an die
Plattform bleibt möglich.

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

**Benötigte Rechte:** Setlists im eigenen oder im Gruppeneigentum entsprechend
der wirksamen Gruppenrolle bearbeiten; referenzierte, dafür freigegebene
Songinformationen und erforderliche Dokumentzustände lesen.

**Nicht erlaubt:** Mitgliedschaften verwalten, nicht freigegebene private
Inhalte verändern oder Berechtigungsprüfungen umgehen.

**Bei Rechteentzug:** Bearbeitung und Freigabe enden; bereits rechtmäßig
freigegebene Setlists bleiben gemäß ihrer eigenen Berechtigung nutzbar.

## Inhaltsverantwortliche

**Ziele:** Songs, Fassungen, Dokumente, Text- und Akkordblätter fachlich korrekt
und nachvollziehbar pflegen.

**Typische Aufgaben:** Metadaten anlegen, Dokumente hinzufügen, Text- oder
Akkordinhalte bearbeiten, Import auslösen und Sichtbarkeit verwalten.

**Benötigte Rechte:** Zugeordnete Inhalte und neue Revisionen im erlaubten
Umfang erstellen oder ändern, Sichtbarkeit verwalten und zulässige
Gruppenfreigaben erteilen. Für Gruppenrevisionen sind Eigentümererlaubnis und
wirksames Gruppenrecht erforderlich.

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

**Benötigte Rechte:** Freigegebene Inhalte lesen, persönliche Overlays ändern
und Gruppenrevisionen nur bei Eigentümererlaubnis und passendem Gruppenrecht
ausführen.

**Nicht erlaubt:** Arbeitsbereich administrieren, fremde private Inhalte lesen,
ungeklärte gemeinsame Inhalte verändern oder nicht freigegebene Dokumente
exportieren.

**Bei Rechteentzug:** Zentraler Zugriff und weitere Synchronisation enden.
Lokale Daten und offene Änderungen werden sichtbar und kontrolliert nach
`SEC-010` behandelt. Den noch offenen Detailumfang regulärer
Gruppenrechte bestimmt `OQ-004`.

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
- Eigentum, Sichtbarkeit und Berechtigungen bleiben getrennt und nachvollziehbar.
- Persönliche und Gruppen-Overlays bleiben vom referenzierten Original getrennt.
- Eine höhere Rolle in einem Arbeitsbereich erteilt keine Rechte in einem
  anderen Arbeitsbereich oder im technischen Betrieb.
- Rechteänderung und -entzug müssen nachvollziehbar sein.
- Ungeklärte Rollenentscheidungen bleiben in
  [Offene Fragen](OPEN-QUESTIONS.md) offen und werden nicht durch Umsetzung
  vorweggenommen.
