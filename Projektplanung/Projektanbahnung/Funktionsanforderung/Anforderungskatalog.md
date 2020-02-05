Anforderungen
=============

Funktionale Anforderungen
-------------------------
### Benutzerverwaltung

#### Benutzer anlegen
##### Kurzbeschreibung
- Ein neuer Nutzer wird angelegt.
##### Aktor
- Bandleader
##### Vorbedingungen
- Der Nutzer, der angelegt werden soll, existiert noch nicht.
##### Beschreibung des Ablaufs
- Ein Bandleader gibt einen neuen Benutzernamen ein (z.B. VornameNachname).
- Diesem Nutzer weist er Werte zu wie E-Mailadresse, Telefonnummer, Vorname, Nachname, Instrumente und Berechtigung.
- Der Nutzer erhält an seine E-Mail-Adresse ein Einmalpasswort, mit dem er sich auf der Plattform anmelden kann. Dieses Passwort muss er sofort ändern.
##### Auswirkungen
- Der Nutzer kann sich einloggen und Module, gemäß seiner Berechtigung nutzen. Außerdem können Mails an ihn versendet werden.
##### Anmerkungen
- keine

#### Benutzer bearbeiten
##### Kurzbeschreibung
- Die Daten eines Nutzers werden bearbeitet
##### Aktor
- Bandleader/Bandmitglied
##### Vorbedingungen
- Der Nutzer, der geändert werden soll existiert.
##### Beschreibung des Ablaufs
- Das Bandmitglied oder ein Bandleader ändert die Daten von diesem, inkl. Zugangspasswort.
- Hierbei wird der Nutzer benachrichtigt, sollte ein Bandleader die daten ändern.
##### Auswirkungen
- Die Daten des Nutzers wurden aktualisiert und er erhält eine Benachrichtigung, wenn er sie selbst nicht geändert hat.
- Er kann evtl. mehr oder weniger Module nutzen, insofern seine Berechtigungen geändert wurden.
##### Anmerkungen
- keine

#### Benutzer löschen
##### Kurzbeschreibung
- Ein Nutzer wird gelöscht.
##### Aktor
- Bandleader
##### Vorbedingungen
- Ein existierender Nutzer wird gelöscht.
##### Beschreibung des Ablaufs
- Ein Bandleader löscht einen existierenden Nutzer. Dabei werden Objekte, die ihm gehören auf diesen Bandleader übertragen. sollten jedoch Daten existieren, die aufbewahrt werden müssen, so werden diese archiviert.
##### Auswirkungen
- Der Nutzer kann sich nicht mehr einloggen. Jegliches Objekteigentum geht auf den Löschenden über. Relevante Daten werden archiviert.
##### Anmerkungen
- Besonders heikles Thema, das vollständig durchdacht sein muss.

### Songverwaltung

#### Song anlegen
##### Kurzbeschreibung
- Ein Song wird angelegt. Diesem werden Titel, Interpret/Künstler, Songtext, Accorde, Noten und eine Soundfile angefügt.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- keine
##### Beschreibung des Ablaufs
- Der Nutzer prüft, ob der Song bereits existiert und entsprechend seiner Vorstellungen. 
- Wenn nicht, legt er einen neuen Song an mit o.g. Daten.
##### Auswirkungen
- Ein neuer Song wird angelegt und die anderen Bandmitglieder können ihn jetzt suchen. Außerdem kann der Song einer Playlist hinzugefügt werden.
##### Anmerkungen
- keine

#### Song bearbeiten
##### Kurzbeschreibung
- Ein Song wird geändert.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- Lied wurde bereits erstellt.
##### Beschreibung des Ablaufs
- Sofern diese vorhanden sind, kann das Bandmitglied einzelne Metadaten, den Liedtext, die Soundfile, Akkorde und Noten anlegen, bearbeiten, ändern oder löschen.
##### Auswirkungen
- Der Datensatz des Songs wurde geändert. Dies Wirkt sich auf alle Dienste aus, die diesen Song referenzieren wie Setlists, sodass bei diesen der neue titel angezeigt wird, falls er geändert wurde. 
##### Anmerkungen
- keine

#### Song löschen
##### Kurzbeschreibung
- Ein Song wird gelöscht.
##### Aktor
- Bandleader/Ersteller
##### Vorbedingungen
Lied wurde bereits erstellt.
##### Beschreibung des Ablaufs
- Sofern ein Song vorhanden ist, kann ein Bandleader dieses löschen nach doppelter Einverständnis. Der Datensatz wird unwiederbringlich gelöscht.
##### Auswirkungen
- Der Datensatz wurde gelöscht. Dieser Datensatz wird auch in allen referenzierenden Setlists sowie anderem gelöscht.
##### Anmerkungen
- Wenn man die Datenbank absichert, lässt sich der Datensatz wieder herstellen.

### Setlistverwaltung

#### Setlist erstellen
##### Kurzbeschreibung
- Eine neue Setlist wird angelegt.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- keine
##### Beschreibung des Ablaufs
- Das Bandmitglied erstellt eine Setliste mit Namen und Beschreibung.
##### Auswirkungen
- Diese Setlist ist jetzt bearbeitbar und löschbar.
##### Anmerkungen
- keine

#### Setlist bearbeiten
##### Kurzbeschreibung
- Eine Setliste wird verändert.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- Die Setlist muss erstellt worden sein.
##### Beschreibung des Ablaufs
- Das Bandmitglied ändert eine bestehende Setlist im Bezug auf Namen und Beschreibung.
- Außerdem kann es Runden hinzufügen, verschieben und löschen.
- In diesen Runden kann das Bandmitglied Lieder hinzufügen verschieben oder löschen.
##### Auswirkungen
- Der Datensatz der Setlist wurde geändert.
- Termine, die auf diese Setliste verweisen auf den geänderten Namen.
##### Anmerkungen
- keine

#### Setlist löschen
##### Kurzbeschreibung
- Eine Setliste wird gelöscht.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- Die Setlist muss erstellt worden sein.
##### Beschreibung des Ablaufs
- Das Bandmitglied löscht eine bestehende Setlist unwiederbringlich. hierbei muss es doppelt die Löschung bestätigen.
##### Auswirkungen
- die Setliste wurde gelöscht.
- Von anderen Modulen aus kann nicht mehr darauf zugegriffen werden.
##### Anmerkungen
- keine

#### Setlist ansehen
##### Kurzbeschreibung
- Eine Setliste wird angeschaut.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- Die Setlist muss erstellt worden sein.
##### Beschreibung des Ablaufs
- Bandmitglied kann sich eine setliste anschauen und die Einzelnen Lieder öffnen. zwischen diesen kann er schnell hin und her wechseln.
##### Auswirkungen
- keine
##### Anmerkungen
- keine

### Inventarliste

#### Inventardatensatz anlegen
##### Kurzbeschreibung
- Ein neuer Inventardatensatz wird angelegt.
##### Aktor
- Bandmitglied
##### Vorbedingungen
- Inventarnummer noch nicht vergeben.
##### Beschreibung des Ablaufs
- Ein Bandmitglied prüft, ob das Item in der Inventarliste vorhanden ist und einen gewissen Preiswert übersteigt (z.B. 50€).
- Wenn dafür noch kein Datensatz existiert, so wird ein neuer Datensatz angelegt.
- In diesem werden Inventarnummer, Bezeichnung, Kategorie, Eigentümer, Preis, Anschaffungsdatum, Beschreibung, Gewicht, Maße und Bemerkungen abgelegt.
##### Auswirkungen
- Der Datensatz ist jetzt auffindbar und kann von weiteren Modulen genutzt werden.
##### Anmerkungen
- keine


<!-- 



Hier weiter machen


 -->


Nicht-Funktionale Anforderungen
-------------------------------