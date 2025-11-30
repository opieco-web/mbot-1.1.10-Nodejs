export default {
    version: "1.0.94",
    releaseDate: "Nov 30, 2025 09:20 AM",
    releaseDateTimestamp: 1764328800,
    changesSummary: "Role icon always shows in /role-info with fallback",

    changes: [
        "1. Accessory always included in title component (no conditional check)",
        "2. Uses role icon if available, fallback to default Discord avatar if not",
        "3. Ensures consistent appearance for all role-info responses",
        "4. Better visual presentation without conditional rendering"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
