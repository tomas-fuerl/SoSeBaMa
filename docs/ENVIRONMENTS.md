# Umgebungsmodell DEV, TST und PRD

## Ziel

DEV, TST und PRD sind eigenständige Sicherheits- und Betriebsgrenzen. Sie
teilen weder Konfigurationen noch Daten, Secrets, Identitäten oder Zugriffswege.
Eine Änderung durchläuft die Umgebungen kontrolliert in der Reihenfolge DEV,
TST, PRD.

| Eigenschaft | DEV | TST | PRD |
| --- | --- | --- | --- |
| Zweck | Entwicklung und lokale Diagnose | produktionsnahe Verifikation und Frontendtests | produktiver Betrieb |
| Daten | künstliche Entwicklungsdaten | definierte Testdaten | ausschließlich produktive Daten |
| Secrets | eigenes DEV-Set auf der Synology | eigenes TST-Set auf der Synology | eigenes PRD-Set auf der Synology |
| Debug und Diagnose | über definierte Wege zulässig | geschützte technische Diagnose für benannte Identitäten zulässig | Debug verboten |
| externer App-Zugang | nicht festgelegt | getrennt und geschützt zulässig | eigener gehärteter App-Zugang |
| ausgehender code-server-Zugriff | nur über definierte SSH-/Debugwege | kein Zugriff | kein Zugriff |
| Datenbankzugriff | nur App-Backend der Umgebung | nur App-Backend der Umgebung | nur App-Backend der Umgebung |
| Anwendungsbundle | identische containerisierte Images | aus DEV promovierte identische Images | aus TST promovierte identische Images |
| Diagnose | definierte Entwicklerwege | geschützter Pfad für benannte technische Identitäten | technisch keine Diagnose- oder Debugwege |

## Verbindliche Trennung

- Jede Umgebung hat eigene Konfiguration, Secrets, Datenbestände, Dateien,
  Identitäten, Berechtigungen, Netze und Volumes.
- Secrets werden ausschließlich auf der Synology gespeichert. Repository und
  Artefakte enthalten keine Secret-Werte.
- Produktive Daten werden weder in DEV noch in TST verwendet.
- Ein Übergang zwischen Umgebungen überträgt nur geprüfte, nicht vertrauliche
  Artefakte und ausdrücklich vorgesehene Konfiguration, niemals Daten oder
  Secrets.
- Nur das App-Backend darf die Datenbank derselben Umgebung erreichen.
- Dasselbe unveränderliche Imagebundle wird ausschließlich in der Reihenfolge
  DEV → TST → PRD promoviert. Daten, Secrets und private Konfigurationswerte
  werden nicht mitpromoviert.
- Reale Domains, IP-Adressen, Hostnamen, Ports, Pfade und andere private
  Infrastrukturwerte bleiben außerhalb des Repositorys.

## Externe Eingänge

Portainer und code-server dürfen jeweils über einen eigenen gehärteten Zugang
extern erreichbar sein. SoSeBaMa PRD wird ausschließlich über einen eigenen
gehärteten App-Zugang bereitgestellt.

TST darf für Frontendtests über einen eigenen, von Portainer, code-server und
PRD getrennten geschützten App-Zugang extern erreichbar sein. Externe
Erreichbarkeit vermittelt keine fachliche oder technische Berechtigung und
keinen Zugriff auf andere Umgebungen oder Datenbanken.

Der angenommene interne Anwendungspfad und die Containergrenzen stehen in
[ADR-0012](architecture/decisions/ADR-0012-container-netz-secrets-und-deployment.md).
Private Härtungs- und Konfigurationswerte bleiben in der freigegebenen
Betriebsumgebung und außerhalb des Repositorys.

## Entwicklungszugriff und Diagnose

Der externe Eingang zu code-server ist vom ausgehenden Entwicklungszugriff auf
DEV zu unterscheiden. code-server darf DEV ausschließlich über vorab
definierte und freigegebene SSH-/Debugwege erreichen. Vor Einrichtung werden
Quelle, Ziel, Identität, Zweck, Richtung, Protokoll und Verantwortliche ohne
reale Infrastrukturwerte dokumentiert.

TST darf geschützte detaillierte Logs, Traces, Statusendpunkte,
Backend-API-Zugriff und definierte Test-/Prüfschnittstellen besitzen. Dabei
müssen:

- nur benannte technische Identitäten zugreifen,
- eine eigene Authentifizierung und minimale Rechte gelten,
- ein pauschaler Autorisierungs-Bypass ausgeschlossen sein,
- Secrets verborgen bleiben,
- Zugriffe auditiert und widerrufbar sein,
- dieselben Wege in PRD technisch fehlen oder nachweislich unerreichbar sein.

Der technische TST-Diagnosepfad ist `/technical-diagnostics/`. Er ist kein
öffentlicher Anwendungsweg. Die entsprechende Route, interaktive
API-Dokumentation, Debugports und Debugprofile fehlen in PRD technisch.

PRD besitzt keine Debugschnittstelle, keinen Debugport und keinen Debug-Tunnel.
Produktive Diagnose erfolgt ausschließlich über vorgesehene datensparsame
Betriebsinformationen.

Die erlaubten Kommunikationsbeziehungen stehen in
[NETWORK-BOUNDARIES.md](NETWORK-BOUNDARIES.md).
