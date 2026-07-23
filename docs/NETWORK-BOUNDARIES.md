# Netzwerkgrenzen

## Grundsatz

Jede Verbindung ist zunächst verboten und wird nur für einen dokumentierten
Zweck mit minimalen Rechten freigegeben. Freigaben gelten stets für genau eine
Umgebung. Gemeinsame Netzwerkreichweite ersetzt keine Zugriffserlaubnis.

## Erlaubte Kommunikationsbeziehungen

| Quelle | Ziel | Zweck | Bedingung |
| --- | --- | --- | --- |
| Nutzer-Client | App-Einstieg der jeweiligen Umgebung | Anwendungsnutzung | nur veröffentlichte Anwendungsschnittstelle |
| App-Backend | Datenbank derselben Umgebung | fachlicher Datenzugriff | eigene minimal berechtigte Identität |
| code-server | DEV | Entwicklung und Diagnose | ausschließlich definierter SSH-/Debugweg |
| Betriebszugang | freigegebene Komponente derselben Umgebung | notwendige Administration | benannte Identität, minimal berechtigt, nachvollziehbar |

Alle nicht aufgeführten Beziehungen sind verboten. Insbesondere unzulässig
sind:

- direkter Datenbankzugriff durch Clients, code-server oder
  Administrationswerkzeuge,
- umgebungsübergreifende Datenbank- oder Secret-Verbindungen,
- Debugzugänge, Debugports oder Debugtunnel zu PRD,
- Weiterleitungen, die eine definierte Grenze umgehen,
- öffentliche Erreichbarkeit interner Verwaltungs- oder
  Datenbankschnittstellen.

## Definition eines Zugriffswegs

Vor Freigabe werden ohne reale Infrastrukturwerte dokumentiert:

1. Umgebung sowie fachlicher Zweck,
2. verantwortlicher Eigentümer,
3. erlaubte Quelle und Zielrolle,
4. Richtung und benötigtes Protokoll,
5. Identität und minimale Berechtigung,
6. Protokollierung und Überprüfung,
7. Ablauf oder Widerruf.

Reale Domains, IP-Adressen, Hostnamen, Ports und Zugangsdaten gehören nicht in
das öffentliche Repository. Betriebswerte und Secrets verbleiben
ausschließlich in der freigegebenen Konfiguration auf der Synology.

Für code-server wird nur ein DEV-Weg definiert. Er nutzt eine eigene Identität,
ist auf den benötigten SSH-/Debugzweck begrenzt und ermöglicht keine
Weiterleitung nach TST, PRD oder zur Datenbank.
