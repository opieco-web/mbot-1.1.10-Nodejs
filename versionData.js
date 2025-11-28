export default {
    version: "1.0.77",
    releaseDate: "Nov 28, 2025 07:45 AM",
    releaseDateTimestamp: 1764323100,
    changesSummary: "Rebuilt setup wizard with simple ActionRows - fixed Discord.js compatibility",

    changes: [
        "1. Rewrote setup pages to use Discord.js ActionRowBuilder instead of Component V2 JSON",
        "2. Uses proper ButtonBuilder for navigation (Previous/Next/Save buttons)",
        "3. Added ChannelSelectMenuBuilder for channel selection on pages 2 and 3",
        "4. Simplified content structure for better Discord.js compatibility",
        "5. Setup wizard now fully responsive and working with slash commands"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
