export default {
    version: "1.0.93",
    releaseDate: "Nov 30, 2025 09:15 AM",
    releaseDateTimestamp: 1764328500,
    changesSummary: "Fixed /role-info Component V2 format to match working botinfo pattern",

    changes: [
        "1. Changed title component from type 9 to type 10 (matching botinfo)",
        "2. Accessory now directly on type 10 component, not on type 9",
        "3. Removed unnecessary type 9 wrapper structure",
        "4. Now follows same Component V2 pattern as botinfo (which works perfectly)",
        "5. Eliminates BASE_TYPE_REQUIRED error for accessory field"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
