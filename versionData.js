export default {
    version: "1.0.58",
    releaseDate: "Nov 28, 2025 06:00 AM",
    releaseDateTimestamp: 1764316800,
    changesSummary: "Code cleanup and structural refinement - 4 critical changes",

    changes: [
        "1. Removed all debug console.log/warn statements - cleaner production logs",
        "2. Deleted redundant afkUsers global variable - data now purely guild-isolated",
        "3. Cleaned project structure - removed legacy folders (events/, src/config/, src/database/, src/utils/) and unused root files",
        "4. Fixed afkUsers reference error in slash and prefix AFK commands - direct guild data assignment"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
