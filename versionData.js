export default {
    version: "1.0.85",
    releaseDate: "Nov 30, 2025 08:45 AM",
    releaseDateTimestamp: 1764326700,
    changesSummary: "Added Permissions section and smart member list pagination",

    changes: [
        "1. Added Permissions section showing important role permissions (Administrator, Kick, Mute, Ban, etc)",
        "2. Permissions section displays below role icon in Component V2 format",
        "3. Member list now fits maximum members possible within 4,000 character limit",
        "4. Shows 'Too many to display' when members exceed character limit",
        "5. Member list includes count and join date for each member",
        "6. Proper character counting to prevent truncation"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
