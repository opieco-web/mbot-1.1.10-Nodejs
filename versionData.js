export default {
    version: "1.0.100",
    releaseDate: "Nov 30, 2025 10:00 AM",
    releaseDateTimestamp: 1764330000,
    changesSummary: "Implemented complete blacklist system with slash and prefix commands",

    changes: [
        "1. Created /blacklist-system command - enable/disable + select blacklist role (ManageGuild permission)",
        "2. Created /blacklist command - add users to blacklist with automatic role assignment",
        "3. Created !bkl <user> prefix command - add users to blacklist via prefix (for authorized moderators)",
        "4. Added src/utils/blacklistData.js - utility functions for blacklist management",
        "5. Added blacklist data structure to mining-bangladesh.json and servers.json",
        "6. Blacklist role auto-assigned when users added via slash or prefix command",
        "7. Persistent blacklist storage with guild-specific data isolation"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
