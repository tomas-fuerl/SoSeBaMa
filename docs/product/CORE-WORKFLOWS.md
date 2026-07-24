# Kernabläufe

## Bezug und Leseregel

Dieses Dokument konkretisiert GitHub-Issue #3. Jeder Ablauf besitzt eine
stabile `WF-xxx`-Kennung. Rollenbezeichnungen folgen
[Benutzer und Rollen](USERS-AND-ROLES.md), Begriffe dem
[Glossar](GLOSSARY.md). Das verbindliche Referenz-, Eigentums- und
Versionsmodell steht im
[Inhalts-, Versions- und Referenzmodell](../architecture/CONTENT-VERSION-REFERENCE-MODEL.md).
Die Abläufe beschreiben beobachtbares Produktverhalten, keine technische
Umsetzung oder Oberflächengestaltung.

## WF-001: Benutzer einladen oder Zugriff erteilen

- **Ausgangszustand:** Ein Arbeitsbereich besteht; der vorgesehene Benutzer ist
  dort noch kein aktives Mitglied.
- **Beteiligte Rollen:** Arbeitsbereichsadministration und vorgesehener
  Benutzer.
- **Normaler Ablauf:** Die Administration startet eine Einladung, ordnet die
  minimal erforderliche Rolle zu, der Benutzer bestätigt seinen Zugang und die
  Mitgliedschaft wird aktiv.
- **Erwartetes Ergebnis:** Der Benutzer sieht ausschließlich die durch Rolle
  und Inhaltsfreigabe erlaubten Bereiche und Aktionen.
- **Fehler und Ausnahmen:** Ungültige, abgelaufene oder bereits verwendete
  Einladungen werden ohne Preisgabe bestehender Mitgliedschaften abgelehnt;
  doppelte Mitgliedschaften werden nicht unbemerkt erzeugt.
- **Security und Offline:** Vor bestätigter Mitgliedschaft entsteht keine
  Offlineberechtigung. Ein zusätzlicher Faktor bleibt gemäß `OQ-020` offen.

## WF-002: Band beziehungsweise Arbeitsbereich verwalten

- **Ausgangszustand:** Eine aktive Administration besitzt die erforderlichen
  Rechte im Arbeitsbereich.
- **Beteiligte Rollen:** Arbeitsbereichsadministration; betroffene Mitglieder
  nur im Rahmen ihrer eigenen Sicht.
- **Normaler Ablauf:** Die Administration prüft Mitglieder und Rollen, ändert
  eine zulässige Zuordnung und bestätigt die fachliche Wirkung.
- **Erwartetes Ergebnis:** Der zentrale Stand zeigt die neue Zuordnung; erlaubte
  und verbotene Aktionen entsprechen ihr nachvollziehbar.
- **Fehler und Ausnahmen:** Unzulässige Selbstentziehung der letzten benötigten
  Administration, Querzugriff und widersprüchliche Änderungen werden
  kontrolliert abgelehnt oder als Konflikt ausgewiesen.
- **Security und Offline:** Rechte gelten nur im betroffenen Arbeitsbereich.
  Auswirkungen auf Offlinegeräte folgen `WF-014` und `WF-015`.

## WF-003: Song mit Metadaten anlegen

- **Ausgangszustand:** Ein berechtigter Inhaltsverantwortlicher befindet sich
  im richtigen Arbeitsbereich.
- **Beteiligte Rollen:** Inhaltsverantwortliche; lesende Rollen nach späterer
  Freigabe.
- **Normaler Ablauf:** Der Benutzer erfasst Titel und erforderliche Metadaten,
  prüft den Inhalt und speichert den Song bewusst.
- **Erwartetes Ergebnis:** Der Song besitzt genau ein Original und einen
  eindeutigen Eigentümer. Fassungen, Revisionen, Freigaben, Overlays und
  Setlists können ihn referenzieren, ohne ein weiteres Original anzulegen.
- **Fehler und Ausnahmen:** Fehlende Pflichtangaben, unzulässige Werte oder ein
  zwischenzeitlich entzogener Zugriff führen zu einer verständlichen Ablehnung
  ohne stillen Teilstand.
- **Security und Offline:** Nur berechtigte Rollen dürfen gemeinsam sichtbare
  Songs anlegen. Offlineanlage ist von `OQ-006` abhängig.

## WF-004: PDF-Dokument hinzufügen und anzeigen

- **Ausgangszustand:** Ein Song besteht; der Benutzer besitzt Importrechte und
  ein bewusst ausgewähltes PDF.
- **Beteiligte Rollen:** Inhaltsverantwortliche für das Hinzufügen; berechtigte
  Mitglieder für die Anzeige.
- **Normaler Ablauf:** Der Benutzer wählt die Datei, bestätigt ihre Zuordnung,
  die Datei wird sicher geprüft und anschließend mit Seitennavigation und Zoom
  angezeigt.
- **Erwartetes Ergebnis:** Das zulässige Original ist dem Song eindeutig
  zugeordnet, unverändert erhalten und nur für berechtigte Benutzer sichtbar.
- **Fehler und Ausnahmen:** Unzulässiger Typ, beschädigter oder nicht sicher
  verarbeitbarer Inhalt, fehlende Rechte oder abgebrochene Übertragung erzeugen
  keinen als erfolgreich dargestellten Teilimport.
- **Security und Offline:** Der Import ist benutzergesteuert und folgt
  `SEC-006` und `SEC-007`. Offlinebereitstellung erfolgt getrennt über
  `WF-010`.

## WF-005: PDF per Touch oder Stift annotieren

- **Ausgangszustand:** Ein berechtigtes PDF ist geöffnet; die wirksame Rolle
  erlaubt die vorgesehene Annotationsart.
- **Beteiligte Rollen:** Musiker, reguläre Mitglieder und
  Inhaltsverantwortliche im jeweils erlaubten Umfang.
- **Normaler Ablauf:** Der Benutzer wählt ein persönliches oder erlaubtes
  Gruppen-Overlay, erstellt die Annotation per Touch oder Stift, prüft und
  speichert sie.
- **Erwartetes Ergebnis:** Die Annotation liegt im gewählten Overlay,
  referenziert das Dokument eindeutig und verändert das Original nicht.
- **Fehler und Ausnahmen:** Nicht unterstützte Eingabe, fehlende Rechte,
  Speicherfehler oder konkurrierende Änderung werden sichtbar; das Original
  bleibt erhalten.
- **Security und Offline:** Sichtbarkeit und Overlay-Berechtigung werden bei
  jedem Zugriff geprüft. Die Standardauswahl des Overlays ist in `OQ-003`,
  Offlinebearbeitung in `OQ-006` offen.

## WF-006: Text- oder Akkordblatt anlegen oder importieren

- **Ausgangszustand:** Ein Song besteht; der Benutzer besitzt die erforderlichen
  Inhaltsrechte und hat den einzubringenden Inhalt geprüft.
- **Beteiligte Rollen:** Inhaltsverantwortliche; reguläre Mitglieder nur nach
  Entscheidung aus `OQ-004`.
- **Normaler Ablauf:** Der Benutzer erstellt Inhalt manuell oder fügt ihn
  bewusst per Copy-and-paste ein, prüft Songfassung, Struktur und Zuordnung und
  speichert eine neue Revision.
- **Erwartetes Ergebnis:** Ein anbieterunabhängig verwaltbares Text- oder
  Akkordblatt ist als Revision genau einer Songfassung zugeordnet und gemäß
  Sichtbarkeit verfügbar.
- **Fehler und Ausnahmen:** Nicht erkennbare Akkordstruktur, ungültige Eingabe,
  fehlende Rechte oder Speicherkonflikt werden ohne Verlust des Ausgangsinhalts
  angezeigt.
- **Security und Offline:** Kein automatisiertes Scraping oder Umgehen von
  Schutzmaßnahmen. Herkunft und Nutzungsrecht bleiben beim einbringenden
  Benutzer; Offlinebearbeitung hängt von `OQ-006` ab.

## WF-007: Akkorde transponieren

- **Ausgangszustand:** Ein berechtigtes Akkordblatt enthält ausreichend
  strukturierte Akkorde.
- **Beteiligte Rollen:** Musiker sowie berechtigte Inhaltsverantwortliche.
- **Normaler Ablauf:** Der Benutzer wählt eine Zieltransposition, prüft die
  angepasste Darstellung und übernimmt sie nur im erlaubten Umfang.
- **Erwartetes Ergebnis:** Akkorde werden konsistent dargestellt; Ausgangsinhalt
  und gewählte Transposition bleiben unterscheidbar.
- **Fehler und Ausnahmen:** Nicht erkennbare oder mehrdeutige Akkorde werden
  markiert und nicht still falsch verändert; unzulässiges Speichern wird
  abgelehnt.
- **Security und Offline:** Die Aktion respektiert private und gemeinsame
  Änderungsrechte. Ob Transposition offline gespeichert werden darf, entscheidet
  `OQ-006`.

## WF-008: Autoscroll bei Probe oder Auftritt verwenden

- **Ausgangszustand:** Ein berechtigtes Text- oder Akkordblatt ist geöffnet und
  für die aktuelle Nutzung verfügbar.
- **Beteiligte Rollen:** Musiker und reguläre Mitglieder.
- **Normaler Ablauf:** Der Benutzer startet Autoscroll, kontrolliert den Verlauf
  und kann Geschwindigkeit, Pause, Fortsetzung und Ende bewusst steuern.
- **Erwartetes Ergebnis:** Der Inhalt bewegt sich vorhersehbar, bleibt lesbar
  und unter unmittelbarer Kontrolle des Benutzers.
- **Fehler und Ausnahmen:** Ressourcen- oder Darstellungsfehler stoppen sicher
  und lassen manuelle Navigation zu; ein Fehler verändert den Inhalt nicht.
- **Security und Offline:** Autoscroll benötigt keine zusätzlichen Rechte und
  funktioniert für vorbereitete Offlineinhalte; konkrete Reaktionsziele folgen
  aus `OQ-011`.

## WF-009: Setlist anlegen, referenzieren, kopieren und freigeben

- **Ausgangszustand:** Berechtigte Songs bestehen; der Benutzer besitzt
  Setlist-Rechte.
- **Beteiligte Rollen:** Setlist-Verantwortliche, Inhaltsverantwortliche und
  berechtigte lesende Mitglieder.
- **Normaler Ablauf:** Der Verantwortliche legt die Setlist im Eigentum eines
  Benutzers oder einer Gruppe an, ergänzt oder entfernt Songreferenzen, wählt je
  Referenz Rolling oder Pinned, ordnet sie und gibt den aktuellen Stand frei.
  Für einen unabhängigen Planungsstand kopiert er die Setlist bewusst.
- **Erwartetes Ergebnis:** Genau ein aktueller Stand, die vollständige
  Änderungshistorie, Eigentum, Referenzstrategie, Reihenfolge, Freigabe- und
  Synchronisationszustand sind eindeutig. Eine Kopie besitzt eine eigene
  Historie und kopiert keine Songinhalte.
- **Fehler und Ausnahmen:** Fehlende Songrechte, ungültige Referenzen, entfernte
  Inhalte, konkurrierende Änderung oder unvollständige Freigabe werden sichtbar
  und nicht als vollständiger Stand ausgegeben.
- **Security und Offline:** Freigabe erweitert keine Inhaltsrechte. Eine
  gruppeneigene Setlist darf nur entsprechend der wirksamen Gruppenrolle
  bearbeitet werden; Offlinevorbereitung folgt `WF-010`.

## WF-010: Inhalte für Offlineverwendung vorbereiten

- **Ausgangszustand:** Der Benutzer ist online, berechtigt und hat einzelne
  Inhalte oder eine Setlist bewusst ausgewählt.
- **Beteiligte Rollen:** Alle Rollen mit expliziter Offlineberechtigung.
- **Normaler Ablauf:** SoSeBaMa ermittelt erforderliche Inhalte, zeigt Umfang
  und Zustand, der Benutzer startet die Vorbereitung und prüft den Abschluss.
- **Erwartetes Ergebnis:** Vollständige, unvollständige und fehlgeschlagene
  Offlineinhalte sind unterscheidbar; nur erlaubte Inhalte liegen lokal vor.
- **Fehler und Ausnahmen:** Fehlender Speicher, Verbindungsabbruch,
  Rechteänderung oder fehlerhaftes Dokument hinterlässt keinen fälschlich als
  vollständig markierten Stand.
- **Security und Offline:** Lokale Inhalte folgen `SEC-008`; Sitzungsgültigkeit
  und Entfernung richten sich nach `OQ-007` und `OQ-008`.

## WF-011: Setlist und Dokumente ohne Netzwerk verwenden

- **Ausgangszustand:** Inhalte wurden erfolgreich vorbereitet; Netzwerk ist
  nicht verfügbar und die Offlineberechtigung ist noch wirksam.
- **Beteiligte Rollen:** Musiker und andere offline berechtigte Mitglieder.
- **Normaler Ablauf:** Der Benutzer öffnet die vorbereitete Setlist, navigiert
  durch Songs und Dokumente und nutzt erlaubte Anzeige- und Bedienfunktionen.
- **Erwartetes Ergebnis:** Vorbereitete Inhalte funktionieren im zugesagten
  Umfang; Offlinezustand und mögliche Einschränkungen sind sichtbar.
- **Fehler und Ausnahmen:** Nicht vorbereitete, abgelaufene oder entzogene
  Inhalte werden sicher und verständlich behandelt; es entsteht keine
  irreführende Onlinebestätigung.
- **Security und Offline:** Keine Verbindung erzeugt keine zusätzlichen Rechte.
  Zulässige lokale Änderungen und Sitzungsdauer entscheiden `OQ-006` und
  `OQ-007`.

## WF-012: Nach Wiederherstellung der Verbindung synchronisieren

- **Ausgangszustand:** Das Gerät ist wieder verbunden; zulässige lokale
  Änderungen oder veraltete lokale Inhalte können vorhanden sein.
- **Beteiligte Rollen:** Betroffener Benutzer; fachlich Verantwortliche bei
  Konflikten.
- **Normaler Ablauf:** SoSeBaMa prüft aktuelle Identität und Rechte, gleicht
  zulässige Zustände kontrolliert ab und zeigt Fortschritt sowie Ergebnis.
- **Erwartetes Ergebnis:** Erfolgreiche Änderungen sind zentral nachvollziehbar;
  lokale Inhalte entsprechen dem erlaubten Stand oder bleiben als offen
  gekennzeichnet.
- **Fehler und Ausnahmen:** Verbindungsabbruch, Rechteentzug, ungültige lokale
  Änderung und Konflikt bleiben sichtbar und erneut behandelbar; nichts wird
  still verworfen.
- **Security und Offline:** Autorisierung wird vor Übernahme erneut geprüft.
  Entzogene Rechte blockieren Übertragung und lösen `WF-015` aus.

## WF-013: Konflikt oder fehlgeschlagene Synchronisation behandeln

- **Ausgangszustand:** Eine Synchronisation meldet mindestens einen Fehler oder
  einen nicht automatisch lösbaren Konflikt.
- **Beteiligte Rollen:** Ändernder Benutzer und, soweit erforderlich, zuständige
  Inhalts- oder Setlist-Verantwortliche.
- **Normaler Ablauf:** SoSeBaMa zeigt betroffenen Inhalt, Fehlerklasse und sichere
  Optionen; eine berechtigte Person wiederholt, verwirft oder entscheidet den
  Konflikt bewusst.
- **Erwartetes Ergebnis:** Der Fall endet in einem eindeutigen zentralen Stand
  oder bleibt sichtbar offen; Ausgangsstände werden nicht unbemerkt zerstört.
- **Fehler und Ausnahmen:** Fehlende Entscheidungsrechte, erneuter
  Verbindungsfehler oder weiterer konkurrierender Stand verhindert die
  Bestätigung eines falschen Erfolgs.
- **Security und Offline:** Anzeigen und Optionen sind auf berechtigte Inhalte
  begrenzt; Fehlermeldungen enthalten keine internen Details gemäß `SEC-015`.

## WF-014: Zugriffsrechte ändern oder entziehen

- **Ausgangszustand:** Eine berechtigte Administration verwaltet ein aktives
  Mitglied oder eine Rolle.
- **Beteiligte Rollen:** Arbeitsbereichsadministration und betroffener Benutzer.
- **Normaler Ablauf:** Die Administration wählt die konkrete Änderung, prüft
  Auswirkungen und bestätigt; der zentrale Berechtigungsstand wird wirksam.
- **Erwartetes Ergebnis:** Neue geschützte Aktionen entsprechen sofort dem
  zentralen Stand; der Entzug ist nachvollziehbar.
- **Fehler und Ausnahmen:** Fehlende Administrationsrechte, widersprüchliche
  gleichzeitige Änderung oder unzulässige Rollenlage wird abgelehnt.
- **Security und Offline:** Weitere Synchronisation entzogener Inhalte wird
  verhindert. Offlinefolgen werden über `WF-015`, `OQ-007` und `OQ-008`
  behandelt.

## WF-015: Lokale Daten bei Abmeldung, Geräteverlust oder Rechteentzug behandeln

- **Ausgangszustand:** Ein Gerät enthält Offlineinhalte oder lokale Änderungen;
  Abmeldung, gemeldeter Geräteverlust oder Rechteentzug tritt ein.
- **Beteiligte Rollen:** Betroffener Benutzer, Arbeitsbereichsadministration und
  gegebenenfalls separat berechtigter technischer Betrieb.
- **Normaler Ablauf:** SoSeBaMa beendet weitere geschützte Nutzung, markiert oder
  sperrt lokale Inhalte und führt die beschlossene kontrollierte Entfernung
  beziehungsweise Klärung offener Änderungen aus.
- **Erwartetes Ergebnis:** Entzogene Inhalte sind nicht weiter nutzbar; lokale
  Daten und ausstehende Änderungen besitzen einen eindeutigen, prüfbaren
  Zustand.
- **Fehler und Ausnahmen:** Ein dauerhaft offline befindliches oder verlorenes
  Gerät kann die zentrale Bestätigung verzögern; es erhält nach Wiederverbindung
  keine entzogenen Rechte zurück.
- **Security und Offline:** Fristen und genaue Behandlung sind in `OQ-007` und
  `OQ-008` offen. Bis zur Entscheidung darf keine Umsetzung still einen
  dauerhaften Offlinezugriff annehmen.

## WF-016: Inhalt freigeben und Zusammenarbeit steuern

- **Ausgangszustand:** Ein Inhalt besitzt genau ein Original und einen
  eindeutigen Eigentümer.
- **Beteiligte Rollen:** Eigentümer des Inhalts, berechtigte
  Inhaltsverantwortliche und betroffene Gruppenmitglieder.
- **Normaler Ablauf:** Der Eigentümer verwaltet Sichtbarkeit und Berechtigungen
  getrennt, erteilt oder entzieht Freigaben für eine oder mehrere Gruppen und
  entscheidet je Inhalt, ob Gruppen neue Revisionen erstellen dürfen.
- **Erwartetes Ergebnis:** Alle Freigaben referenzieren dasselbe Original. Der
  Inhalt kann mehreren Gruppen freigegeben und öffentlich sichtbar sein, ohne
  dass sich Eigentum oder nicht ausdrücklich erteilte Rechte ändern.
- **Fehler und Ausnahmen:** Eine Gruppenaktion ohne Eigentümerfreigabe oder ohne
  wirksames Gruppenrecht wird abgelehnt. Der Entzug einer Freigabe verändert
  andere Freigaben, Referenzen und das Original nicht.
- **Security und Offline:** Jede Sicht- und Änderungsaktion wird gegen die
  aktuell wirksamen Berechtigungen geprüft. Offlinefolgen eines Entzugs folgen
  `WF-014` und `WF-015`.

## WF-017: Benutzer oder Gruppe löschen und Eigentum behandeln

- **Ausgangszustand:** Ein Benutzer oder eine Gruppe soll gelöscht werden;
  private, gruppeneigene oder freigegebene Inhalte können betroffen sein.
- **Beteiligte Rollen:** Zuständige Administration, betroffener Benutzer und
  gegebenenfalls der bestimmte Nachfolger.
- **Normaler Ablauf:** SoSeBaMa zeigt die Eigentumsfolgen vor Bestätigung. Bei
  Benutzerlöschung werden private Inhalte entfernt und Gruppeninhalte an die
  Gruppe übertragen. Bei Gruppenlöschung wird der verantwortliche
  Administrator oder ein ausdrücklich bestimmter Nachfolger Eigentümer.
- **Erwartetes Ergebnis:** Jeder verbleibende Inhalt besitzt genau einen
  eindeutigen Eigentümer; zu entfernende private Inhalte sind entfernt und jede
  Übertragung ist nachvollziehbar.
- **Fehler und Ausnahmen:** Eine Gruppenlöschung ohne bestimmten Nachfolger wird
  abgelehnt. Mehrdeutige Eigentumszuordnung oder unvollständige Übertragung darf
  nicht als erfolgreiche Löschung erscheinen.
- **Security und Offline:** Sichtbarkeit und Berechtigungen werden durch die
  Eigentumsübertragung nicht still erweitert. Lokale Daten folgen zusätzlich
  `OQ-007`, `OQ-008` und `WF-015`.

## Abdeckungsregel

Funktionale Anforderungen aus
[Funktionaler Scope](FUNCTIONAL-SCOPE.md),
[Qualitätsanforderungen](QUALITY-ATTRIBUTES.md) und
[Security-Anforderungen](SECURITY-REQUIREMENTS.md) gelten auch dann, wenn ein
Ablauf sie nicht einzeln wiederholt. Neue Kernabläufe erhalten die nächste
freie `WF-xxx`-Kennung; bestehende Kennungen werden nicht umgedeutet.
