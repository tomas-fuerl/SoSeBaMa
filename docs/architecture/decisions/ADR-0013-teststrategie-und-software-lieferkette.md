# ADR-0013: Teststrategie und Software-Lieferkette

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

Fachintegrität, Browserunterstützung, Migrationen, Container und Lieferkette
benötigen reproduzierbare Nachweise. Fremder Pull-Request-Code darf keine
privaten Runner oder Secrets erreichen.

## Ziele und Nicht-Ziele

Ziele sind gestufte automatisierte Prüfungen, reale PostgreSQL-Integration,
Browser- und Barrierefreiheitstests sowie attestierte unveränderliche
Releasekandidaten. Jest parallel zu Vitest, SQLite als Integritätsnachweis,
Auto-Merge und automatisches PRD-Deployment sind keine Ziele.

## Entscheidungskriterien

- Abdeckung von Fach-, Security- und Betriebsrisiken,
- deterministische und portable Tests,
- sichere GitHub-Berechtigungen,
- Nachweisbarkeit von Abhängigkeiten und Artefakten,
- angemessene PR-Laufzeit mit erweiterter TST-Prüfung.

## Betrachtete Optionen

1. **Status quo:** Keine implementierte Test- oder Lieferkette.
2. **Angenommen:** Vitest, Testing Library, Playwright, Testcontainers und
   gestufte GitHub-Prüfungen mit attestierten Artefakten.
3. **Alternative:** Überwiegend manuelle Tests und selbst gehostete Runner für
   alle Beiträge. Dies ist schlechter reproduzierbar und erhöht das Risiko für
   private Infrastruktur.

## Entscheidung und Begründung

Vitest ist der Test Runner, React Testing Library das Komponentenwerkzeug,
Playwright das Browserwerkzeug und V8 die Coveragequelle. Jest wird nicht
parallel eingeführt.

Die Testpyramide umfasst Unit-, Vertrags-, Integrations-, Komponenten-,
Browser- und Systemtests. PostgreSQL-Integration verwendet reale Instanzen über
Testcontainers; SQLite ist kein Integritätsnachweis.

Pull Requests verwenden eine Smoke-Matrix, nächtliche und
Releasekandidatenläufe eine erweiterte Matrix. Playwright prüft Chromium,
Firefox und WebKit. TST ergänzt reale Safari-/iPadOS-Prüfung.
axe-basierte Automatisierung wird durch manuelle WCAG-Prüfung ergänzt.

Fixtures sind synthetisch und deterministisch. Das PDF-Testkorpus wird selbst
erzeugt und ist urheberrechtlich unkritisch. Uhr und Zufallsquellen sind
injizierbar.

Die verpflichtende PR-Pipeline umfasst mindestens:

- Repositoryvalidierung, Format, Lint und Typecheck,
- Unit-, Komponenten- und Vertragsprüfung,
- OpenAPI-Diff,
- Migration einer leeren Datenbank,
- PostgreSQL-Integration,
- Chromium-Smoke,
- Compose-Validierung und Containerbuild,
- Dependency Review,
- Secret- und Policychecks,
- einen zusammenfassenden erforderlichen Status.

Es gibt drei CI-Stufen: Pull Request, geplant/nächtlich und Releasekandidat in
TST.

Repositorycode läuft auf GitHub-hosted Runnern. Fremder PR-Code läuft nie auf
selbst gehosteten Runnern. Workflowpermissions sind minimal; normale PR-Jobs
erhalten keine Secrets. Unsicheres `pull_request_target` ist verboten.
Drittanbieter-Actions werden über vollständige Commit-SHAs fixiert.

`main` ist geschützt. Pull Requests und erforderliche Checks sind Pflicht,
Force-Push ist verboten und ausschließlich der Projekteigentümer merged.

Dependabot überwacht pnpm/npm, GitHub Actions und Docker ohne Auto-Merge.
Dependency Review und eine versionierte Lizenzrichtlinie sind Pflicht. CodeQL
prüft TypeScript/JavaScript und GitHub Actions. Secret Scanning und Push
Protection sind aktiv. Trivy prüft Images, Abhängigkeiten und
Fehlkonfigurationen.

Neue kritische oder hohe Schwachstellen blockieren. Kritische Befunde werden
nie ungeklärt released. Zulässige hohe Befunde benötigen eine befristete
dokumentierte Ausnahme.

Releases enthalten SPDX-SBOM, BuildKit-Provenienz und GitHub Artifact
Attestations. Vor Promotion werden Digest und Attestierung geprüft.

Migrationstests decken leeres und letztes Releaseschema ab. Veröffentlichte
Migrationen werden nicht nachträglich geändert. Performance wird mit
Browsermarks, OpenTelemetry und k6 geprüft; eine Wiederherstellungsprobe ist
Pflicht.

Versionierung folgt SemVer: vor dem ersten Produktrelease `0.MINOR.PATCH`, der
erste vollständig abgenommene Produktrelease ist `1.0.0`,
Releasekandidaten sind `X.Y.Z-rc.N`.

Ein Merge erzeugt höchstens einen Buildkandidaten. Release und PRD-Deployment
benötigen getrennte Ownerfreigaben. Das Nachweispaket ist vollständig und
secretfrei.

## Folgen und Risiken

Die breite Prüfmatrix kostet Laufzeit und Wartung. Stufen halten PR-Feedback
schnell und verschieben teure reale Geräte-, Performance- und
Wiederherstellungsprüfungen kontrolliert nach TST. Testcontainers benötigen
geeignete Runner, dürfen aber keine private Infrastruktur exponieren.

Standardwerkzeuge, synthetische Fixtures und SBOM erhalten Portabilität.
Deterministische Zeit und Zufall verbessern Störfall- und Eigenschaftstests.

Die Testbarkeit selbst wird durch reproduzierbare Stufen, benannte
Nachweisartefakte und klar zuordenbare Fehlerausgaben überprüft.

## Security sowie DEV/TST/PRD

PRs erhalten keine Umgebungssecrets. DEV und CI verwenden künstliche Daten. TST
verwendet getrennte Testidentitäten und geschützte Zugänge. PRD wird durch CI
weder automatisch erreicht noch deployed. Nachweise enthalten keine Secrets
oder privaten Infrastrukturwerte.

## Migration, Verifikation und Rückbau

AP-01 richtet die Mindestprüfungen ein; jedes weitere Arbeitspaket erweitert sie
mit seinen Nachweisen. AP-11 führt vollständige TST-, Performance-,
Wiederherstellungs-, Attestierungs- und reale Geräteprüfungen aus.

Ein Werkzeugwechsel benötigt kompatible Testergebnisse und darf erforderliche
Gates nicht entfernen. Alte und neue Prüfung laufen übergangsweise parallel.
Artefakte werden nur promoviert, wenn Digest, SBOM, Provenienz und
Attestierung zusammenpassen.

## Offene Annahmen

Die gewählten Werkzeuge unterstützen Node.js 24, die Browsermatrix und die
erforderliche GitHub-Sicherheitskonfiguration zur Implementierungszeit. Exakte
Versionen und Action-SHAs werden dann geprüft und fixiert.
