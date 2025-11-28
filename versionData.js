export default {
    version: "1.0.79",
    releaseDate: "Nov 28, 2025 07:55 AM",
    releaseDateTimestamp: 1764323700,
    changesSummary: "Restructured setup.js to store page components directly - now works exactly like config command",

    changes: [
        "1. Rewrote setup.js to store page components as direct arrays (not wrapped)",
        "2. Removed unnecessary nesting - pageComponents ready to use immediately",
        "3. Setup command now uses identical format to config: components: [{ type: 17, components: pageComponents }]",
        "4. All page navigation uses same structure as working config command",
        "5. No manipulation needed - components used directly as provided"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
