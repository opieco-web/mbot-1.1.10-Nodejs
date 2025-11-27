export default {
    version: "1.0.46",
    releaseDate: "Nov 27, 2025 12:00 AM",
    releaseDateTimestamp: 1764230400,
    changesSummary: "Multi-server data isolation complete - 9 critical fixes",

    changes: [
        "1. Fixed AFK system - now guild-specific with isolated data per server",
        "2. Fixed autoresponse triggers - each server has isolated autoresponse data",
        "3. Fixed header attachment config - server-specific avatar storage",
        "4. Fixed background attachment config - server-specific banner storage",
        "5. Fixed welcome messages - each server manages own welcome data independently",
        "6. Fixed prefix command - guild-specific prefix storage per server",
        "7. Fixed search functionality - searches only current server's data",
        "8. Fixed nickname handler - Mining Bangladesh-only with proper data isolation",
        "9. Fixed duplicate variable declarations - removed guildData redeclaration error"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};