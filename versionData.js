export default {
    version: "1.0.97",
    releaseDate: "Nov 30, 2025 09:35 AM",
    releaseDateTimestamp: 1764329700,
    changesSummary: "Updated /role-info to use Type 9 Content Accessory structure for Component V2",

    changes: [
        "1. Changed title component from type 10 to type 9 (Content Accessory)",
        "2. Wrapped title content in components array within type 9",
        "3. Moved accessory (type 11) inside type 9 structure",
        "4. Improved title formatting with role mention and descriptive text",
        "5. Maintains flags: 32768 and type 17 container structure"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
