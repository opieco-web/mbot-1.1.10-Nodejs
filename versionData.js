export default {
    version: "1.0.93",
    releaseDate: "Nov 28, 2025 09:10 AM",
    releaseDateTimestamp: 1764328200,
    changesSummary: "Added comprehensive logging to debug interaction handling",

    changes: [
        "✅ Added [INTERACTION] logs to see all interactions received",
        "✅ Added [DROPDOWN] logs for menu selections",
        "✅ Added [BUTTON] logs for button clicks",
        "✅ Added [SETUP] logs for wizard-specific actions",
        "✅ Fixed dropdown handler to show error instead of silent deferUpdate",
        "✅ Improved error handling and logging throughout",
        "",
        "📋 DEBUGGING: Check console logs when clicking buttons/dropdowns"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
