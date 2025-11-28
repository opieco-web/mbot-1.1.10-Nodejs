export default {
    version: "1.0.94",
    releaseDate: "Nov 28, 2025 09:15 AM",
    releaseDateTimestamp: 1764328500,
    changesSummary: "FIXED! Implemented collector-based setup wizard - all interactions now respond properly",

    changes: [
        "✅ COMPLETELY REWRITTEN setup wizard using message component collectors",
        "✅ Collector listens for ALL user interactions in the setup session",
        "✅ 10-minute timeout for complete wizard experience",
        "✅ All dropdowns, buttons, and modals now respond INSTANTLY",
        "✅ Page navigation works smoothly",
        "✅ Settings save properly on completion",
        "✅ Session cleanup on collector end"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
