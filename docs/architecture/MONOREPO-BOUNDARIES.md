# Workspace- und Importgrenzen

- Eigentümer: Projekteigentümer
- Letzter Prüfstand: 2026-08-02
- Bezogenes Issue: [#12](https://github.com/tomas-fuerl/SoSeBaMa/issues/12)

## Ziel und Geltungsbereich

Diese Grenze hält Clientcode, öffentliche Verträge, serverinterne
Konfiguration und spätere Fachmodule auseinander. Sie gilt für lokales DEV,
GitHub-hosted CI, TST und PRD. Web, API und Worker enthalten minimale technische
Starts; fachlicher Quellcode bleibt ausgeschlossen.

## Workspace-Matrix

| Workspace | Zweck | Zulässige Zielgruppe |
| --- | --- | --- |
| `apps/web` | clientseitige React-PWA | Browser |
| `apps/api` | serverseitige HTTP-API | Node.js |
| `apps/worker` | serverseitige Hintergrundarbeit | Node.js |
| `packages/contracts` | öffentliche technische Verträge | Browser, API, Worker |
| `packages/validation` | Validierung öffentlicher Verträge | Browser, API, Worker |
| `packages/config` | validierte Umgebungs- und Laufzeitkonfiguration | nur API und Worker |
| `packages/testing` | Testfabriken und Testhilfen | nur Tests |
| `packages/eslint-config` | gemeinsame statische Regeln | Entwicklungswerkzeug |
| `packages/typescript-config` | gemeinsame TypeScript-Basis | Entwicklungswerkzeug |

Ein generisches Paket namens `shared`, `common`, `helpers` oder `utils` ist
nicht zulässig. Neue Pakete benötigen einen eindeutigen Zweck und eine benannte
Zielgruppe.

## Verbindliche Importregeln

1. `apps/web` darf öffentliche Verträge und deren Validierung importieren.
2. `apps/web` darf weder `apps/api`, `apps/worker`, `packages/config`, Prisma
   noch interne Unterpfade anderer Pakete importieren.
3. Serverinterne Modelle, Autorisierungslogik, Auditdetails und Secrets werden
   niemals über Clientpakete exportiert.
4. API und Worker dürfen gemeinsame öffentliche Verträge und serverseitige
   Konfiguration verwenden, aber nicht über internes HTTP miteinander
   kommunizieren.
5. Spätere Fachmodule exportieren ausschließlich ihre öffentliche Fassade.
   Interne Ordner anderer Module bleiben verboten.

Die aktuelle ESLint-Konfiguration erzwingt die Clientverbote aus den Punkten 1
bis 3 für JavaScript- und TypeScript-Clientdateien unter `apps/web`. Die
vollständigen Fachmodul-, Zyklen- und Fassadentests folgen in
[Issue #14](https://github.com/tomas-fuerl/SoSeBaMa/issues/14), sobald
Quellmodule existieren.

## Verifikation

```sh
pnpm lint
pnpm typecheck
```

Beide Befehle müssen mit Exit-Code `0` enden. Ein verbotener Clientimport muss
die ESLint-Prüfung fehlschlagen lassen. Regeln werden nicht durch lokale
VS-Code-Einstellungen ersetzt oder abgeschwächt.

## Security und Umgebungen

Die Paketstruktur enthält keine Secrets oder Umgebungswerte. DEV, TST und PRD
verwenden später dieselben Quellen, aber getrennte validierte Konfigurationen
und Secrets. PRD erhält keine Debugkonfiguration oder Clientexporte
serverinterner Werte.

## Fehlerbehandlung und Rollback

Bei einer unklaren Zielgruppe wird kein neues Paket angelegt. Die Verantwortung
wird zuerst im Issue oder, bei einer Architekturänderung, in einem ADR geklärt.
Das leere Grundgerüst kann ohne Daten- oder Laufzeitfolgen revertiert werden.
