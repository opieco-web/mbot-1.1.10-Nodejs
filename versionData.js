export default {
    version: "1.0.79",
    releaseDate: "Nov 28, 2025 08:15 AM",
    releaseDateTimestamp: 1764324900,
    changesSummary: "Fixed ephemeral flag & simplified remove mode for /roles-connection",

    changes: [
        "1. Fixed all bot responses to be properly hidden (ephemeral) - flags: 64",
        "2. Reverse option now required ONLY for add mode, not remove mode",
        "3. Remove mode simplified: just provide Main Role, Action, Connection Role",
        "4. Clearer error messages differentiating add vs remove requirements",
        "5. All responses now have content field for Discord compatibility",
        "6. Ephemeral flag (64) ensures all responses are hidden from other users"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
