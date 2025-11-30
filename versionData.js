export default {
    version: "1.0.80",
    releaseDate: "Nov 28, 2025 08:20 AM",
    releaseDateTimestamp: 1764325200,
    changesSummary: "Fixed ephemeral messages to be properly hidden & cleared all role connections",

    changes: [
        "1. Fixed ephemeral flag: now using ephemeral: true for proper Discord formatting",
        "2. All bot responses are now HIDDEN from other users - only command user sees them",
        "3. Cleared all existing role connections from data files - fresh start",
        "4. Ready to add new role connections with working functionality"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
