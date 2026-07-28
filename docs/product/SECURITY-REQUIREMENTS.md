# Produktbezogene Sicherheitsanforderungen

## Bezug und Geltungsbereich

Dieses Dokument ergänzt die repositoryweite
[Sicherheitsrichtlinie](../../SECURITY.md). Jede Anforderung besitzt eine
stabile `SEC-xxx`-Kennung. Sie beschreibt Produktverhalten und legt keine
konkrete Authentifizierungs-, Autorisierungs-, Verschlüsselungs- oder
Synchronisationstechnik fest.

## Anforderungen

| ID | Verbindliche Anforderung | Erwarteter Nachweis |
| --- | --- | --- |
| SEC-001 | Vor jedem geschützten Zugriff muss die Benutzeridentität angemessen bestätigt sein. Die Systemband `Öffentlich` darf keinen anonymen Internetzugriff ermöglichen. | Nicht authentifizierte Zugriffe werden abgelehnt; aktive Mitglieder erhalten nur ihre positiven Rechte. |
| SEC-002 | MFA muss für Plattformadministratoren verpflichtend und für andere Benutzer optional sein. Änderung und Wiederherstellung müssen auditiert werden; der letzte Administrator benötigt einen dokumentierten Wiederherstellungsweg. | Pflicht-, Verlust-, Änderungs- und Wiederherstellungsfälle verhindern dauerhafte Aussperrung. Das Verfahren bleibt Architekturentscheidung. |
| SEC-003 | Jede geschützte Aktion muss serverseitig autorisiert werden. Normale Benutzer benötigen globales Aktionsrecht und Objektberechtigung; Plattformadministratoren besitzen fachlichen Superuserstatus. Eine ausgeblendete Bedienaktion genügt nicht. | Direkte manipulierte Anfragen ohne eine der beiden Ebenen werden abgelehnt. |
| SEC-004 | Positive Benutzer- und Gruppenrechte müssen additiv ausgewertet werden. Negative Rechte sind unzulässig. Bearbeiten, Löschen, Berechtigungen verwalten und Eigentum übertragen müssen nur die dokumentierten Implikationen besitzen. | Kombinationen eigener, Gruppen-, Band- und Eigentümerrechte ergeben den höchsten positiven Status ohne erfundene Verwaltungsrechte. |
| SEC-005 | Bandbereiche müssen alle impliziten Querzugriffe verhindern. Ausdrückliche Objektfreigaben über Bandgrenzen sind zulässig, ändern Eigentum nicht und vermitteln Bandadministration keine automatische Verwaltung. Bandbezogene Gruppen dürfen nur Mitglieder der Band enthalten und nicht verschachtelt werden. | Zugriffe mit anderer Bandmitgliedschaft werden ohne Freigabe abgelehnt; explizite Freigaben erlauben nur die gesetzten Rechte. |
| SEC-006 | Eigentum, globale Rechte, Objektberechtigungen, Songzuordnung, Overlay-Kopplung, Löschzustand und Check-out müssen getrennt autorisiert werden. Eigentümerrechte bleiben nicht entziehbar, erfordern aber globale Rechte; Bandmitglieder erhalten Rechte ihrer Eigentümerband nicht automatisch. | Eigentums-, Freigabe-, Verwaltungs-, Lösch-, Übertragungs- und Check-out-Fälle werden positiv und negativ geprüft. |
| SEC-007 | Dateiimporte müssen Typ, Zulässigkeit und sichere Verarbeitbarkeit prüfen, Grenzen kontrolliert durchsetzen und aktive oder unerwartete Inhalte ohne interne Detailpreisgabe ablehnen. | Zulässige, beschädigte, übergroße und manipulierte Dateien erzeugen sichere eindeutige Ergebnisse. |
| SEC-008 | Lokale Inhalte, Overlays, Entwürfe und Sitzungsschlüssel müssen verschlüsselt gespeichert und gegen unberechtigte Nutzung geschützt werden. Konkretes Verfahren bleibt Architekturentscheidung. Online- und Offline-Leases dürfen die maximale Offlinesitzung nicht umgehen. | Offline-, Abmelde-, Geräteverlust-, Lease-, Wiederverbindungs- und Rechteentzugsfälle sind nachweisbar. |
| SEC-009 | Abmeldung muss weitere geschützte Onlineaktionen verhindern, vor dem Verlust nicht synchronisierter Entwürfe warnen, vorherige Synchronisation erlauben und lokale Daten sowie Sitzungsschlüssel kontrolliert entfernen. | Beendete Sitzungen sind nicht wiederverwendbar; lokale Folgen sind sichtbar. |
| SEC-010 | Rechteentzug muss weitere Speicherung und Synchronisation verhindern und einen Check-out beenden. Bereits vorbereitete Daten dürfen nur bis zur nächsten erfolgreichen Rechteprüfung lesbar bleiben; danach müssen Basisinhalt und Overlays entfernt werden. | Online- und wieder verbundene Offlinegeräte können entzogene Rechte nicht ausüben; minimale Setlistanzeige enthält keine Inhaltsdaten. |
| SEC-011 | Für Geräteverlust muss die weitere Nutzung geschützter Sitzungen und Offlineinhalte durch Sitzungsgrenzen, Widerruf und nächste Rechteprüfung begrenzt werden. | Das Verlustszenario hält die maximale Offlinesitzung ein und stellt keine dauerhafte Offlineberechtigung her. |
| SEC-012 | Audit muss nicht editierbar, datensparsam und manipulationserschwerend sein. Administrative, Eigentums-, Berechtigungs-, Lösch-, Wiederherstellungs- und Check-out-Ereignisse müssen 365 Tage; abgelehnte Zugriffe, Anmeldungen und technische Security-Ereignisse 90 Tage; minimale Nachweise nach endgültiger Löschung 90 Tage aufbewahrt werden. Fachliche Historien bestehen solange wie ihr Objekt. | Fristen, Suchbarkeit für Plattformadministratoren und Trennung von Security-Audit und fachlicher Historie werden geprüft. Basisinhalte und Dateien fehlen im Security-Audit. |
| SEC-013 | Serverseitige Secrets und private Schlüssel dürfen nie an Clients gelangen. Primäre Zugangsdaten dürfen weder zurückgegeben noch protokolliert oder dauerhaft im Client gespeichert werden. Sitzungsnachweise müssen minimal berechtigt, geschützt, begrenzt und widerrufbar sein. Öffentliche Konfiguration darf keine vertraulichen Werte oder versteckten Rechte enthalten. | Repository, Logs, Fehler und Beispiele bleiben secretfrei; Client- und Servergrenzen werden geprüft. |
| SEC-014 | TST darf extern erreichbar sein und geschützte Diagnose-, Backend-API-, Test- und Prüfschnittstellen besitzen, aber nur für benannte technische Identitäten mit eigener Authentifizierung, minimalen Rechten, Audit und ohne pauschalen Autorisierungs-Bypass. Diese Zugriffe müssen in PRD technisch fehlen oder nachweislich unerreichbar sein. PRD darf keine Debugports, -tunnel oder -schnittstellen besitzen. | Netzwerk- und Negativprüfung weist TST-Schutz und vollständige PRD-Abgrenzung nach. |
| SEC-015 | Dublettenprüfung, Berechtigungsanfrage, Check-out-Anzeige und Fehlermeldungen müssen datensparsam sein. Sie dürfen keine Secrets, internen Adressen, technischen Stapel, Dateipfade, fremden Inhalte, Eigentümerbeziehungen, Bandmitgliedschaften, E-Mail-Adressen, Benutzer-IDs oder zusätzlichen Profildaten offenlegen, soweit das Referenzmodell sie nicht ausdrücklich nennt. | Repräsentative Fehler-, Setlist-, Song- und Check-out-Fälle zeigen nur die erlaubten Felder und eine sichere nächste Handlung. |

## Verbindliche Datenschutz- und Inhaltsregeln

- Neue Inhalte haben keine Freigaben.
- Nur Plattformadministratoren dürfen `Anzeigen` für `Öffentlich` setzen oder
  entfernen; Genehmigung, Ablehnung und Entfernung werden auditiert.
- Eigentümerlose Objekte behalten wirksame Rechte, aber nur
  Plattformadministratoren dürfen Eigentum oder Berechtigungen ändern.
- Während einer Löschvormerkung bleiben Leserechte wirksam; Bearbeitung, neue
  Freigaben und neue Setlistreferenzen sind gesperrt.
- Ein gekoppeltes Overlay darf keine Leserechte außerhalb seines Inhalts und
  zusätzliche Bearbeitungsrechte nur für bereits Leseberechtigte erhalten.
- Sicherheitsprotokollierung darf keine Basisinhalte, Dateien oder unnötigen
  Inhaltsdaten speichern.

## Umgebungs- und Netzwerkgrenzen

DEV, TST und PRD bleiben bei Daten, Konfiguration, Secrets, Identitäten und
Zugriffswegen getrennt. Nur das App-Backend darf die Datenbank derselben
Umgebung erreichen. Clients und Entwicklungswerkzeuge erhalten keinen direkten
Datenbankzugriff. Details stehen im
[Umgebungsmodell](../ENVIRONMENTS.md) und in den
[Netzwerkgrenzen](../NETWORK-BOUNDARIES.md).
