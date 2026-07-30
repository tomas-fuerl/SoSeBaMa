# ADR-0005: Identität, Authentifizierung und Sitzungen

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

SoSeBaMa benötigt lokale Konten, sichere Anmeldung, widerrufbare Sitzungen und
einen Einladungsweg ohne offene Selbstregistrierung. Das delegierbare Recht
`Nutzer einladen` muss klar von manueller Kontoadministration getrennt bleiben.

## Ziele und Nicht-Ziele

Ziele sind sichere lokale Identität, MFA, serverseitiger Sitzungswiderruf,
CSRF-Schutz und eine eng begrenzte Einladungsdelegation. Offene Registrierung,
JWT-Autorisierung, Backdoor-Konten und ein nicht auditierter
Administratorzugang sind keine Ziele.

## Entscheidungskriterien

- Schutz von Zugangsdaten und Sitzungen,
- kontrollierte Delegation und geringste Rechte,
- Widerruf, Wiederherstellung und Auditierbarkeit,
- Same-Origin-Betrieb und Offlineabgrenzung,
- Testbarkeit ohne reale Identitäten.

## Betrachtete Optionen

1. **Status quo:** Keine festgelegte Identitäts- oder Sitzungsarchitektur.
2. **Angenommen:** Lokale Backendidentität mit serverseitigen PostgreSQL-
   Sitzungen, WebAuthn/TOTP und kontrollierten Einladungen.
3. **Alternative:** Externer Identity Provider mit JWTs im Browser. Dies schafft
   zusätzliche Betriebsabhängigkeit und erschwert sofortigen serverseitigen
   Sitzungswiderruf im vorgesehenen Umfang.

## Entscheidung und Begründung

Das SoSeBaMa-Backend verwaltet Identitäten lokal. Eine bestätigte E-Mail-Adresse
ist der Login; der Anzeigename ist getrennt. Es gibt keine offene
Selbstregistrierung. Konten entstehen durch einen Einladungsworkflow.

Passwörter werden mit Argon2id geschützt. Passwortregeln orientieren sich an
NIST. WebAuthn und TOTP werden als MFA-Verfahren unterstützt; einmalige
Wiederherstellungscodes ergänzen sie. MFA ist für Plattformadministratoren
verpflichtend und für normale Benutzer optional.

Sitzungen sind opak, serverseitig widerrufbar und in PostgreSQL gespeichert.
Der Browser erhält ausschließlich das Cookie
`__Host-sosebama_session` mit `Secure`, `HttpOnly` und `SameSite=Lax`. JWTs und
Sitzungsdaten in Web Storage sind ausgeschlossen. Online-Idle-, absolute,
Administrator-, Offline- und Step-up-Fristen sind getrennt. Gerätesitzungen sind
widerrufbar.

Web und API laufen Same-Origin. Eine offene CORS-Konfiguration ist
ausgeschlossen. Zustandsänderungen benötigen einen expliziten CSRF-Nachweis und
Origin-Prüfung. Kritische Aktionen verlangen Step-up-Authentifizierung.
Globale Administratorwiederherstellung ist kontrolliert und auditiert; es gibt
kein Backdoor-Konto.

Das globale Aktionsrecht `Nutzer einladen` (`user.invite`) darf ausschließlich
von Plattformadministratoren direkt an aktive Benutzer oder über globale
Gruppen vergeben werden. Es gehört nicht zum Basissatz von `Alle Benutzer` und
darf nicht über Band, Bandmitgliedschaft oder Bandgruppe vermittelt werden.

Das Recht erlaubt dem Einladenden:

- eine Einladung zu erstellen,
- eine eigene offene Einladung erneut zu senden oder zu widerrufen,
- den Status ausschließlich eigener offener Einladungen zu sehen.

Das Recht vermittelt keine allgemeine Einladungshistorie. Abgeschlossene,
abgelaufene, verwendete oder ersetzte Einladungen sowie fremde Einladungen sind
für den Einladenden darüber nicht einsehbar; eine weitergehende Einsicht
erforderte eine getrennte Administratorbefugnis.

Es erlaubt keine manuelle Aktivierung, Deaktivierung oder Löschung, keine
Vergabe globaler Rechte, Gruppen, Administratorstatus, Bandmitgliedschaften
oder Objektberechtigungen, keinen fremden MFA-Reset und keine Verwaltung der
Einladungen anderer. Plattformadministratoren dürfen alle offenen Einladungen
widerrufen.

Bei Annahme bestätigt der Empfänger die E-Mail-Adresse und setzt das eigene
Passwort. Das System aktiviert das Konto automatisch als normalen Benutzer und
vergibt ausschließlich den Basissatz von `Alle Benutzer`. Weitere Rechte,
Gruppen, Bands und Objektberechtigungen werden getrennt vergeben. Diese
systemgesteuerte Aktivierung ist keine manuelle Aktivierungsbefugnis des
Einladenden.

Einladungstokens sind kryptografisch zufällig, einmalig und kurz
konfigurierbar gültig. Serverseitig wird nur der Hash gespeichert. Doppelte
offene Einladungen für dasselbe Ziel sind ausgeschlossen. Antworten vermeiden
E-Mail-Enumeration. Rate Limits gelten nach Einladendem, Ziel und Quelle.
Token enthalten weder Rechte noch Bandzuordnungen. Erstellen, erneutes Senden,
Widerrufen, Annehmen und Ablaufen werden auditiert. Annahme prüft Status und
Gültigkeit serverseitig erneut.

## Folgen und Risiken

Serverseitige Sitzungen vereinfachen Widerruf und erhöhen Datenbankabhängigkeit.
Einladungs-E-Mails und Wiederherstellung benötigen einen sorgfältig gedrosselten
Betriebsweg. WebAuthn- und TOTP-Kompatibilität muss in der Browsermatrix
verifiziert werden.

Die Identitätslogik bleibt über interne Schnittstellen ersetzbar. Diese Grenze
erhält die Portabilität zu einem späteren Identitätsanbieter. Testidentitäten
und synthetische Zustände machen Ablauf-, Widerruf-, CSRF- und Einladungstests
deterministisch.

## Security sowie DEV/TST/PRD

Tokens, Cookies, E-Mail-Adressen und Wiederherstellungscodes werden nie
protokolliert. DEV, TST und PRD besitzen getrennte Identitäten, Schlüssel,
Sitzungen und Secrets. TST-Testidentitäten erhalten keinen fachlichen Bypass.
PRD besitzt keine Debug- oder Wiederherstellungs-Backdoor.

## Migration, Verifikation und Rückbau

AP-02 implementiert Konten, Einladung, MFA und Sitzungen. Unit-, API-, Browser-,
Rate-Limit-, Enumeration-, Tokenwiederverwendungs-, CSRF-, Origin-,
Widerruf- und Step-up-Tests verifizieren die Entscheidung. TST prüft
Wiederherstellung und den Schutz des letzten Plattformadministrators.

Ein späterer externer Identity Provider benötigt ein ersetzendes ADR,
Kontenmigration, Sitzungswiderruf, MFA-Übernahme und einen getesteten
Rückfallweg. Bestehende Sitzungen werden beim Wechsel kontrolliert beendet.

## Offene Annahmen

Der konkrete Versanddienst, Fristwerte und Argon2id-Parameter werden vor
Implementierung sicher konfiguriert und in TST gemessen, ohne private Werte im
Repository zu dokumentieren.
