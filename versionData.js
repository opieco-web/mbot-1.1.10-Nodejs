export default {
    version: "1.0.62",
    releaseDate: "Nov 28, 2025 06:30 AM",
    releaseDateTimestamp: 1764318600,
    changesSummary: "Nickname system - converted to Component V2 raw structure",

    changes: [
        "1. Converted nickname approved/failed/rejected messages to use Component V2 raw JSON structure with type 17 (Container), type 10 (TextDisplay), and type 14 (Separator) for better component handling"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
