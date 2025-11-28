export default {
    version: "1.0.91",
    releaseDate: "Nov 28, 2025 09:00 AM",
    releaseDateTimestamp: 1764327600,
    changesSummary: "FULL BACKEND LOGIC - Setup wizard now saves and executes all welcome & nickname features",

    changes: [
        "✅ PAGE 2 - WELCOME SETUP",
        "  • Randomized Welcome: Saves channel + delay (default 120s), fully enabled",
        "  • Temporary Welcome: Saves multi-channels + type (custom/random) + send/delete times",
        "",
        "✅ PAGE 3 - NICKNAME SETUP",
        "  • Blocklist: Saves blocklist status for add/remove/list operations",
        "  • Channels & Mode: Saves channel + mode (auto/approval) for nickname processing",
        "",
        "✅ ALL DATA PERSISTS in guildData with proper structure",
        "✅ Setup wizard now works EXACTLY like /config command"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
