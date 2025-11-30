export default {
    version: "1.0.86",
    releaseDate: "Nov 30, 2025 08:50 AM",
    releaseDateTimestamp: 1764327000,
    changesSummary: "Updated /role-info to exact Component V2 format specifications",

    changes: [
        "1. Updated role info format to match exact specifications",
        "2. Role details now use plain blockquotes without bold field markers",
        "3. ID field removed backticks for consistency",
        "4. Icon field shows as simple text instead of clickable link",
        "5. Permissions section formatted as blockquote with bold header",
        "6. Maintained smart member list pagination within 4,000 character limit"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
