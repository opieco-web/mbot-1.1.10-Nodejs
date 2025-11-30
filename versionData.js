export default {
    version: "1.0.88",
    releaseDate: "Nov 30, 2025 09:00 AM",
    releaseDateTimestamp: 1764327600,
    changesSummary: "Reorganized permissions by danger level - most powerful first",

    changes: [
        "1. Administrator permission listed first (most dangerous)",
        "2. Management permissions (Manage Server, Roles, Channels) listed second",
        "3. Audit/moderation permissions (View Audit Log, Kick, Ban, Moderate) listed third",
        "4. Voice moderation (Mute, Deafen, Move) listed fourth",
        "5. Standard management (Messages, Nicknames, Webhooks, Emojis) listed fifth",
        "6. Basic permissions (Create Invite) listed last",
        "7. Permissions now display from most dangerous to least dangerous"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
