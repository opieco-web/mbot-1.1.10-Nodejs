export default {
    version: "1.0.77",
    releaseDate: "Nov 28, 2025 07:45 AM",
    releaseDateTimestamp: 1764323100,
    changesSummary: "Fixed Component V2 structure - use IsComponentsV2 flag instead of wrapping in type 1",

    changes: [
        "1. Removed incorrect type 1 wrapping around Component V2",
        "2. Added MessageFlags.IsComponentsV2 flag to all setup responses",
        "3. Setup pages now send Component V2 directly with proper flag",
        "4. Navigation and completion messages use correct Component V2 format"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
