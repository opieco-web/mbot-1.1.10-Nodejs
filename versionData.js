export default {
    version: "1.0.65",
    releaseDate: "Nov 28, 2025 06:45 AM",
    releaseDateTimestamp: 1764319500,
    changesSummary: "Fixed welcome message bug + Auto-create new server sections",

    changes: [
        "1. FIXED critical bug: Welcome message handler now uses getGuildData() instead of incorrect data.welcome[guildId] lookup",
        "2. Added guildCreate handler to auto-create new server sections in other-servers.json when bot joins",
        "3. New servers automatically get template structure with prefix, autoresponse, welcome (disabled), config, afk, and pendingNicknameRequests"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
