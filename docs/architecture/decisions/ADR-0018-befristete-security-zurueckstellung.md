# ADR-0018: Automatische befristete Zurückstellung von Security-Findings

- Status: Angenommen
- Datum: 2026-11-11
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #64
- Präzisiert: ADR-0013 für Befunde ohne tatsächlich verwendbaren Fix

## Kontext und Problem

[ADR-0013](ADR-0013-teststrategie-und-software-lieferkette.md) verlangt, dass
neue hohe und kritische Schwachstellen blockieren. In der Praxis kann ein Fix
noch fehlen, durch die Veröffentlichungsquarantäne gesperrt sein oder außerhalb
der deklarierten Consumer-Ranges liegen. Ein dauerhaft rotes Gate ohne
Handlungsoption begünstigt pauschale Ausnahmen. Ein stilles Dismissal würde den
Befund dagegen unsichtbar machen und seine spätere Behebung gefährden.

Diese Entscheidung führt deshalb die **automatische, befristete
Zurückstellung** ein. Sie ist ausdrücklich keine automatische
Risikoakzeptanz. Eine Risikoakzeptanz bleibt eine bewusste, dokumentierte
Entscheidung des Projekteigentümers.

## Ziele und Nicht-Ziele

Ziele sind:

- Development bei noch nicht verwendbaren Fixes kontrolliert fortsetzen,
- jeden Befund dedupliziert und fristgebunden verfolgen,
- Fixverfügbarkeit automatisch erkennen und die Bearbeitungsfrist starten,
- kritische, aktiv ausgenutzte, Malware- und erreichbar hohe Befunde weiterhin
  fail-closed behandeln,
- Development Dependencies vollständig im Scope halten.

Nicht-Ziele sind automatische Risikoakzeptanz, permanente Auto-Dismissals,
ungeprüfte Major-Overrides, das Umgehen der Veröffentlichungsquarantäne sowie
eine TST-, PRD-, Release- oder Mergefreigabe.

## Entscheidungskriterien

- Vereinbarkeit mit Governance und ADR-0013,
- keine unsichtbaren oder dauerhaft vergessenen Findings,
- sichere Behandlung unvollständiger Scanner- oder Trackingdaten,
- Wiederverwendung von Dependabot, pnpm-Audit, Trivy und GitHub Issues,
- minimal notwendige Schreibrechte und kein schreibender PR-Workflow,
- nachvollziehbare Rückkehr zum regulären blockierenden Zustand.

## Betrachtete Optionen

1. **Alle Findings blockieren.** Einfach, aber bei fehlender Handlungsoption
   dauerhaft rot und damit anfällig für spätere pauschale Abschwächungen.
2. **Findings automatisch akzeptieren oder dauerhaft dismissen.** Verwirft die
   notwendige Ownerentscheidung und kann Befunde unsichtbar machen. Abgelehnt.
3. **Befristete Zurückstellung mit dedupliziertem Tracking.** Erhält
   Sichtbarkeit, Fristen und automatische Reaktivierung. Angenommen.

## Entscheidung und Begründung

### Verwendbarer Fix

Ein Fix ist erst **verwendbar**, wenn er:

1. veröffentlicht ist,
2. die geltende Veröffentlichungsquarantäne passiert hat,
3. innerhalb der deklarierten Consumer-Ranges regulär auflösbar ist oder ein
   isolierter Kompatibilitätsnachweis einen eng begrenzten Override trägt,
4. ohne Altersausnahme frozen installiert werden kann.

Die bloße Angabe einer `FixedVersion` durch einen Scanner reicht dafür nicht.

### Zustände

| Zustand | Wirkung |
| --- | --- |
| Fix verwendbar | blockierend; Umsetzung und reguläre Verifikation |
| Fix nur quarantänisiert | befristet zurückstellbar bis zum exakten erneuten Prüfzeitpunkt |
| Fix außerhalb der Consumer-Ranges | kurzer isolierter Kompatibilitätsnachweis; kein ungeprüfter Major-Override |
| Kein Fix veröffentlicht | befristet zurückstellbar, wenn Risikoeinordnung und Tracking vollständig sind |
| Ausschlusskriterium erfüllt | keine automatische Zurückstellung; Owner-/Securityentscheidung erforderlich |

Eine automatische Zurückstellung benötigt immer:

- ein offenes dedupliziertes Security-Debt-Issue,
- erfolgreiche technische Scannerläufe,
- Severity, Runtime-/Development-Scope und Patchstatus,
- dokumentierte Erreichbarkeit oder Exposition,
- Grund, ersten und letzten Fund sowie exakten nächsten Prüfzeitpunkt,
- Umsetzungsfrist nach Fixverfügbarkeit.

Fehlt eine dieser Angaben, bleibt der Befund blockierend.

### Ausschlusskriterien

Keine automatische Zurückstellung ist zulässig für:

- `CRITICAL`,
- unbekannte oder unvollständige Severity-Klassifikation,
- Malware,
- nachgewiesene aktive Ausnutzung,
- nachweislich erreichbare `HIGH`-Befunde,
- fehlgeschlagene oder unvollständige Scans,
- abgelaufene Zurückstellungen,
- Findings ohne vollständige Risikoeinordnung oder Tracking.

### Fristen

Nach dem ersten tatsächlich verwendbaren Fix gelten:

| Severity | Umsetzungsfrist |
| --- | --- |
| `CRITICAL` | sofortige Owner-/Securityentscheidung; keine automatische Zurückstellung |
| `HIGH` | innerhalb von zwei Arbeitstagen |
| `MEDIUM` | innerhalb von sieben Kalendertagen oder früher im nächsten Dependency-Schnitt |
| `LOW` | innerhalb von 30 Kalendertagen oder früher im nächsten Wartungsschnitt |

Ohne veröffentlichten Fix wird spätestens erneut geprüft:

- `HIGH` nach zwei Arbeitstagen,
- `MEDIUM` nach sieben Kalendertagen,
- `LOW` nach 30 Kalendertagen.

Bei einer Veröffentlichungsquarantäne enthält das Issue `next_review_at` als
RFC-3339-Zeitpunkt mit Zeitzone. Die Prüfung beginnt beim ersten geplanten Lauf
ab diesem Zeitpunkt und spätestens 60 Minuten danach. Es wird keine
`minimumReleaseAgeExclude`-Ausnahme erzeugt oder übernommen.

### Deduplizierung und Lebenszyklus

Die stabile Identität lautet:

`Advisory oder CVE + Ökosystem + Paket + relevantes Manifest`.

Wenn ein Scanner CVE und GHSA als nachgewiesene Aliase liefert, wird die GHSA
als scannerübergreifende kanonische Kennung bevorzugt. Ohne belegten Alias
werden Kennungen nicht anhand von Titeltext oder Vermutung zusammengeführt.

Zu dieser Identität besteht höchstens ein offenes Issue. Das Issue trägt
mindestens `security`, genau ein `severity:*`-Label und abhängig vom Zustand
`fix-unavailable`, `fix-quarantined`, `fix-ready` beziehungsweise zusätzlich
`security-deferred`.

Ein Issue wird erst geschlossen, wenn ein regulärer erfolgreicher Scan den
Befund nicht mehr meldet. Bei erneutem Fund wird dasselbe Issue wieder geöffnet.
Bei einem verwendbaren Fix wird `fix-ready` gesetzt und die Frist gestartet.

### Verantwortlichkeiten

- Die Synchronisation erkennt, dedupliziert, aktualisiert Termine und
  reaktiviert Findings. Sie trifft keine Risikoakzeptanz.
- Beitragende dokumentieren Erreichbarkeit, führen Kompatibilitätsnachweise und
  Fix-PRs aus und halten die Frist ein.
- Reviewende prüfen Klassifikation, Nachweise, Fristen und Rückkehr zum
  Regelzustand.
- Der Projekteigentümer entscheidet Risikoakzeptanzen, Ausschlussfälle und jede
  Fristabweichung.

## Folgen und Risiken

Der Prozess erzeugt zusätzliche Issues und Automatisierungslogik. Falsch
normalisierte Scannerberichte könnten Findings doppeln oder übersehen. Deshalb
validiert die Synchronisation Eingaben strikt, arbeitet bei Unklarheit
fail-closed und erhält einen Dry-run-Modus sowie Regressionstests.

Dependabots „snooze until a patch is available“ kann später für eng begrenzte,
bereits getrackte Alerts ergänzen. Es ist nicht das führende System, weil es
Trivy, pnpm-Audit, Veröffentlichungsquarantäne und Erreichbarkeit nicht
vollständig abbildet. Permanente Auto-Dismissals bleiben unzulässig.

## Security sowie DEV/TST/PRD

Die Synchronisation läuft ausschließlich aus dem vertrauenswürdigen
Default-Branch. Sie erhält `contents: read`, `security-events: read` und nur für
Issues `issues: write`. Sie läuft nicht über `pull_request_target`, führt keinen
ungeprüften PR-Code mit Schreibrechten aus und erhält keine Umgebungssecrets.

Die Entscheidung betrifft Development und CI. Sie ist keine TST-, PRD-,
Release-, Deployment- oder Mergefreigabe. Development Dependencies bleiben im
Scope, weil Build-, Test-, Browser-, Analyse- und Supply-Chain-Werkzeuge
Repositoryinhalte verarbeiten.

## Migration, Verifikation und Rückbau

Der erste Umsetzungsschnitt führt Dokumentation, Issue-Schema und eine
getrennte Tracking-Synchronisation ein. Das bestehende `quality`-Gate wird noch
nicht abgeschwächt. Solange die Repositoryvariable `SECURITY_DEBT_APPLY` nicht
exakt `true` ist, läuft die Synchronisation nur als Dry-run. Die Aktivierung des
schreibenden Modus erfolgt erst nach geprüftem realem Dry-run und ausdrücklicher
Ownerfreigabe. Eine spätere Gate-Anbindung ist ein eigener reviewbarer Schnitt
und benötigt erneut die ausdrückliche Ownerfreigabe.

Vor dem schreibenden Erstlauf wird ein Dry-run gegen Fixtures und reale
read-only Scannerberichte geprüft. Regressionstests decken Deduplizierung,
Statusübergänge, Fristen, Ausschlusskriterien, Reaktivierung und fail-closed
Eingabevalidierung ab.

Der Rückbau deaktiviert den Synchronisationsworkflow und revertiert seine
Repositorydateien. Bestehende Issues bleiben als Nachweis erhalten und werden
nicht automatisch gelöscht. Ohne funktionierende Synchronisation gelten
Zurückstellungen nicht als nachgewiesen; die regulären Gates bleiben maßgeblich.

## Offene Annahmen

Die erste Synchronisation bewertet Scannerdaten und vorhandene strukturierte
Issueangaben. Vollautomatische Erreichbarkeitsanalyse ist nicht behauptet.
Zeitversetzte GitHub-Schedules können später als geplant starten; die zulässige
Verzögerung ist deshalb auf 60 Minuten begrenzt und wird als Verstoß sichtbar.
