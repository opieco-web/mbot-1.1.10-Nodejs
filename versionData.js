export default {
    version: "1.0.76",
    releaseDate: "Nov 28, 2025 07:40 AM",
    releaseDateTimestamp: 1764322800,
    changesSummary: "Fixed Component V2 structure - wrapped type 17 containers in type 1 ActionRow",

    changes: [
        "1. Fixed setup command - wrapped Components in proper type 1 ActionRow",
        "2. Fixed setup page updates - all navigation now properly wraps type 17 in type 1",
        "3. Fixed completion page - wrapped completion message in proper structure",
        "4. Component V2 format preserved exactly - only fixed Discord.js structure requirement"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
