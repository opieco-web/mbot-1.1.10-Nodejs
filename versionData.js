export default {
    version: "1.0.84",
    releaseDate: "Nov 28, 2025 08:40 AM",
    releaseDateTimestamp: 1764326400,
    changesSummary: "Implemented Component V2 container format for /role-info command",

    changes: [
        "1. Converted /role-info to use Component V2 containers (type 17) instead of embeds",
        "2. Role icon displayed as media accessory with content accessory component (type 9)",
        "3. Role information formatted as blockquotes with all details",
        "4. Member list shows count with numbered mentions and join dates",
        "5. Proper Component V2 formatting with separators and text displays",
        "6. Hoisted status displayed with Correct/Error emojis"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
