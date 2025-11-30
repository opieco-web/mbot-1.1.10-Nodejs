export default {
    version: "1.0.81",
    releaseDate: "Nov 28, 2025 08:25 AM",
    releaseDateTimestamp: 1764325500,
    changesSummary: "Fixed command response format - using embeds with Component V2 styling",

    changes: [
        "1. Fixed bot application response error by using proper embed format",
        "2. All responses now use standard Discord embeds with emoji styling",
        "3. Embeds styled with Component V2 visual appearance (Correct, Error, Warning emojis)",
        "4. Ephemeral flag properly set (messages only visible to command user)",
        "5. Proper error handling for command interactions"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
