# ADR-0007: PDF-Verarbeitung und Annotationen

- Status: Angenommen
- Datum: 2026-07-30
- Eigentümer: Projekteigentümer
- Bezogenes Issue: #7 – nachträglich angelegtes Tracking- und Abnahme-Issue; Ownerentscheidung vom 2026-07-30

## Kontext und Problem

PDFs sind der MVP-Basisinhalt. Darstellung, Annotation, Uploadprüfung,
Auslieferung und Offlineübergabe müssen aktive Inhalte abwehren und große
Dokumente ressourcenschonend behandeln.

## Ziele und Nicht-Ziele

Ziele sind sichere PDF-Anzeige, ein eigener Overlayeditor, strikte
Quarantäneprüfung und atomare Overlay-Speicherung. Ein vollständiger generischer
PDF.js-Viewer, OCR, CDR, Rasterisierung, resumierbarer Upload und pixelweises
Teilradieren sind keine MVP-Ziele.

## Entscheidungskriterien

- Angriffsschutz und Isolation,
- korrekte zoomunabhängige Annotationen,
- Speicher- und Renderingeffizienz,
- kontrollierte Auslieferung und Offlinefähigkeit,
- Testbarkeit mit ungefährlichem Korpus.

## Betrachtete Optionen

1. **Status quo:** Kein festgelegter PDF-Pfad.
2. **Angenommen:** PDF.js Core/Display mit eigenem Overlay, strikter
   Quarantäne und isoliertem qpdf-Prüfer.
3. **Alternative:** Browser-`iframe` oder vollständiger PDF.js-Viewer mit
   nachträglicher Bereinigung. Dies vergrößert aktive Funktions- und
   Angriffsfläche.

## Entscheidung und Begründung

Die PWA verwendet `pdfjs-dist` über die PDF.js Core-/Display-API, nicht den
generischen vollständigen Viewer. Ein dedizierter PDF.js-Web-Worker rendert nur
sichtbare und angrenzende Seiten; Canvasressourcen werden freigegeben.

XFA, PDF-JavaScript, Eval, Formulareingaben, Launch- und eingebettete Aktionen
sowie externe Links sind im MVP deaktiviert. PDF wird weder per `iframe`,
`object` noch `embed` dargestellt.

Der SoSeBaMa-Overlayeditor verwendet `react-konva` auf einem getrennten Canvas
über der PDF-Seite. Koordinaten werden in PDF-Punkten und unabhängig vom Zoom
gespeichert. Jedes Overlayelement besitzt UUIDv7. Der MVP unterstützt die
festgelegten Produktwerkzeuge. Der Radierer löscht ganze Objekte; pixelweises
Teilradieren gehört nicht zum MVP.

Ein Overlay ist fachlich ein Objekt mit einer Gesamtrevision. Eine technische
Aufteilung nach PDF-Seite in begrenztem JSONB ist zulässig.

Uploads durchlaufen eine mehrstufige Quarantäne. SHA-256 wird während des
Uploads berechnet. Der PDF-Prüfer verwendet eine versionierte strikte Allowlist
mit Default-Deny-Regel. Akzeptiert werden ausschließlich ausdrücklich
unterstützte und sicher klassifizierte PDF-Strukturen und -Merkmale. Unbekannte,
nicht unterstützte, nicht sicher klassifizierbare, aktive, beschädigte oder
reparaturbedürftige Strukturen werden abgelehnt. Eine bloße Blocklist oder die
Formulierung `insbesondere` ersetzt diese Sicherheitsgrenze nicht. qpdf und
PDF.js liefern die technischen Prüfsignale. Die unveränderten
Ablehnungsbeispiele sind:

- verschlüsselte oder passwortgeschützte PDFs,
- JavaScript, Dokument- und Launch-Aktionen,
- Attachments, eingebettete Dateien und Portfolios,
- Rich Media, Audio, Video und 3D,
- XFA und interaktive Formulare,
- externe Datei- oder Streamreferenzen,
- beschädigte oder nur reparierbare Dateien,
- PDFs ohne nutzbare Seite,
- Dateien oberhalb festgelegter Größen-, Seiten- oder Komplexitätsgrenzen.

Es gibt im MVP keine automatische Umschreibung, Rasterisierung, OCR oder CDR
und keinen verpflichtenden zusätzlichen Virenscanner. Ein isolierter
zustandsloser PDF-Prüfcontainer besitzt keinen Datenbankzugang, keine
App-Sitzungen, keine Secrets und keinen Internetzugang. Ressourcen sind
begrenzt; er liefert nur einen sicheren Prüfbericht.

Das Backend stellt einen autorisierten Same-Origin-Endpunkt für `GET`, `HEAD`
und Range bereit. Sichere Cache- und Content-Header sind verpflichtend. Offline
erhält PDF.js entschlüsselte Daten ausschließlich als `Uint8Array`.

Während der Bearbeitung bleibt der verschlüsselte lokale Entwurf kontinuierlich
erhalten. Serverseitiges Speichern erfolgt bewusst, nicht als stilles Autosave,
und atomar für alle geänderten Seiten.

Eine PDF darf bei vorhandenen Overlays nur ersetzt werden, wenn Seitenanzahl und
Seitengeometrie kompatibel sind. Eine inkompatible PDF erzeugt einen neuen
Inhalt; fremde Overlays werden weder automatisch umgerechnet noch gelöscht.

## Folgen und Risiken

Strikte Ablehnung reduziert Kompatibilität mit komplexen PDFs, hält die
Angriffsfläche aber überprüfbar. qpdf allein ist kein Virenscanner; die
Entscheidung wird bei geänderter Bedrohungslage überprüft. Große Dokumente
benötigen Ressourcenlimits und Fortschrittsanzeige.

PDF-Punktkoordinaten und getrennte Object-Store-Schnittstellen erhalten
Portabilität. Ein synthetisches PDF-Korpus ermöglicht reproduzierbare
Positiv-, Negativ- und Performanceprüfungen.

Der Betrieb muss PDF-Prüfung, Renderfehler und deaktivierte strenge
PDF-Funktionen sichtbar machen, ohne Originaldateien in Logs zu übernehmen.

## Security sowie DEV/TST/PRD

Nur das Backend erreicht Quarantäne und Binärvolume. Der Validator hat weder
Internet noch Datenbank, Secrets oder App-Sitzungen. Jede Umgebung besitzt
eigene Volumes und Identitäten. DEV und geschütztes TST dürfen sichere
Prüfdetails zeigen; PRD liefert nur datensparsame Fehlercodes und keine
Debugroute.

## Migration, Verifikation und Rückbau

AP-04 und AP-06 implementieren Upload, Anzeige und Overlays. Das Testkorpus
prüft die versionierte Allowlist, Default-Deny für unbekannte Strukturen, alle
Ablehnungsarten, Range, Header, Rendering, Speicherfreigabe, Geometrie,
atomaren Save, Offlineübergabe und inkompatiblen Ersatz. Ressourcenlimits
werden mit den Referenz-PDFs in TST verifiziert.

Eine andere Rendering- oder Prüfkomponente benötigt ein ersetzendes ADR und
muss denselben Korpus mindestens gleich streng bestehen. Overlaydaten bleiben
in PDF-Punkten exportierbar; ein Rückbau deaktiviert Upload oder Bearbeitung,
ohne vorhandene Daten still umzuschreiben.

## Offene Annahmen

qpdf und PDF.js können die strikte Allowlist und Default-Deny-Grenze
einschließlich Erkennung beziehungsweise Deaktivierung der festgelegten aktiven
Merkmale zuverlässig durchsetzen. Dies bleibt ein blockierender technischer
Eignungsnachweis vor der Implementierung von AP-04.
