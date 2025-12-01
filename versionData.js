export default {
    version: "1.0.104",
    releaseDate: "Dec 01, 2025 11:10 AM",
    releaseDateTimestamp: 1764337800,
    changesSummary: "Blacklist system now supports both roles AND members for access control",

    changes: [
        "1. Changed dropdown selector to Mentionable Select Menu (type 10)",
        "2. Now allows selection of BOTH roles and individual members",
        "3. Updated data structure: allowedRoleIds → allowedIds (supports mixed role/member IDs)",
        "4. Updated canUseBlacklistPrefix() to check both member IDs and role IDs",
        "5. Selected roles and members are now saved and persisted",
        "6. Only selected roles and members can use /blacklist and !bkl commands",
        "7. Updated data/servers.json with new allowedIds structure"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
