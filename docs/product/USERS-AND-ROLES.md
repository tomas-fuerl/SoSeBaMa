# Benutzer und fachliche Rollen

## Bezug und Grundsatz

Dieses Dokument konkretisiert GitHub-Issue #3 und die verbindlichen
Produktentscheidungen. Es beschreibt das fachliche Rechte- und Rollenmodell von
SoSeBaMa. Es legt weder eine technische Autorisierungsmethode noch ein
Identitäts-, Verzeichnis- oder Authentifizierungsprodukt fest.

Das verbindliche Verhältnis von Song, Inhalt, Eigentum, Sichtbarkeit,
Bandbereich, Overlays und Setlists ist im
[Inhalts- und Overlaymodell](../architecture/CONTENT-AND-OVERLAY-MODEL.md)
beschrieben. Die bevorzugten Begriffe stehen im
[Glossar](GLOSSARY.md).

## Grundmodell für Rechte und Rollen

### Rechte

Ein Recht erlaubt eine konkret benannte fachliche Aktion.

Rechte können wirksam werden:

- über eine Rolle,
- durch unmittelbare Zuweisung an eine einzelne Person.

Mitgliedschaft, Sichtbarkeit oder Eigentum ersetzen keine Prüfung des für die
konkrete Aktion erforderlichen Rechts.

Die Auswertung mehrerer Rechte muss eindeutig und nachvollziehbar sein. Die
abschließende Konfliktregel zwischen Rollenrechten und Direktrechten bleibt in
`OQ-004` offen und darf nicht durch eine Implementierung still vorweggenommen
werden.

### Rollen

Eine Rolle bündelt mehrere Rechte und kann mehreren Personen zugewiesen werden.

Rollen gelten entweder:

- global für die Plattform,
- innerhalb genau eines Bandbereichs.

Eine bandbezogene Rolle vermittelt keine Rechte in einem anderen Bandbereich.
Eine globale Rolle muss ausdrücklich als global definiert sein.

SoSeBaMa stellt Standardrollen mit Standardrechten bereit. Die Rechte einer
bandbezogenen Standardrolle dürfen pro Band angepasst werden. Eine Band darf
globale Rollen und deren globale Rechte nicht verändern.

### Direktrechte

Ein Direktrecht wird einer einzelnen Person unmittelbar zugewiesen.

Direktrechte dienen der gezielten Abweichung von einer Rollenbelegung, ohne
dafür eine zusätzliche Rolle für mehrere Personen anlegen zu müssen. Sie dürfen
keine Bandbereichsgrenzen, Sichtbarkeiten, Eigentumsgrenzen oder
Zustimmungspflichten umgehen.

Ob ein Direktrecht ein Rollenrecht nur ergänzen oder auch einschränken kann,
bleibt Teil von `OQ-004`.

## Band und Bandbereich

Jede Band besitzt genau einen Bandbereich und jeder Bandbereich gehört genau
einer Band.

Eine Installation kann mehrere getrennte Bandbereiche enthalten. Ein Benutzer
kann Mitglied mehrerer Bands und damit mehrerer Bandbereiche sein.

Bandbezogene Rollen und Rechte werden je Bandbereich getrennt ausgewertet.
Mehrfachmitgliedschaft überträgt keine Rechte zwischen Bands.

Der Bandbereich ist die fachliche Grenze für:

- Mitgliedschaften,
- Bandrollen,
- bandbezogene Rechte,
- Band-Overlays,
- bandbezogene Inhalte,
- bandbezogene Setlists,
- bandbezogene Check-outs.

## Eigentümer und Ersteller

Eigentümer ist keine Rolle, sondern die fachliche Verantwortung für ein
verwaltetes Objekt.

Eigentümer eines Inhalts ist genau ein Benutzer, eine Band oder die Plattform.
Eigentümer einer Setlist ist ein Benutzer oder eine Band. Eigentümer eines
Overlays ist entsprechend seiner Reichweite ein Benutzer, eine Band oder der
Eigentümer des zugrunde liegenden Inhalts.

Eigentum vermittelt keine automatischen Rechte an anderen Objekten und ersetzt
keine Autorisierung einer geschützten Aktion.

Der Ersteller ist der Benutzer, der einen Song, Inhalt, ein Overlay oder eine
Setlist ursprünglich angelegt hat. Ersteller und aktueller Eigentümer können
auseinanderfallen.

Eine Freigabe verändert das Eigentum nicht. Eine Eigentumsübertragung muss
bewusst erfolgen und nachvollziehbar sein.

Bei Benutzer- und Bandlöschung gelten die verbindlichen Eigentumsübergänge aus
dem Inhalts- und Overlaymodell sowie den zugehörigen Anforderungen und
Workflows. Ein freiwillig an die Plattform übertragener privater Inhalt bleibt
privat.

## Fachliche Standardrollen

Die folgenden Rollen bilden den vorgesehenen fachlichen Ausgangspunkt. Ihre
abschließenden Standardrechte bleiben in `OQ-004` zu entscheiden.

### Globaler Administrator

**Geltungsbereich:** gesamte Plattform.

**Ziele:** Plattformweite fachliche Verwaltungsaufgaben ausführen, die
ausdrücklich nicht auf einen einzelnen Bandbereich begrenzt sind.

**Mögliche Aufgaben:**

- globale fachliche Rollen und Rechte verwalten,
- plattformweite fachliche Konfiguration verwalten,
- ausdrücklich vorgesehene Eigentums- oder Supportabläufe begleiten,
- globale Overlays entsprechend den dafür erteilten Rechten verwalten.

**Nicht erlaubt:**

- technische Betriebsrechte aus der fachlichen Rolle ableiten,
- private oder bandbezogene Inhalte ohne konkrete fachliche Berechtigung
  einsehen oder verändern,
- Bandbereichsgrenzen umgehen,
- Rechte des technischen Betriebs übernehmen.

Die Rolle ist von technischen Administratoren und Betriebsidentitäten strikt
getrennt.

### Bandadministrator

**Geltungsbereich:** genau ein Bandbereich.

**Ziele:** Mitgliedschaft, Bandrollen, Bandrechte und die sichere fachliche
Zusammenarbeit der eigenen Band verwalten.

**Mögliche Aufgaben, abhängig von den wirksamen Rechten:**

- Benutzer einladen und Mitgliedschaften verwalten,
- bandbezogene Rollen zuweisen oder entziehen,
- anpassbare Rechte bandbezogener Standardrollen verwalten,
- zulässige Direktrechte innerhalb der eigenen Band verwalten,
- Band-Overlays und bandbezogene Setlists verwalten,
- zustimmungspflichtige Änderungen bestehender Bandpublikationen prüfen,
- Check-outs im eigenen Bandbereich nachvollziehbar zurücknehmen.

**Nicht erlaubt:**

- Rollen oder Rechte anderer Bandbereiche verwalten,
- globale Rollen verändern,
- technische Betriebsrechte ableiten,
- private Inhalte oder private Overlays ohne ausdrückliche Berechtigung
  einsehen,
- bestehende Eigentums-, Sichtbarkeits- oder Inhaltsgrenzen still umgehen.

**Bei Rechteentzug:** Die entzogenen bandbezogenen Rechte enden zentral. Offene
Sitzungen, Check-outs und lokale Offline-Daten werden nach den verbindlichen
Security-Regeln und den noch offenen Offlineentscheidungen behandelt.

### Bandredakteur beziehungsweise Inhaltsredakteur

**Geltungsbereich:** genau ein Bandbereich oder ausdrücklich zugewiesene
Einzelobjekte.

**Ziele:** Songs, Inhalte, Inhaltsmetadaten und Band-Overlays im erlaubten
Umfang fachlich pflegen.

**Mögliche Aufgaben, abhängig von den wirksamen Rechten:**

- Songs und normalisierte Songmetadaten anlegen oder bearbeiten,
- konkrete Inhalte anlegen und genau einem Song zuweisen,
- Inhaltsmetadaten bearbeiten,
- Inhalte bearbeiten,
- Band-Overlays anlegen oder bearbeiten,
- Sichtbarkeitsänderungen auslösen oder beantragen,
- Freigaben verwalten,
- Inhalte archivieren oder löschen,
- gemeinsam bearbeitbare Objekte auschecken und speichern.

**Nicht erlaubt:**

- Mitgliedschaften oder globale Rollen verwalten,
- nicht ausdrücklich zugewiesene Inhalte verändern,
- private Overlays anderer Benutzer lesen oder bearbeiten,
- das Original durch eine reine Overlay-Aktion verändern,
- einen bestehenden Check-out umgehen,
- urheberrechtliche Schutzmaßnahmen umgehen.

**Bei Rechteentzug:** Schreibzugriff und weitere kollaborative Speicherung
enden. Ein bestehender Check-out wird kontrolliert behandelt; lokale Änderungen
dürfen nicht still übernommen werden.

### Setlist-Verantwortlicher

**Geltungsbereich:** eigene Setlists oder ausdrücklich berechtigte Setlists
einer Band.

**Ziele:** Für Probe oder Auftritt geeignete und nachvollziehbare Setlists
bereitstellen.

**Mögliche Aufgaben, abhängig von den wirksamen Rechten:**

- Setlists anlegen,
- konkrete Inhalte hinzufügen, entfernen und ordnen,
- bandweite Overlay-Auswahl je Setlisteintrag festlegen,
- persönliche und bandweite Ausblendung eindeutig unterscheiden,
- Setlists freigeben,
- Offlinevorbereitung prüfen,
- eine Setlist bewusst als unabhängigen Planungsstand kopieren.

**Nicht erlaubt:**

- aus einer Setlistberechtigung Bearbeitungsrechte am zugeordneten Inhalt
  ableiten,
- private Inhalte ohne Sichtberechtigung hinzufügen oder anzeigen,
- private Overlay-Auswahl eines anderen Benutzers verändern,
- Mitgliedschaften oder allgemeine Bandrollen verwalten.

**Bei Rechteentzug:** Bandweite Bearbeitung und Freigabe enden. Bereits
rechtmäßig freigegebene Setlists bleiben entsprechend ihrer eigenen
Berechtigungen nutzbar.

### Bandmitglied beziehungsweise Musiker

**Geltungsbereich:** die Bandbereiche, in denen der Benutzer Mitglied ist.

**Ziele:** Freigegebene Inhalte und Setlists in Probe und Auftritt zuverlässig
nutzen und persönliche Anpassungen im erlaubten Umfang führen.

**Mögliche Aufgaben, abhängig von den wirksamen Rechten:**

- freigegebene Songs und Inhalte suchen und anzeigen,
- Setlists verwenden,
- eigene private Overlays anlegen und bearbeiten,
- private Notizen, Markierungen oder Transpositionsanpassungen führen,
- verfügbare Overlays im persönlichen Setlistkontext ein- oder ausblenden,
- rollenabhängig einzelne Setlisteinträge persönlich ausblenden,
- Inhalte für eine erlaubte Offlineverwendung vorbereiten.

**Nicht erlaubt:**

- aus der Mitgliedschaft allgemeine Änderungsrechte ableiten,
- fremde private Inhalte oder Overlays lesen,
- Band-Overlays ohne ausdrückliches Recht bearbeiten,
- bandweite Setlists durch persönliches Ausblenden verändern,
- gemeinsam bearbeitete Objekte ohne wirksamen Check-out ändern.

**Bei Rechteentzug:** Zentraler Zugriff, weitere Synchronisation und neue
geschützte Aktionen enden. Lokale Daten und offene private Änderungen werden
nach den Security-Regeln und den noch offenen Offlineentscheidungen behandelt.

### Lesender oder eingeschränkter Zugriff

**Geltungsbereich:** ausdrücklich freigegebene Objekte und Bandbereiche.

**Ziele:** Freigegebene Inhalte und Setlists ohne weitergehende
Änderungsberechtigung nutzen.

**Mögliche Aufgaben:**

- freigegebene Songs, Inhalte, Overlays und Setlists anzeigen,
- freigegebene Offlineinhalte im erlaubten Umfang vorbereiten und verwenden.

**Nicht erlaubt:**

- Songs, Inhalte, Overlays, Setlists, Rollen oder Freigaben ändern,
- aus einer Leseberechtigung ein Export-, Weitergabe- oder Bearbeitungsrecht
  ableiten.

**Bei Rechteentzug:** Zugriff, Synchronisation und Offlineverwendung enden nach
den verbindlichen Security-Regeln.

## Direkt berechtigte Person

Eine direkt berechtigte Person ist ein Benutzer, dem mindestens ein Direktrecht
für eine konkrete Aktion oder ein konkretes Objekt zugewiesen wurde.

Dies ist keine eigenständige Hierarchiestufe und keine automatische
Standardrolle. Die Person darf nur die konkret zugewiesenen Aktionen innerhalb
der weiterhin geltenden Bandbereichs-, Sichtbarkeits-, Eigentums- und
Zustimmungsgrenzen ausführen.

## Inhaltsspezifische Rechte

Das Modell muss mindestens die getrennte Vergabe folgender fachlicher Aktionen
ermöglichen:

### Song und Inhalt

- Song anlegen,
- Songmetadaten bearbeiten,
- Inhalt anlegen,
- Inhalt einem Song zuweisen,
- Inhalt bearbeiten,
- Inhaltsmetadaten bearbeiten,
- Inhalt veröffentlichen,
- Sichtbarkeit ändern,
- Inhalt archivieren,
- Inhalt löschen,
- Eigentumsübertragung auslösen oder bestätigen.

### Overlays

- privates Overlay anlegen,
- eigenes privates Overlay anzeigen,
- eigenes privates Overlay bearbeiten,
- eigenes privates Overlay löschen,
- Band-Overlay anlegen,
- Band-Overlay anzeigen,
- Band-Overlay bearbeiten,
- Band-Overlay löschen,
- globales Overlay anlegen,
- globales Overlay anzeigen,
- globales Overlay bearbeiten,
- globales Overlay löschen,
- Overlay-Auswahl im Setlistkontext ändern.

### Setlists

- Setlist anlegen,
- Setlist anzeigen,
- Setlist bearbeiten,
- Inhalte hinzufügen oder entfernen,
- Reihenfolge ändern,
- bandweite Overlay-Auswahl je Eintrag ändern,
- Setlist veröffentlichen oder freigeben,
- Setlist kopieren,
- Setlisteintrag persönlich ausblenden.

### Kollaboration und Administration

- gemeinsam bearbeitbares Objekt auschecken,
- eigenes Check-out beenden,
- fremdes Check-out im eigenen Bandbereich administrativ zurücknehmen,
- Bandmitgliedschaften verwalten,
- Bandrollen zuweisen,
- bandbezogene Rollenrechte anpassen,
- Direktrechte vergeben oder entziehen,
- zustimmungspflichtige Bandpublikationsänderung genehmigen oder ablehnen.

Die Liste beschreibt unterscheidbare Aktionen, aber noch keine abschließende
Zuordnung zu Standardrollen.

## Zusammenarbeit und Check-out

Private eigene Inhalte und private eigene Overlays können entsprechend den
wirksamen Rechten bearbeitet werden.

Gemeinsam bearbeitbare Inhalte und Overlays müssen bei bestehender Verbindung
vor der Bearbeitung wirksam ausgecheckt werden. Während des Check-outs ist
parallele Bearbeitung desselben Gegenstands ausgeschlossen.

Es gilt **first come, first save**:

- Der zuerst wirksam auscheckende Benutzer erhält den Bearbeitungszugriff.
- Ein späterer konkurrierender Versuch wird blockiert.
- Nach einer zwischenzeitlichen Änderung muss der aktuelle Stand neu geladen
  werden.
- Stilles Überschreiben und automatisches Zusammenführen sind nicht zulässig.

Ein berechtigter Bandadministrator darf einen Check-out im eigenen Bandbereich
nachvollziehbar zurücknehmen. Die Rücknahme muss für den bisherigen Bearbeiter
sichtbar sein und darf keinen stillen Datenverlust verursachen.

## Technischer Betrieb außerhalb der App-Rollen

Technischer Betrieb ist keine fachliche App-Rolle.

Betriebsverantwortliche erhalten durch ihre technische Aufgabe keine implizite
Berechtigung, fachliche Songs, Inhalte, Overlays oder Setlists zu lesen oder zu
verändern.

Notwendige Betriebszugriffe werden separat, minimal und je Umgebung nach
[Umgebungsmodell](../ENVIRONMENTS.md) und
[Netzwerkgrenzen](../NETWORK-BOUNDARIES.md) freigegeben.

## Rollenübergreifende Regeln

- Jede geschützte Aktion wird gegen die aktuell wirksame fachliche Berechtigung
  geprüft.
- Mitgliedschaft und Sichtbarkeit allein vermitteln kein Änderungsrecht.
- Eigentümer, Ersteller, Sichtbarkeit, Rollenrechte, Direktrechte und
  Bearbeitungsberechtigungen bleiben getrennt und nachvollziehbar.
- Bandrollen und Bandrechte gelten ausschließlich in ihrem Bandbereich.
- Mehrfachmitgliedschaft überträgt keine Rechte zwischen Bands.
- Globale Rollen müssen ausdrücklich global sein.
- Eine Band darf globale Rollen oder deren globale Rechte nicht verändern.
- Private Overlays bleiben für andere Benutzer unsichtbar.
- Band- und globale Overlays umgehen keine Sichtbarkeit des zugrunde liegenden
  Inhalts.
- Persönliches Ausblenden eines Setlisteintrags verändert keine bandweite
  Setlist.
- Gemeinsame Onlinebearbeitung benötigt einen wirksamen Check-out.
- Rechteänderung, Rechteentzug und administrative Check-out-Rücknahme müssen
  nachvollziehbar sein.
- Nicht entschiedene Detailregeln bleiben in den
  [Produktfragen](OPEN-QUESTIONS.md) offen und werden nicht durch Umsetzung
  vorweggenommen.
