# Initiales Ressourcenbudget

## Status und Geltungsbereich

Dieses Dokument ist das normative initiale Referenz- und Betriebsbudget aus
`OQ-016`. Es enthält keine privaten Hardwaredetails. Die Produktfrage ist
entschieden; die technische Eignung der privaten Referenzhardware muss vor
PRD-Freigabe in AP-11 und TST nachgewiesen werden. Grundlage ist
[ADR-0016](decisions/ADR-0016-initiales-ressourcenbudget-und-oq-016.md).

## Referenzprofil

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

## Referenz-PDF

| Merkmal | Wert |
| --- | ---: |
| typische Testgröße | 10 MiB |
| großes Referenz-PDF | 25 MiB |
| maximaler MVP-Upload | 50 MiB |
| maximale Seitenzahl | 300 |

## Referenzverbindungen

Normale Verbindung:

- 25 Mbit/s Download,
- 5 Mbit/s Upload,
- 50 ms Round-Trip,
- höchstens 0,5 % Paketverlust.

Eingeschränkte Verbindung:

- 5 Mbit/s Download,
- 1 Mbit/s Upload,
- 150 ms Round-Trip,
- bis 1 % Paketverlust.

## PRD-Hostbudget einschließlich Observability

| Ressource | Grenze |
| --- | ---: |
| CPU-Auslastung, p95 über 15 Minuten | höchstens 60 % |
| CPU-Auslastung über fünf Minuten | nicht dauerhaft über 85 % |
| dauerhaft belegter Arbeitsspeicher | höchstens 65 % des Hosts |
| kurzfristiger Speicherpeak | höchstens 75 % |
| freie Hostreserve | mindestens 20 % und mindestens 4 GiB |
| freie Kapazität je Produktdatenvolume | mindestens 25 % |
| I/O-Wait, p95 unter Referenzlast | höchstens 10 % |

Zusätzlich gelten:

- kein dauerhaftes Swapping durch SoSeBaMa,
- keine OOM-Beendigung,
- keine dauerhaft wachsenden Prozesse oder Queues,
- mindestens 15 % Hostreserve bei gleichzeitigem TST- und PRD-Betrieb,
- keine Aussage über ausreichende, noch nicht qualifizierte Hardware,
- Containerlimits nach TST-Messung: gemessener Peak plus 20 % technische
  Reserve innerhalb des Host- und Umgebungsbudgets.

## Fachlicher Zentralbestand je Umgebung

| Bereich | Initiale Obergrenze |
| --- | ---: |
| Binärspeicher | 100 GiB |
| PostgreSQL | 20 GiB |
| Uploadquarantäne | 5 GiB |
| temporäre Verarbeitung | 5 GiB |

## Telemetrie

PRD:

| Bereich | Aufbewahrung |
| --- | ---: |
| Metriken | 30 Tage |
| Betriebslogs | 14 Tage |
| Traces | 72 Stunden |
| gesamtes Telemetrievolume | 25 GiB |

TST:

| Bereich | Aufbewahrung |
| --- | ---: |
| Metriken | 14 Tage |
| Betriebslogs | 14 Tage |
| Traces | 7 Tage |
| gesamtes Telemetrievolume | 25 GiB |

TST und PRD verwenden getrennte Telemetriespeicher und Identitäten. Die
PRD-Traceaufbewahrung benötigt eine von Tempo unterstützte und gesicherte
Ablage. Eine ungeeignete lokale Ablage erfüllt das Ziel nicht.

## Speicherwarnungen

- Warnung bei 70 %,
- kritisch bei 85 %,
- kontrollierte Ablehnung neuer großer Uploads spätestens bei 90 %,
- bestehende Inhalte und administrative Bereinigung bleiben erreichbar.

## Workerparallelität und Hintergrundziele

| Arbeitsart | Parallelität |
| --- | ---: |
| PDF-Prüfung | 1 |
| Binärdateiverarbeitung | 1 |
| endgültige Löschung | 1 |
| leichte allgemeine Jobs | 4 |
| Audit- und Retention-Batches | 1 |

- Ein normaler Job beginnt p95 innerhalb von 60 Sekunden.
- Eine Referenz-PDF-Prüfung endet p95 innerhalb von 60 Sekunden.
- Eine überfällige endgültige Löschung beginnt spätestens innerhalb von fünf
  Minuten.
- API-Latenz hat Vorrang vor Hintergrunddurchsatz.
- Backpressure und Jobstau sind sichtbar.

## Synchronisationsbudget

Je Gerätesitzung:

| Größe | Grenze |
| --- | ---: |
| gleichzeitig laufende Synchronisationen | 1 |
| Befehle pro Paket | 100 |
| strukturierte Nutzdaten pro Paket | 10 MiB |
| Änderungen pro Pull-Seite | 500 |
| parallele Dateiübertragungen | 1 |

Referenzszenario:

- zehn Geräte mit jeweils 100 lokalen Befehlen,
- höchstens fünf gleichzeitig synchronisierende Geräte,
- kontrollierte Backpressure für weitere Geräte,
- keine PDFs in strukturierten Befehlspaketen.

## Verifikation und Änderungsregel

AP-01 bis AP-10 dürfen umgesetzt werden. PRD bleibt ohne erfolgreichen
AP-11-Ressourcennachweis gesperrt. TST misst Referenzlast, beide
Netzbedingungen, PDF-Verarbeitung, Synchronisation, Speicher, Telemetrie,
gleichzeitigen TST-/PRD-Betrieb und Containerpeaks.

Ein nicht bestandener Test führt zu Optimierung oder Kapazitätsanpassung.
Qualitätsziele werden nicht still abgesenkt. Jede Budgetänderung benötigt
Begründung, Messwerte und erneute TST-Verifikation.
