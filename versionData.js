export default {
    version: "1.0.91",
    releaseDate: "Nov 30, 2025 09:15 AM",
    releaseDateTimestamp: 1764328500,
    changesSummary: "Fixed component validation and improved permissions display",

    changes: [
        "1. Fixed Discord component validation by removing undefined values",
        "2. Cleaned response JSON to ensure no undefined fields",
        "3. Improved permissions display with better formatting",
        "4. Added line breaks in permissions section for readability",
        "5. Filtered components array to prevent null/undefined entries"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
