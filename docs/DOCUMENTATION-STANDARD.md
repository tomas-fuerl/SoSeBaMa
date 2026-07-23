# Foolproof-Dokumentationsstandard

## Ziel

Eine Anleitung ist foolproof, wenn eine berechtigte Person ohne implizites
Projektwissen den vorgesehenen Ablauf sicher ausführen, das Ergebnis eindeutig
prüfen und bei Problemen kontrolliert stoppen kann.

## Pflichtbestandteile einer Anleitung

1. **Ziel:** genau ein beobachtbares Ergebnis.
2. **Geltungsbereich:** betroffene Umgebung und ausdrücklich nicht betroffene
   Bereiche.
3. **Voraussetzungen:** Rollen, Werkzeuge, Ausgangszustand und Freigaben.
4. **Sicherheitswarnungen:** Risiken vor dem jeweiligen Schritt, nicht erst am
   Ende.
5. **Nummerierte Schritte:** eine Aktion pro Schritt mit eindeutigen
   Platzhaltern.
6. **Erwartetes Ergebnis:** sichtbarer Sollzustand nach kritischen Schritten.
7. **Verifikation:** konkrete, nicht destruktive Prüfung des Endzustands.
8. **Fehlerbehandlung:** häufige Fehlerbilder, sichere Abbruchbedingung und
   zuständige Rolle.
9. **Rollback:** Rückkehr zum vorherigen Zustand oder begründete Aussage, warum
   kein Rollback möglich ist.
10. **Pflege:** Eigentümer, letzter Prüfstand und Auslöser für Aktualisierung.

## Schreibregeln

- Kurze, eindeutige Sätze und konsistente Begriffe verwenden.
- DEV, TST und PRD immer ausdrücklich benennen.
- Keine Annahmen wie „wie üblich“, „einfach“ oder „entsprechend“ verwenden.
- Befehle kopierbar darstellen, aber gefährliche Platzhalter nicht mit
  scheinbar realen Werten füllen.
- Platzhalter sichtbar kennzeichnen und direkt erklären.
- Keine Secrets, realen Domains, IP-Adressen, Hostnamen, Ports oder lokalen
  Infrastrukturpfade dokumentieren.
- Für Entscheidungen auf das zugehörige Issue oder ADR verweisen.
- Screenshots nur ergänzend nutzen; alle notwendigen Informationen müssen
  textuell verfügbar sein.

## Review-Check

Eine unbeteiligte berechtigte Person prüft:

- Sind Ausgangs- und Zielzustand eindeutig?
- Kann kein Schritt versehentlich auf die falsche Umgebung angewendet werden?
- Sind Berechtigungen und Auswirkungen vorab sichtbar?
- Lassen sich Erfolg, Abbruch und Rollback zweifelsfrei erkennen?
- Bleiben Secrets und Infrastrukturdetails außerhalb des Repositorys?

Unklare Antworten blockieren die Freigabe oder benötigen eine dokumentierte
Eigentümerentscheidung nach [GOVERNANCE.md](GOVERNANCE.md).
