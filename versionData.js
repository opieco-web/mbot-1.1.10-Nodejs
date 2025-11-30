export default {
    version: "1.0.76",
    releaseDate: "Nov 28, 2025 08:00 AM",
    releaseDateTimestamp: 1764324000,
    changesSummary: "Integrated complete roles-connection system with auto-role assignments",

    changes: [
        "1. Added /roles-connection slash command (add/remove/list modes)",
        "2. Integrated guildMemberUpdate event for automatic role connections",
        "3. Role connections saved in ./serverData/<guildId>.json",
        "4. Automatic role assignment when members gain/lose main roles",
        "5. All responses use embed format with proper error handling",
        "6. Permission validation and role hierarchy checks implemented",
        "7. Duplicate prevention and empty entry cleanup"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
