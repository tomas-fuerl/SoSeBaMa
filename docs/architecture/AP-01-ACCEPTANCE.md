# AP-01: Abnahmenachweis G1 bis G3

- Status: Bestanden
- Prüfstand: 2026-08-16
- Geprüfter Stand: `a7683cd`
- Bezogenes Issue: [#27](https://github.com/tomas-fuerl/SoSeBaMa/issues/27)
- Geltungsbereich: AP-01 in lokalem DEV und auf der Pull-Request-Stufe

## Ziel und Ergebnis

Die [Implementierungsroadmap](IMPLEMENTATION-ROADMAP.md) nennt als kumulatives
Abnahmekriterium für AP-01: „G1 bis G3 bestehen für das leere
Walking-Skeleton-Fundament; DEV startet reproduzierbar ohne fachliche Route."
Die Definition of Done verlangt zusätzlich, dass die Gate-Ergebnisse
**dokumentiert** sind.

**Ergebnis: G1 bis G3 sind für den anwendbaren Umfang bestanden.** Jede Zeile
unten nennt Kriterium, Nachweisbefehl, ausgeführtes Ergebnis und den Pull
Request, der den Nachweis geliefert hat.

## Wie dieser Nachweis zu lesen ist

Er protokolliert **ausschließlich tatsächlich ausgeführte** Läufe. Jede Zeile
wurde am Prüfstand gegen den oben genannten Stand ausgeführt; keine Zeile ist
aus einer früheren Ausführung übernommen oder aus einer Pull-Request-Beschreibung
abgeschrieben.

Zwei Nachweisquellen kommen vor:

| Quelle | Bedeutung |
| --- | --- |
| Befehl | lokal ausgeführt, Ergebnis ist der Exit-Code beziehungsweise die Testanzahl |
| CI | läuft ausschließlich in GitHub-hosted CI; Beleg ist der Lauf zum geprüften Stand |

Der CI-Beleg ist der Lauf
[31971774181](https://github.com/tomas-fuerl/SoSeBaMa/actions/runs/31971774181)
auf `a7683cd` mit den Jobs `repository`, `containers`, `dependencies`,
`code-scanning` (beide Sprachen) und dem zusammenfassenden Pflichtstatus
`quality`, sämtlich `success`.

Der Nachweis ersetzt **nicht** das lokale, durch `.gitignore` ausgeschlossene
Ergebnisprotokoll je Teilschnitt. Er ist der versionierte Projektnachweis.

## Verbindliche Vorgaben

- [Implementierungsroadmap](IMPLEMENTATION-ROADMAP.md): Abnahmegates und
  Definition of Done
- [ADR-0011](decisions/ADR-0011-logging-metriken-tracing-und-diagnose.md):
  getrennte Health-Endpunkte
- [ADR-0012](decisions/ADR-0012-container-netz-secrets-und-deployment.md):
  Container-, Netz- und Secretgrenzen
- [ADR-0013](decisions/ADR-0013-teststrategie-und-software-lieferkette.md):
  Teststrategie und Mindestprüfungen der Lieferkette
- [ADR-0014](decisions/ADR-0014-modulstruktur-und-walking-skeleton.md):
  Modulstruktur und Walking Skeleton

## G1 Code

Mindestnachweis laut Roadmap: Format, Lint, Typecheck, Unit- und
Komponententests, Modul- und Policyregeln.

| Kriterium | Nachweis | Ergebnis | PR |
| --- | --- | --- | --- |
| Reproduzierbare Installation | `pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies` | Exit `0` | [#19](https://github.com/tomas-fuerl/SoSeBaMa/pull/19) |
| Formatierung | `pnpm format` | Exit `0` | [#19](https://github.com/tomas-fuerl/SoSeBaMa/pull/19) |
| Lint | `pnpm lint` | Exit `0` | [#19](https://github.com/tomas-fuerl/SoSeBaMa/pull/19) |
| Typprüfung | `pnpm typecheck` | Exit `0` | [#19](https://github.com/tomas-fuerl/SoSeBaMa/pull/19) |
| Build aller Workspaces | `pnpm build` | Exit `0` | [#20](https://github.com/tomas-fuerl/SoSeBaMa/pull/20) |
| Unit- und Komponententests der Pakete | `pnpm --recursive --if-present run test` | 89 Tests bestanden | [#20](https://github.com/tomas-fuerl/SoSeBaMa/pull/20), [#24](https://github.com/tomas-fuerl/SoSeBaMa/pull/24), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Modul- und Importgrenzen | `pnpm test:architecture` | 17 Tests bestanden | [#22](https://github.com/tomas-fuerl/SoSeBaMa/pull/22) |
| Werkzeugtests des Lizenzgates | `pnpm test:tools` | 65 Tests bestanden | [#35](https://github.com/tomas-fuerl/SoSeBaMa/pull/35) |
| Toolchain- und Installationsrichtlinie | `pnpm test:toolchain` | 16 Tests bestanden | [#47](https://github.com/tomas-fuerl/SoSeBaMa/pull/47), [#48](https://github.com/tomas-fuerl/SoSeBaMa/pull/48), [#50](https://github.com/tomas-fuerl/SoSeBaMa/pull/50) |
| Prozessverhalten der Laufzeitrollen | `pnpm test:processes` | 6 Tests bestanden | [#20](https://github.com/tomas-fuerl/SoSeBaMa/pull/20), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Containerpolicy als Regelprüfung | `pnpm container:policy` | 7 Tests bestanden | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Lizenzrichtlinie | `pnpm licenses:check` | Exit `0` | [#35](https://github.com/tomas-fuerl/SoSeBaMa/pull/35) |
| Dokumentationslinks | `pnpm docs:links` | Exit `0`, 51 Dateien | [#8](https://github.com/tomas-fuerl/SoSeBaMa/pull/8) |
| Statische Codeanalyse | CI, `code-scanning` (`javascript-typescript`, `actions`) | `success` | [#40](https://github.com/tomas-fuerl/SoSeBaMa/pull/40) |

Testsumme des Prüfstands: **193** bestandene Tests (89 in den Workspacepaketen,
104 in den repositoryweiten Suiten).

## G2 Integration

Mindestnachweis laut Roadmap: Verträge, PostgreSQL, Migration, Jobs, Datei- und
Fehlerpfade.

**AP-01 enthält keine Datenbank, keine Jobverarbeitung und keine
Dateiverarbeitung.** Der anwendbare Anteil von G2 beschränkt sich daher auf die
technischen Verträge zwischen den Laufzeitrollen und auf die Fehlerpfade des
Starts.

### Anwendbar und nachgewiesen

| Kriterium | Nachweis | Ergebnis | PR |
| --- | --- | --- | --- |
| Health-Vertrag als geteilter Typ, browsertauglich | `pnpm --filter @sobama/contracts run test` | 4 Tests bestanden | [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Zustandsabbildung auf HTTP-Status, serverseitig getrennt | `pnpm --filter @sobama/runtime-health run test` | 32 Tests bestanden | [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Konfigurationsvertrag inklusive Grenzwerten | `pnpm --filter @sobama/config run test` | 28 Tests bestanden | [#20](https://github.com/tomas-fuerl/SoSeBaMa/pull/20), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Vertrag über Rollengrenzen im laufenden Stack | `pnpm container:smoke` prüft `role` **und** `status` je Antwort | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Fehlerpfad ungültige Konfiguration | `pnpm test:processes` | Exit `1` je Rolle, Teil der 6 Tests | [#20](https://github.com/tomas-fuerl/SoSeBaMa/pull/20) |
| Fehlerpfad Herunterfahren | `pnpm test:processes` | SIGINT/SIGTERM, Exit `0`, Health geschlossen | [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Telemetrievertrag ohne Secrets | `pnpm container:logs` | Exit `0` | [#24](https://github.com/tomas-fuerl/SoSeBaMa/pull/24) |

### Nicht anwendbar

| Gate-Anteil | Begründung | Zuständig |
| --- | --- | --- |
| PostgreSQL | AP-01 enthält keine Datenbank; die Roadmap schließt Datenbank und Deployment für AP-01 ausdrücklich aus | AP-02 und folgende |
| Migration | ohne Datenbank gegenstandslos | AP-02 und folgende |
| Jobs | der Worker besitzt einen technischen Start und Health, aber keine Jobverarbeitung | AP-04 und folgende |
| Dateipfade | AP-01 verarbeitet keine Dateien; PDF-Inhalte sind ausdrücklich Nicht-Ziel | AP-04 |

Diese vier Anteile sind **nicht** ungeprüft geblieben, sondern für diesen
Paketumfang gegenstandslos. Sie werden mit dem Paket nachgewiesen, das die
jeweilige Integration einführt.

## G3 System

Mindestnachweis laut Roadmap: Browser-Smoke, Compose, Container, Security- und
Ausfallfälle.

| Kriterium | Nachweis | Ergebnis | PR |
| --- | --- | --- | --- |
| Compose-Konfiguration gültig | `pnpm container:config` | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23) |
| Härtung, Netzgrenzen, Portpolitik | `pnpm container:policy` | 7 Tests bestanden | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Reproduzierbarer Imagebau | `pnpm container:build` | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23) |
| Start aller vier Rollen | `pnpm container:up` | Exit `0`, vier Rollen `Healthy` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23), [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Healthzustand aller Rollen | `pnpm container:health` | Exit `0` | [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29) |
| Hosteingang ausschließlich über Caddy | `pnpm container:smoke` | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23) |
| **Browser-Smoke der SPA-Auslieferung** | `pnpm browser:smoke` | Exit `0`, 2 Tests bestanden | [#48](https://github.com/tomas-fuerl/SoSeBaMa/pull/48), [#49](https://github.com/tomas-fuerl/SoSeBaMa/pull/49) |
| Strukturierte, secretfreie Startlogs | `pnpm container:logs` | Exit `0` | [#24](https://github.com/tomas-fuerl/SoSeBaMa/pull/24) |
| Kontrollierter Rückbau | `pnpm container:down` | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23) |
| Rückstandsfreiheit | `pnpm container:cleanup` | Exit `0` | [#23](https://github.com/tomas-fuerl/SoSeBaMa/pull/23) |
| Schwachstellen in beiden Images | CI, Trivy `image` | `success` | [#40](https://github.com/tomas-fuerl/SoSeBaMa/pull/40) |
| Schwachstellen der aufgelösten Abhängigkeiten | CI, Trivy `fs` | `success` | [#40](https://github.com/tomas-fuerl/SoSeBaMa/pull/40) |
| Fehlkonfiguration in Dockerfiles und Compose | CI, Trivy `config` | `success` | [#40](https://github.com/tomas-fuerl/SoSeBaMa/pull/40) |
| Neu hinzukommende Abhängigkeiten | CI, `dependencies` (Dependency Review) | `success` | [#35](https://github.com/tomas-fuerl/SoSeBaMa/pull/35) |

### Ausfallfall: blockierte Worker-Laufzeit

Der Nachweis nach
[DEV-CONTAINERS.md](../development/DEV-CONTAINERS.md) belegt, dass der
Containerhealthcheck eine blockierte Laufzeit erkennt und nicht nur die Existenz
des Prozesses prüft.

| Schritt | Ergebnis |
| --- | --- |
| Node-PID im Worker ermittelt | `7`, also ungleich `1` — der Init-Prozess ist nicht das Ziel |
| Ausgangszustand | `healthy` |
| Nach `SIGSTOP` | `unhealthy` nach **62 s** |
| `pnpm container:health` im blockierten Zustand | Exit `1` |
| Nach `SIGCONT` | wieder `healthy` nach **67 s** ab Start des Nachweises |
| `pnpm container:health` nach Erholung | Exit `0` |

Es ist keine `restart`-Policy gesetzt; der Zustandswechsel ist deshalb
beobachtbar und nicht durch einen Neustart überdeckt.

### Sicherheitsgrenze des Browser-Smokes

Aus dem Browsercontainer heraus gemessen, während der Smoke lief:

| Ziel | Ergebnis |
| --- | --- |
| öffentliches Internet | nicht erreichbar |
| veröffentlichter Hostport | nicht erreichbar |
| `http://gateway:8080` | HTTP `200` |

Der Container läuft unprivilegiert, mit read-only Root-Dateisystem, ohne
Capabilities und ohne Hostnetz. Das Werkzeug prüft vor dem Start, dass das
verwendete Compose-Netz tatsächlich `Internal` ist.

## Noch nicht nachgewiesen

Die folgenden Anteile sind für AP-01 **nicht** erbracht und ausdrücklich
späteren Paketen zugeordnet. Keiner davon blockiert den AP-01-Abschluss.

| Anteil | Zuständig |
| --- | --- |
| PostgreSQL, Migrationen, Testcontainers-Laufzeit | AP-02 und folgende |
| Jobverarbeitung im Worker | AP-04 und folgende |
| Datei- und PDF-Pfade | AP-04 |
| Mehrarchitektur-Images | [AP-11](IMPLEMENTATION-ROADMAP.md) |
| SBOM, Provenienz, Attestierung | AP-11 |
| Browser- und Gerätematrix, Firefox und WebKit | AP-11 |
| WCAG- und axe-Prüfungen | AP-11 |
| G4 sowie jede TST-Aussage | AP-11 |
| Nächtliche CI-Stufe und Releasekandidatenstufe | spätere Pakete |

ADR-0013 nennt drei CI-Stufen. AP-01 richtet ausschließlich die
Pull-Request-Stufe ein; genau das weist ADR-0013 dem Paket zu.

## Fehlerbehandlung und sichere Abbruchbedingungen

- **Eine Zeile lässt sich nicht reproduzieren:** Der Nachweis gilt als nicht
  erbracht. Weder die Zeile noch die Prüfung wird angepasst, um ein grünes
  Ergebnis herzustellen.
- **Ein Prüfschritt schlägt fehl:** Den ersten fehlgeschlagenen Schritt beheben.
  Prüfregeln werden nicht abgeschaltet, um den Fehler zu umgehen.
- **Der Ausfallnachweis zeigt keinen Zustandswechsel:** Abbrechen. Das wäre ein
  Rückfall in die tautologische Prüfung, die [#29](https://github.com/tomas-fuerl/SoSeBaMa/pull/29)
  beseitigt hat.
- **Ein Nachweis benötigt eine laufende Container-Laufzeit, die fehlt:** Den
  Nachweis als nicht ausgeführt kennzeichnen, nicht aus einem früheren Lauf
  übernehmen.

## Security sowie DEV/TST/PRD

Dieser Nachweis betrifft ausschließlich lokales DEV und die
Pull-Request-Stufe. Er erreicht weder TST noch PRD und enthält keine
Deploymentaussage.

Im geprüften Stand liegen keine Secrets, realen Domains, IP-Adressen oder
privaten Infrastrukturwerte. Der DEV-Rahmen startet ohne solche Werte; der
Hosteingang bindet ausschließlich an einen lokal gewählten Loopback-Port.

Offene Dependabot-Sicherheitsmeldungen zum Prüfstand: **0**.

## Rollback und Pflege

Dieser Nachweis ist ein reines Dokument. Ein `git revert` seines Commits
entfernt ihn ohne Laufzeit- oder Datenfolgen.

Verantwortlich für die Pflege ist der Projekteigentümer. Der Nachweis wird
wiederholt, sobald ein Gate-Anteil sich ändert, ein hier genannter Befehl
umbenannt oder ersetzt wird oder ein späteres Paket einen bisher nicht
anwendbaren Anteil einführt. Er wird **nicht** fortgeschrieben, um spätere
Pakete abzudecken; jedes Paket führt seinen eigenen kumulativen Nachweis.
