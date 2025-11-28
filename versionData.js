export default {
    version: "1.0.90",
    releaseDate: "Nov 28, 2025 08:50 AM",
    releaseDateTimestamp: 1764327000,
    changesSummary: "Fixed duplicate dropdown handler - all page 2 interactions now working",

    changes: [
        "1. REMOVED duplicate 'setup_welcome_randomized_channel' handler causing conflicts",
        "2. ALL page 2 dropdowns now respond properly",
        "3. ALL page 2 buttons (Enable/Disable, Custom/Random, When to Send/Delete) work",
        "4. Added fallback deferUpdate() for all setup_ interactions"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
