export default {
    version: "1.0.92",
    releaseDate: "Nov 30, 2025 09:20 AM",
    releaseDateTimestamp: 1764328800,
    changesSummary: "Removed problematic accessory field to fix Discord validation",

    changes: [
        "1. Removed type 9 component wrapper that was causing validation error",
        "2. Simplified header display to type 10 text component",
        "3. Removed accessory field that was breaking Discord API validation",
        "4. Cleaner component structure without unnecessary nesting"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
