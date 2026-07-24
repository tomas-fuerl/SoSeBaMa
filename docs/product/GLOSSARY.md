# Verbindliches Produktglossar

## Bezug und Verwendung

Dieses Glossar konkretisiert GitHub-Issue #3. Die bevorzugten Begriffe werden
in allen Produktdokumenten konsistent verwendet. Ein Synonym verweist auf den
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

### Song

Der fachliche Eintrag für ein Musikstück mit Metadaten und gegebenenfalls
mehreren Songfassungen und zugehörigen Dokumenten.

### Songfassung

Eine unterscheidbare fachliche Ausprägung eines Songs, etwa für eine Besetzung,
Tonart oder Bearbeitung. Ob Fassungen als versionierte Revisionen geführt
werden, ist in `OQ-012` offen.

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

### Annotation

Eine zusätzliche Markierung oder Notiz zu einem Dokument, die das
Originaldokument nicht unbemerkt verändert. Annotationen können abhängig von
der späteren Entscheidung privat oder gemeinsam sichtbar sein.

### Setlist

Eine geordnete Auswahl von Songs für einen fachlichen Zweck, insbesondere eine
Probe oder einen Auftritt.

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
