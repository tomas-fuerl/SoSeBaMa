# Umgebungsmodell DEV, TST und PRD

## Ziel

DEV, TST und PRD sind eigenständige Sicherheits- und Betriebsgrenzen. Sie
teilen weder Konfigurationen noch Daten, Secrets, Identitäten oder
Zugriffswege. Eine Änderung durchläuft die Umgebungen kontrolliert in dieser
Reihenfolge: DEV, TST, PRD.

| Eigenschaft | DEV | TST | PRD |
| --- | --- | --- | --- |
| Zweck | Entwicklung und lokale Diagnose | produktionsnahe Verifikation | produktiver Betrieb |
| Daten | künstliche Entwicklungsdaten | definierte Testdaten | ausschließlich produktive Daten |
| Secrets | eigenes DEV-Set auf der Synology | eigenes TST-Set auf der Synology | eigenes PRD-Set auf der Synology |
| Debug | über definierte Wege zulässig | nur kontrolliert und zeitlich begrenzt | verboten |
| ausgehender code-server-Zugriff | über definierte SSH-/Debugwege | kein Zugriff | kein Zugriff |
| Datenbankzugriff | nur App-Backend der Umgebung | nur App-Backend der Umgebung | nur App-Backend der Umgebung |
| öffentliche App-Veröffentlichung | nicht festgelegt | nicht festgelegt | eigener gehärteter App-Reverse-Proxy |

## Verbindliche Trennung

- Jede Umgebung hat eigene Konfiguration, Secrets, Datenbestände und
  Berechtigungen.
- Secrets werden ausschließlich auf der Synology gespeichert. Repository und
  Deployment-Artefakte enthalten keine Secret-Werte.
- Identitäten und Berechtigungen gelten nur für die jeweils benötigte
  Umgebung.
- Produktive Daten werden weder in DEV noch in TST verwendet.
- Ein Deployment zwischen Umgebungen überträgt nur geprüfte, nicht vertrauliche
  Artefakte und ausdrücklich vorgesehene Konfiguration, niemals Daten oder
  Secrets.

## Öffentliche Eingänge

Portainer und code-server dürfen jeweils über einen eigenen gehärteten Reverse
Proxy öffentlich erreichbar sein. SoSeBaMa PRD wird ausschließlich über einen
eigenen gehärteten App-Reverse-Proxy veröffentlicht. Diese drei eingehenden
Zugänge sind voneinander und von den Umgebungsnetzen getrennt.

Öffentliche Erreichbarkeit gewährt keine implizite Berechtigung für andere
Netze, Umgebungen oder Komponenten. Nutzer-Clients erreichen weder das
App-Backend beziehungsweise BFF noch die Datenbank direkt. Die konkrete Härtung
der drei Reverse-Proxy-Zugänge bleibt einer späteren Architektur- und
Betriebsentscheidung in einem separaten freigegebenen Arbeitspaket vorbehalten.

## Entwicklungszugriff und Diagnose

Der öffentliche eingehende Zugang zu code-server ist vom ausgehenden
Entwicklungszugriff auf DEV zu unterscheiden. code-server darf DEV
ausschließlich über vorab definierte und freigegebene SSH-/Debugwege erreichen.
Vor Einrichtung werden Quelle, Ziel, Identität, Zweck, erlaubte Richtung,
Protokoll und Verantwortliche dokumentiert. Ein impliziter Zugriff aufgrund der
öffentlichen Erreichbarkeit oder gemeinsamer Netze ist unzulässig.

TST-Diagnose ist nur kontrolliert, minimal berechtigt und zeitlich begrenzt
zulässig. PRD erhält keine Debugschnittstelle, keinen Debugport und keinen
Debug-Tunnel. Produktive Diagnose erfolgt ausschließlich über dafür
vorgesehene, geheimnisfreie Betriebsinformationen.

Nur das App-Backend darf die Datenbank derselben Umgebung erreichen. Keine
Datenbank veröffentlicht einen öffentlichen Endpunkt.

Die erlaubten Kommunikationsbeziehungen stehen in
[NETWORK-BOUNDARIES.md](NETWORK-BOUNDARIES.md).
