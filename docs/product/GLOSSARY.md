# Verbindliches Produktglossar

## Bezug und Verwendung

Dieses Glossar konkretisiert die Produktvision und die verbindlichen
Eigentümerentscheidungen. Die bevorzugten Begriffe werden in allen Produkt- und
Architekturdokumenten konsistent verwendet. Ein Synonym führt keine zusätzliche
fachliche Bedeutung ein.

## Begriffe

### SoSeBaMa

Kurzname für **Song-Setlist-Band-Manager**, das in der
[Produktvision](VISION.md) beschriebene Produkt.

### Benutzer

Eine identifizierte Person, die nach erfolgreicher Zugangsprüfung und gemäß
ihren wirksamen fachlichen Rechten mit SoSeBaMa interagiert.

### Mitglied

Ein Benutzer mit einer aktiven Mitgliedschaft in einem Bandbereich.
Mitgliedschaft allein vermittelt keine konkrete Änderungsberechtigung.

### Band

Die fachliche Organisation eines Ensembles oder eines Zusammenschlusses von
Musikern. Eine Band besitzt genau einen [Bandbereich](#bandbereich).

In der Produkt- und Architekturdokumentation wird für diese fachliche
Organisation ausschließlich „Band“ verwendet.

### Bandbereich

Die genau einer Band zugeordnete fachliche Verwaltungs-, Mitgliedschafts- und
Berechtigungsgrenze.

Jede Band besitzt genau einen Bandbereich und jeder Bandbereich gehört genau
einer Band. Eine Installation kann mehrere getrennte Bandbereiche enthalten.
Ein Benutzer kann Mitglied mehrerer Bandbereiche sein.

„Arbeitsbereich“ und „Workspace“ werden im Produktmodell nicht als Synonyme für
Bandbereich verwendet.

### Recht

Eine konkret benannte erlaubte fachliche Aktion. Ein Recht kann über eine Rolle
oder unmittelbar einer einzelnen Person zugewiesen werden.

### Rolle

Eine fachliche Zusammenfassung mehrerer Rechte. Eine Rolle gilt entweder global
für die Plattform oder innerhalb genau eines Bandbereichs.

Eine Rolle ist keine Festlegung einer technischen Autorisierungsmethode.

### Direktrecht

Ein Recht, das einer einzelnen Person unmittelbar und nicht ausschließlich über
eine Rolle zugewiesen wird.

Das wirksame Ergebnis von Rollen- und Direktrechten muss eindeutig sein. Die
abschließende Konfliktregel wird in den Produktfragen entschieden.

### Standardrolle

Eine von SoSeBaMa bereitgestellte Rolle mit vordefinierten Standardrechten.
Bandbezogene Standardrollen dürfen pro Band angepasst werden. Globale Rollen und
globale Rechte dürfen nicht durch eine Band verändert werden.

### Bandadministrator

Eine bandbezogene fachliche Rolle zur Verwaltung der ausdrücklich erlaubten
Aspekte einer Band und ihres Bandbereichs.

Ein Bandadministrator besitzt keine impliziten technischen Betriebsrechte und
keine impliziten globalen Plattformrechte.

### Bandredakteur

Eine bandbezogene Rolle zur Pflege der durch ihre konkreten Rechte erlaubten
Inhalte, Inhaltsmetadaten, Band-Overlays und Setlists.

Die Rolle vermittelt keine impliziten administrativen Rechte.

### Globaler Administrator

Eine ausdrücklich globale fachliche Rolle für plattformweite
Verwaltungsaufgaben. Sie ist von technischen Betriebsidentitäten und
technischen Administrationsrechten getrennt.

### Plattform

SoSeBaMa als fachlicher Eigentümer eines freiwillig übertragenen Inhalts.

Ein zuvor privater Inhalt bleibt nach der Übertragung als privater Inhalt des
Plattformeigentümers privat. Die Plattform als fachlicher Eigentümer ist keine
technische Betriebsidentität.

### Song

Der normalisierte fachliche Metadateneintrag für ein Musikstück.

Ein Song ist weder PDF noch Text- oder Akkorddarstellung. Ein Song kann mehreren
konkreten [Inhalten](#inhalt) zugrunde liegen.

### Songmetadaten

Normalisierte fachliche Merkmale eines Songs, beispielsweise Titel, Interpret,
Urheber oder weitere später festgelegte Angaben.

### Inhalt

Eine konkrete musikalische Darstellung genau eines Songs, beispielsweise ein
PDF oder ein strukturierter Chord-/Textinhalt.

Ein Inhalt besitzt genau einen aktuellen Stand, ein
[Original](#original), einen eindeutigen Eigentümer und eine
[Änderungshistorie](#änderungshistorie). Er kann eigene
[Inhaltsmetadaten](#inhaltsmetadaten) besitzen.

Eine Setlist ist kein Inhalt im Sinne dieser Definition.

### Inhaltsmetadaten

Metadaten eines konkreten Inhalts, die von den normalisierten Songmetadaten
abweichen dürfen.

Eine Änderung der Inhaltsmetadaten verändert nicht automatisch die
Songmetadaten. Die Herkunft eines angezeigten Metadatenwerts muss
nachvollziehbar sein.

### Original

Der aktuelle Inhalt ohne angewendete Overlays.

Ein Original wird durch eine reine Overlay-Aktion weder verändert noch kopiert.
Es existieren keine auswählbaren Fassungen oder Revisionen des Originals.

### Eigentum

Die fachliche Verantwortung für ein verwaltetes Objekt. Eigentum ist von
Sichtbarkeit und Berechtigungen getrennt.

### Eigentümer

Die Partei, die das Eigentum an einem Objekt trägt.

Eigentümer eines Inhalts ist genau ein Benutzer, eine Band oder die Plattform.
Setlists besitzen einen Benutzer oder eine Band als Eigentümer. Overlays
besitzen entsprechend ihrer Reichweite einen Benutzer, eine Band oder den
Inhaltseigentümer als Eigentümer.

### Ersteller

Der Benutzer, der einen Song, Inhalt, ein Overlay oder eine Setlist ursprünglich
angelegt hat.

Der Ersteller muss nicht dauerhaft der Eigentümer sein. Aus der Erstellung
entstehen keine nicht ausdrücklich vergebenen Rechte.

### Sichtbarkeit

Die fachliche Festlegung, wer ein Objekt finden oder sehen darf.

Sichtbarkeit allein erteilt kein Änderungsrecht und überträgt kein Eigentum.
Neue Inhalte sind ohne abweichende wirksame Benutzervoreinstellung privat.

### Berechtigung

Das wirksame Ergebnis aller für eine konkrete Aktion relevanten Rechte,
Eigentumsgrenzen, Sichtbarkeiten und inhaltsbezogenen Regeln.

### Freigabe

Die bewusste Erweiterung der Sichtbarkeit oder Nutzbarkeit eines Objekts für
eine Band, mehrere Bands oder die Öffentlichkeit.

Eine Freigabe überträgt kein Eigentum und vermittelt keine nicht ausdrücklich
erteilten Bearbeitungsrechte.

### Bandpublizierter Inhalt

Ein Inhalt, der für mindestens eine Band sichtbar publiziert wurde.

Änderungen an seiner bestehenden Bandpublikation richten sich nach den
wirksamen Rechten und den festgelegten Zustimmungsregeln des Bandadministrators.

### Dokument

Ein konkreter Inhalt in einer dokumentorientierten Darstellungsform,
beispielsweise PDF, Textblatt oder Akkordblatt.

### PDF

Ein Inhalt in einem portablen, seitenorientierten Dokumentformat. Sein Original
wird getrennt von angewendeten Overlays geführt.

### Textinhalt

Ein bearbeitbarer, textorientierter Inhalt ohne zwingend strukturierte
Akkordinformationen.

### Chord-Inhalt

Ein bearbeitbarer Inhalt, in dem Text und Akkorde so strukturiert sind, dass
Akkorde erkannt, dargestellt und transponiert werden können.

„Akkordblatt“ kann in benutzerorientierten Texten als verständliche
Darstellungsbezeichnung verwendet werden. Der bevorzugte Modellbegriff ist
Chord-Inhalt.

### Overlay

Eine zusätzliche Darstellungs- oder Bearbeitungsebene zu genau einem Inhalt.

Ein Overlay verändert oder kopiert das Original nicht. Zu einem Inhalt können
beliebig viele Overlays existieren und mehrere berechtigte Overlays können
gleichzeitig dargestellt werden.

### Privates Overlay

Ein Overlay eines Benutzers, das ausschließlich für diesen Benutzer sichtbar
ist.

Ein Benutzer kann mehrere private Overlays zu demselben Inhalt besitzen.

### Band-Overlay

Ein Overlay einer Band. Es wird innerhalb des zugehörigen Bandbereichs nach den
wirksamen Rollen, Direktrechten und inhaltsbezogenen Regeln angezeigt und
bearbeitet.

Eine Band kann mehrere Band-Overlays zu demselben Inhalt besitzen.

### Globales Overlay

Ein durch den Eigentümer eines Inhalts allgemein für die zum Inhalt
berechtigten Benutzer bereitgestelltes Overlay.

„Global“ erweitert weder die Sichtbarkeit des Inhalts noch vermittelt es
implizite Bearbeitungsrechte.

### Overlay-Auswahl

Die im jeweiligen Nutzungskontext, insbesondere für einen Inhalt innerhalb
einer Setlist, festgelegte Auswahl ein- und ausgeblendeter Overlays.

Die Auswahl verändert weder Inhalt noch Overlay und darf bestehende
Berechtigungen nicht umgehen.

### Annotation

Eine zusätzliche grafische oder textuelle Markierung in einem Overlay.

### Transpositions-Overlay

Ein Overlay oder ein Bestandteil eines Overlays, das eine
benutzer- beziehungsweise auftrittsbezogene Transposition darstellt, ohne den
zugrunde liegenden Chord-Inhalt zu verändern.

### Check-out

Die wirksame Reservierung eines gemeinsam bearbeitbaren Inhalts oder Overlays
für genau einen Benutzer.

Während eines Check-outs dürfen andere Benutzer denselben Gegenstand nicht
parallel bearbeiten. Ein Check-out ist keine technische Implementierungsfestlegung.

### Administrative Check-out-Rücknahme

Die bewusste und nachvollziehbare Aufhebung eines Check-outs durch einen hierzu
berechtigten Bandadministrator im eigenen Bandbereich.

Die Rücknahme darf keinen stillen Datenverlust verursachen.

### First come, first save

Fachlicher Kollaborationsgrundsatz, nach dem der zuerst wirksam auscheckende und
unter gültiger Berechtigung speichernde Benutzer seine Änderung abschließen
kann.

Spätere konkurrierende Bearbeitungen werden blockiert und müssen den aktuellen
Stand neu laden. Ein stilles Überschreiben oder automatisches Zusammenführen ist
nicht vorgesehen.

### Setlist

Ein eigenständiges Planungsobjekt mit einer geordneten Auswahl konkreter
Inhalte, insbesondere für Probe oder Auftritt.

Eine Setlist ist kein Inhalt. Sie enthält keine Songfassungen, Revisionen oder
Referenzstrategien. Für jeden Eintrag können die im Setlistkontext sichtbaren
Overlays ausgewählt werden.

Eine Setlist besitzt genau einen aktuellen Stand und eine Änderungshistorie.

### Setlisteintrag

Die Zuordnung eines konkreten Inhalts zu einer Setlist einschließlich
Reihenfolge und setlistenbezogener Darstellungsentscheidungen.

### Persönliches Ausblenden

Die rollenabhängig zulässige Entscheidung eines Benutzers, einen Setlisteintrag
für seine eigene Nutzung nicht anzuzeigen.

Persönliches Ausblenden entfernt den Eintrag weder aus der bandweiten Setlist
noch für andere Benutzer.

### Änderungshistorie

Die nachvollziehbare Folge fachlich relevanter Änderungen eines Songs, Inhalts,
Overlays oder einer Setlist.

Eine Änderungshistorie erzeugt keine auswählbaren Versionen oder Revisionen. Sie
muss mindestens Gegenstand, Akteur, Zeitpunkt und Art der Änderung erkennbar
machen.

### Aktueller Stand

Der genau eine fachlich wirksame Stand eines Inhalts, Overlays oder einer
Setlist.

Frühere Änderungen sind nur über die Änderungshistorie nachvollziehbar und
nicht als alternative Version auswählbar.

### Offlineinhalt

Ein ausdrücklich ausgewählter und lokal vorbereiteter Inhalt, der im Rahmen der
wirksamen Berechtigung ohne Netzwerk verwendet werden darf.

### Lokale private Overlay-Änderung

Eine auf einem Offlinegerät entstandene Änderung an einem privaten Overlay, die
noch nicht erfolgreich mit der zentralen Datenhaltung abgeglichen wurde.

Ob solche Änderungen zulässig sind und wie lange sie gespeichert werden dürfen,
wird in den Produktfragen entschieden.

### Synchronisation

Der kontrollierte Abgleich zulässiger zentraler und lokaler Zustände.

Eine offline entstandene Änderung darf nicht still als kollaborative
Bandänderung übernommen werden. Rechte werden vor einer Übernahme erneut
geprüft.

### Konflikt

Ein Zustand, in dem eine beabsichtigte Änderung wegen eines neueren Stands,
eines wirksamen Check-outs, fehlender Rechte oder eines nicht zulässigen lokalen
Zustands nicht übernommen werden kann.

### Zentrale Datenhaltung

Der fachlich maßgebliche Datenbestand einer Umgebung. Der Begriff legt kein
konkretes Datenbankprodukt oder Speichermodell fest.

### DEV

Die getrennte Umgebung für Entwicklung und zulässige lokale Diagnose gemäß
[Umgebungsmodell](../ENVIRONMENTS.md).

### TST

Die getrennte Umgebung für produktionsnahe Verifikation gemäß
[Umgebungsmodell](../ENVIRONMENTS.md).

### PRD

Die getrennte Umgebung für produktiven Betrieb ohne Debugzugänge gemäß
[Umgebungsmodell](../ENVIRONMENTS.md).

## Nicht mehr verwendete Modellbegriffe

Die folgenden Begriffe sind keine gültigen Bestandteile des Produktmodells:

- Songfassung,
- Revision als auswählbarer fachlicher Inhaltsstand,
- Rolling Reference,
- Pinned Reference,
- Setlist-Standardstrategie,
- Gruppe als Synonym für Band,
- Gruppenadministrator,
- Arbeitsbereich oder Workspace als Synonym für Bandbereich.

Historische Erwähnungen müssen ausdrücklich als verworfene frühere Entscheidung
gekennzeichnet sein.

## Konsistenzregel

Neue Begriffe dürfen bestehende Definitionen nicht still verändern. Eine
fachliche Präzisierung aktualisiert dieses Glossar und alle betroffenen
Produktdokumente gemeinsam. Nicht entschiedene Bedeutungsunterschiede werden in
den [Produktfragen](OPEN-QUESTIONS.md) dokumentiert.
