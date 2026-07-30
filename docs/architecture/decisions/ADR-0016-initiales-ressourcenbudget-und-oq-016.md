# ADR-0016: Initiales Ressourcenbudget und OQ-016

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: Keines – dokumentierte Ownerentscheidung vom 2026-07-30

## Kontext und Problem

`OQ-016` benötigte messbare Referenzlasten, Speichergrenzen und
Betriebsbudgets. Private Hardwaredetails dürfen nicht veröffentlicht werden.
Die Produktfrage muss geschlossen werden, ohne die reale TST-Qualifikation
vorwegzunehmen.

## Ziele und Nicht-Ziele

Ziele sind ein vollständiges initiales Referenz- und Hostbudget, messbare
Backpressure und eine klare PRD-Sperre bis zum Ressourcennachweis. Eine Aussage
über konkrete private Hardware, garantierte Kapazität ohne Messung oder stille
Absenkung von Qualitätszielen ist kein Ziel.

## Entscheidungskriterien

- Abdeckung des erwarteten ersten Betriebs,
- messbare Last-, Speicher- und Latenzgrenzen,
- Reserve für TST, PRD und Observability,
- sichere Reaktion auf Kapazitätsengpässe,
- Wiederholbarkeit und Anpassbarkeit nach TST-Messung.

## Betrachtete Optionen

1. **Status quo:** `OQ-016` bleibt offen; Implementierung und PRD-Qualifikation
   haben keine Referenzlast.
2. **Angenommen:** Initiales öffentliches Budget ohne Hardwareidentifikatoren,
   mit verbindlicher TST-Verifikation vor PRD.
3. **Alternative:** Budget ausschließlich aus privaten Hardwaredaten ableiten.
   Dies wäre nicht portabel, nicht öffentlich dokumentierbar und würde
   Qualitätsziele mit einem Einzelgerät verwechseln.

## Entscheidung und Begründung

Das vollständige normative Budget steht im
[Ressourcenbudget](../RESOURCE-BUDGET.md). Das initiale Referenzprofil ist:

| Größe | Referenzwert |
| --- | ---: |
| aktive Benutzerkonten | 100 |
| gleichzeitig angemeldete Benutzer | 20 |
| gleichzeitig aktive Bearbeitungssitzungen | 5 |
| gleichzeitig synchronisierende Geräte | 5 |
| reguläre Bands | bis 10 |
| Songs | 5.000 |
| Inhalte beziehungsweise PDFs | 5.000 |
| Overlays | 10.000 |
| Setlists | 500 |
| simultane schwere PDF-Prüfungen | 1 |

Referenz-PDFs:

| Merkmal | Wert |
| --- | ---: |
| typische Testgröße | 10 MiB |
| großes Referenz-PDF | 25 MiB |
| maximaler MVP-Upload | 50 MiB |
| maximale Seitenzahl | 300 |

Normale Referenzverbindung: 25 Mbit/s Download, 5 Mbit/s Upload, 50 ms
Round-Trip und höchstens 0,5 % Paketverlust. Eingeschränkte
Referenzverbindung: 5 Mbit/s Download, 1 Mbit/s Upload, 150 ms Round-Trip und
bis 1 % Paketverlust.

Das PRD-Hostbudget einschließlich Observability ist:

| Ressource | Grenze |
| --- | ---: |
| CPU-Auslastung, p95 über 15 Minuten | höchstens 60 % |
| CPU-Auslastung über fünf Minuten | nicht dauerhaft über 85 % |
| dauerhaft belegter Arbeitsspeicher | höchstens 65 % des Hosts |
| kurzfristiger Speicherpeak | höchstens 75 % |
| freie Hostreserve | mindestens 20 % und mindestens 4 GiB |
| freie Kapazität je Produktdatenvolume | mindestens 25 % |
| I/O-Wait, p95 unter Referenzlast | höchstens 10 % |

SoSeBaMa darf kein dauerhaftes Swapping, keine OOM-Beendigung und keine
dauerhaft wachsenden Prozesse oder Queues verursachen. Bei gleichzeitigem TST-
und PRD-Betrieb bleiben mindestens 15 % Hostreserve. Nicht qualifizierte
Hardware gilt nicht als ausreichend. Containerlimits werden nach TST-Messung
als gemessener Peak plus 20 % technische Reserve innerhalb des Host- und
Umgebungsbudgets gesetzt.

Fachlicher Zentralbestand je Umgebung:

| Bereich | Initiale Obergrenze |
| --- | ---: |
| Binärspeicher | 100 GiB |
| PostgreSQL | 20 GiB |
| Uploadquarantäne | 5 GiB |
| temporäre Verarbeitung | 5 GiB |

PRD-Telemetrie:

| Bereich | Aufbewahrung |
| --- | ---: |
| Metriken | 30 Tage |
| Betriebslogs | 14 Tage |
| Traces | 72 Stunden |
| gesamtes Telemetrievolume | 25 GiB |

TST-Telemetrie:

| Bereich | Aufbewahrung |
| --- | ---: |
| Metriken | 14 Tage |
| Betriebslogs | 14 Tage |
| Traces | 7 Tage |
| gesamtes Telemetrievolume | 25 GiB |

Speicherwarnungen erfolgen bei 70 %, kritisch bei 85 %. Neue große Uploads
werden spätestens bei 90 % kontrolliert abgelehnt. Bestehende Inhalte und
administrative Bereinigung bleiben erreichbar.

Workerparallelität:

| Arbeitsart | Parallelität |
| --- | ---: |
| PDF-Prüfung | 1 |
| Binärdateiverarbeitung | 1 |
| endgültige Löschung | 1 |
| leichte allgemeine Jobs | 4 |
| Audit- und Retention-Batches | 1 |

Ein normaler Job beginnt p95 innerhalb von 60 Sekunden. Eine Referenz-PDF-
Prüfung endet p95 innerhalb von 60 Sekunden. Überfällige endgültige Löschung
beginnt spätestens innerhalb von fünf Minuten. API-Latenz hat Vorrang vor
Hintergrunddurchsatz; Backpressure und Jobstau sind sichtbar.

Synchronisationsbudget je Gerätesitzung:

| Größe | Grenze |
| --- | ---: |
| gleichzeitig laufende Synchronisationen | 1 |
| Befehle pro Paket | 100 |
| strukturierte Nutzdaten pro Paket | 10 MiB |
| Änderungen pro Pull-Seite | 500 |
| parallele Dateiübertragungen | 1 |

Das Referenzszenario verwendet zehn Geräte mit jeweils 100 lokalen Befehlen.
Höchstens fünf Geräte synchronisieren gleichzeitig; weitere Geräte erhalten
kontrollierte Backpressure. PDFs werden nicht in strukturierte Befehlspakete
eingebettet.

`OQ-016` erhält den Status:
`Entschieden – initiales Betriebsbudget; Verifikation auf der privaten
Referenzhardware vor PRD-Freigabe erforderlich.`

Die Produktfrage ist geschlossen. AP-01 bis AP-10 dürfen umgesetzt werden. PRD
bleibt ohne erfolgreichen AP-11-Ressourcennachweis gesperrt. Private
Hardwaredetails bleiben außerhalb des Repositorys. Ein nicht bestandener Test
führt zu Optimierung oder Kapazitätsanpassung, nicht zur stillen Absenkung von
Qualitätszielen. Budgetänderungen benötigen Begründung, Messwerte und erneute
TST-Verifikation.

## Folgen und Risiken

Das Budget ist eine initiale Ober- und Referenzgrenze, keine
Hardwaregarantie. Observability konkurriert um Hostressourcen und ist
einbezogen. Backpressure begrenzt Spitzen, kann aber Wartezeiten sichtbar
erhöhen.

Hardwareunabhängige Messgrößen verbessern Portabilität. Synthetische
Referenzdaten, PDFs und Netzprofile ermöglichen reproduzierbare TST- und
Performanceprüfungen.

Die Testbarkeit des Budgets entsteht durch feste Lastannahmen, reproduzierbare
TST-Messungen und dokumentierte Freigabegrenzen für jede relevante Ressource.

## Security sowie DEV/TST/PRD

Messdaten und Berichte enthalten keine privaten Hardwareidentifikatoren,
Domains, Hosts, Pfade oder Secrets. DEV dient früher Beobachtung. TST
qualifiziert das Budget mit getrennten Daten und Identitäten. PRD bleibt bis
zum erfolgreichen AP-11-Nachweis gesperrt und besitzt keine Diagnosewege.

## Migration, Verifikation und Rückbau

AP-01 bis AP-10 implementieren Messpunkte und begrenzte Parallelität. AP-11
führt Last-, Speicher-, Netzwerk-, PDF-, Synchronisations-, Retention- und
gleichzeitige TST-/PRD-Reservetests auf der privaten Referenzhardware aus.

Budgets werden nicht still überschrieben. Eine Änderung benötigt Messwerte,
Begründung, erneute TST-Verifikation und ein ersetzendes oder aktualisierendes
ADR nach den Statusregeln. Bei Nichtbestehen werden Implementierung optimiert
oder Kapazität angepasst; PRD bleibt gesperrt.

## Offene Annahmen

Die private Referenzhardware kann das Budget möglicherweise erfüllen. Ihre
Eignung ist ausdrücklich noch nicht technisch nachgewiesen.
