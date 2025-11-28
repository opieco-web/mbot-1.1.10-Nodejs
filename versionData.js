export default {
    version: "1.0.86",
    releaseDate: "Nov 28, 2025 08:30 AM",
    releaseDateTimestamp: 1764325800,
    changesSummary: "Fixed Component V2 validation errors - replaced text inputs with modal buttons",

    changes: [
        "1. Fixed Discord validation error: removed type 4 fields from Component V2 rows",
        "2. Replaced delay text inputs with 'Set Delay' and 'Set Delete Time' buttons",
        "3. Buttons now open modals for entering delay values (1-300 seconds)",
        "4. Continue button on page 1 now works - can navigate to page 2",
        "5. All modal handlers properly integrated"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
