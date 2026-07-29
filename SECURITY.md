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
  Zugriffswege. Produktive Daten werden nicht nach DEV oder TST kopiert.
- Portainer darf über einen eigenen gehärteten externen Zugang erreichbar sein.
- code-server darf über einen eigenen gehärteten externen Zugang erreichbar
  sein.
- SoSeBaMa TST darf für Frontendtests über einen eigenen, von PRD getrennten,
  geschützten externen App-Zugang erreichbar sein.
- SoSeBaMa PRD darf ausschließlich über einen eigenen gehärteten App-Zugang
  erreichbar sein. Nutzer-Clients erreichen das App-Backend beziehungsweise
  BFF nicht direkt.
- Externe Erreichbarkeit vermittelt weder fachliche noch technische Rechte auf
  andere Netze, Umgebungen, Komponenten oder Objekte.
- Der PRD-App-Zugang darf ausschließlich die vorgesehenen
  Anwendungsendpunkte des App-Backends beziehungsweise BFF von PRD erreichen.
- TST darf zusätzlich geschützte technische Diagnosezugriffe auf detaillierte
  Logs, Traces, Statusendpunkte, Backend-APIs sowie definierte Test- und
  Prüfschnittstellen besitzen. Sie sind ausschließlich benannten technischen
  Identitäten mit eigener Authentifizierung, minimalen Rechten, Audit,
  Widerrufsmöglichkeit und secretfreier Ausgabe zugänglich.
- TST besitzt keinen pauschalen fachlichen Autorisierungs-Bypass. Seine
  technischen Diagnose-, Test- und Prüfwege müssen in PRD technisch fehlen
  oder dort nachweislich unerreichbar sein.
- PRD besitzt keine Debugports, Debugtunnel oder Debugschnittstellen.
- Nur das App-Backend darf die Datenbank derselben Umgebung erreichen. Die
  Datenbank veröffentlicht keinen externen Endpunkt; Nutzer-Clients,
  code-server und Verwaltungswerkzeuge dürfen nicht direkt auf sie zugreifen.
- Der ausgehende Entwicklungszugriff von code-server ist vom externen
  eingehenden code-server-Zugang getrennt. code-server erreicht ausschließlich
  DEV über explizit definierte, freigegebene und nachvollziehbare
  SSH-/Debugwege.
- Logs und Diagnoseausgaben dürfen keine Secrets, personenbezogenen Inhalte
  oder lokalen Infrastrukturwerte offenlegen.
- Berechtigungen folgen dem Minimalprinzip und werden je Umgebung vergeben.

Damit bestehen vier voneinander getrennte extern erreichbare Zugänge:
Portainer, code-server, SoSeBaMa TST und SoSeBaMa PRD. Konkrete Domains,
IP-Adressen, Hostnamen, Ports und Härtungsparameter bleiben außerhalb des
öffentlichen Repositorys. Ihre konkrete Härtung ist eine spätere Architektur-
und Betriebsentscheidung und benötigt ein separates freigegebenes
Arbeitspaket. Der Begriff `Systemband Öffentlich` bezeichnet dagegen
ausschließlich das fachliche Berechtigungsprinzip innerhalb von SoSeBaMa und
keinen Netzwerkzugang.

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
