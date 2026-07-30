# ADR-0015: Implementierungsstrategie und Arbeitspakete

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Die angenommene Architektur und der MVP sind umfangreich. Die Umsetzung muss
reviewbar, vertikal nutzbar und über kumulative Abnahmegates steuerbar bleiben.

## Ziele und Nicht-Ziele

Ziele sind geordnete vertikale Arbeitspakete, kleine Pull Requests, klare
Eintritts- und Abschlusskriterien sowie technisch unerreichbare unfertige
Funktionen. Eine rein horizontale Schichtenimplementierung und Feature Flags
als Sicherheitsgrenze sind keine Ziele.

## Entscheidungskriterien

- frühe Ende-zu-Ende-Nachweise,
- begrenzter Review- und Rückbauscope,
- sichere Abhängigkeiten zwischen Fachbereichen,
- kumulative System- und TST-Abnahme,
- Transparenz unfertiger Funktionen.

## Betrachtete Optionen

1. **Status quo:** Architektur- und Produktdokumente ohne festgelegte
   Implementierungsreihenfolge.
2. **Angenommen:** AP-00 bis AP-11 als vertikale Epics mit kleinen Pull
   Requests und vier Gates.
3. **Alternative:** Zuerst alle technischen Schichten, danach Fachfunktionen.
   Dadurch entstehen lange nicht nutzbare Zwischenstände und spätes
   Integrationsrisiko.

## Entscheidung und Begründung

Arbeitspakete sind vertikale, einzeln nutzbare Epics. Jedes Epic besteht aus
kleinen reviewbaren Pull Requests. Die verbindliche Reihenfolge und der
detaillierte Umfang stehen in der
[Implementierungsroadmap](../IMPLEMENTATION-ROADMAP.md):

- AP-00 Architektur dokumentieren,
- AP-01 Repository- und Plattformfundament,
- AP-02 Identität und Sitzungen,
- AP-03 Bands, Rechte und Eigentum,
- AP-04 Walking Skeleton für private PDF-Inhalte,
- AP-05 Songverwaltung,
- AP-06 Overlays,
- AP-07 Setlists,
- AP-08 Gemeinsame Bearbeitung,
- AP-09 PWA und Offlinebetrieb,
- AP-10 Lebenszyklus und Audit,
- AP-11 MVP-Härtung und Releasekandidat.

Definition of Ready verlangt entschiedene fachliche Kennungen,
Abhängigkeiten, Security- und Umgebungsfolgen, messbare Akzeptanz und geplante
Nachweise. Definition of Done verlangt implementierten Scope, Tests,
Dokumentation, Migration und Rückbau, secretfreie Artefakte sowie bestandene
anwendbare Gates.

Die vier kumulativen Abnahmegates sind:

- G1 Code,
- G2 Integration,
- G3 System,
- G4 TST.

Unfertige Funktionen bleiben technisch unerreichbar: keine Route, Navigation,
Jobregistrierung, Berechtigung oder produktive Konfiguration darf sie
aktivieren. Feature Flags können Lieferumfang steuern, sind aber keine
Sicherheitsgrenze.

## Folgen und Risiken

Vertikale Pakete können technische Grundlagen wiederholt erweitern; kleine
Pull Requests und klare Modulverantwortung begrenzen Drift. Kumulative Gates
werden mit wachsendem Produkt teurer und benötigen eine gestufte Teststrategie.

Die Strategie ist unabhängig von konkreten Hostingwerkzeugen und erhält damit
die Portabilität der Lieferplanung. Jede vertikale Scheibe besitzt isolierbare
Akzeptanz- und Rückbaunachweise.

Die Testbarkeit jedes Arbeitspakets wird durch seine kumulativen
Abnahmekriterien und die zugehörigen Qualitätsgates hergestellt.

## Security sowie DEV/TST/PRD

Jedes Paket benennt Security- und Umgebungsfolgen. DEV beginnt die technische
Prüfung, TST liefert produktionsnahe Gates. PRD wird in keinem Arbeitspaket
automatisch erreicht. AP-11 erzeugt nur einen Releasekandidaten; PRD benötigt
separate Ownerfreigabe und besitzt keine Debugwege.

## Migration, Verifikation und Rückbau

Die Roadmap ist der verbindliche Umsetzungsplan. Jedes Epic dokumentiert
Voraussetzungen, Nicht-Ziele, ADR-Bezüge und kumulatives Abnahmekriterium.
Pull-Request-Checks und Gateprotokolle verifizieren die Strategie.

Änderungen der Reihenfolge oder Paketgrenzen benötigen begründete
Roadmapaktualisierung und bei Architekturfolgen ein ersetzendes ADR. Ein Paket
kann über kleine Pull-Request-Reverts, deaktivierte unerreichbare Pfade und
kompatible Vorwärtsmigrationen zurückgebaut werden.

## Offene Annahmen

Die Paketgrenzen sind für den aktuellen MVP ausreichend klein. Vor jedem Epic
bestätigt die Definition of Ready, dass keine neue Produktentscheidung
vorausgesetzt wird.
