# Produktbezogene Sicherheitsanforderungen

## Bezug und Geltungsbereich

Dieses Dokument konkretisiert GitHub-Issue #3 und ergänzt die repositoryweite
[Sicherheitsrichtlinie](../../SECURITY.md). Jede Anforderung besitzt eine
stabile `SEC-xxx`-Kennung.

Die Anforderungen beschreiben Produktverhalten und legen kein
Authentifizierungs-, Autorisierungs-, Speicher- oder Synchronisationsprodukt
fest.

## Anforderungen

| ID | Verbindliche Anforderung | Erwarteter Nachweis |
| --- | --- | --- |
| SEC-001 | Vor Zugriff auf geschützte Inhalte, Overlays, Setlists oder Aktionen muss die Identität des Benutzers angemessen bestätigt sein. | Geschützte Positiv- und Negativfälle sind in DEV und TST nachweisbar; PRD legt keine internen Prüfinformationen offen. |
| SEC-002 | SoSeBaMa muss einen optionalen zusätzlichen Authentifizierungsfaktor ermöglichen, sobald Einsatzbereich und Wiederherstellung durch `OQ-020` entschieden sind. | Aktivierung, Verwendung, Verlustfall und Deaktivierung werden ohne Festlegung eines Produkts geprüft. |
| SEC-003 | Jede geschützte Aktion und jeder geschützte Datenzugriff muss serverseitig anhand der aktuell wirksamen globalen oder bandbezogenen Rollen, Direktrechte, Objektfreigaben und Schutzgrenzen autorisiert werden. Eine ausgeblendete Bedienaktion allein genügt nicht. | Für jede geschützte Funktion bestehen erlaubte und abgelehnte Prüffälle einschließlich direkter manipulierter Anfrage. |
| SEC-004 | Benutzer und technische Identitäten erhalten nur die für ihren dokumentierten Zweck minimal erforderlichen Rechte. Globale Rollen müssen ausdrücklich global sein; Bandrollen und bandbezogene Direktrechte gelten ausschließlich im zugehörigen Bandbereich. | Rollen-, Direktrechte- und Negativprüfungen weisen fehlende Quer-, globale oder technische Verwaltungsrechte nach. |
| SEC-005 | Mitgliedschaften, Rollen, Direktrechte, Band-Overlays, bandbezogene Inhalte, Setlists, Offlineinhalte, Check-outs und Aktionen verschiedener Bandbereiche müssen strikt getrennt bleiben. Private Inhalte und private Overlays benötigen keine Bandzuordnung und dürfen nicht allein wegen fehlender Bandmitgliedschaft offengelegt oder abgelehnt werden. | Querzugriffe mit gültiger Identität, aber falschem Bandbereich werden abgelehnt und sicher protokolliert. Private Objekte bleiben ausschließlich für ihren berechtigten Benutzer verfügbar. |
| SEC-006 | Eigentum, Ersteller, Songzuordnung, Sichtbarkeit, Rollen, Direktrechte, Objektfreigaben, Overlay-Reichweite und Bearbeitungsberechtigung eines Inhalts oder Overlays müssen getrennt autorisiert werden. Eine bestehende Bandpublikation darf nur mit der dafür erforderlichen nachvollziehbaren Zustimmung geändert werden. Gemeinsam bearbeitbare Inhalte sowie Band- und globale Overlays dürfen nur durch den Inhaber eines wirksamen Check-outs gespeichert werden. Ein Check-out ersetzt weder ein Bearbeitungsrecht noch bleibt er nach Rechteentzug wirksam. | Lese-, Bearbeitungs-, Sichtbarkeits-, Mehrfachfreigabe-, Overlay-, Archivierungs-, Lösch-, Eigentums-, Zuweisungs-, Check-out- und Entzugsfälle werden positiv und negativ geprüft. Publikationsänderungen ohne erforderliche Zustimmung, parallele Bearbeitung, Speichern nach Rechteentzug und Speichern nach administrativer Check-out-Rücknahme werden abgelehnt. |
| SEC-007 | Dateiimporte müssen Typ, Zulässigkeit und sichere Verarbeitbarkeit prüfen, Grenzen kontrolliert durchsetzen und aktive oder unerwartete Inhalte ohne interne Detailpreisgabe ablehnen. | Zulässige, fehlerhafte, übergroße und manipulierte Dateien erzeugen eindeutige sichere Ergebnisse; konkrete Grenzwerte werden später freigegeben. |
| SEC-008 | Lokale Offline-Daten und ausstehende zulässige private Änderungen müssen gegen unberechtigten Zugriff, unbeabsichtigte Weitergabe und Nutzung nach Ablauf der Berechtigung geschützt werden. Gemeinsam verwaltete Inhalte sowie Band- und globale Overlays dürfen offline nicht kollaborativ bearbeitet werden; ein lokaler Zustand darf keinen Check-out vortäuschen. | Offline-, Abmelde-, Geräteverlust-, Wiederverbindungs- und Rechteentzugsfälle sind gemäß `OQ-006`, `OQ-007` und `OQ-008` nachweisbar. Offline erzeugte Daten werden nicht unberechtigt in gemeinsam verwaltete Objekte übernommen. |
| SEC-009 | Eine Abmeldung oder Sitzungsbeendigung muss weitere geschützte Onlineaktionen verhindern und die kontrollierte Behandlung lokaler Inhalte, Overlays und bestehender Check-outs auslösen. | Wiederverwendung einer beendeten Sitzung wird abgelehnt; lokaler Zustand und Check-out-Folge bleiben verständlich und folgen der beschlossenen Richtlinie. |
| SEC-010 | Rechteentzug muss zentral wirksam werden, weitere geschützte Speicherung und Synchronisation verhindern und lokale Offlineberechtigungen kontrolliert beenden. Ein zuvor vergebener Check-out vermittelt nach Rechteentzug kein Speicherrecht. | Online- und später wieder verbundene Offlinegeräte können entzogene Rechte nicht weiter ausüben. Offene private Änderungen werden nicht still übernommen; Speichern mit einem überholten Check-out wird abgelehnt. |
| SEC-011 | Für Geräteverlust muss ein kontrollierter Weg bestehen, die weitere Nutzung geschützter Sitzungen, Offlineinhalte und lokal gespeicherter Overlays zu begrenzen. | Der dokumentierte Verlustfall sperrt weitere zulässige Nutzung entsprechend den Entscheidungen aus `OQ-007` und `OQ-008`. |
| SEC-012 | Sicherheitsrelevante Ereignisse, fachlich erforderliche Zustimmungen und administrative Check-out-Eingriffe müssen manipulationserschwerend, datensparsam und für berechtigte Prüfungen nachvollziehbar protokolliert werden. | Rechteänderung, Direktrecht, Zustimmung oder Ablehnung einer Publikationsänderung, Check-out-Vergabe, administrative Rücknahme, abgelehnter geschützter Zugriff, relevante Importablehnung und Sitzungsereignis sind ohne Secrets oder unnötige Inhaltsdaten prüfbar; Umfang und Frist entscheidet `OQ-019`. |
| SEC-013 | Serverseitige Secrets, private Schlüssel, primäre Benutzerzugangsdaten, Sitzungs- oder Berechtigungsnachweise und nicht vertrauliche öffentliche Konfiguration müssen nach den folgenden verbindlichen Kategorien getrennt behandelt werden. | Prüfungen weisen nach, dass serverseitige Secrets und private Schlüssel nicht an Clients gelangen, primäre Benutzerzugangsdaten weder zurückgegeben noch protokolliert oder dauerhaft im Client gespeichert werden und ausgegebene Sitzungs- oder Berechtigungsnachweise minimal berechtigt, geschützt, begrenzt und widerrufbar sind. Repository, Logs, öffentliche Fehler und Beispiele bleiben frei von vertraulichen Werten; öffentliche Konfiguration wird als nicht vertraulich verifiziert. |
| SEC-014 | PRD darf keine Debugports, Debugtunnel oder Debugschnittstellen besitzen. Produktive Diagnose muss über vorgesehene, minimal berechtigte Betriebsinformationen erfolgen. | Netzwerk- und Betriebsprüfung weist ausschließlich freigegebene PRD-Zugänge nach; ein Debugweg ist nicht vorhanden. |
| SEC-015 | Fehlermeldungen müssen Benutzern eine sichere nächste Handlung nennen, ohne Secrets, interne Adressen, technische Stapel, Dateipfade, fremde Bandmitgliedschaften, private Overlays oder unberechtigte Inhaltsdetails offenzulegen. | Repräsentative Fehlerfälle zeigen handlungsorientierte Meldungen; interne Detailmuster und fremde fachliche Daten bleiben in Client und öffentlich sichtbaren Logs aus. |

### Verbindliche Kategorien zu SEC-013

- **Serverseitige Secrets:** Nicht öffentliche Werte, die ausschließlich für
  serverseitige oder betriebliche Zwecke bestimmt sind, werden niemals an
  Clients ausgeliefert.
- **Private Schlüssel:** Privates Schlüsselmaterial wird niemals an Clients
  ausgeliefert und bleibt in der dafür freigegebenen serverseitigen oder
  betrieblichen Sicherheitsgrenze.
- **Primäre Benutzerzugangsdaten:** Die zur unmittelbaren Bestätigung einer
  Benutzeridentität eingegebenen Zugangsdaten werden nicht an den Benutzer
  zurückgegeben, nicht protokolliert und nicht dauerhaft im Client gespeichert.
- **Sitzungs- oder Berechtigungsnachweise:** Ein für die weitere zulässige
  Nutzung erforderlicher Nachweis darf kontrolliert an einen Client ausgegeben
  werden. Er muss minimal berechtigt, gegen unberechtigten Zugriff geschützt,
  zeitlich oder ereignisbezogen begrenzt und widerrufbar sein.
- **Nicht vertrauliche öffentliche Konfiguration:** Ausdrücklich als öffentlich
  bewertete Konfiguration darf Clients sowie öffentlichen Dokumentations- oder
  Repositoryinhalten bereitgestellt werden. Sie darf kein Secret, keinen
  privaten Schlüssel, keine primären Benutzerzugangsdaten und keinen gültigen
  Sitzungs- oder Berechtigungsnachweis enthalten oder versteckte Rechte
  vermitteln.

Repository, Logs, öffentliche Fehlermeldungen und Dokumentationsbeispiele
enthalten keine vertraulichen Werte. Diese Anforderung legt weder ein konkretes
Authentifizierungsprodukt noch ein Token-, Cookie- oder Speicherverfahren fest.

## Datenschutz- und Inhaltsgrundsätze

- Neue Inhalte sind standardmäßig privat. Eine persönliche Voreinstellung darf
  privat, eine berechtigte Band oder öffentlich wählen und bei jeder Erstellung
  überschrieben werden.
- Nach Entzug der Veröffentlichungsberechtigung darf die Band nicht weiter als
  Ziel der Standardsichtbarkeit verwendet werden.
- Inhaltssichtbarkeit, Eigentum, Songzuordnung, Overlay-Reichweite,
  Rollenrechte, Direktrechte und Bearbeitungsberechtigung bleiben getrennte
  Dimensionen.
- Private Inhalte dürfen ohne Bandzuordnung bestehen.
- Private Overlays sind ausschließlich für ihren Benutzer sichtbar.
- Band- und globale Overlays erweitern weder die Sichtbarkeit des zugrunde
  liegenden Inhalts noch vermitteln sie implizite Bearbeitungsrechte.
- Öffentliche Sichtbarkeit und Bandfreigaben übertragen kein Eigentum.
- Bei Benutzer- oder Bandlöschung werden private Inhalte entfernt oder
  Eigentumsübergänge nach `FR-059` kontrolliert und nachvollziehbar ausgeführt.
  Ein freiwillig an die Plattform übertragener privater Inhalt bleibt privat.
- Gemeinsam bearbeitete Inhalte sowie Band- und globale Overlays dürfen ohne
  wirksames Recht und Check-out weder geändert noch überschrieben werden.
- Nur erforderliche personenbezogene und sicherheitsrelevante Daten werden für
  den dokumentierten Zweck verarbeitet und angezeigt.
- Export, Weitergabe und Import begründen keine zusätzlichen Nutzungsrechte an
  urheberrechtlich geschützten Inhalten.
- Sicherheitsprotokollierung ist kein Ersatz für fachliche Historisierung und
  darf nicht zur unnötigen Inhaltsablage werden.

## Umgebungs- und Netzwerkgrenzen

DEV, TST und PRD bleiben bei Daten, Konfiguration, Secrets und Zugriffswegen
getrennt. Nur das App-Backend darf die Datenbank derselben Umgebung erreichen;
Nutzer-Clients greifen nicht direkt auf Backend oder Datenbank zu.

Öffentliche Erreichbarkeit erteilt keine impliziten Rechte. Die vollständigen
Grenzen stehen im [Umgebungsmodell](../ENVIRONMENTS.md) und in den
[Netzwerkgrenzen](../NETWORK-BOUNDARIES.md).

## Freigaberegel

Eine Sicherheitsanforderung gilt erst als erfüllt, wenn ihre Erfolgs- und
Negativfälle in DEV und TST nachvollziehbar geprüft wurden.

Eine Abweichung in PRD benötigt vorab eine dokumentierte
Eigentümerentscheidung; PRD-Debugzugänge bleiben auch dann verboten.
