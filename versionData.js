export default {
    version: "1.0.92",
    releaseDate: "Nov 30, 2025 09:10 AM",
    releaseDateTimestamp: 1764328200,
    changesSummary: "Fixed rate limiting and interaction timeout issues in /role-bulk",

    changes: [
        "1. Added 200ms delay between batches to prevent Discord API rate limits",
        "2. Reduced batch size from 50 to 30 members for more manageable processing",
        "3. Added rate limit error handling in member role operations",
        "4. Fixed deferReply flag setting (Discord doesn't support flags in defer)",
        "5. Improved error handling for rate limit errors",
        "6. Prevents 'This application didn't respond' timeout errors"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
