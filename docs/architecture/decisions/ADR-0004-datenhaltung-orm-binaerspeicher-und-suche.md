# ADR-0004: Datenhaltung, ORM, Binärspeicher und Suche

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Fachzustand, Revisionen, Audit, Jobs, Suche und große PDF-Dateien benötigen
konsistente, sicher getrennte Speicher. Offlineanlagen brauchen vorab
erzeugbare Kennungen, ohne Serverzeit oder Autorisierung zu ersetzen.

## Ziele und Nicht-Ziele

Ziele sind relationale Integrität, kontrollierte Migrationen,
backendexklusiver Binärzugriff, transaktionale Jobanlage und ausreichende Suche.
Ein externer Broker, externer Suchdienst, PostgreSQL-RLS und Runtime-DDL sind
keine MVP-Ziele.

## Entscheidungskriterien

- Transaktions- und Datenintegrität,
- Betrieb auf dem Zielhost und Sicherbarkeit,
- Sicherheitsgrenzen für Datenbank und Dateien,
- Offline-ID-Erzeugung und Konkurrenzkontrolle,
- Portabilität, Testbarkeit und Migrationsfähigkeit.

## Betrachtete Optionen

1. **Status quo:** Kein festgelegter Speicher. Integrität, Sicherung und Suche
   wären nicht planbar.
2. **Angenommen:** PostgreSQL mit Prisma, relationalem Kern und
   backendexklusivem Binärvolume hinter einer Object-Store-Schnittstelle.
3. **Alternative:** Dokumentdatenbank plus externer Object Store und
   Suchcluster. Das erhöht Systeme und Konsistenzgrenzen ohne MVP-Bedarf.

## Entscheidung und Begründung

PostgreSQL 18 speichert den fachlichen relationalen Kern. DEV, TST und PRD
besitzen jeweils einen eigenen PostgreSQL-Dienst beziehungsweise eine eigene
PostgreSQL-Instanz mit eigenen Datenbankrollen, Daten und Volumes. Sie teilen
weder PostgreSQL-Instanz noch PostgreSQL-Cluster. Prisma ORM 7 und Prisma
Migrate sind Standardzugriff und Migrationsweg. Begründetes rohes SQL ist
zulässig. Prisma Studio ist in TST und PRD verboten. `db push` ist nur in
kurzlebigen lokalen Experimenten zulässig.

Fachlich-technische IDs sind UUIDv7. Ein Offlineclient darf sie vorab erzeugen.
Serverzeit bleibt maßgeblich. Jedes veränderliche Objekt besitzt eine monotone
`bigint`-Revision.

JSONB bleibt auf begrenzte, versionierte, Zod-validierte und größenbeschränkte
Strukturen beschränkt. PDFs und andere Binärdaten liegen in einem
backendexklusiven persistenten Volume hinter einer Object-Store-Schnittstelle.
PostgreSQL speichert Metadaten, SHA-256-Hash und Status. Clients greifen nie
direkt auf das Volume zu.

Uploads durchlaufen Quarantäne und Validierung. Das Backend liefert autorisierte
Ranges aus. Datenbank und Dateien werden konsistent gemeinsam gesichert.
Dateisystem- und Datenbankfehler verwenden explizite Kompensation.

Eine PostgreSQL-Transaktion umfasst Fachzustand, Revision, Audit und Jobanlage.
Worker sind idempotent; Wiederholungsfehler bleiben sichtbar. Ein externer
Message Broker gehört nicht zum MVP. Check-outs sind persistente Fachobjekte
und keine langen SQL-Sperren.

Suche verwendet PostgreSQL Full Text Search und `pg_trgm`. Ein externer
Suchdienst gehört nicht zum MVP. Autorisierung wird vor Counts angewendet;
unscharfe Dublettenhinweise sind ausschließlich administrativ.

Migrationen sind kontrollierte Vorwärtsmigrationen mit committetem SQL und
Expand-and-Contract. Der normale Start verändert kein Schema. API, Worker,
Migrator und Backup verwenden getrennte Datenbankrollen. Runtime-Rollen haben
weder DDL- noch Superuserrechte. PostgreSQL-RLS wird im MVP nicht verwendet.

## Folgen und Risiken

PostgreSQL bündelt Transaktion, Suche und Jobgrundlage und reduziert
Betriebssysteme. Das Binärvolume liegt außerhalb der Datenbank; Kompensation,
gemeinsame Sicherung und Wiederherstellung müssen deshalb praktisch geprüft
werden. JSONB-Disziplin und Suchindizes benötigen Größen- und Performancechecks.

Die Object-Store-Schnittstelle erhält Portabilität zu einem späteren
Objektspeicher. Prisma darf Fachmodule nicht an generierte Modelle koppeln.
Reale PostgreSQL-Integration verbessert die Testbarkeit.

## Security sowie DEV/TST/PRD

Nur Backendrollen erreichen Datenbank und Binärvolume. Validator und Clients
besitzen keinen Datenbankzugriff. DEV, TST und PRD verwenden getrennte
PostgreSQL-Dienste beziehungsweise -Instanzen, Cluster, Daten, Rollen, Volumes
und Sicherungen. Private Host-, Pfad-, Port- oder andere Infrastrukturwerte
bleiben außerhalb des Repositorys. TST darf geschützte Diagnose liefern; PRD
hat kein Prisma Studio, keine Debugroute und kein Runtime-DDL.

## Migration, Verifikation und Rückbau

Migrationstests beginnen sowohl mit leerem Schema als auch mit dem letzten
Releasezustand. Integrations-, Konkurrenz-, Kompensations-, Sicherungs-,
Range-, Such- und Autorisierungsfiltertests verifizieren das Modell. TST prüft
Wiederherstellung von Datenbank und Dateien zusammen.

Eine Ablösung von Prisma erfolgt hinter Repositoryschnittstellen. Ein Wechsel
von PostgreSQL oder Binärspeicher benötigt Datenexport, Hashvergleich,
Parallelvalidierung und ein ersetzendes ADR. Down-Migrationen sind kein
normaler Rückbau; bei Dateninkompatibilität gilt Vorwärtskorrektur oder
konsistente Wiederherstellung.

## Offene Annahmen

Die geplante PostgreSQL-Version und Prisma-Hauptversion sind zur Umsetzung
kompatibel. Suchqualität, Indexgröße und Volume-Kompensation werden in TST
belegt.
