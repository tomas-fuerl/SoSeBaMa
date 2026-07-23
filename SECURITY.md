# Sicherheitsrichtlinie

## Sicherheitsproblem vertraulich melden

Sicherheitslücken, vermutete Secrets oder verwertbare
Infrastrukturinformationen dürfen nicht in einem öffentlichen Issue oder Pull
Request veröffentlicht werden. Stattdessen ist die private
Sicherheitsmeldung des Repositorys zu verwenden und der Projekteigentümer zu
informieren.

Die Meldung soll knapp enthalten:

1. betroffene Komponente oder Dokumentation,
2. nachvollziehbare Beschreibung ohne echte Zugangsdaten,
3. mögliche Auswirkungen,
4. sichere Reproduktionsschritte mit Platzhaltern,
5. bereits bekannte Gegenmaßnahmen.

## Verbindliche Sicherheitsbasis

- Das Repository und alle GitHub-Inhalte sind öffentlich zu behandeln.
- Secrets existieren ausschließlich auf der Synology. Sie werden weder
  versioniert noch in Beispieldateien mit realistischen Werten abgebildet.
- DEV, TST und PRD verwenden getrennte Konfigurationen, Daten, Secrets und
  Zugriffswege.
- Produktive Daten werden nicht nach DEV oder TST kopiert.
- PRD besitzt keine Debugschnittstelle und keinen Debugzugang.
- Die Datenbank akzeptiert Anwendungszugriffe ausschließlich vom App-Backend.
- code-server erreicht ausschließlich DEV über explizit definierte,
  freigegebene und nachvollziehbare SSH-/Debugwege.
- Logs und Diagnoseausgaben dürfen keine Secrets, personenbezogenen Inhalte
  oder lokalen Infrastrukturwerte offenlegen.
- Berechtigungen folgen dem Minimalprinzip und werden je Umgebung vergeben.

Weitere verbindliche Details stehen in
[ENVIRONMENTS.md](docs/ENVIRONMENTS.md) und
[NETWORK-BOUNDARIES.md](docs/NETWORK-BOUNDARIES.md).

## Reaktion auf versehentliche Offenlegung

1. Wert auf der Synology unverzüglich sperren oder rotieren.
2. Projekteigentümer vertraulich informieren.
3. Reichweite und betroffene Umgebungen feststellen.
4. Öffentliche Inhalte ohne erneute Verbreitung des Werts bereinigen.
5. Ursache, Auswirkungen und Prävention vertraulich dokumentieren.

Das Entfernen aus dem aktuellen Stand ersetzt keine Rotation. Ausnahmen von
dieser Richtlinie sind nur als dokumentierte Eigentümerentscheidung nach
[GOVERNANCE.md](docs/GOVERNANCE.md) zulässig.
