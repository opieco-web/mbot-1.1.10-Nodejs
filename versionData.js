export default {
    version: "1.0.69",
    releaseDate: "Nov 28, 2025 07:05 AM",
    releaseDateTimestamp: 1764320700,
    changesSummary: "Enforced complete data separation: Mining Bangladesh (mining-bangladesh.json) vs Others (servers.json)",

    changes: [
        "1. Added Mining Bangladesh guardrails to ALL servers.json utility functions",
        "2. loadServer() now rejects Mining Bangladesh ID (1296783492989980682)",
        "3. saveServer() now rejects Mining Bangladesh ID",
        "4. updateServerProperty() now rejects Mining Bangladesh ID",
        "5. deleteServer() now rejects Mining Bangladesh ID",
        "6. All cleanup functions skip Mining Bangladesh (cannot be kicked/banned/left)",
        "7. Result: 100% data isolation - Mining Bangladesh uses ONLY mining-bangladesh.json, all others use ONLY servers.json"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
