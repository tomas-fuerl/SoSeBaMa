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
| code-server | Zugriff über definierte SSH-/Debugwege | kein Standardzugriff | kein Zugriff |
| Datenbankzugriff | nur App-Backend der Umgebung | nur App-Backend der Umgebung | nur App-Backend der Umgebung |

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

## Zugriff und Diagnose

code-server darf DEV ausschließlich über vorab definierte und freigegebene
SSH-/Debugwege erreichen. Vor Einrichtung werden Quelle, Ziel, Identität,
Zweck, erlaubte Richtung, Protokoll und Verantwortliche dokumentiert. Ein
impliziter Zugriff aufgrund gemeinsamer Netze ist unzulässig.

TST-Diagnose ist nur kontrolliert, minimal berechtigt und zeitlich begrenzt
zulässig. PRD erhält keine Debugschnittstelle, keinen Debugport und keinen
Debug-Tunnel. Produktive Diagnose erfolgt ausschließlich über dafür
vorgesehene, geheimnisfreie Betriebsinformationen.

Die erlaubten Kommunikationsbeziehungen stehen in
[NETWORK-BOUNDARIES.md](NETWORK-BOUNDARIES.md).
