export default {
    version: "1.0.102",
    releaseDate: "Dec 01, 2025 11:00 AM",
    releaseDateTimestamp: 1764337200,
    changesSummary: "Enhanced blacklist toggle button with dynamic styling and emoji feedback",

    changes: [
        "1. Toggle button now shows 'Enable' with red/danger color (style 4) when blacklist is disabled",
        "2. Toggle button now shows 'Disable' with green/success color (style 3) when blacklist is enabled",
        "3. Error emoji added to button when disabled",
        "4. Success emoji added to button when enabled",
        "5. Button dynamically updates after each toggle to show the next action",
        "6. Response message includes the updated button with current state",
        "7. Role selector remains visible in the blacklist system panel"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
