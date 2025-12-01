export default {
    version: "1.0.103",
    releaseDate: "Dec 01, 2025 11:05 AM",
    releaseDateTimestamp: 1764337500,
    changesSummary: "Fixed emoji logic and role selector functionality",

    changes: [
        "1. SUCCESS emoji now shows on ENABLE button (when system is disabled)",
        "2. ERROR emoji now shows on DISABLE button (when system is enabled)",
        "3. Button colors corrected: Green (style 3) for Enable, Red (style 4) for Disable",
        "4. Role selector changed to proper Role Select Menu (type 8)",
        "5. Fixed role selector to only respond to role select interactions",
        "6. Added console logging for role selector updates",
        "7. Role selector now properly registers and saves selected roles"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
