export default {
    version: "1.0.76",
    releaseDate: "Nov 28, 2025 07:40 AM",
    releaseDateTimestamp: 1764322800,
    changesSummary: "Fixed setup wizard component structure - now responds properly to /setup command",

    changes: [
        "1. Fixed Component V2 structure in getSetupPage function",
        "2. Properly wrapped setup pages with content, components, and flags",
        "3. Updated /setup command handler to use complete payload structure",
        "4. Fixed button handlers to pass complete page data",
        "5. Setup wizard now fully functional and responds to interactions"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
