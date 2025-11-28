export default {
    version: "1.0.75",
    releaseDate: "Nov 28, 2025 07:35 AM",
    releaseDateTimestamp: 1764322500,
    changesSummary: "Integrated 3-page setup wizard with complete navigation and settings saving",

    changes: [
        "1. Added setup session storage (Map tracking user page and settings)",
        "2. Implemented /setup slash command - displays Page 1 (Menu)",
        "3. Added navigation handlers for Previous/Next buttons between pages",
        "4. Implemented dropdown handlers for channel selections in both Welcome and Nickname pages",
        "5. Added final save handler - saves all settings when user completes Page 3",
        "6. Session auto-cleanup after completion or expiration",
        "7. Perfect Component V2 format with proper container/separator/text structure",
        "8. All 3 pages fully functional: Menu → Welcome Settings → Nickname Setup"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
