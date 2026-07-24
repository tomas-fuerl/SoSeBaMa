# Reuse-first-Automatisierungsstandard

## Grundsatz

Vor jedem neuen Skript, Werkzeug oder Automatisierungsschritt wird geprüft, ob
eine vorhandene Lösung unverändert wiederverwendet oder klein erweitert werden
kann. Neuerstellung ist die letzte Option.

## Verbindlicher Ablauf

1. **Bedarf beschreiben:** Ein- und Ausgabe, Auslöser, Umgebung,
   Sicherheitsgrenze und Erfolgskriterium festhalten.
2. **Bestand suchen:** Repository, bestehende Betriebsdokumentation und
   freigegebene gemeinsame Lösungen nach vergleichbarer Funktion durchsuchen.
3. **Kandidaten bewerten:** Funktion, Wartbarkeit, Lizenz, Sicherheit,
   Umgebungsisolation und Erweiterbarkeit vergleichen.
4. **Wiederverwenden:** Einen geeigneten Kandidaten bevorzugt unverändert
   einsetzen.
5. **Erweitern:** Fehlt nur ein kleiner Teil, die bestehende Lösung kompatibel
   und reviewbar ergänzen.
6. **Neu erstellen:** Nur wenn Wiederverwendung und Erweiterung sachlich
   ausscheiden; Gründe im Issue und Pull Request dokumentieren.
7. **Konsolidieren:** Entstehende Duplikate entfernen oder eine geplante
   Ablösung mit Eigentümer und Termin festhalten.

## Nachweis im Pull Request

Der Reuse-first-Abschnitt nennt:

- verwendete Suchbegriffe und geprüfte Fundstellen,
- wiederverwendete oder erweiterte Lösung,
- bei Neuerstellung die ausgeschlossenen Alternativen und Gründe,
- Verantwortliche für Wartung und Dokumentation.

„Nichts gefunden“ ohne nachvollziehbaren Suchumfang ist kein ausreichender
Nachweis. Sicherheits- oder Lizenzrisiken können Wiederverwendung ausschließen,
müssen aber konkret benannt werden.

## Mindeststandard für wiederverwendbare Automatisierung

Ein normales Skript benötigt nicht automatisch ein ADR. Ein ADR ist nur nötig,
wenn die Automatisierung selbst eine Entscheidung nach den Kriterien des
[ADR-Verfahrens](ADR.md) einführt.

Neue Skripte und andere wiederverwendbare Automatisierungen müssen mindestens:

- einen klaren, langfristigen Zweck besitzen,
- über Parameter statt eingebetteter Umgebungswerte anpassbar sein,
- soweit technisch möglich idempotent sein,
- eine verständliche `--help`-Ausgabe besitzen,
- sichere Standardwerte verwenden,
- definierte und dokumentierte Exit-Codes besitzen,
- Fehler eindeutig und handlungsorientiert melden,
- passende Tests oder statische Prüfungen besitzen,
- in einer Anleitung nach dem
  [Foolproof-Dokumentationsstandard](DOCUMENTATION-STANDARD.md) dokumentiert
  sein.

## Keine Ad-hoc-Duplikation

Ad-hoc- und Einmalskripte werden nicht erzeugt, wenn dieselbe Aufgabe mit einem
vorhandenen Werkzeug oder über einen stabilen Repository-Einstiegspunkt
ausführbar ist. Eine einmalige Befehlsfolge ist kein Grund, bereits vorhandene
Automatisierungslogik zu duplizieren.

Arbeitspakete rufen langfristig bevorzugt vorhandene Repository-Kommandos auf,
statt deren Logik oder lange Befehlsfolgen wiederholt neu zu formulieren. Das
verbessert die Nachvollziehbarkeit, erhöht die Konsistenz zwischen Ausführungen
und reduziert den Tokenverbrauch in AI-gestützten Arbeitsabläufen.
