export default {
    version: "1.0.105",
    releaseDate: "Dec 01, 2025 11:15 AM",
    releaseDateTimestamp: 1764338100,
    changesSummary: "Fixed select menu interaction handler to recognize mentionable select menus",

    changes: [
        "1. Fixed: Interaction handler was filtering OUT mentionable select menus",
        "2. Added .isMentionableSelectMenu() check to initial interaction filter",
        "3. Select menu now properly responds when roles/members are selected",
        "4. All selections are saved to allowedIds array",
        "5. Verified type 7 is correct for mentionable select menu"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
