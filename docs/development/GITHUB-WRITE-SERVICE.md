# GitHub-Schreibdienst unter macOS

Der lokale Dienst führt freigegebene GitHub-Aktionen unter der App-Identität
aus und gibt ausschließlich einen Status und bei Erfolg eine GitHub-Objekt-ID
zurück. Diese Anleitung gilt für den Entwicklungszugang DEV von SoSeBaMa.
TST braucht eine eigene Installation und Freigabe für Live-Tests. PRD ist
außerhalb des Geltungsbereichs. Der eingecheckte Code enthält weder Konfiguration
noch einen Autostart. Grundlage sind [ADR-0019](../architecture/decisions/ADR-0019-lokale-entwicklungszugaenge.md)
und die [Projekt-Governance](../GOVERNANCE.md). Der technische Entwurf steht im
[vorgeschlagenen ADR-0020](../architecture/decisions/ADR-0020-github-schreibdienst.md).

## Architektur und Optionen

Bewertet wurden Atomizität des Branchupdates, Rechtebegrenzung, zusätzlicher
Betriebsaufwand, Wiederverwendbarkeit und Prüfbarkeit.

| Option | Bewertung |
| --- | --- |
| Status quo mit Nur-Lese-Broker und Einzelfreigaben | Bestehender Rückfallweg. Kein technisch begrenzter autonomer Schreibpfad. |
| Git-Transport im Eigentümerprozess | Git-Objekte und normale Pushes wären möglich. Der Dienst müsste fremde Repositories, Git-Konfiguration, Hooks, Helper, Protokolloptionen und den Transport sicher kontrollieren. Die notwendige Validierung und Isolation vergrößert die Angriffsfläche. |
| REST Git Data API | Blob, Tree, Commit und Ref erfordern mehrere Mutationen und jeweils eine Autorisierungsprüfung. Der Ref-Endpunkt bietet einen Fast-forward-Schutz. Teilfehler können lose Git-Objekte hinterlassen. |
| Feste REST-Operationen und GraphQL `createCommitOnBranch` | Eine Mutation legt den Commit an und aktualisiert den Entwicklungsbranch mit `expectedHeadOid`. Der Dienst verarbeitet Dateiänderungen und braucht weder lokale Git-Repositories noch Git-Authentifizierung. Einfache API-Oberfläche mit Node-Standardbibliothek. GitHub erstellt die Commit-Identität. |

Der lokale Entwurf verwendet die letzte Option. Ein Commit entspricht einem
Dateiänderungssatz auf dem angegebenen GitHub-Branch-Head. Eine lokale
Commit-Historie, Dateimodi, Symlinks, Submodule und Merge-Commits sind kein
Teil des Schnittstellenvertrags. Draft-PRs werden angelegt. Metadatenpflege
bestehender Drafts bleibt im Einzelfreigabeverfahren, da die Bearbeitung
zuvor gelesener Drafts mit einer gleichzeitigen Eigentümeraktion konkurriert.
Siehe [GitHub Commit-Mutation](https://docs.github.com/en/graphql/reference/commits#createcommitonbranchinput).

Das Eigentümerkonto ist die Vertrauensgrenze für den Prozess. Der Broker-Signer
bleibt der Aussteller der App-JWTs. Ein owner-only Adapter stellt die vorhandene
Signierung als `signAppJwt()` bereit. Der Server mintet genau ein auf das
Repository und die Operationsklasse beschränktes Installationstoken pro
Aktion. Er widerruft es vor der Abschlussantwort. Der bisherige Lesebroker
bleibt der normale Lesezugang. Der vorbereitete schreibende Credential-Export
bleibt aus. Die Akzeptanz der Gestaltung von der Signer-Anbindung bis zum
Notstopp steht aus. Siehe [Token-Ausstellung](https://docs.github.com/en/rest/apps/apps#create-an-installation-access-token-for-an-app)
und [Einzelwiderruf](https://docs.github.com/en/rest/apps/installations#revoke-an-installation-access-token).

## Vorbereitung und Konfiguration

Voraussetzungen sind ein freigegebenes und abgesichertes macOS-DEV-Gerät,
getrennte Eigentümer- und Codex-Konten, Node gemäß `.node-version`, eine
dedizierte Client-Gruppe und ein eigentümerkontrollierter Broker-Signer.
Für TST ist vor Tests mit GitHub eine gesonderte, befristete Testfreigabe
erforderlich. Der öffentliche Repositoryname ist fest im Modul
`policy.mjs` vorgegeben. Für einen Live-TST-Nachweis ist eine eigens
geprüfte und ausschließlich auf das TST-Repository gerichtete Kopie
mit angepasst fest verdrahtetem Repository erforderlich.

1. Führe im Checkout `pnpm test:github-writer` aus. Die Tests verwenden
   synthetische Nachweise und Zugangsdaten. Erwartet werden ausschließlich
   bestandene Tests. Dieser Schritt aktiviert keinen Dienst.
2. Prüfe als Eigentümer den Signer auf eine wiederverwendbare, private
   Schnittstelle. Lege den geprüften Adapter als eigentümereigene Datei
   mit Modus `0600` außerhalb des Checkouts ab. Sein Export
   `signAppJwt()` liefert ausschließlich intern ein App-JWT. Der Adapter
   mintet keine Installationstokens. Seine Implementierung und Abhängigkeiten
   müssen vollständig aus eigentümerkontrollierten Pfaden stammen.
3. Stelle eine geprüfte Kopie von `server.mjs`, `controller.mjs`,
   `github.mjs` und `policy.mjs` unter Eigentümerkontrolle bereit. Die
   Dateien gehören dem Dienstkonto mit Modus `0600`. Setze den effektiven
   Prozess-GID auf die dedizierte Client-Gruppe. Nur die berechtigten
   Konten gehören zu dieser Gruppe. Prüfe alle Pfadkomponenten mit
   `ls -lde` auf Eigentümer, Modus und zusätzliche ACLs. Der Dienst lehnt ACL-Einträge ab, die von der macOS-Standardregel `group:everyone deny delete` abweichen. Verwende kanonische
   Pfade ohne Symlinks und mit kurzen Verzeichnisnamen für Unix-Sockets.
4. Lege als Eigentümer ein Zustandsverzeichnis mit Modus `0700` auf
   lokalem Speicher und ein Client-Verzeichnis mit Modus `0710` an.
   Das Client-Verzeichnis gehört dem Dienstkonto und der Client-Gruppe.
   Die Client-Gruppe braucht auf den Elternpfaden Durchgangsrechte.
   Der Codex-Benutzer darf kein Verzeichnis in diesen Pfaden ändern.
   Erstelle vor dem ersten Abnahmelauf im Zustandsverzeichnis eine leere
   Datei `locked` mit Modus `0600`. Eine leere Zustandsablage startet ebenfalls gesperrt.
5. Hinterlege außerhalb des Checkouts die nachstehende Konfiguration
   als Datei mit Modus `0600`. Werte stammen aus der getrennten
   Eigentümerprüfung. Führe **keine Freischaltung** anhand der
   Geräte- oder Architekturfreigabe aus #94 durch.
6. Erst nach gesondertem Startauftrag den Server im Vordergrund mit einer
   vom Eigentümer verwalteten Node-Installation und kontrollierter Umgebung
   starten. Deaktiviere Core Dumps und verwende weder Inspector noch
   Preloads, nutzerkontrollierte Zertifikatsquellen oder HTTP-Proxys.
   Ersetze die drei Platzhalter im folgenden Befehl durch kanonische
   absolute Pfade. Unix-Sockets bleiben bei Prozessabsturz gegebenenfalls
   liegen. Ein zweiter Start scheitert bei belegtem Owner-Socket.

   ```sh
   ulimit -c 0
   env -i '<NODE>' '<SERVER_MODUL>' '<KONFIGURATION>'
   ```

7. Prüfe den Start im gesperrten Zustand. `owner.sock` liegt im
   privaten Zustandspfad. `write.sock` liegt im Client-Pfad und hat Modus
   `0660`. Ein formal gültiger Schreibrequest liefert `denied`.
   Die Tests mit einem getrennten Codex-Konto müssen zusätzlich
   Zugriffe auf Schlüssel, Signer, Konfiguration, Zustandsdateien,
   Stop-Socket und den laufenden Prozess verweigern.

| JSON-Schlüssel | Wert |
| --- | --- |
| `repositoryId`, `installationId`, `appActorId` | Stabile positive numerische GitHub-IDs des Repositorys, der Installation und des App-Bot-Akteurs. |
| `ownerId` | Vom Eigentümer bestätigte positive numerische ID seines GitHub-Akteurs. |
| `approvalIssue`, `approvalComment` | Positive Nummer des separaten Freigabe-Issues und stabile ID des Originalkommentars. |
| `approvalIssueUpdatedAt`, `approvalIssueDigest` | Entsprechende Revision und SHA-256 des vom Eigentümer erstellten Freigabe-Issues und seines dekodierten `body`. Die Werte nach Veröffentlichung des Originalkommentars erfassen. |
| `approvalUpdatedAt` | GitHubs Feld `updated_at` des geprüften Originals im UTC-Format mit Sekunden. |
| `approvalDigest` | SHA-256 als Kleinbuchstaben-Hexstring über die UTF-8-Bytes von GitHubs dekodiertem `body` ohne hinzugefügten Zeilenumbruch. |
| `main` | Geprüfter, aktueller Commit-SHA von `main`. Nach einem Merge muss der neue Stand geprüft und die Entscheidung für diesen Stand neu gebunden werden. |
| `unassignedPrs` | Liste geprüfter Objekte mit `number` und `updatedAt` (GitHubs `updated_at`). Jede PR-Revision erfordert eine erneute Prüfung der Zuordnung. Im Zweifel eine leere Liste verwenden. App-eigene PRs zählen immer. |
| `stateDir`, `clientDir`, `signerModule` | Kanonische absolute Pfade zu den in den Schritten 2 und 4 eingerichteten Objekten. |

## Freigaben und Aufrufe

Der Eigentümer hinterlegt die Governance-Pflichtangaben im separaten
Freigabe-Issue und veröffentlicht die präzise Aktivierungsentscheidung
als eigenen GitHub-Originalkommentar mit einem rohen JSON-Objekt.
Die lokale Konfiguration bindet den exakten Text und die Version an den
bestätigten Akteur. Signierte Eigentümerentscheidungen werden bei der
Einrichtung zusätzlich nach dem vom Eigentümer festgelegten Nachweisweg
geprüft. Der Dienst akzeptiert für den Originalkommentar ausschließlich die
festgelegte ID, die bestätigte User-ID, eine aktuelle unveränderte Fassung
und GitHub-Aktionen ohne App-Zuordnung. Löschen oder Bearbeiten des Kommentars, eine neue Issue-Revision,
Schließen seines Issues und ein Wechsel von `main` entziehen die
maschinelle Freigabe. Das Issue sollte während der Laufzeit ausschließlich
den Eigentümernachweis tragen. Aktualisierungen erfordern eine erneute
Prüfung und Bindung. Der lokale Stop ist der sofortige Sperrweg.

Ein synthetischer Entscheidungstext sieht so aus. Der SHA ist ein
Platzhalterwert. Zeiten benötigen Sekunden und `Z` oder einen expliziten
UTC-Offset. Ab dem Überprüfungstermin oder Ablauf ist der Nachweis
ungültig. Eine Verlängerung erfordert eine neue Eigentümerentscheidung.

```json
{
  "version": 1,
  "decision": "activate",
  "repository": "tomas-fuerl/SoSeBaMa",
  "policyHead": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "start": "2030-02-10T01:00:00+01:00",
  "review": "2030-02-11T01:00:00+01:00",
  "expires": "2030-02-12T00:00:00Z",
  "scope": [
    { "op": "branch.create", "branch": "ap-01/example" },
    { "op": "branch.commit", "branch": "ap-01/example", "paths": ["src/example.ts"] },
    { "op": "draft.create", "branch": "ap-01/example" }
  ]
}
```

Die Client-Schnittstelle erwartet genau ein UTF-8-JSON-Objekt bis 1 MiB je
Verbindung. Der Client beendet seine Schreibrichtung mit EOF. Alle in der
folgenden Tabelle genannten Felder sind Pflichtfelder. Weitere Felder,
abweichende Operationen und andere Ziele werden verweigert.

| `op` | Weitere Client-Felder | Pflichtfelder im jeweiligen Scope-Eintrag außer `op` |
| --- | --- | --- |
| `issue.create` | `title`, `body` | `digest` über UTF-8 von `JSON.stringify([title, body])` als SHA-256 in Kleinbuchstaben-Hex. |
| `issue.update` | `issue`, `title`, `body` | Exakte Issue-Nummer `issue`. Nur offene, ungesperrte App-Issues. |
| `issue.comment` | `issue`, `body` | Exakte Issue-Nummer `issue`. Nur offene, ungesperrte Issues. |
| `branch.create` | `branch` | Exakter DEV-Branch `branch`. Ausgangspunkt ist der verifizierte `main`-SHA. |
| `branch.commit` | `branch`, `head`, `title`, `files` | Exakter `branch` und exakte Liste zulässiger `paths`. `head` ist der erwartete aktuelle Branch-Head. Jedes Element in `files` ist `{path, contents}` mit Base64 für Dateidaten oder `null` für Löschen. |
| `draft.create` | `branch`, `title`, `body` | Exakter DEV-Branch `branch`. Zielbasis ist fest `main`. |

Den Client als Codex mit einer geprüften Request-Datei und dem
bereitgestellten Socket aufrufen. Ersetze die Platzhalter durch die
entsprechenden Pfade.

```sh
node tools/github-writer/client.mjs '<WRITE_SOCKET>' < '<REQUEST_JSON>'
```

Die Prüfung liest öffentlich einsehbare Originaldaten direkt von GitHub.
Rate Limits oder Ausfall führen zur Ablehnung. Ein einzelner Dienstprozess
serialisiert Mutationen und WIP-Zuweisung. Nur dieser Prozess darf neue
WIP-Plätze im autonomen Betrieb belegen. Vor Einführung muss der Eigentümer
das mit bestehenden Threads und Schreibwegen abgleichen. Eigentümeraktionen
wie Übernahme und Wiedereröffnung werden mit dem Dienst koordiniert.
Der Dienst dokumentiert seine Zuordnung im PR-Text. Bei einem unklaren oder revidierten Bestand zählt ein PR vorsorglich zum Limit. Bei 100
offenen PRs oder einer unvollständigen Antwort scheitert die Anlage.

## Stop, Fehlerbehandlung und Rückkehr zur Einzelfreigabe

1. Sende als Eigentümer auf dem privaten Socket den Stop-Befehl.
   Verwende eigentümerkontrollierte Kopien von Client und dessen `policy.mjs`. Ersetze die
   Platzhalter durch die geprüften absoluten Pfade.

   ```sh
   printf '%s\n' '{"op":"stop"}' | '<NODE>' '<CLIENT_MODUL>' '<OWNER_SOCKET>'
   ```

2. Prüfe die Antwort. `locked` bestätigt eine persistierte Sperre
   und das Ende der Token-Verarbeitung ohne offenen Widerruf.
   Der Dienst stoppt neue Mutationen und Token-Ausstellungen vor dem
   Warten auf laufende Operationen. Ein bereits an GitHub gesendeter
   Request kann vor der Durchsetzung des Widerrufs verarbeitet worden sein.
   Prüfe den letzten Zielzustand in GitHub, bevor du ihn als gesperrt abnimmst.
3. Bei `unconfirmed` oder fehlender Antwort führe sofort den
   unabhängigen Sperrweg auf GitHub als Eigentümer aus. Suspendiere
   die betroffene Installation über den für deine Rolle vorgesehenen
   GitHub-Weg. Bei gemeinsamer Installation unterbricht das auch den
   Lesezugang. Prüfe die bestätigte Suspension und lass sie bestehen,
   bis alle möglicherweise ausgestellten Tokens nachweislich unwirksam
   sind. Während einer GitHub-Störung ist eine sofortige serverseitige
   Bestätigung unter Umständen nicht möglich. Lokale Sperre beibehalten,
   unabhängigen Sperrweg erneut versuchen und den Vorfall offen halten.
   Siehe [Installation suspendieren](https://docs.github.com/en/apps/maintaining-github-apps/suspending-a-github-app-installation).
4. Widerrufe den Freigabenachweis zusätzlich auf GitHub und pausiere
   gegebenenfalls das Codex-Goal. Nutze wieder das bisherige
   Verfahren mit einzeln dokumentierten Freigaben. Der Owner-Socket
   enthält keinen Entsperrbefehl.
5. Beende den Dienst nach bestätigter Sperre. Entferne bei Bedarf nur
   verwaiste Sockets, nachdem der Prozess nachweislich beendet ist.
   Behalte `locked`, `pending` und die Request-Marker bis zur
   abgeschlossenen Klärung. Ein Wiederanlauf mit Schreibbefugnis setzt
   die verifizierte Wirkung des Widerrufs, neue Eigentümerfreigabe und
   einen bewusst vorbereiteten Zustand voraus. Erst bei einer gesondert freigegebenen Aktivierung hinterlegt der Eigentümer im Zustandspfad `armed` (Modus `0600`) mit dem SHA-256 der exakten Konfigurationsbytes. Der Server verbraucht den Marker vor dem Öffnen des Client-Sockets. Jeder Neustart braucht einen neuen Marker. `locked` und `pending` haben Vorrang.

`busy` bedeutet laufende Verarbeitung. `denied` bezeichnet einen
abgewiesenen Request. `unavailable` bedeutet einen Ausfall vor einer
unbestätigten Mutation. `unconfirmed` weist auf einen möglichen
Teilvorgang, verlorene Antwort, ausstehende Sperrbestätigung oder fehlenden
Credential-Widerruf hin. Bei `stopped` hat GitHub eine bereits übermittelte
Mutation bestätigt, während die lokale Sperre gesetzt wurde. `duplicate`
verhindert identische Issue-Erstellungen und Kommentare anhand dauerhafter
Hashmarker. Vor jedem Wiederholen nach Timeout oder unklarem Ergebnis das
GitHub-Ziel prüfen. Der Client verwendet Exit-Code 0 für Hilfe, `ok` und
`locked`. Ablehnungen, Transportfehler und fehlgeschlagener Start liefern 1.
Der Server protokolliert für syntaktisch gültige Aufrufe Zeitpunkt,
Operationsname und Ergebnis.

Für den Rückbau zuerst sperren und den Widerruf bestätigen. Danach den
Dienst beenden, lokale Dienstkopien und den Schreibadapter kontrolliert
entfernen sowie die Client-Gruppenzuordnung zurücknehmen. Vorhandene
Lesefunktion und einfach autorisierte Abläufe separat prüfen. Bereits auf
GitHub angenommene Änderungen bleiben bestehen. Der Eigentümer bearbeitet
sie bei Bedarf über das reguläre Review- und Revert-Verfahren.

## Bedrohungsanalyse und Abnahme

| Risiko | Kontrolle und Verifikation |
| --- | --- |
| Gefälschte oder editierte Entscheidung, Namenswechsel | Stabile Akteur-, Repository- und Kommentar-IDs, exakter Textdigest und Version, GitHub-Zugehörigkeit zum separaten Issue, geprüfter Stand von `main` und strikte Gültigkeitsgrenzen. Manipulation synthetisch getestet. |
| Client versucht an Tokens oder Signierfunktion zu gelangen | Nur Unix-Socket für validierte Fachaktionen. Owner-Socket und Codepfad abgeschottet. Keine Credential-Helper, Weiterleitungen, generischen APIs, HTTP-Listener oder Geheimnisse in Antworten und Logs. Tatsächliche macOS-Isolation als separater Benutzer nachweisen. |
| Missbrauch von Issues, Git-Refs, GraphQL und CI | Feste Endpunkte, GitHub-Variablen statt Query-Interpolation, exakte Branches, Issues und Dateipfade, keine `.git*`-Pfade, keine Mutationen an `main`, kein Merge. Überprüfe zusätzlich die Rulesets, App-Berechtigungen ohne Bypass und Workflows auf gefährliche Trigger, privilegierte Runner oder Secrets beim Ausführen von PR-Inhalten. |
| Überschreitung des WIP-Limits | Serialisierung im Einzelprozess, konservative Zählung und eigentümerkontrollierte PR-Zuordnung. Externe WIP-Aktionen brauchen dieselbe Koordination. |
| Stop während Ausstellung, Mutation oder Absturz | Vor Ausstellung persistiertes `pending` ohne Credential, gleichzeitiger Widerruf des bekannten Tokens und lokaler Stop. Verlorene Antworten und Prozessabsturz sperren den Neustart. Bei verlorenen Tokenwerten oder nicht bestätigtem Widerruf muss die unabhängige Installationssperre greifen. Kein verteilter Mechanismus kann eine bereits von GitHub angewandte Mutation zurücknehmen. |
| Alternativer Schreibweg mit Lesebroker, vorbereitetem Schreibexport oder anderer Identität | In TST aus dem separaten Client-Konto je einen Schreibversuch mit dem normalen Lesetoken sowie Zugriffsversuche auf direkten Broker, vorbereitete Schreibvariante, lokale Agenten und Git-Credential-Helper durchführen. Die Schreibvariante und jegliche persönliche Zugangsdaten bleiben unerreichbar. |
| Freigabe ändert sich während einer HTTP-Anfrage | Mehrfachprüfung bis unmittelbar vor dem Dispatch. GitHub-Kommentar, WIP und Mutation haben keine gemeinsame atomare Transaktion. Der Eigentümerstopp setzt die lokale Sperre sofort und stößt den Token-Widerruf an. Der technische Nachweis muss die serverseitige Wirksamkeit belegen. |

Vor öffentlicher Veröffentlichung gelten die bestehenden Diff-, Secret- und Veröffentlichungsprüfungen auch für Datei-, Issue- und PR-Inhalte. Ein Ziel-Scope ist keine Inhaltsfreigabe. Welche Inhalte delegiert werden dürfen, entscheidet der Eigentümer vor einer Rahmenfreigabe.

Die Abnahme umfasst einen zulässigen Write mit jeder Operationsklasse und
nachgewiesener Ablehnung für falsche Identität, Scope, Zeit, Ausfall und
Widerruf. Live-Tests erfolgen ausschließlich in separat genehmigtem TST.
Prüfe dort insbesondere einen vor Stop erhaltenen Token nach Einzelwiderruf
und nach Installationssuspension, Prozessabsturz im Ausgabezeitfenster,
`main`-Schutz und Merge-Sperre an einem TST-PR. Erfasse Zeit, Operation
und Ergebnis ohne Tokenwerte. Prüfe anschließend die Rückkehr zu
Einzelfreigaben und den normalen Lesepfad.

Pflegeverantwortung liegt beim Projekteigentümer und der von ihm benannten
Betriebsrolle. Prüfstand ist der lokale Entwurf vom 24.11.2026. Bei
Änderungen an Broker, GitHub-API, Rulesets, macOS-Schutz, WIP-Koordination
oder Governance ist die Abnahme erneut zu bewerten.

### Automatisierter Nachweis der lokalen Benutzergrenze

1. Richte als Eigentümer den gesperrten TST-Dienst mit synthetischer
   Konfiguration und Dummy-Signer ein. Verwende ausschließlich synthetische
   Markerdateien und bestätige als Eigentümer, dass alle Prüfpfade existieren.
2. Lege für den Codex-Benutzer lokal ein JSON-Testobjekt ab. Es enthält
   `codexUid` und `ownerUid` als verschiedene UID-Zahlen, `files` als
   Liste absoluter Pfade auf mindestens fünf synthetische Dateien (Dummy-Key,
   Signer, Konfiguration, Zustandsmarker, Tokenattrappe) und die absoluten
   Pfade `ownerSocket` und `writeSocket`. Die Testdatei gehört nicht ins
   Repository.
3. Führe als nicht administrativer Codex-Benutzer folgenden Befehl aus.
   Er dokumentiert Kernel-Ablehnungen und ungültige Service-Operationen,
   ohne Dateiinhalte zu lesen. Sorge dafür, dass der Test »separate Codex
   account« ausgeführt und bestanden wurde. Pfade und UID-Werte gehören
   nicht in öffentliche Prüfnachweise.

   ```sh
   SOSEMABA_WRITER_TST_ISOLATION="$(cat '<LOKALER_TST_FIXTURE_PFAD>')" pnpm test:github-writer
   ```
