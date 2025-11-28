export default {
    version: "1.0.96",
    releaseDate: "Nov 28, 2025 09:25 AM",
    releaseDateTimestamp: 1764329100,
    changesSummary: "FINAL FIX - All conflicts removed, collector is sole handler. ALL FEATURES WORKING!",

    changes: [
        "✅ REMOVED all conflicting global handlers for setup_ interactions",
        "✅ Global handlers now return early for setup_ to let collector handle",
        "✅ Eliminated 'Unknown interaction' errors",
        "✅ Page 2 (Welcome): All dropdowns, buttons, modals now work",
        "✅ Page 3 (Nickname): Blocklist, channels, modes all functional",
        "✅ Clean code architecture with collector as single source of truth",
        "✅ Bot is LIVE and ready for production"
    ],

    commands: [
        "/setup - Interactive 3-page wizard for welcome & nickname setup",
        "/nickname setup - Set up nickname channel and mode",
        "/nicknamefilter - Manage banned words for nicknames",
        "/setprefix - Change server prefix",
        "/prefix - View current prefix",
        "/afk - Set AFK status with reason",
        "/afklist - View AFK list"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
