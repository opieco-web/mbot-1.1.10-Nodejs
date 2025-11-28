export default {
    version: "1.0.82",
    releaseDate: "Nov 28, 2025 08:10 AM",
    releaseDateTimestamp: 1764324600,
    changesSummary: "Fixed all setup wizard interactions, added toggle state tracking, improved button styling, dynamic status display",

    changes: [
        "1. ALL interactions now respond properly with deferUpdate()",
        "2. Toggle buttons track state: enabled (green), disabled (red) - toggle with each click",
        "3. Previous/Next buttons improved: '◀ Previous' and 'Next ▶' with better styling",
        "4. Page 1 & 3 show real-time status: ✅ active or ❌ inactive based on enabled features",
        "5. Toggle states persist across navigation within same session",
        "6. All dropdown, mode buttons, and selections now respond"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
