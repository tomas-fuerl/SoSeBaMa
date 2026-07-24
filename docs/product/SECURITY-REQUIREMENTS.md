# Produktbezogene Sicherheitsanforderungen

## Bezug und Geltungsbereich

Dieses Dokument konkretisiert GitHub-Issue #3 und ergänzt die repositoryweite
[Sicherheitsrichtlinie](../../SECURITY.md). Jede Anforderung besitzt eine
stabile `SEC-xxx`-Kennung. Die Anforderungen beschreiben Produktverhalten und
legen kein Authentifizierungs-, Autorisierungs-, Speicher- oder
Synchronisationsprodukt fest.

## Anforderungen

| ID | Verbindliche Anforderung | Erwarteter Nachweis |
| --- | --- | --- |
| SEC-001 | Vor Zugriff auf geschützte Inhalte oder Aktionen muss die Identität des Benutzers angemessen bestätigt sein. | Geschützte Positiv- und Negativfälle sind in DEV und TST nachweisbar; PRD legt keine internen Prüfinformationen offen. |
| SEC-002 | SoSeBaMa muss einen optionalen zusätzlichen Authentifizierungsfaktor ermöglichen, sobald Einsatzbereich und Wiederherstellung durch `OQ-020` entschieden sind. | Aktivierung, Verwendung, Verlustfall und Deaktivierung werden ohne Festlegung eines Produkts geprüft. |
| SEC-003 | Jede geschützte Aktion und jeder geschützte Datenzugriff muss serverseitig anhand der aktuell wirksamen Berechtigung autorisiert werden. Eine ausgeblendete Bedienaktion allein genügt nicht. | Für jede geschützte Funktion bestehen erlaubte und abgelehnte Prüffälle einschließlich direkter manipulierter Anfrage. |
| SEC-004 | Benutzer und technische Identitäten erhalten nur die für ihren dokumentierten Zweck minimal erforderlichen Rechte. | Rollenmatrix und Negativprüfungen weisen fehlende Quer- oder Verwaltungsrechte nach. |
| SEC-005 | Daten, Rollen, Offlineinhalte und Aktionen verschiedener Arbeitsbereiche müssen fachlich strikt getrennt bleiben. | Querzugriffe mit gültiger Identität, aber falschem Arbeitsbereich werden abgelehnt und sicher protokolliert. |
| SEC-006 | Dokumente, Text- und Akkordblätter sowie private und gemeinsame Annotationen dürfen nur gemäß ihrer Sichtbarkeit und Berechtigung gelesen oder verändert werden. | Lese-, Änderungs-, Freigabe- und Entzugsfälle werden je Inhaltsart geprüft; Originale bleiben nachweisbar erhalten. |
| SEC-007 | Dateiimporte müssen Typ, Zulässigkeit und sichere Verarbeitbarkeit prüfen, Grenzen kontrolliert durchsetzen und aktive oder unerwartete Inhalte ohne interne Detailpreisgabe ablehnen. | Zulässige, fehlerhafte, übergroße und manipulierte Dateien erzeugen eindeutige sichere Ergebnisse; konkrete Grenzwerte werden später freigegeben. |
| SEC-008 | Lokale Offline-Daten und ausstehende Änderungen müssen gegen unberechtigten Zugriff, unbeabsichtigte Weitergabe und Nutzung nach Ablauf der Berechtigung geschützt werden. | Offline-, Abmelde-, Geräteverlust- und Rechteentzugsfälle sind gemäß `OQ-007` und `OQ-008` nachweisbar. |
| SEC-009 | Eine Abmeldung oder Sitzungsbeendigung muss weitere geschützte Onlineaktionen verhindern und die kontrollierte Behandlung lokaler Inhalte auslösen. | Wiederverwendung einer beendeten Sitzung wird abgelehnt; lokaler Zustand bleibt verständlich und folgt der beschlossenen Richtlinie. |
| SEC-010 | Rechteentzug muss zentral wirksam werden, weitere Synchronisation verhindern und lokale Offlineberechtigungen kontrolliert beenden. | Online- und später wieder verbundene Offline-Geräte können entzogene Rechte nicht weiter ausüben; offene Änderungen werden nicht still übernommen. |
| SEC-011 | Für Geräteverlust muss ein kontrollierter Weg bestehen, die weitere Nutzung geschützter Sitzungen und Offlineinhalte zu begrenzen. | Der dokumentierte Verlustfall sperrt weitere zulässige Nutzung entsprechend der Entscheidungen aus `OQ-007` und `OQ-008`. |
| SEC-012 | Sicherheitsrelevante Ereignisse müssen manipulationserschwerend, datensparsam und für berechtigte Prüfungen nachvollziehbar protokolliert werden. | Rechteänderung, abgelehnter geschützter Zugriff, relevante Importablehnung und Sitzungsereignis sind ohne Secrets oder unnötige Inhaltsdaten prüfbar; Umfang und Frist entscheidet `OQ-019`. |
| SEC-013 | Secrets, Zugangsdaten und private Schlüssel dürfen weder an Clients ausgeliefert noch im Repository oder in Logs gespeichert werden. | Repository-, Build-, Client- und Logprüfung findet keine solchen Werte; neutrale Platzhalter bleiben eindeutig erkennbar. |
| SEC-014 | PRD darf keine Debugports, Debugtunnel oder Debugschnittstellen besitzen. Produktive Diagnose muss über vorgesehene, minimal berechtigte Betriebsinformationen erfolgen. | Netzwerk- und Betriebsprüfung weist ausschließlich freigegebene PRD-Zugänge nach; ein Debugweg ist nicht vorhanden. |
| SEC-015 | Fehlermeldungen müssen Benutzern eine sichere nächste Handlung nennen, ohne Secrets, interne Adressen, technische Stapel, Dateipfade oder unberechtigte Inhaltsdetails offenzulegen. | Repräsentative Fehlerfälle zeigen handlungsorientierte Meldungen; interne Detailmuster bleiben in Client und öffentlich sichtbaren Logs aus. |

## Datenschutz- und Inhaltsgrundsätze

- Private Inhalte bleiben ohne bewusste Freigabe privat; die
  Standardsichtbarkeit von Annotationen entscheidet `OQ-003`.
- Nur erforderliche personenbezogene und sicherheitsrelevante Daten werden für
  den dokumentierten Zweck verarbeitet und angezeigt.
- Export, Weitergabe und Import begründen keine zusätzlichen Nutzungsrechte an
  urheberrechtlich geschützten Inhalten.
- Sicherheitsprotokollierung ist kein Ersatz für fachliche Historisierung und
  darf nicht zur unnötigen Inhaltsablage werden.

## Umgebungs- und Netzwerkgrenzen

DEV, TST und PRD bleiben bei Daten, Konfiguration, Secrets und Zugriffswegen
getrennt. Nur das App-Backend darf die Datenbank derselben Umgebung erreichen;
Nutzer-Clients greifen nicht direkt auf Backend oder Datenbank zu. Öffentliche
Erreichbarkeit erteilt keine impliziten Rechte. Die vollständigen Grenzen
stehen im [Umgebungsmodell](../ENVIRONMENTS.md) und in den
[Netzwerkgrenzen](../NETWORK-BOUNDARIES.md).

## Freigaberegel

Eine Sicherheitsanforderung gilt erst als erfüllt, wenn ihre Erfolgs- und
Negativfälle in DEV und TST nachvollziehbar geprüft wurden. Eine Abweichung in
PRD benötigt vorab eine dokumentierte Eigentümerentscheidung; PRD-Debugzugänge
bleiben auch dann verboten.
