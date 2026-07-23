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

Neue ausführbare Skripte benötigen zusätzlich eine foolproof Anleitung,
Fehlerbehandlung, sichere Standardwerte und passende statische Prüfungen.
