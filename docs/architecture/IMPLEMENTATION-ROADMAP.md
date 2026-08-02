# Implementierungsroadmap AP-00 bis AP-11

## Status und Grundsatz

Diese Roadmap setzt
[ADR-0015](decisions/ADR-0015-implementierungsstrategie-und-arbeitspakete.md)
um. Die Architektur ist angenommen, aber noch nicht implementiert. Jedes
Arbeitspaket ist ein vertikales Epic und wird durch kleine reviewbare Pull
Requests geliefert. Die Reihenfolge ist kumulativ; ein späteres Paket übernimmt
die Nachweise früherer Pakete.

## Definition of Ready

Ein Arbeitspaket ist bereit, wenn:

1. Zweck, Hauptumfang, Nicht-Ziele und fachliche Kennungen feststehen.
2. Alle vorausgesetzten ADRs angenommen und Vorgängerpakete abgenommen sind.
3. Security-, Datenschutz-, DEV-, TST- und PRD-Folgen benannt sind.
4. Daten-, Vertrags- und Migrationsfolgen bekannt sind.
5. Positiv-, Negativ-, Integrations- und Rückbaunachweise geplant sind.
6. Offene technische Verifikationen ausdrücklich als blockierend oder
   nicht blockierend eingeordnet sind.
7. Der Scope ohne private Infrastrukturwerte und Secrets umsetzbar ist.

## Definition of Done

Ein Arbeitspaket ist abgeschlossen, wenn:

1. nur der freigegebene Umfang erreichbar implementiert ist,
2. Fach-, Security- und Umgebungsgrenzen serverseitig durchgesetzt sind,
3. Verträge, Migrationen, Audit und Dokumentation aktuell sind,
4. relevante Unit-, Vertrags-, Integrations-, Browser- und Negativtests
   bestanden sind,
5. Beobachtbarkeit, Fehlerbehandlung und Rückbau nachgewiesen sind,
6. keine Secrets oder privaten Infrastrukturwerte in Code oder Artefakten
   stehen,
7. alle für das Paket anwendbaren Gates bestanden und Ergebnisse dokumentiert
   sind.

## Abnahmegates

| Gate | Inhalt | Mindestnachweis |
| --- | --- | --- |
| G1 Code | statische und lokale Komponentenqualität | Format, Lint, Typecheck, Unit-/Komponententests, Modul- und Policyregeln |
| G2 Integration | reale technische Integrationen | Verträge, PostgreSQL, Migration, Jobs, Datei- und Fehlerpfade |
| G3 System | installierter Ende-zu-Ende-Stand | Browser-Smoke, Compose, Container, Security- und Ausfallfälle |
| G4 TST | produktionsnahe Abnahme | Browser-/Gerätematrix, Performance, Ressourcen, Wiederherstellung, Umgebungs- und PRD-Abwesenheitsnachweis |

Gates sind kumulativ. G4 ersetzt weder G1 noch G2 oder G3.

## Arbeitspakete

### AP-00: Architektur dokumentieren

- **Zweck:** Verbindliche Architekturgrundlage, Produktentscheidung
  `Nutzer einladen` und Ressourcenbudget dokumentieren.
- **Hauptumfang:** ADR-0001 bis ADR-0016, Übersicht, Roadmap, Budget und
  konsistente Produkt- und Betriebsdokumente.
- **Voraussetzungen:** bestätigte Ownerentscheidungen A bis O.
- **Nicht-Ziele:** Anwendungscode, Abhängigkeiten, Workflows, Container,
  Compose, Datenbank oder Deployment.
- **ADRs:** alle ADRs als Dokumentationsergebnis.
- **Kumulatives Abnahmekriterium:** Dokumente, Kennungen, Links und Status sind
  widerspruchsfrei; keine Implementierung wird vorgetäuscht.

### AP-01: Repository- und Plattformfundament

- **Zweck:** Reproduzierbaren Monorepo-, Build-, Test- und lokalen
  Laufzeitrahmen schaffen.
- **Hauptumfang:** pnpm-Workspace, TypeScriptkonfiguration, Modulgrenzprüfung,
  minimale Web/API/Worker-Starts, Health, Telemetriegrundlage, Images und
  explizite DEV-Konfiguration.
- **Voraussetzungen:** AP-00; bestandener
  [Hauptversions- und Kompatibilitätsnachweis](AP-01-COMPATIBILITY.md).
- **Nicht-Ziele:** fachliche Konten, Bands, PDFs, Overlays, Setlists,
  Offlinefachdaten oder PRD-Deployment.
- **ADRs:** [0001](decisions/ADR-0001-systemarchitektur-und-laufzeitrollen.md),
  [0002](decisions/ADR-0002-typescript-technologiestack-und-monorepo.md),
  [0011](decisions/ADR-0011-logging-metriken-tracing-und-diagnose.md),
  [0012](decisions/ADR-0012-container-netz-secrets-und-deployment.md),
  [0013](decisions/ADR-0013-teststrategie-und-software-lieferkette.md),
  [0014](decisions/ADR-0014-modulstruktur-und-walking-skeleton.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 bestehen für das leere
  Walking-Skeleton-Fundament; DEV startet reproduzierbar ohne fachliche Route.

### AP-02: Identität und Sitzungen

- **Zweck:** Sichere lokale Anmeldung, Einladung, MFA und widerrufbare
  Sitzungen liefern.
- **Hauptumfang:** Konten, `Nutzer einladen`, Einladungsannahme, Argon2id,
  WebAuthn/TOTP, Cookie, CSRF/Origin, Step-up, Gerätesitzungswiderruf und
  Administratorbootstrap.
- **Voraussetzungen:** AP-01; Versand-, Frist-, Argon2id- und
  Browserkompatibilität technisch geprüft.
- **Nicht-Ziele:** Bandmitgliedschaften, Objektberechtigungen, PDFs oder
  Offline-Grants.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0005](decisions/ADR-0005-identitaet-authentifizierung-und-sitzungen.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md),
  [0014](decisions/ADR-0014-modulstruktur-und-walking-skeleton.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 decken Einladung, Anmeldung,
  MFA, Widerruf, Enumeration, Rate Limits und den letzten Administrator ab.

### AP-03: Bands, Rechte und Eigentum

- **Zweck:** Das angenommene Zwei-Ebenen-Autorisierungsmodell durchsetzen.
- **Hauptumfang:** Bands, Gruppen, `Alle Benutzer`, `Öffentlich`, globale und
  objektbezogene Rechte, Eigentum, Bandvertretung, Policyregister und
  transaktionaler Auditkontext.
- **Voraussetzungen:** AP-02; vollständige Entscheidungsmatrix aus den
  Produktanforderungen.
- **Nicht-Ziele:** PDF-Verarbeitung, Overlays, Setlists, Check-outs und
  Offlinebetrieb.
- **ADRs:** [0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md),
  [0014](decisions/ADR-0014-modulstruktur-und-walking-skeleton.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen positive und negative
  Rechte-, Bandgrenz-, Eigentums-, 404-, Count- und Auditfälle.

### AP-04: Walking Skeleton für private PDF-Inhalte

- **Zweck:** Erste private PDF-Inhaltsstrecke Ende zu Ende nutzbar machen.
- **Hauptumfang:** Songanlage mit Inhalt, Metadaten, Quarantäne, kontrolliert
  migriertes `pg-boss`-Queue-Schema, versionierter minimaler PDF-Prüfjob,
  transaktionale Jobanlage, Worker, PDF-Prüfer, Binärspeicher, autorisierte
  Range-Auslieferung und sichere PDF-Anzeige. Der Job wird mit begrenzter
  Parallelität idempotent verarbeitet; Fehlerzustände bleiben sichtbar.
- **Voraussetzungen:** AP-03; blockierender PDF.js-/qpdf-Eignungsnachweis für
  die strikte Allowlist mit Default-Deny und synthetisches Korpus sowie
  blockierender Nachweis, dass `pg-boss` mit kontrolliert migriertem
  Queue-Schema ohne Runtime-DDL betrieben werden kann.
- **Nicht-Ziele:** Overlaybearbeitung, gemeinsame Rechte, Setlists,
  Check-outs, Offlinefachdaten oder breite Freigabe.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md),
  [0007](decisions/ADR-0007-pdf-verarbeitung-und-annotationen.md),
  [0010](decisions/ADR-0010-hintergrundaufgaben-loeschung-und-auditaufbewahrung.md),
  [0014](decisions/ADR-0014-modulstruktur-und-walking-skeleton.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 bestehen für sicheren Upload,
  Allowlist, Default-Deny unbekannter Strukturen, Ablehnung, Quarantäne, Range,
  Anzeige und atomaren privaten Fachzustand. Die API legt Fachzustand, Audit
  und Prüfjob transaktional an; der Worker verarbeitet den versionierten Job
  idempotent mit begrenzter Parallelität, ruft den isolierten PDF-Prüfer auf
  und schreibt einen autorisierten Status oder sichtbaren Fehlerzustand fort.

### AP-05: Songverwaltung

- **Zweck:** Globale Songsuche, Prüfung und administrative Bereinigung liefern.
- **Hauptumfang:** Sichtbarkeitsfilter, FTS/`pg_trgm`, Änderungsanträge,
  Prüfarbeitsliste, Dubletten, Zusammenführung, Umhängung und auditierte
  Last-write-wins-Ausnahme.
- **Voraussetzungen:** AP-04; Such- und Autorisierungsindizes entworfen.
- **Nicht-Ziele:** spätere optimistische Songkonkurrenzprüfung oder externer
  Suchdienst.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen Suche ohne
  Beziehungslecks sowie atomare und auditierte Verwaltungsaktionen.

### AP-06: Overlays

- **Zweck:** PDF-Annotationen als getrennte Fachobjekte liefern.
- **Hauptumfang:** `react-konva`, PDF-Punktkoordinaten, MVP-Werkzeuge,
  Gesamtrevision, lokaler verschlüsselter Entwurf, atomarer Save, Kopplung,
  Einreichung und Übernahme.
- **Voraussetzungen:** AP-05; Rendering-, Geometrie- und
  Berechtigungstestfälle.
- **Nicht-Ziele:** Formen, Stempel, Layergruppen, OCR, pixelweises Teilradieren
  oder gemeinsamer Check-out.
- **ADRs:** [0006](decisions/ADR-0006-lokale-pwa-daten-und-offline-synchronisation.md),
  [0007](decisions/ADR-0007-pdf-verarbeitung-und-annotationen.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen zoomunabhängige,
  atomare und autorisierte Overlays ohne Basisinhaltsänderung.

### AP-07: Setlists

- **Zweck:** Gemeinsame Planung und ablenkungsarme Nutzung liefern.
- **Hauptumfang:** Anlage, Einträge, Reihenfolge, Overlay-Auswahl, persönliche
  Einstellungen, Kopie, vollständige gemeinsame Historie und minimale
  Nichtverfügbarkeitsanzeige.
- **Voraussetzungen:** AP-06; Historien- und Löschmarker-Verträge festgelegt.
- **Nicht-Ziele:** eingefrorene Snapshots, Auftrittsexport, Check-outs und
  Offlinebearbeitung.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen aktuelle Referenzen,
  getrennte persönliche Einstellungen, Historie und Datenschutz.

### AP-08: Gemeinsame Bearbeitung

- **Zweck:** Gemeinsam bearbeitbare Inhalte, Overlays und Setlists sicher
  koordinieren.
- **Hauptumfang:** EditSession, Check-out, Lease, Heartbeat, Warnungen,
  Übernahme, Rücknahme, SSE-Hinweise, Polling und atomare Save-Prüfung.
- **Voraussetzungen:** AP-07; injizierbare Uhr und Konkurrenzszenarien.
- **Nicht-Ziele:** WebSockets, Warteschlange, Freigabebenachrichtigung,
  Echtzeitkollaboration oder Offline-Check-out.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0008](decisions/ADR-0008-autorisierungs-engine-und-auditdurchsetzung.md),
  [0009](decisions/ADR-0009-bearbeitungssitzungen-check-outs-und-leases.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen Zeit-, Sitzungs-,
  Konkurrenz-, Rechte-, Lösch- und Störfälle ohne stilles Speichern.

### AP-09: PWA und Offlinebetrieb

- **Zweck:** Bewusste Offlineanzeige und private Offlinebearbeitung liefern.
- **Hauptumfang:** Dexie-Schema, Schlüsselbereiche, PDF-Blöcke, Offline-Grants,
  Outbox, Cursor, Vordergrundssync, Speicherprüfung und Clientversionsübergang.
- **Voraussetzungen:** AP-08; Web-Crypto-, Quota-, Migrations- und
  Browserverifikation.
- **Nicht-Ziele:** automatische Vollspiegelung, verlässlicher Background Sync
  oder gemeinsame Offlinebearbeitung nach dem MVP.
- **ADRs:** [0003](decisions/ADR-0003-http-api-und-oeffentliche-vertraege.md),
  [0006](decisions/ADR-0006-lokale-pwa-daten-und-offline-synchronisation.md),
  [0009](decisions/ADR-0009-bearbeitungssitzungen-check-outs-und-leases.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen Verschlüsselung,
  Sperren, Migration, Konflikte, Löschung, Rechteentzug und Rettungswege.

### AP-10: Lebenszyklus und Audit

- **Zweck:** Die in AP-04 eingeführte minimale Jobstrecke zur allgemeinen
  Hintergrund-, Lösch- und Retentionarchitektur vervollständigen und härten.
- **Hauptumfang:** allgemeine versionierte Hintergrundjobs, begrenzte Retries
  mit Backoff, Dead-Letter-Zustände, Reparaturläufe, kontrolliertes
  Herunterfahren und Wiederanlaufen, Löschzustände, endgültige Löschung,
  Binärkompensation, append-only Audit, Audit- und Retention-Bereinigung sowie
  eine geschützte Betriebsansicht für Job- und Löschfehler.
- **Voraussetzungen:** AP-09; die minimale jobgestützte PDF-Prüfung und das
  kontrolliert migrierte Queue-Schema aus AP-04 bestehen.
- **Nicht-Ziele:** Neueinführung der PDF-Jobstrecke, externer Broker, zweite
  Outbox, Runtime-DDL, kryptografische Audit-Hashkette oder PRD-Debugkonsole.
- **ADRs:** [0004](decisions/ADR-0004-datenhaltung-orm-binaerspeicher-und-suche.md),
  [0010](decisions/ADR-0010-hintergrundaufgaben-loeschung-und-auditaufbewahrung.md),
  [0011](decisions/ADR-0011-logging-metriken-tracing-und-diagnose.md).
- **Kumulatives Abnahmekriterium:** G1 bis G3 beweisen atomare Jobanlage,
  Idempotenz, begrenzte Retries und Backoff, Dead-Letter, Reparatur,
  kontrollierten Wiederanlauf, Fristrennen, Finalisierung, Binärkompensation,
  Retention und sichtbare Job- und Löschfehler. Die in AP-04 eingeführte
  jobgestützte PDF-Prüfung bleibt bestehen und wird nicht neu eingeführt.

### AP-11: MVP-Härtung und Releasekandidat

- **Zweck:** Den kumulativen MVP als attestierten TST-Releasekandidaten
  qualifizieren.
- **Hauptumfang:** vollständige Browser-/Gerätematrix, WCAG, Performance,
  Ressourcenbudget, Reserveszenario, Security, Migration, Wiederherstellung,
  SBOM, Provenienz, Attestierung und secretfreies Nachweispaket.
- **Voraussetzungen:** AP-10; alle offenen technischen Verifikationen geklärt.
- **Nicht-Ziele:** PRD-Deployment, Mergefreigabe, neue Funktionen oder stille
  Qualitätszieländerung.
- **ADRs:** alle ADRs, besonders
  [0011](decisions/ADR-0011-logging-metriken-tracing-und-diagnose.md),
  [0012](decisions/ADR-0012-container-netz-secrets-und-deployment.md),
  [0013](decisions/ADR-0013-teststrategie-und-software-lieferkette.md) und
  [0016](decisions/ADR-0016-initiales-ressourcenbudget-und-oq-016.md).
- **Kumulatives Abnahmekriterium:** G1 bis G4 bestehen. Digest,
  Attestierung, Migration, Wiederherstellung, PRD-Abwesenheitsnachweis und
  Ressourcenbudget sind belegt. Das Ergebnis ist nur ein Releasekandidat.

## PR-Granularität

Ein Pull Request behandelt genau einen reviewbaren Nachweis oder vertikalen
Teilschnitt. Datenmigration, öffentlicher Vertrag, Fachlogik, UI und
Betriebsänderung dürfen gemeinsam vorkommen, wenn sie für denselben kleinen
Ende-zu-Ende-Schnitt untrennbar sind. Fachfremde Bereinigung, neue
Produktentscheidungen und mehrere unabhängige Funktionen werden getrennt.

Jeder Pull Request nennt betroffene `FR-*`, `QR-*`, `SEC-*`, `WF-*`, ADRs,
Migrationen, Securityfolgen, Tests und Rückbau.

## Unfertige Funktionen

Unfertige Funktionen bleiben technisch unerreichbar. Es existieren keine
öffentliche Route, Navigation, Jobregistrierung, Berechtigungszuweisung oder
PRD-Konfiguration dafür. Datenmigrationen dürfen nur kompatible vorbereitende
Strukturen anlegen. Feature Flags sind kein Autorisierungs- oder
Sicherheitsmechanismus. Erst ein bestandener vertikaler Nachweis macht eine
Funktion erreichbar.
