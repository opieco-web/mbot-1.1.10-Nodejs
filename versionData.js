export default {
    version: "1.0.92",
    releaseDate: "Nov 28, 2025 09:00 AM",
    releaseDateTimestamp: 1764327600,
    changesSummary: "SIMPLIFIED Page 2 - removed dropdowns/modals, now just toggle buttons that WORK",

    changes: [
        "1. Removed all dropdowns from page 2 (they don't work in Component V2)",
        "2. Removed all modal buttons (when to send/delete)",
        "3. Page 2 now has ONLY 2 simple toggle buttons:",
        "   - Random Welcome Messages (Enable/Disable)",
        "   - Temporary Welcome Messages (Enable/Disable)",
        "4. All interactions NOW respond properly",
        "5. Configuration will be done via /welcome command"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
