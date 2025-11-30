export default {
    version: "1.0.82",
    releaseDate: "Nov 28, 2025 08:30 AM",
    releaseDateTimestamp: 1764325800,
    changesSummary: "Fixed Component V2 format using proper flag combination",

    changes: [
        "1. Fixed flag format: now using 32768 | MessageFlags.Ephemeral",
        "2. All responses use Component V2 container format (type 17) matching config command",
        "3. Proper content field and flag combination for hidden messages",
        "4. Messages now truly hidden from other users"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
