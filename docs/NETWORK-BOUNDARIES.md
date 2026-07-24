# Netzwerkgrenzen

## Grundsatz

Jede Verbindung ist zunächst verboten und wird nur für einen dokumentierten
Zweck mit minimalen Rechten freigegeben. Freigaben gelten stets für genau eine
Umgebung. Gemeinsame Netzwerkreichweite ersetzt keine Zugriffserlaubnis.

## Öffentliche eingehende Erreichbarkeit

Drei voneinander getrennte Zugänge dürfen öffentlich erreichbar sein. Jeder
Zugang endet an einem eigenen gehärteten Reverse Proxy:

| Öffentlicher Zugang | Ziel hinter dem Reverse Proxy | Erlaubter Umfang |
| --- | --- | --- |
| eigener Portainer-Reverse-Proxy | Portainer | ausschließlich vorgesehene Verwaltungsendpunkte für berechtigte Identitäten |
| eigener code-server-Reverse-Proxy | code-server | ausschließlich vorgesehene code-server-Endpunkte für berechtigte Identitäten |
| eigener App-Reverse-Proxy für SoSeBaMa PRD | App-Backend beziehungsweise BFF von PRD | ausschließlich vorgesehene Anwendungsendpunkte |

Nutzer-Clients erreichen das App-Backend beziehungsweise BFF niemals direkt.
Sie verwenden ausschließlich den App-Reverse-Proxy. Dieser darf nur die
vorgesehenen Anwendungsendpunkte des App-Backends beziehungsweise BFF von PRD
erreichen.

Die öffentliche Erreichbarkeit eines Reverse Proxys erteilt weder dem Proxy
noch seinen Nutzern implizite Zugriffsrechte auf andere Netze, Umgebungen oder
Komponenten. Insbesondere entsteht dadurch kein Zugriff auf Datenbanken,
interne Verwaltungswege, TST oder weitere PRD-Komponenten.

Die konkrete Härtung der drei öffentlich erreichbaren Reverse-Proxy-Zugänge ist
eine spätere Architektur- und Betriebsentscheidung. Sie wird vor Inbetriebnahme
nach dem [ADR-Verfahren](ADR.md) und als separates freigegebenes Arbeitspaket
dokumentiert.

## Ausgehender Entwicklungszugriff von code-server

Der öffentliche eingehende Zugang zu code-server und der ausgehende
Entwicklungszugriff von code-server auf DEV sind zwei getrennte
Kommunikationsbeziehungen. Die Veröffentlichung von code-server berechtigt
nicht zum Zugriff auf DEV.

code-server darf ausschließlich über definierte, freigegebene und
nachvollziehbare SSH-/Debugwege auf DEV zugreifen. Diese Wege verwenden eine
eigene Identität, minimale Rechte und eine ausdrücklich dokumentierte Quelle,
Zielrolle und Richtung. Sie erlauben keine Weiterleitung nach TST, PRD oder zur
Datenbank.

## Interne Anwendungs- und Datengrenzen

| Quelle | Ziel | Erlaubter Zweck |
| --- | --- | --- |
| App-Reverse-Proxy von PRD | App-Backend beziehungsweise BFF von PRD | ausschließlich vorgesehene Anwendungsendpunkte |
| App-Backend einer Umgebung | Datenbank derselben Umgebung | fachlicher Datenzugriff mit eigener minimal berechtigter Identität |
| freigegebener Betriebszugang | freigegebene Komponente derselben Umgebung | notwendige Administration mit benannter Identität |

Nur das App-Backend darf die Datenbank derselben Umgebung erreichen. Die
Datenbank veröffentlicht keinen öffentlichen Endpunkt. Direkter Zugriff durch
Nutzer-Clients, Reverse Proxies, code-server oder Administrationswerkzeuge ist
unzulässig.

PRD besitzt keine Debugports, Debugtunnel oder Debugschnittstellen. Produktive
Diagnose darf diese Grenze nicht durch temporäre Weiterleitungen oder
vermeintliche Notfallzugänge umgehen.

## Standardmäßig verbotene Beziehungen

Alle nicht ausdrücklich aufgeführten Beziehungen sind verboten. Dazu gehören:

- umgebungsübergreifende Datenbank- oder Secret-Verbindungen,
- implizite Netzfreigaben aufgrund öffentlicher Erreichbarkeit,
- Weiterleitungen, die eine definierte Grenze umgehen,
- öffentliche Datenbank-, Debug- oder interne Verwaltungsendpunkte.

## Definition und Ablage eines Zugriffswegs

Vor Freigabe werden ohne reale Infrastrukturwerte dokumentiert:

1. Umgebung sowie fachlicher Zweck,
2. verantwortlicher Eigentümer,
3. erlaubte Quelle und Zielrolle,
4. Richtung und benötigtes Protokoll,
5. Identität und minimale Berechtigung,
6. Protokollierung und Überprüfung,
7. Ablauf oder Widerruf.

Konkrete Domains, IP-Adressen, Hostnamen, Ports, Zugangsdaten und
Härtungsparameter bleiben außerhalb des öffentlichen Repositorys. Betriebswerte
und Secrets verbleiben ausschließlich in der freigegebenen Konfiguration auf
der Synology.
