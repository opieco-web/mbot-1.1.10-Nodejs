export default {
    version: "1.0.96",
    releaseDate: "Nov 30, 2025 09:30 AM",
    releaseDateTimestamp: 1764329400,
    changesSummary: "Fixed role icon URL - icon link preserved, accessory thumbnail now displays",

    changes: [
        "1. Restored full icon link functionality in role info content",
        "2. Fixed icon URL format by removing size parameter",
        "3. Icon now shows in both: clickable link in content AND thumbnail in accessory",
        "4. **IMPORTANT: Will ask permission before ANY Component V2 structure changes**"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
