# Historischer nginx-Proof und Ownerentscheidung

- Eigentümer: Projekteigentümer
- Prüfdatum: 2026-11-10
- Bezug: [#64](https://github.com/tomas-fuerl/SoSeBaMa/issues/64)
- Ergebnis: lokaler Proof erfolgreich; anschließender dauerhafter Wechsel vom Owner freigegeben.

## Zweck und Reuse-first

Der Proof verglich den bestehenden Caddy-Pfad mit nginx unter denselben lokalen
DEV-Netzgrenzen und Härtungsoptionen. Wiederverwendet wurden die vorhandenen
Docker-Buildstages, Compose-Dateien, Containerpolicy, HTTP-/Log-/Cleanup-Prüfer
und Playwright-Smokes. Kein neuer ausführbarer Prüfer und keine neue npm-
Abhängigkeit wurden eingeführt. Gesucht wurde in `containers`, `compose*.yaml`,
`tools/check-dev-containers.mjs`, Container-/Browsertests und DEV-/Supply-Chain-
Dokumentation. Die Architekturentscheidung steht in
[ADR-0017](../architecture/decisions/ADR-0017-nginx-application-gateway.md).

## Gemessener Stand des Proofs

- Offizielles nginx 1.30.6-trixie, Multi-Arch-Index
  `sha256:42c68eab6f7e22611786a9fe1d1c019e275c50185bd54b8f75dc2b9184322703`.
  Index enthält amd64 und arm64; ausgeführt wurde Linux amd64 in Docker Desktop.
- Offizielle Basis: zwei fixbare zlib1g-HIGHs (`CVE-2026-76844`,
  `CVE-2026-85091`). Gezieltes Debian-Update auf
  `1:1.3.dfsg+really1.3.1-1+deb13u1`, keine neue Ausnahme.
- Fertiger damaliger Proof-Index
  `sha256:a13d176f0f903af2977d9315d4f85bc1aa4788a1e65869f5ede687d8c3524ba1`:
  Trivy 0.74.0/DB 2026-11-10 13:03 UTC, 0 fixbare HIGH/CRITICAL, Exit 0.
  Der spätere Standardbuild muss eigenständig erneut geprüft werden.
- Node 24.21 für unveränderte JSON-Healthchecks; keine npm-/corepack-Runtime.
- Vier gesunde Rollen, HTTP-Smoke, Backendlogs und aktive Härtung bestätigt:
  UID/GID 1000:1000, read-only, keine Capabilities, `no-new-privileges`,
  internes Application-Netz, ausschließlich Gatewayport auf Loopback.
- Drei Chromium-Tests bestanden: Root, SPA-Fallback und HTTP-/Cache-/API-Vertrag.
- API und Web mit garantiert anderen internen Adressen wiederangelegt.
  Gateway-Container-ID blieb unverändert; HTTP, Health und alle drei
  Browsertests erneut erfolgreich. Temporäre gehärtete Adresshalter entfernt.
- Worker SIGSTOP → `unhealthy`/Prüfer Exit 1 → SIGCONT → `healthy`,
  RestartCount 0. Kontrollierter Rückbau und Cleanup erfolgreich.
- Frozen-Installation und vollständiges `pnpm check` unter Node 24.21,
  pnpm 11.18, Vitest 4.1.12 erfolgreich: 194 Tests, Build, Format, Lint,
  Typecheck, Lizenzen und Markdown-Dateiziele.
- Damalige 14 Policytests (zwei Varianten) auf Hostnode 24.18.1/Vitest 4.1.11
  erfolgreich, ausdrücklich kein gepinnter CI-Nachweis.
- Konfiguration: 77 statt 33 Zeilen, einschließlich Leerzeilen.

## Folgerung, Grenzen und Reproduktion

Der Owner hat anschließend den dauerhaften Wechsel freigegeben. Proof-Overlay
und Caddy-Konfiguration sind entfernt; es gibt nur den nginx-Standardpfad.
Aktuelle reproduzierbare Build-, Start-, Prüf- und Rückbaubefehle stehen in
[DEV-CONTAINERS.md](DEV-CONTAINERS.md). Die vorübergehenden Proof-Kommandos
sind nicht mehr ausführbar und werden nicht als aktueller Ablauf angeboten.

Das ist kein Lastbenchmark und keine TST-/PRD-/AP-01-Abnahme. Keine Aussage
über native arm64-Laufzeit, große Uploads, WebSockets oder reale Ingress-
Vertrauenskette. Basisimageunterschiede (Bookworm/Trixie) erlauben keinen
isolierten Sicherheits- oder Größenvergleich der Webserver. Minimatch und
Browserimage-Risikobewertung waren zum Proofzeitpunkt unabhängig offen. Die
anschließende befristete Ownerentscheidung zum Browserimage steht in den
[Supply-Chain-Nachweisen](SUPPLY-CHAIN-CHECKS.md); sie behebt den Minimatch-
Befund nicht.

Temporäre Dienste, Netze, Dependency-Volume, Hilfsimage-Tags und etwa 3,3 GB
Scanarchive/-Cache wurden nach dem Proof gezielt entfernt. Keine lokalen
Dependencies, VS-Code-Konfigurationen, TST, PRD oder AP-02 wurden verändert.

Vor jeder erneuten Bewertung gelten die unveränderten Supply-Chain-Gates.
Rollback nur über reviewten Revert und neu geprüfte Images; bekannte
Caddy-Befunde dürfen dabei nicht als freigegeben gelten.
