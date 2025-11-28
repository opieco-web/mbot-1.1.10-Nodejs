export default {
    version: "1.0.67",
    releaseDate: "Nov 28, 2025 06:52 AM",
    releaseDateTimestamp: 1764319920,
    changesSummary: "Corrected bot leave detection - now checks if bot itself leaves",

    changes: [
        "1. Fixed GuildMemberRemove handler to check if bot (client.user.id) leaves, not guild owner",
        "2. Ensures server section is deleted when bot leaves the server"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
