# SoSeBaMa

**Song-Setlist-Band-Manager**

Dieses öffentliche Repository befindet sich im initialen Projektaufbau. Es
enthält die verbindliche Projekt- und Produktgrundlage, aber noch keine
funktionsfähige Anwendung. Technische Architektur und Technologien sind
angenommen und dokumentiert, aber noch nicht implementiert.

Der beschlossene erste Produktstand ist PDF-zentriert. Das Fachmodell verwendet
plattformweite Songs, aktuelle Basisinhalte, normale berechtigte Overlays,
globale Aktionsrechte und Objektberechtigungen. Die globale Systemgruppe `Alle
Benutzer` vermittelt den Basissatz aktiver Benutzer; breite objektbezogene
Lesbarkeit erfolgt getrennt über die geschützte Systemband `Öffentlich`, nicht
über anonymen Zugriff oder einen eigenständigen Sichtbarkeitszustand.

## Verbindliche Projektgrundlage

- [Mitwirken](CONTRIBUTING.md)
- [Sicherheitsrichtlinie](SECURITY.md)
- [Projekt-Governance](docs/GOVERNANCE.md)
- [AI-First-Workflow](docs/AI-FIRST-WORKFLOW.md)
- [Umgebungsmodell DEV/TST/PRD](docs/ENVIRONMENTS.md)
- [Netzwerkgrenzen](docs/NETWORK-BOUNDARIES.md)
- [Reuse-first-Standard](docs/REUSE-FIRST.md)
- [Foolproof-Dokumentationsstandard](docs/DOCUMENTATION-STANDARD.md)
- [ADR-Verfahren](docs/ADR.md)
- [Architekturübersicht](docs/architecture/ARCHITECTURE-OVERVIEW.md)
- [ADR-Index](docs/architecture/decisions/README.md)
- [Implementierungsroadmap](docs/architecture/IMPLEMENTATION-ROADMAP.md)
- [Initiales Ressourcenbudget](docs/architecture/RESOURCE-BUDGET.md)

Repository-spezifische Arbeitsregeln stehen in [AGENTS.md](AGENTS.md).

## Produktgrundlage

- [Produktvision](docs/product/VISION.md)
- [Benutzer, Gruppen und Berechtigungen](docs/product/USERS-AND-ROLES.md)
- [Kernabläufe](docs/product/CORE-WORKFLOWS.md)
- [Funktionaler Scope](docs/product/FUNCTIONAL-SCOPE.md)
- [Qualitätsanforderungen](docs/product/QUALITY-ATTRIBUTES.md)
- [Produktbezogene Sicherheitsanforderungen](docs/product/SECURITY-REQUIREMENTS.md)
- [Produktglossar](docs/product/GLOSSARY.md)
- [Produktfragen und Entscheidungen](docs/product/OPEN-QUESTIONS.md)
- [Inhalts- und Overlaymodell](docs/architecture/CONTENT-AND-OVERLAY-MODEL.md)

Die Produktdokumentation trennt verbindliche MVP-Anforderungen, das Zielmodell
nach dem MVP, spätere Anforderungen und ausgeschlossene Funktionen. Alle
Produktfragen einschließlich `OQ-016` sind entschieden. Das initiale
Ressourcenbudget ist vor einer PRD-Freigabe in TST auf der privaten
Referenzhardware zu verifizieren.
