# Produktvision

## Zweck

SoSeBaMa, der **Song-Setlist-Band-Manager**, ist als langfristig wartbare
Progressive Web App für Musiker, Bands und Ensembles vorgesehen. Diese Vision
legt keine Programmiersprache, kein Framework, keine Datenbank und kein
technisches Synchronisationsverfahren fest.

Verbindliche Begriffe stehen im [Glossar](GLOSSARY.md), Anforderungen im
[funktionalen Scope](FUNCTIONAL-SCOPE.md) und Entscheidungen in den
[Produktfragen](OPEN-QUESTIONS.md).

## Problem und Nutzen

Musiker verwalten Songdaten, PDFs, Text-/Chord-Inhalte, Annotationen und
Setlists häufig in getrennten Ablagen. Für Probe und Auftritt müssen berechtigte
Inhalte schnell auffindbar, auf Tablets gut bedienbar und kontrolliert offline
verfügbar sein. Bands benötigen klare Eigentums-, Berechtigungs- und
Verwaltungsgrenzen, ohne gemeinsame Inhalte unnötig zu duplizieren.

SoSeBaMa stellt dafür plattformweite normalisierte Songs, konkrete Inhalte,
normale berechtigte Overlays und Setlists bereit. Globale Aktionsrechte,
Objektberechtigungen, Gruppen, Eigentum und Bandbereiche bleiben nachvollziehbar
getrennt.

## Zielgruppen

- Musiker in einer oder mehreren Bands,
- Eigentümer und Bearbeiter von Inhalten, Overlays und Setlists,
- berechtigte Bandmitglieder für Mitgliedschafts- und Gruppenverwaltung,
- Plattformadministratoren für geschützte globale Aufgaben,
- technische Betriebsverantwortliche mit getrennten technischen Rechten.

## Produktprinzipien

1. **Song und Inhalt sind getrennt.** Ein Song ist das plattformweite
   normalisierte Metadatenobjekt. Jeder Inhalt gehört genau einem Song.
2. **Es gilt ein aktueller Basisinhalt.** Inhalte besitzen keine auswählbaren
   Versionen oder Revisionen. Die zuerst importierte Datei wird nicht als
   zusätzlicher unveränderlicher Stand geführt.
3. **Songmetadaten gelten global.** Nur Plattformadministratoren ändern oder
   prüfen bestehende Songs; andere Benutzer stellen Änderungsanträge.
4. **Overlays sind normale Objekte.** Es gibt keine festen Reichweitentypen.
   Eigene Overlays können übernommen oder mit dem Inhalt dynamisch gekoppelt
   werden, ohne den Basisinhalt zu verändern.
5. **Autorisierung hat zwei Ebenen.** Normale Benutzer benötigen globales
   Aktionsrecht und Objektberechtigung. Gruppenrechte wirken additiv;
   Plattformadministratoren sind fachliche Superuser.
6. **Bands sind Prinzipale.** Jede Band besitzt genau einen Bandbereich und
   darf Eigentümer sein. Ausdrückliche Freigaben über Bandgrenzen sind erlaubt,
   implizite Querzugriffe nicht.
7. **Breite Lesbarkeit bleibt authentifiziert.** Die geschützte Systemband
   `Öffentlich` vermittelt nach administrativ geprüftem Antrag Lesen für alle
   aktiven Benutzer, aber keinen anonymen Zugriff.
8. **Eigentum bleibt eindeutig.** Regulärer Eigentümer ist ein aktiver Benutzer
   oder eine bestehende Band. Die Plattform ist kein Eigentümer. Eigentümerlose
   Objekte und Löschvormerkungen sind getrennte Zustände.
9. **Gemeinsame Bearbeitung ist sitzungsgebunden.** Jedes gemeinsam
   bearbeitbare Objekt außer Songs benötigt einen Check-out. Administration
   darf ihn zurücknehmen, aber nicht umgehen.
10. **Offlinekonflikte werden nicht versteckt.** Private Offlinebearbeitung ist
    im MVP enthalten. Gemeinsame Offlinebearbeitung folgt nach dem MVP über
    Offline-Check-outs. Automatisches Merge und stilles Überschreiben sind
    ausgeschlossen.
11. **Setlists zeigen den aktuellen berechtigten Stand.** Es gibt keine
    Snapshots. Fehlende Inhalte werden datensparsam markiert und können
    angefragt werden.
12. **Security, Barrierearmut und Performance sind Produkteigenschaften.** MFA
    schützt Plattformadministration; Kernabläufe orientieren sich an WCAG 2.2
    AA und der initiale Performancekorridor ist messbar.

## MVP und Weiterentwicklung

Der früh nutzbare MVP ist PDF-zentriert. Er umfasst Benutzer, Bands, Gruppen,
Plattformadministration, `Öffentlich`, Berechtigungen, Eigentum und Löschung,
Songverwaltung, PDF-Inhalte mit Metadaten, PDF-Navigation und -Overlays,
Setlists, Berechtigungsanfragen, Audit, Suche, Offlineanzeige und private
Offlinebearbeitung.

Vollständig nach dem MVP folgen:

- Texteditor und Copy-and-paste,
- Chorderkennung und -korrektur,
- Transposition und Vereinfachung,
- Autoscroll und Offlineverwendung der Text-/Chord-Funktionen,
- gemeinsame Offlinebearbeitung über Offline-Check-outs.

Später vorgemerkt sind die optimistische Konkurrenzprüfung für Songs, eine
Check-out-Freigabebenachrichtigung, Export und ein optionales Bewertungssystem.
MFA-, Verschlüsselungs- und Synchronisationsverfahren sowie konkrete
Referenzmessbedingungen und Ressourcenbudgets bleiben technischen
beziehungsweise betrieblichen Entscheidungen vorbehalten.

Handschrift- und Musikerkennung sind bis auf Weiteres außerhalb des Scopes und
dürfen frühestens nach Gesamtprodukt-Release als neue Feature Requests bewertet
werden.

## Produktgrenzen

SoSeBaMa ist kein anonymes öffentliches Musikportal, kein soziales Netzwerk,
kein Handelsplatz, keine Digital Audio Workstation und kein vollständiger
Ersatz professioneller Notensatzsoftware. Automatisiertes Scraping, Umgehung
von Schutzmaßnahmen und unkontrollierte Weitergabe geschützter Inhalte sind
ausgeschlossen.

Technologie folgt den Anforderungen. Architektur- und Betriebsentscheidungen
werden erst nach ergebnisoffener Bewertung im dafür freigegebenen Arbeitspaket
getroffen.

## Erfolgskriterien

Das Produkt ist erfolgreich, wenn:

- Songs, Inhalte, Basisinhalte und Overlays konsistent getrennt bleiben,
- Berechtigungen und Bandgrenzen positive Zusammenarbeit ohne implizite
  Querzugriffe erlauben,
- Eigentum, Eigentümerlosigkeit und Löschung nachvollziehbar funktionieren,
- Setlists trotz einzelner fehlender Rechte sicher nutzbar bleiben,
- Check-outs gemeinsame Bearbeitung ohne stillen Datenverlust koordinieren,
- Offlinezustände und Konflikte verständlich behandelbar sind,
- der PDF-zentrierte MVP auf unterstützten Primärgeräten barrierearm und im
  dokumentierten Performancekorridor nutzbar ist.
