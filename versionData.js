export default {
    version: "1.0.95",
    releaseDate: "Nov 30, 2025 09:25 AM",
    releaseDateTimestamp: 1764329100,
    changesSummary: "Fixed role icon URL format in /role-info accessory",

    changes: [
        "1. Changed role icon URL construction to direct Discord CDN format",
        "2. Uses proper format: https://cdn.discordapp.com/role-icons/{roleId}/{icon}.webp",
        "3. Ensures role icon displays correctly in accessory thumbnail",
        "4. Fallback to default avatar if role has no custom icon"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
