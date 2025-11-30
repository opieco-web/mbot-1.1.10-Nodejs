export default {
    version: "1.0.83",
    releaseDate: "Nov 28, 2025 08:35 AM",
    releaseDateTimestamp: 1764326100,
    changesSummary: "Added /role-info command with detailed role information and member listing",

    changes: [
        "1. Created /role-info slash command for moderators (ManageRoles permission)",
        "2. Displays detailed role info: name, color, hex, creation date, member count, permissions",
        "3. Optional full_member_list shows all members with their join dates as mentions",
        "4. Large member lists automatically split across multiple embeds",
        "5. All responses ephemeral (hidden) with professional embed formatting",
        "6. Readable permission names and timestamps in Discord format"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
