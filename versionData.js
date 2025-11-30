export default {
    version: "1.0.99",
    releaseDate: "Nov 30, 2025 09:45 AM",
    releaseDateTimestamp: 1764330300,
    changesSummary: "Fixed AFK prefix command for other servers - Added guildData.afk initialization",

    changes: [
        "1. Added guildData.afk initialization in /afk slash command (line 1387)",
        "2. Added guildData.afk initialization in afk prefix command (line 2655)",
        "3. Prevents 'Cannot set properties of undefined' error when AFK is used in other servers",
        "4. Both slash and prefix versions now work consistently on all servers"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
