# Netzwerkgrenzen

## Grundsatz

Jede Verbindung ist zunächst verboten und wird nur für einen dokumentierten
Zweck mit minimalen Rechten freigegeben. Freigaben gelten für genau eine
Umgebung. Gemeinsame Netzwerkreichweite ersetzt keine Zugriffserlaubnis.

## Externe eingehende Erreichbarkeit

Vier voneinander getrennte Zugänge dürfen extern erreichbar sein. Jeder endet
an einem eigenen gehärteten Zugangspunkt; die konkrete Technik bleibt eine
spätere Architekturentscheidung.

| Externer Zugang | Erlaubtes Ziel und Umfang |
| --- | --- |
| Portainer-Zugang | ausschließlich vorgesehene Verwaltungsendpunkte für berechtigte technische Identitäten |
| code-server-Zugang | ausschließlich vorgesehene code-server-Endpunkte für berechtigte Identitäten |
| SoSeBaMa-TST-Zugang | vorgesehene TST-Anwendungsendpunkte sowie getrennt geschützte Diagnose-, Backend-API-, Test- und Prüfschnittstellen für benannte technische Identitäten |
| SoSeBaMa-PRD-Zugang | ausschließlich vorgesehene PRD-Anwendungsendpunkte |

Nutzer-Clients verwenden ausschließlich den jeweiligen freigegebenen
App-Zugang und erreichen weder Datenbank noch interne Verwaltungswege direkt.
Externe Erreichbarkeit erteilt weder Nutzern noch Zugangspunkt Rechte auf
andere Netze, Umgebungen oder Komponenten.

Die konkrete Härtung wird vor Inbetriebnahme nach dem
[ADR-Verfahren](ADR.md) in einem eigenen freigegebenen Arbeitspaket
dokumentiert.

## TST-Diagnosegrenze

TST darf zur Verifikation detaillierte Logs, Traces, Statusendpunkte,
Backend-API-Zugriff und definierte Test-/Prüfschnittstellen bereitstellen.
Jeder Zugriff erfordert:

1. eine benannte technische Identität,
2. eigene Authentifizierung und minimale Rechte,
3. reguläre fachliche Autorisierung ohne pauschalen Bypass,
4. secretfreie Ausgabe,
5. Audit und Widerrufsmöglichkeit,
6. technische Abwesenheit oder nachgewiesene Unerreichbarkeit desselben Wegs in
   PRD.

TST-Erreichbarkeit vermittelt keinen Zugriff auf DEV, PRD oder eine Datenbank.

## Ausgehender Entwicklungszugriff von code-server

Der externe Zugang zu code-server und sein ausgehender Entwicklungszugriff auf
DEV sind getrennte Kommunikationsbeziehungen. code-server darf ausschließlich
über definierte, freigegebene und nachvollziehbare SSH-/Debugwege auf DEV
zugreifen. Diese Wege verwenden eine eigene Identität, minimale Rechte und eine
ausdrücklich dokumentierte Quelle, Zielrolle und Richtung. Sie erlauben keine
Weiterleitung nach TST, PRD oder zur Datenbank.

## Interne Anwendungs- und Datengrenzen

| Quelle | Ziel | Erlaubter Zweck |
| --- | --- | --- |
| freigegebener App-Zugang einer Umgebung | App-Backend beziehungsweise BFF derselben Umgebung | ausschließlich vorgesehene Anwendungsendpunkte |
| geschützter TST-Prüfzugang | freigegebene TST-Diagnose-, Backend-API-, Test- oder Prüfschnittstelle | produktionsnahe Verifikation mit benannter technischer Identität |
| App-Backend einer Umgebung | Datenbank derselben Umgebung | fachlicher Datenzugriff mit eigener minimal berechtigter Identität |
| freigegebener Betriebszugang | freigegebene Komponente derselben Umgebung | notwendige Administration mit benannter Identität |

Nur das App-Backend darf die Datenbank derselben Umgebung erreichen. Die
Datenbank veröffentlicht keinen externen Endpunkt. Direkter Zugriff durch
Nutzer-Clients, Zugangspunkte, code-server oder Administrationswerkzeuge ist
unzulässig.

PRD besitzt keine Debugports, Debugtunnel oder Debugschnittstellen. Produktive
Diagnose darf diese Grenze nicht durch temporäre Weiterleitungen oder
vermeintliche Notfallzugänge umgehen.

## Standardmäßig verbotene Beziehungen

Alle nicht ausdrücklich aufgeführten Beziehungen sind verboten. Dazu gehören:

- umgebungsübergreifende Datenbank-, Secret- oder Diagnoserechte,
- implizite Freigaben aufgrund externer Erreichbarkeit,
- ein pauschaler Autorisierungs-Bypass in TST,
- Weiterleitungen, die eine definierte Grenze umgehen,
- externe Datenbank-, PRD-Debug- oder interne Verwaltungsendpunkte.

## Definition und Ablage eines Zugriffswegs

Vor Freigabe werden ohne reale Infrastrukturwerte dokumentiert:

1. Umgebung und Zweck,
2. verantwortlicher Eigentümer,
3. erlaubte Quelle und Zielrolle,
4. Richtung und benötigtes Protokoll,
5. Identität und minimale Berechtigung,
6. Protokollierung und Überprüfung,
7. Ablauf oder Widerruf.

Domains, IP-Adressen, Hostnamen, Ports, Zugangsdaten und Härtungsparameter
bleiben außerhalb des öffentlichen Repositorys. Betriebswerte und Secrets
verbleiben ausschließlich in der freigegebenen Synology-Konfiguration.
