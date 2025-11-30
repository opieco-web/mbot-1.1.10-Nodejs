export default {
    version: "1.0.91",
    releaseDate: "Nov 30, 2025 09:05 AM",
    releaseDateTimestamp: 1764327900,
    changesSummary: "Standardized all bot responses to unified Component V2 format",

    changes: [
        "1. Updated /role-manage responses to standardized format with title + separator + content",
        "2. Updated /role-bulk responses to standardized format with title + separator + content",
        "3. Removed content field from main level (only flags in main body)",
        "4. All responses use exact Component V2 structure: type 17 container with type 10, 14, 10",
        "5. Success/Error/Warning emojis in title line with ### heading",
        "6. Content details in separate text display below separator"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
