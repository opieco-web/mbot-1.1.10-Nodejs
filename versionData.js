export default {
    version: "1.0.78",
    releaseDate: "Nov 28, 2025 08:10 AM",
    releaseDateTimestamp: 1764324600,
    changesSummary: "Added reverse functionality to /roles-connection system",

    changes: [
        "1. Added 'reverse' boolean option to /roles-connection command",
        "2. Reverse option required for add/remove modes",
        "3. When reverse=true, bot undoes role changes when main role is removed",
        "4. When reverse=false, bot only applies when main role is added",
        "5. Reverse setting stored in JSON: {add_role: [...], remove_role: [...], reverse: true/false}",
        "6. List mode shows reverse status for each rule (✅ ON / ❌ OFF)",
        "7. guildMemberUpdate checks reverse flag and restores affected roles accordingly"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
