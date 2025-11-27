export default {
    version: "1.0.57",
    releaseDate: "Nov 27, 2025 12:00 AM",
    releaseDateTimestamp: 1764230400,
    changesSummary: "Complete multi-server data isolation - 12 critical changes",

    changes: [
        "1. Fixed AFK system - now guild-specific with isolated data per server",
        "2. Fixed autoresponse triggers - each server has isolated autoresponse data",
        "3. Fixed header attachment config - server-specific avatar storage",
        "4. Fixed background attachment config - server-specific banner storage",
        "5. Fixed welcome messages - each server manages own welcome data independently",
        "6. Fixed prefix command - guild-specific prefix storage per server",
        "7. Fixed search functionality - searches only current server's data",
        "8. Fixed nickname handler - Mining Bangladesh-only with proper data isolation",
        "9. Fixed duplicate variable declarations - removed guildData redeclaration error",
        "10. Fixed config command - displays guild-specific settings and configurations",
        "11. Fixed bot startup - eliminated all global data references for true multi-server support",
        "12. Fixed AFK nickname permissions - gracefully skips nickname changes if bot lacks permission"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};