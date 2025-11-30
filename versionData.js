export default {
    version: "1.0.90",
    releaseDate: "Nov 30, 2025 09:10 AM",
    releaseDateTimestamp: 1764328200,
    changesSummary: "Fixed Discord component validation error for accessory field",

    changes: [
        "1. Fixed 'BASE_TYPE_REQUIRED' error by conditionally adding accessory field",
        "2. Accessory field only added when role icon exists",
        "3. Prevents undefined values from breaking component validation",
        "4. Improved component structure for Discord API compatibility"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
