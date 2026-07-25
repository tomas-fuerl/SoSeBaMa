# Inhalts- und Overlaymodell

## Zweck und Geltungsbereich

Dieses Dokument beschreibt das verbindliche fachliche Modell für Songs,
Inhalte, Metadaten, Eigentum, Sichtbarkeit, Overlays, Setlists,
Änderungshistorien und kollaborative Bearbeitung. Es legt weder ein technisches
Datenmodell noch eine API, Speichertechnologie oder Implementierungsarchitektur
fest.

Die zugehörigen funktionalen Anforderungen stehen im
[funktionalen Scope](../product/FUNCTIONAL-SCOPE.md), die verbindlichen
Fachbegriffe im [Glossar](../product/GLOSSARY.md) und verbleibende
Eigentümerentscheidungen in den
[Produktfragen](../product/OPEN-QUESTIONS.md).

## Song- und Inhaltsmodell

### Song

Ein Song ist der normalisierte fachliche Metadateneintrag für ein Musikstück.
Er beschreibt das Musikstück, ist aber selbst weder PDF noch Text- oder
Akkorddarstellung.

Ein Song kann ohne konkreten Inhalt angelegt werden. Jeder neue konkrete Inhalt
muss jedoch genau einem vorhandenen oder im selben Ablauf neu angelegten Song
zugeordnet werden.

Ein Song kann mehreren konkreten Inhalten zugrunde liegen. Beispielsweise können
demselben Song ein PDF, ein strukturiertes Akkordblatt und eine vereinfachte
Textdarstellung zugeordnet sein.

### Inhalt

Ein Inhalt ist eine konkrete musikalische Darstellung genau eines Songs. Ein
Inhalt kann insbesondere sein:

- ein PDF,
- ein strukturiertes Akkord- oder Textdokument,
- eine andere später ausdrücklich freigegebene Darstellungsform.

Für jeden Inhalt gilt:

- Er ist genau einem Song zugeordnet.
- Er besitzt genau einen aktuellen Stand.
- Er besitzt ein Original ohne angewendete Overlays.
- Er besitzt einen eindeutigen Eigentümer.
- Er kann privat, für eine oder mehrere Bands oder öffentlich sichtbar sein.
- Er kann unabhängig vom Song eigene Metadaten besitzen.
- Seine Änderungen werden nachvollziehbar historisiert, aber nicht versioniert.

Ein Inhalt kann ausschließlich privat bleiben. Eine Zuordnung zu einer Band ist
nicht erforderlich.

### Keine Versionierung

SoSeBaMa führt keine fachlichen Songfassungen und keine auswählbaren Revisionen.

Insbesondere existieren nicht:

- Songfassungen,
- Rolling References,
- Pinned References,
- auswählbare frühere Inhaltsstände,
- setlistweite Referenzstrategien.

Eine Setlist kann ausschließlich den aktuellen Stand eines konkreten Inhalts
verwenden. Frühere Änderungen bleiben über die Änderungshistorie
nachvollziehbar, bilden aber keine adressierbare Version und können nicht als
Setlisteintrag ausgewählt werden.

## Inhaltsmetadaten

Normalisierte Metadaten werden am Song geführt. Dazu können insbesondere Titel,
Interpret, Urheber und weitere später festgelegte Songmerkmale gehören.

Ein konkreter Inhalt darf eigene Metadaten führen, die von den normalisierten
Songmetadaten abweichen. Dies ermöglicht beispielsweise:

- einen ergänzten Inhaltstitel,
- eine inhaltsspezifische Tonart,
- einen Hinweis auf eine vereinfachte Bearbeitung,
- eine besetzungs- oder auftrittsbezogene Bezeichnung.

Eine Abweichung am Inhalt ändert nicht automatisch die normalisierten
Songmetadaten. Für Benutzer muss erkennbar sein, ob ein angezeigter Wert vom
Song oder vom konkreten Inhalt stammt. Das konkrete technische Vererbungs- oder
Darstellungsverfahren wird hier nicht festgelegt.

## Eigentums- und Sichtbarkeitsmodell

Eigentum, Sichtbarkeit und Berechtigungen sind getrennte fachliche Dimensionen.

### Eigentum

Eigentum bezeichnet die fachliche Verantwortung für ein verwaltetes Objekt.

Für Inhalte ist Eigentümer genau eine der folgenden Parteien:

- ein Benutzer,
- eine Band,
- die Plattform.

Setlists besitzen einen Benutzer oder eine Band als Eigentümer. Overlays
besitzen entsprechend ihrer Reichweite einen Benutzer, eine Band oder den
Eigentümer des zugrunde liegenden Inhalts als Eigentümer.

Ein Eigentumswechsel muss bewusst erfolgen und nachvollziehbar sein. Er ändert
Sichtbarkeit oder Berechtigungen nicht still.

Wird ein Benutzer gelöscht, werden seine ausschließlich privaten Inhalte gemäß
dem beschlossenen Löschmodell entfernt. Bereits als Bandinhalt geführte Inhalte
bleiben erhalten und gehen an die zuständige Band über. Wird eine Band gelöscht,
muss für ihre verbleibenden Inhalte ein eindeutiger Nachfolger bestimmt werden.

Ein Eigentümer darf einen Inhalt freiwillig an die Plattform übertragen. War
der Inhalt zuvor privat, bleibt er privat und wird nicht automatisch
veröffentlicht.

### Sichtbarkeit

Ein Inhalt kann sichtbar sein:

- ausschließlich privat,
- für eine oder mehrere Bands,
- öffentlich.

Neue Inhalte sind standardmäßig privat. Ein Benutzer darf eine wirksame
persönliche Standardsichtbarkeit konfigurieren und sie bei der Erstellung
überschreiben. Eine Band darf nur ausgewählt werden, wenn die erforderliche
Veröffentlichungsberechtigung besteht.

Wurde ein Inhalt in einer Band publiziert, benötigen spätere Änderungen seiner
Sichtbarkeit oder Bandzuordnung die nachvollziehbare Zustimmung eines
Bandadministrators der betroffenen Band, soweit die Änderung deren bestehende
Publikation betrifft.

Eine Sichtbarkeit vermittelt keine nicht ausdrücklich vorhandenen
Bearbeitungsrechte und überträgt kein Eigentum.

## Overlay-Modell

### Grundprinzip

Ein Overlay enthält zusätzliche Darstellungs- oder Bearbeitungsinformationen zu
genau einem Inhalt. Es verändert und kopiert das Original des Inhalts nicht.

Das Original ist der aktuelle Inhalt ohne angewendete Overlays.

Ein Overlay kann unter anderem enthalten:

- grafische Annotationen,
- Markierungen,
- Textnotizen,
- auftrittsbezogene Hinweise,
- eine automatische Transposition,
- die Änderung einzelner Akkorde,
- die Vereinfachung komplizierter Akkorde,
- andere ausdrücklich zulässige Darstellungsanpassungen.

### Anzahl und Eigentümer

Zu einem Inhalt können beliebig viele Overlays existieren.

Ein Benutzer darf mehrere eigene Overlays zu demselben Inhalt erzeugen.

Eine Band darf mehrere eigene Band-Overlays zu demselben Inhalt erzeugen.
Bearbeitung und Verwaltung richten sich nach den wirksamen Bandrollen,
Direktrechten und inhaltsbezogenen Berechtigungen.

Der Eigentümer eines Inhalts darf ein globales Overlay bereitstellen. Global
bedeutet, dass das Overlay allen zum Inhalt berechtigten Benutzern angeboten
werden kann. Es erweitert weder die Sichtbarkeit des Inhalts noch umgeht es
bestehende Berechtigungen.

### Reichweiten

Fachlich werden mindestens folgende Reichweiten unterschieden:

- **Privates Overlay:** einem Benutzer zugeordnet und ausschließlich für
  diesen Benutzer sichtbar.
- **Band-Overlay:** einer Band zugeordnet und innerhalb ihres Bandbereichs nach
  Rollen und Rechten nutzbar.
- **Globales Overlay:** durch den Inhaltseigentümer für die berechtigten Nutzer
  des Inhalts bereitgestellt.

Die Reichweite allein vermittelt kein Bearbeitungsrecht. Eigentümer, Ersteller,
Sichtbarkeit und Bearbeitungsberechtigung eines Overlays bleiben getrennt.

### Gleichzeitige Darstellung

Mehrere berechtigte Overlays können gleichzeitig auf demselben Inhalt
dargestellt werden. Überlappungen sind zulässig.

Die Anwendung muss die aktiven Overlays und ihre Darstellungsreihenfolge
eindeutig kenntlich machen. Überlappungen dürfen weder ein Overlay noch das
Original verändern oder zu Datenverlust führen. Eine konkrete Rendering- oder
UI-Technik wird nicht festgelegt.

### Verwendung in Setlists

Für jeden Inhalt im Kontext einer Setlist kann festgelegt werden, welche
verfügbaren Overlays ein- oder ausgeblendet werden. Mehrere Overlays dürfen
gleichzeitig aktiv sein.

Die setlistenbezogene Auswahl:

- verändert den Inhalt nicht,
- verändert die Overlays nicht,
- verändert deren allgemeine Sichtbarkeit nicht,
- überträgt keine zusätzlichen Rechte.

Ein Band-Overlay kann beispielsweise redaktionelle Hinweise für alle
berechtigten Musiker bereitstellen. Ein Benutzer kann gleichzeitig ein privates
Overlay mit eigenen Notizen einblenden. Für einen konkreten Auftritt können
nicht benötigte Overlays im Setlistkontext ausgeblendet werden.

Ob eine Auswahl als bandweiter Setliststandard oder als persönliche Ansicht
gespeichert wird, richtet sich nach den wirksamen Rechten und muss für Benutzer
eindeutig erkennbar sein.

## Rechte- und Rollenmodell

### Rechte

Ein Recht erlaubt eine konkret benannte fachliche Aktion. Ein Recht kann
zugewiesen werden:

- über eine Rolle,
- unmittelbar an eine einzelne Person.

Mitgliedschaft oder Sichtbarkeit allein vermitteln kein Änderungsrecht.

Das wirksame Ergebnis mehrerer Zuweisungen muss eindeutig und nachvollziehbar
sein. Die abschließende Konfliktregel zwischen Rollenrechten und Direktrechten
wird in den Produktfragen festgelegt und darf nicht durch eine technische
Implementierung still vorweggenommen werden.

### Rollen

Eine Rolle bündelt mehrere Rechte und kann mehreren Personen zugewiesen werden.

Rollen gelten entweder:

- global für die Plattform,
- innerhalb genau eines Bandbereichs.

Bandbezogene Rollen und Rechte wirken nicht in anderen Bandbereichen. Globale
Rollen müssen ausdrücklich als global definiert sein.

SoSeBaMa stellt Standardrollen mit Standardrechten bereit. Die bandbezogenen
Standardrechte dürfen pro Band angepasst werden. Eine Band darf globale Rollen
oder deren globale Rechte nicht verändern.

Mindestens vorgesehen sind:

- eine globale fachliche Plattformadministration,
- Bandadministrator,
- Bandredakteur oder Inhaltsredakteur,
- Bandmitglied beziehungsweise Musiker,
- eine rein lesende Ausprägung, soweit für einen Einsatzfall erforderlich.

Die abschließende Rollen- und Rechtematrix bleibt eine gesonderte
Produktentscheidung.

### Bandadministrator

Ein Bandadministrator verwaltet ausschließlich die fachlich erlaubten Aspekte
seiner Band und ihres Bandbereichs. Daraus entstehen keine technischen
Betriebs- oder plattformweiten Administrationsrechte.

Zu den möglichen bandbezogenen Aufgaben gehören abhängig von den wirksamen
Rechten:

- Mitgliedschaften verwalten,
- Bandrollen und Bandrechte verwalten,
- Band-Overlays verwalten,
- bandbezogene Inhalte und Setlists verwalten,
- bestehende Check-outs im eigenen Bandbereich nachvollziehbar zurücknehmen.

## Band und Bandbereich

Eine Band ist die fachliche Organisation eines Ensembles oder eines
Zusammenschlusses von Musikern.

Jede Band besitzt genau einen Bandbereich. Jeder Bandbereich gehört genau einer
Band.

Der Bandbereich ist die fachliche Grenze für:

- Mitgliedschaften,
- Bandrollen,
- bandbezogene Rechte,
- Band-Overlays,
- bandbezogene Inhalte,
- bandbezogene Setlists.

Eine Installation darf mehrere voneinander getrennte Bandbereiche enthalten.
Ein Benutzer darf Mitglied mehrerer Bands und Bandbereiche sein. Seine
bandbezogenen Rollen und Rechte werden je Bandbereich getrennt ausgewertet.

## Kollaboration und Bearbeitungssperren

### Private Bearbeitung

Ein Benutzer darf eigene private Inhalte und private Overlays entsprechend
seinen wirksamen Rechten bearbeiten. Diese Bearbeitung erzeugt keine Rechte an
Band- oder globalen Objekten.

### Gemeinsame Bearbeitung

Ein gemeinsam bearbeitbarer Inhalt oder ein gemeinsam bearbeitbares Overlay
muss bei bestehender Verbindung vor der Bearbeitung ausgecheckt werden.

Ein wirksamer Check-out reserviert genau den bezeichneten
Bearbeitungsgegenstand für genau einen Benutzer. Andere Benutzer dürfen
währenddessen keine parallele Bearbeitung desselben Gegenstands beginnen.

Es gilt der fachliche Grundsatz:

**First come, first save.**

Der zuerst wirksam auscheckende und unter gültiger Berechtigung speichernde
Benutzer kann seine Änderung abschließen. Spätere konkurrierende Versuche
werden blockiert und müssen den aktuellen Stand neu laden. Ein automatisches
Zusammenführen paralleler gemeinsamer Änderungen oder stilles Überschreiben ist
nicht vorgesehen.

### Administrative Rücknahme

Ein Bandadministrator darf einen Check-out im eigenen Bandbereich
zurücknehmen, wenn er das erforderliche Recht besitzt.

Die Rücknahme muss:

- bewusst ausgelöst,
- nachvollziehbar protokolliert,
- für den bisherigen Bearbeiter sichtbar

sein. Sie darf keinen stillen Datenverlust oder eine stille Überschreibung
verursachen.

### Offline-Abgrenzung

Eine kollaborative gemeinsame Bearbeitung setzt einen wirksamen Check-out bei
bestehender Verbindung voraus. Offline entstandene Änderungen dürfen nicht
still als gemeinsame Änderungen übernommen werden.

Ob und in welchem Umfang private Overlay-Anpassungen offline entstehen und
später synchronisiert werden dürfen, wird durch die entsprechenden offenen
Produktfragen bestimmt.

## Setlistenmodell

Eine Setlist ist ein eigenständiges Planungsobjekt und kein Inhalt im Sinne des
Song- und Inhaltsmodells.

Eine Setlist enthält eine geordnete Auswahl konkreter Inhalte. Sie enthält keine
Songfassungen, Revisionen oder Referenzstrategien.

Für jeden Setlisteintrag muss mindestens eindeutig sein:

- der konkrete Inhalt,
- der zugrunde liegende Song,
- die Reihenfolge,
- der sichtbare oder persönlich ausgeblendete Zustand,
- die im Setlistkontext ausgewählten Overlays.

Ein Benutzer darf abhängig von seinen wirksamen Rechten einzelne Inhalte für
seine persönliche Nutzung ausblenden. Persönliches Ausblenden entfernt den
Setlisteintrag weder für andere Benutzer noch aus dem bandweit aktuellen
Setliststand.

Bandweite Änderungen der Setlist und persönliche Ansichtsentscheidungen müssen
eindeutig unterscheidbar sein.

Eine Setlist besitzt genau einen aktuellen Stand und eine nachvollziehbare
Änderungshistorie. Sie wird nicht versioniert. Ein unabhängiger neuer
Planungsstand kann durch bewusstes Kopieren als neue Setlist mit eigener
Eigentümerschaft und Änderungshistorie entstehen.

## Änderungshistorien

Songs, Inhalte, Overlays und Setlists müssen ihre fachlich relevanten Änderungen
nachvollziehbar festhalten.

Eine Änderungshistorie muss mindestens erkennen lassen:

- welches Objekt geändert wurde,
- wer die Änderung ausgelöst hat,
- wann sie erfolgt ist,
- welche Art von Änderung vorgenommen wurde.

Die Änderungshistorie erzeugt keine auswählbaren Versionen oder Revisionen.
Frühere Stände dürfen nicht als Setlisteintrag oder alternatives Original
verwendet werden. Ein konkretes technisches Diff-, Speicher- oder
Wiederherstellungsverfahren wird nicht festgelegt.

## Integritätsregeln

Das Produkt muss mindestens folgende Widersprüche verhindern oder eindeutig
anzeigen:

1. einen Inhalt ohne zugeordneten Song,
2. einen Inhalt mit mehr als einem zugeordneten Song,
3. eine unklare Vermischung normalisierter Songmetadaten und abweichender
   Inhaltsmetadaten,
4. eine Änderung des Originals durch eine reine Overlay-Aktion,
5. ein Overlay ohne eindeutig zugeordneten Inhalt,
6. die Anzeige eines Overlays ohne erforderliche Sichtberechtigung,
7. die Bearbeitung eines Overlays ohne Bearbeitungsrecht,
8. die Offenlegung eines privaten Overlays über eine Setlist,
9. eine setlistenbezogene Overlay-Auswahl, die allgemeine Berechtigungen
   umgeht,
10. parallele Onlinebearbeitung eines ausgecheckten gemeinsamen Gegenstands,
11. stilles Überschreiben durch konkurrierende Speicherung,
12. eine administrative Check-out-Rücknahme ohne Nachvollziehbarkeit,
13. das Speichern nach Entzug der erforderlichen Berechtigung,
14. einen Setlisteintrag ohne vorhandenen konkreten Inhalt,
15. die Verwechslung persönlichen Ausblendens mit bandweiter Entfernung eines
    Setlisteintrags,
16. mehrere gleichzeitig als aktuell geltende Stände derselben Setlist,
17. eine Änderungshistorie ohne eindeutig bestimmbaren Akteur oder Gegenstand,
18. die Vermischung von Rechten verschiedener Bandbereiche,
19. die Verwendung einer globalen Rolle als bandbezogene Rolle oder umgekehrt,
20. die Zuweisung einer Bandrolle außerhalb ihres Bandbereichs,
21. eine Band ohne genau einen Bandbereich oder einen Bandbereich ohne genau
    eine Band,
22. eine unzulässige Band- oder Plattformpublikation eines privaten Inhalts,
23. eine Eigentumsübertragung ohne eindeutigen neuen Eigentümer,
24. die automatische Veröffentlichung eines privat an die Plattform
    übertragenen Inhalts.

Diese Regeln sind technologieoffen zu verifizieren. Eine spätere technische
Abbildung benötigt eine gesonderte Architekturentscheidung, sofern sie die
Kriterien des [ADR-Verfahrens](../ADR.md) erfüllt.
