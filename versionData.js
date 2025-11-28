export default {
    version: "1.0.75",
    releaseDate: "Nov 28, 2025 07:30 AM",
    releaseDateTimestamp: 1764322800,
    changesSummary: "All AFK messages now use Component V2 container format",

    changes: [
        "1. AFK mention replies now use Component V2 container (type 17)",
        "2. Welcome back message uses Component V2 container",
        "3. Prefix command AFK set message uses Component V2 container",
        "4. All AFK messages use flags: 32768 (ephemeral)",
        "5. Consistent formatting across all AFK notifications"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
