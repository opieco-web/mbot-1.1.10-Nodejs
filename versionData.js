export default {
    version: "1.0.101",
    releaseDate: "Dec 01, 2025 10:30 AM",
    releaseDateTimestamp: 1764335400,
    changesSummary: "Redesigned blacklist system UI with button toggle and role selector",

    changes: [
        "1. Updated /blacklist-system with new interactive UI (Component V2 format)",
        "2. Added 'Enable or Disable' button for quick system toggle",
        "3. Added role selector menu to choose which roles can use blacklist commands",
        "4. Both /blacklist and !bkl prefix commands now check selected roles",
        "5. Removed troll boss terminology - now uses 'selected roles' language",
        "6. Added button and select menu interaction handlers",
        "7. Role-based access control for both slash and prefix blacklist commands",
        "8. Updated allowedRoleIds data structure in both servers and mining-bangladesh.json"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
