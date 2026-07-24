# Inhalts-, Versions- und Referenzmodell

## Zweck und Geltungsbereich

Dieses Dokument konsolidiert die in GitHub-Issue #5 festgelegten fachlichen
Architekturprinzipien für Inhalte, Eigentum, Freigaben, Overlays, Versionen und
Setlisten. Es beschreibt das verbindliche Produktmodell, aber weder ein
technisches Datenmodell noch eine API, Speichertechnologie oder
Implementierungsarchitektur.

Die zugehörigen funktionalen Anforderungen stehen im
[funktionalen Scope](../product/FUNCTIONAL-SCOPE.md), die Fachbegriffe im
[Glossar](../product/GLOSSARY.md) und verbleibende Entscheidungen in den
[offenen Produktfragen](../product/OPEN-QUESTIONS.md).

## Referenzmodell

Jeder Inhalt besitzt genau ein fachlich maßgebliches
[Original](../product/GLOSSARY.md#original). Andere fachliche Zusammenhänge
referenzieren dieses Original oder eine festgelegte Songfassung und erzeugen
keine inhaltlich eigenständige Kopie.

Verbindlich gilt:

- Mehrfachfreigaben an mehrere Gruppen verweisen auf dasselbe Original.
- Setlists enthalten Referenzen auf Inhalte und betten keine unabhängigen
  Inhaltskopien ein.
- Verweise auf Songfassungen verwenden entweder eine Rolling Reference oder
  eine Pinned Reference.
- Persönliche und gruppenbezogene Zusatzinformationen werden als Overlays
  geführt.
- Eine Freigabe, Setlistzuordnung oder Overlay-Erstellung verändert weder das
  Original noch dessen Eigentum.

Eine ausdrücklich ausgelöste Kopie einer Setlist ist ein neuer, eigenständiger
fachlicher Inhalt mit eigener Eigentums-, Freigabe- und Änderungshistorie. Sie
ist keine Version der Ausgangssetlist. Das Kopieren einer Setlist kopiert nicht
die von ihr referenzierten Songinhalte.

## Eigentumsmodell

Eigentum bezeichnet die fachliche Verantwortung für einen Inhalt und ist von
Sichtbarkeit und Berechtigungen getrennt. Eigentümer eines Inhalts ist genau
eine der folgenden Parteien:

- ein Benutzer,
- eine Gruppe,
- die Plattform.

Für Änderungen der Eigentümerschaft gelten folgende verbindliche Regeln:

1. Wird ein Benutzer gelöscht, werden seine weiterhin privaten Inhalte
   entfernt.
2. Inhalte, die der gelöschte Benutzer für eine Gruppe eingebracht hat und die
   als Gruppeninhalte geführt werden, bleiben erhalten und gehen an diese
   Gruppe über.
3. Wird eine Gruppe gelöscht, gehen ihre Inhalte an den verantwortlichen
   Administrator oder an den beim Löschvorgang ausdrücklich bestimmten
   Nachfolger über.
4. Ein Eigentümer darf Eigentum freiwillig an die Plattform übertragen.

War ein freiwillig an die Plattform übertragener Inhalt zuvor privat, bleibt
er privat. Er wird als privater Inhalt des Plattformeigentümers geführt. Die
Eigentumsübertragung veröffentlicht den Inhalt nicht und erweitert weder seine
Sichtbarkeit noch seine Berechtigungen.

Eine Eigentumsübertragung muss bewusst erfolgen und nachvollziehbar sein. Sie
ändert bestehende Sichtbarkeit oder Berechtigungen nicht still. Der konkrete
Ablauf einer Benutzer- oder Gruppenlöschung muss die betroffenen Inhalte und
den neuen beziehungsweise entfallenden Eigentümer vor Bestätigung eindeutig
ausweisen.

## Freigabemodell

Für jeden Inhalt werden drei voneinander unabhängige fachliche Dimensionen
unterschieden:

1. **Eigentum:** Wer trägt die fachliche Verantwortung und darf den Inhalt
   verwalten?
2. **Sichtbarkeit:** Wer darf den Inhalt finden oder sehen?
3. **Berechtigungen:** Welche Aktionen darf die jeweilige Partei am sichtbaren
   Inhalt ausführen?

Ein Inhalt kann deshalb gleichzeitig mehreren Gruppen freigegeben, öffentlich
sichtbar und weiterhin durch seinen Eigentümer verwaltet sein. Weder
öffentliche Sichtbarkeit noch eine Gruppenfreigabe übertragen Eigentum oder
erteilen über die ausdrücklich vergebenen Berechtigungen hinausgehende Rechte.
Der Entzug einer einzelnen Freigabe lässt das Original und andere Freigaben
unverändert.

Neue Inhalte sind standardmäßig privat. Jeder Benutzer darf in seinen
persönlichen Einstellungen als Standardsichtbarkeit privat, eine bestimmte
Gruppe oder öffentlich wählen und diese Voreinstellung bei jeder Erstellung
überschreiben. Eine bestimmte Gruppe darf nur als persönliche Standardsichtbarkeit gewählt
werden, solange der Benutzer dort die erforderliche Veröffentlichungsberechtigung
besitzt. Nach Entzug dieser Berechtigung darf sie nicht weiter als Ziel der
Standardsichtbarkeit verwendet werden.

Wurde ein Inhalt in einer Gruppe publiziert, benötigen spätere Änderungen
seiner Sichtbarkeit oder Gruppenzuordnung die nachvollziehbare Zustimmung eines
Gruppenadministrators. Das gilt mindestens für die Rücknahme aus der Gruppe,
die Veröffentlichung außerhalb der Gruppe, die Freigabe für weitere Gruppen
und den Wechsel der Gruppenfreigabe. Die Zustimmung verändert das Eigentum
nicht und ersetzt keine weitere erforderliche Berechtigung.

## Overlay-Modell

Zusatzinformationen werden getrennt vom Original geführt:

- Ein **persönliches Overlay** ist einem Benutzer persönlich zugeordnet und
  enthält die für diesen Benutzer geführten Zusatzinformationen.
- Ein **Gruppen-Overlay** enthält die für eine Gruppe gemeinsam geführten
  Zusatzinformationen.

Mehrere persönliche oder Gruppen-Overlays können dasselbe Original
referenzieren. Es entstehen keine gruppenspezifischen Kopien des Originals.
Die persönliche Zuordnung bezeichnet weder den Eigentümer des referenzierten
Originals noch automatisch den Ersteller des Overlays. Eigentümer, Ersteller,
zugeordneter Benutzer, Sichtbarkeit und Bearbeitungsberechtigung werden als
getrennte fachliche Merkmale behandelt. Zugriff und Änderung eines Overlays
richten sich nach seiner Sichtbarkeit und den ausdrücklich wirksamen
Berechtigungen.

## Songfassungen, Revisionen und Referenzstrategien

Fachliche Versionen werden bei Songs als Songfassungen mit zugehörigen
Revisionen modelliert und über Referenzen verwendet. Ein Song kann mehrere
fachlich unterscheidbare Songfassungen besitzen. Jede Songfassung besitzt eine
eigene Folge nachvollziehbarer Revisionen. Eine Revision ist ein festgehaltener
Änderungsstand genau dieser Songfassung und keine weitere Songfassung.

Referenzen auf eine Songfassung wählen genau eine der folgenden Strategien:

- **Rolling Reference:** verweist auf die jeweils aktuelle Revision der
  gewählten Songfassung.
- **Pinned Reference:** verweist dauerhaft auf eine ausdrücklich ausgewählte
  Revision der Songfassung.

Benutzer und Gruppen dürfen die Strategie für ihre eigenen zulässigen
Referenzen wählen. Eine Setlist legt zusätzlich genau eine Standardstrategie
für ihre Songreferenzen fest:

- **Immer aktuell:** Ein erbender Setlisteintrag verwendet eine Rolling
  Reference.
- **Stabil beziehungsweise festgesetzt:** Ein erbender Setlisteintrag verwendet
  eine für ihn festgesetzte Revision.

Jeder Setlisteintrag übernimmt zunächst die Standardstrategie der Setlist. Für
einen einzelnen Song darf diese Vorgabe durch eine Rolling Reference oder eine
ausdrücklich Pinned Reference überschrieben werden. Eine Änderung des
Setliststandards wirkt auf erbende Einträge, aber nicht auf ausdrücklich
überschriebene Einträge. Keine Strategie kopiert den Songinhalt. Beispiel: Bei
Setliststandard stabil erbt Song A die stabile Strategie, Song B überschreibt
sie mit Rolling und Song C verweist ausdrücklich auf eine gepinnte
Revision. Ein neuer Revisionsstand verändert Rolling References, aber keine Pinned References.

## Zusammenarbeit an Inhalten

Ein in einer Gruppe publizierter Inhalt darf durch seinen ursprünglichen
Ersteller, Gruppenadministratoren und weitere Gruppenrollen mit ausdrücklicher
Inhaltsberechtigung verwaltet werden. Die Rechte müssen mindestens für folgende
Aktionen getrennt vergeben werden können:

- Inhalt bearbeiten,
- neue Revision erstellen,
- eine Sichtbarkeitsänderung auslösen oder beantragen,
- Freigaben verwalten,
- Inhalt archivieren,
- Inhalt löschen,
- Mitverantwortliche oder berechtigte Rollen zuweisen.

Eine Gruppenrolle vermittelt nur die ausdrücklich freigegebenen Aktionen und
ersetzt keine inhaltsbezogene Einschränkung durch den Eigentümer. Für neue
Revisionen gilt weiterhin die doppelte Prüfung: Der Eigentümer erlaubt
Gruppenrevisionen für diesen Inhalt und die wirksame Gruppenrolle erlaubt die
konkrete Aktion. Die Erlaubnis, neue Revisionen anzulegen, überträgt weder das
Eigentum noch weitere Verwaltungsrechte.

Änderungen der Sichtbarkeit oder Gruppenzuordnung eines gruppenpublizierten
Inhalts folgen zusätzlich der Zustimmungspflicht aus dem Freigabemodell. Der
genaue Zuschnitt weiterer Gruppenrollen bleibt eine offene Produktfrage;
dieses Dokument legt keine Rollenmatrix fest.

## Setlistenmodell

Eine Setlist besitzt genau einen aktuellen Stand und eine vollständige
Änderungshistorie. Frühere Änderungen bleiben nachvollziehbar, werden aber
nicht als parallel auswählbare Setlistversionen modelliert.

Für Setlists gilt:

- Eigentümer ist ein Benutzer oder eine Gruppe.
- Eine Setlist referenziert Songs beziehungsweise deren Fassungen und
  Revisionen; sie kopiert die Inhalte nicht.
- Jede Setlist besitzt die Standardstrategie immer aktuell oder stabil
  beziehungsweise festgesetzt.
- Jeder Song übernimmt diese Strategie oder überschreibt sie mit einer Rolling
  beziehungsweise ausdrücklich Pinned Reference.
- Gruppenmitglieder bearbeiten eine gruppeneigene Setlist nur entsprechend
  ihrer wirksamen Gruppenrolle und Berechtigung.
- Wer einen unabhängigen neuen Planungsstand benötigt, kopiert die Setlist.
  Die Kopie erhält einen eigenen aktuellen Stand und eine eigene vollständige
  Änderungshistorie.

## Integritätsregeln

Das Produkt muss mindestens folgende Widersprüche verhindern oder eindeutig
anzeigen:

- mehrere vermeintliche Originale desselben Inhalts,
- Freigaben oder Setlisteinträge mit eingebetteten unabhängigen Inhaltskopien,
- Referenzen auf nicht vorhandene Fassungen oder Revisionen,
- stilles Umschalten einer Pinned Reference auf eine neuere Revision,
- Overlay-Änderungen am Original,
- Eigentumsübertragungen ohne bestimmten Nachfolger,
- Gruppenänderungen ohne Zustimmung des Eigentümers oder ohne wirksames
  Gruppenrecht,
- Änderungen an Sichtbarkeit oder Gruppenzuordnung eines gruppenpublizierten
  Inhalts ohne nachvollziehbare Zustimmung eines Gruppenadministrators,
- eine Gruppe als Standardsichtbarkeit ohne wirksame
  Veröffentlichungsberechtigung,
- eine Verwechslung von Eigentümer, Ersteller und persönlich zugeordnetem
  Benutzer,
- Setlists ohne eindeutige Standardstrategie oder mit widersprüchlicher
  Eintragsüberschreibung,
- mehrere gleichzeitig als aktuell geltende Stände derselben Setlist.

Diese Regeln sind technologieoffen zu verifizieren. Eine spätere technische
Abbildung benötigt eine gesonderte Architekturentscheidung, sofern sie die
Kriterien des [ADR-Verfahrens](../ADR.md) erfüllt.
