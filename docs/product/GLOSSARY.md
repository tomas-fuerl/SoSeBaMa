# Verbindliches Produktglossar

## Bezug und Verwendung

Dieses Glossar konkretisiert GitHub-Issue #3 und die Produktentscheidungen aus
GitHub-Issue #5. Die bevorzugten Begriffe werden in allen Produkt- und
Architekturdokumenten konsistent verwendet. Ein Synonym verweist auf den
bevorzugten Begriff und führt keine zusätzliche Bedeutung ein.

## Begriffe

### SoSeBaMa

Kurzname für **Song-Setlist-Band-Manager**, das in der
[Produktvision](VISION.md) beschriebene Produkt.

### Benutzer

Eine identifizierte Person, die nach erfolgreicher Zugangsprüfung und gemäß
ihrer fachlichen Berechtigungen mit SoSeBaMa interagiert.

### Mitglied

Ein Benutzer mit einer aktiven Mitgliedschaft in einem Arbeitsbereich. Eine
Mitgliedschaft allein legt noch keine konkreten Änderungsrechte fest.

### Band

Die fachliche Gruppe von Musikern oder das Ensemble, dessen Repertoire und
Auftritte durch SoSeBaMa unterstützt werden. Die fachliche Zuordnung von Band
und Arbeitsbereich ist in `OQ-021` offen.

### Arbeitsbereich

Bevorzugter Begriff für die fachliche Verwaltungs- und Berechtigungsgrenze, in
der Mitglieder, Songs, Dokumente und Setlists zusammenarbeiten.

### Workspace

Synonym für [Arbeitsbereich](#arbeitsbereich); in deutschsprachiger
Projektdokumentation wird „Arbeitsbereich“ bevorzugt.

### Rolle

Eine fachliche Zusammenfassung erlaubter Aufgaben innerhalb eines
Arbeitsbereichs. Sie ist keine Festlegung eines technischen Rollenmodells.

### Gruppe

Eine fachliche Zusammenfassung von Benutzern für gemeinsame Sichtbarkeit,
Overlays und Berechtigungen. Eine Gruppe kann Inhalte und Setlists besitzen.
Die genaue technische Abbildung sowie das Verhältnis zu Band und Arbeitsbereich
werden dadurch nicht festgelegt.

### Plattform

SoSeBaMa als fachlicher Eigentümer eines freiwillig übertragenen Inhalts. Der
Begriff bezeichnet keine technische Betriebsidentität und erteilt dem
technischen Betrieb keine impliziten Inhaltsrechte.

### Inhalt

Ein fachlich verwaltetes Objekt wie Song, Dokument, Text- oder Akkordblatt oder
Setlist. Jeder Inhalt besitzt genau ein Original und genau einen Eigentümer.

### Original

Der fachlich maßgebliche Inhalt, der genau einmal besteht. Freigaben, Setlists
und Overlays referenzieren ihn oder eine festgelegte Revision und erzeugen kein
weiteres Original.

### Eigentum

Die fachliche Verantwortung für einen Inhalt. Eigentümer ist genau ein
Benutzer, eine Gruppe oder die Plattform. Eigentum ist von Sichtbarkeit und
Berechtigungen getrennt.

### Eigentümer

Der Benutzer, die Gruppe oder die Plattform, die das [Eigentum](#eigentum) an
einem Inhalt trägt und ihn im Rahmen der wirksamen Berechtigungen verwaltet.

### Sichtbarkeit

Die fachliche Festlegung, wer einen Inhalt finden oder sehen darf. Sichtbarkeit
allein erteilt kein Änderungsrecht und überträgt kein Eigentum.

### Berechtigung

Die ausdrücklich erlaubte Aktion einer Partei an einem sichtbaren Inhalt. Eine
Berechtigung kann durch Rolle, Gruppe und inhaltsbezogene Freigabe begrenzt sein.

### Freigabe

Die bewusste Zuordnung von Sichtbarkeit und Berechtigungen für eine Partei. Ein
Inhalt kann gleichzeitig mehreren Gruppen freigegeben und öffentlich sichtbar
sein, ohne dass sich sein Eigentümer ändert.

### Referenz

Eine fachliche Verknüpfung zu einem bestehenden Original, einer Songfassung
oder einer Revision. Eine Referenz erzeugt keine eigenständige Inhaltskopie.

### Song

Der fachliche Eintrag für ein Musikstück mit Metadaten und gegebenenfalls
mehreren Songfassungen und zugehörigen Dokumenten.

### Songfassung

Eine unterscheidbare fachliche Ausprägung eines Songs, etwa für eine Besetzung,
Tonart oder Bearbeitung. Jede Songfassung besitzt ihre eigene Folge von
Revisionen.

### Version

Überbegriff für fachlich unterscheidbare Stände. Bei Songs wird er präzise als
Songfassung mit zugehörigen Revisionen ausgedrückt. Setlists werden nicht
versioniert, sondern besitzen einen aktuellen Stand und eine Änderungshistorie.

### Revision

Ein nachvollziehbar festgehaltener Änderungsstand genau einer Songfassung. Eine
Revision ist keine zusätzliche Songfassung und kein neues Original.

### Rolling Reference

Eine Referenz auf die jeweils aktuelle Revision einer gewählten Songfassung.
Eine neue Revision verändert das von dieser Referenz gelieferte Ergebnis.

### Pinned Reference

Eine Referenz auf eine ausdrücklich gewählte Revision einer Songfassung. Eine
neue Revision verändert das Ziel dieser Referenz nicht.

### Dokument

Ein einem Song zugeordneter Inhalt, beispielsweise ein PDF, Textblatt oder
Akkordblatt. Die Zuordnung verleiht keine über das jeweilige Nutzungsrecht
hinausgehenden Rechte.

### PDF

Ein als Original erhaltenes Dokument in einem portablen, seitenorientierten
Dokumentformat, das angezeigt und getrennt davon annotiert werden kann.

### Textblatt

Ein bearbeitbarer, textorientierter Songinhalt ohne zwingend strukturierte
Akkordinformationen.

### Akkordblatt

Ein bearbeitbarer Songinhalt, in dem Text und Akkorde so strukturiert sind,
dass Akkorde erkannt, dargestellt und transponiert werden können.

### Overlay

Zusatzinformationen, die ein Original referenzieren und getrennt davon geführt
werden. Ein Overlay verändert oder kopiert das Original nicht.

### Persönliches Overlay

Ein Overlay mit persönlichen Zusatzinformationen eines Benutzers. Seine
Sichtbarkeit und Berechtigungen werden unabhängig vom Original behandelt.

### Gruppen-Overlay

Ein Overlay mit gemeinsam geführten Zusatzinformationen einer Gruppe. Mehrere
Gruppen-Overlays können dasselbe Original referenzieren; es entstehen keine
gruppenspezifischen Originalkopien.

### Annotation

Eine zusätzliche Markierung oder Notiz in einem persönlichen oder
Gruppen-Overlay zu einem referenzierten Dokument.

### Setlist

Eine geordnete Auswahl von Songreferenzen für einen fachlichen Zweck,
insbesondere eine Probe oder einen Auftritt. Eine Setlist besitzt genau einen
aktuellen Stand und eine vollständige Änderungshistorie. Ein unabhängiger neuer
Stand entsteht durch Kopieren statt durch Setlistversionierung.

### Änderungshistorie

Die vollständige nachvollziehbare Folge von Änderungen eines Inhalts. Bei einer
Setlist dient sie dem Nachweis früherer Stände, ohne diese als parallel
auswählbare Versionen zu modellieren.

### Offlineinhalt

Ein ausdrücklich ausgewählter und lokal vorbereiteter Inhalt, der im Rahmen
der wirksamen Berechtigung ohne Netzwerk verwendet werden darf.

### Lokale Änderung

Eine auf einem Offline-Gerät entstandene, noch nicht erfolgreich in die
zentrale Datenhaltung übertragene fachliche Änderung.

### Synchronisation

Der kontrollierte Abgleich zulässiger zentraler und lokaler Zustände. Die
zentrale Datenhaltung bleibt fachlich maßgeblich; ausstehende Änderungen,
Fehler und Konflikte müssen sichtbar bleiben.

### Konflikt

Ein Zustand, in dem lokale und zentrale Änderungen nicht ohne fachliche
Entscheidung zu einem eindeutigen Ergebnis zusammengeführt werden können.

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

## Konsistenzregel

Neue Begriffe dürfen bestehende Definitionen nicht still verändern. Eine
fachliche Präzisierung aktualisiert dieses Glossar und alle betroffenen
Produktdokumente gemeinsam. Nicht entschiedene Bedeutungsunterschiede werden
zunächst als [offene Frage](OPEN-QUESTIONS.md) dokumentiert.
