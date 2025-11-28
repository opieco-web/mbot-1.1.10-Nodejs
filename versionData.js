export default {
    version: "1.0.78",
    releaseDate: "Nov 28, 2025 07:50 AM",
    releaseDateTimestamp: 1764323400,
    changesSummary: "Fixed setup wizard to match config command format - type 17 wrapped in array with 32768 flag",

    changes: [
        "1. Setup command now uses exact config format: components: [{ type: 17, components: [...] }]",
        "2. Changed flags from IsComponentsV2 to 32768 | MessageFlags.Ephemeral",
        "3. Removed type 1 wrapper - Component V2 structure now matches working config command",
        "4. Navigation and completion pages use identical format to config command",
        "5. Setup wizard now responds properly without Discord errors"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
