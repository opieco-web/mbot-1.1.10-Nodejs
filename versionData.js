export default {
    version: "1.0.68",
    releaseDate: "Nov 28, 2025 07:00 AM",
    releaseDateTimestamp: 1764320400,
    changesSummary: "Auto-cleanup system: Delete orphaned server data when bot leaves",

    changes: [
        "1. Created cleanupServer.js with functions for auto-deleting orphaned server data",
        "2. Integrated cleanup into GuildDelete event (bot kicked/banned)",
        "3. Integrated cleanup into GuildMemberRemove event (bot left)",
        "4. Added periodic cleanup function: cleanupOrphanedServers() for database maintenance",
        "5. Result: No useless orphaned data, only active servers remain in servers.json"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
