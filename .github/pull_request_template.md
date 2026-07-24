## Ziel

<!-- Welches Issue und welches konkrete Ergebnis deckt dieser PR ab? -->

Closes #

> Checklistenregel: Jeden Punkt entweder abhaken oder direkt darunter mit
> `Nicht anwendbar: <Begründung>` kennzeichnen. Unmarkierte Punkte ohne
> Begründung sind nicht ausreichend.

## Änderungen

<!-- Geänderte Dateien und fachliche Wirkung vollständig, aber knapp nennen. -->

## Prüfungen

<!-- Ausgeführte Befehle und Ergebnisse eintragen. Nicht ausgeführte Prüfungen begründen. -->

- [ ] `git status --short` geprüft
- [ ] `git diff --check` ohne Befund
- [ ] Relative Markdown-Links geprüft
- [ ] Konfliktmarker geprüft
- [ ] Secrets, reale Domains, IP-Adressen und lokale Infrastrukturwerte geprüft
- [ ] Passende Lint-, Typ-, Test- und Build-Prüfungen ausgeführt oder als nicht
      anwendbar begründet

## Nicht ausgeführte Prüfungen

<!-- Prüfung, Grund, Risiko und gegebenenfalls verantwortliche Person sowie -->
<!-- geplanten Nachholtermin nennen. „Nicht anwendbar“ immer begründen. -->

## Security und Umgebungen

- [ ] Keine Secrets oder vertraulichen Infrastrukturwerte enthalten
- [ ] DEV, TST und PRD bleiben getrennt
- [ ] PRD besitzt keine Debugports, Debugtunnel oder Debugschnittstellen
- [ ] Nutzer-Clients erreichen App-Backend beziehungsweise BFF nicht direkt
- [ ] App-Reverse-Proxy erreicht nur vorgesehene Anwendungsendpunkte des
      App-Backends beziehungsweise BFF
- [ ] Nur das App-Backend erreicht die Datenbank derselben Umgebung; die
      Datenbank hat keinen öffentlichen Endpunkt
- [ ] Ausgehender code-server-Zugriff bleibt auf definierte SSH-/Debugwege zu
      DEV begrenzt
- [ ] Öffentliche Erreichbarkeit erzeugt keine impliziten Zugriffsrechte

## Reuse-first

<!-- Welche vorhandenen Lösungen wurden gesucht, wiederverwendet oder erweitert? -->

- [ ] Reuse-first-Prüfung dokumentiert
- [ ] Neue Skripte oder Automatisierungen sind begründet

## Dokumentation und Entscheidungen

- [ ] Betroffene Dokumentation ist foolproof aktualisiert
- [ ] Technologieentscheidungen sind technologieoffen bewertet und als ADR
      dokumentiert
- [ ] Ausnahmen enthalten eine dokumentierte Eigentümerentscheidung

## Daten- und Migrationsfolgen

<!-- Auswirkungen auf Daten, Datenformate, Migrationen und Rückwärtskompatibilität nennen. -->

- [ ] Datenfolgen sind beschrieben
- [ ] Erforderliche Migrationen und ihre Verifikation sind beschrieben

## Rollback

<!-- Sicheren Rückweg, Abbruchkriterien und verantwortliche Person nennen. -->

- [ ] Rollback ist beschrieben und praktisch ausführbar

## Ergebnisprotokoll

- [ ] Lokales, ignoriertes `TASK-RESULT.md` ist aktualisiert und nicht committed

<!-- Pfad, relevante Ergebnisse und verbleibende Abweichungen nennen. -->

## Annahmen und Risiken

<!-- Offene Annahmen und verbleibende Risiken nennen. -->
