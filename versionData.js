export default {
    version: "1.0.106",
    releaseDate: "Dec 01, 2025 11:25 AM",
    releaseDateTimestamp: 1764338700,
    changesSummary: "Fixed blacklist-system command structure and added live access roles/members display",

    changes: [
        "1. Fixed: Removed duplicate select menu entries (was showing Add/Remove dropdowns)",
        "2. Cleaned: Component structure now uses single mentionable select menu (type 7)",
        "3. Added: Dynamic display showing which roles and members currently have access",
        "4. Fixed: Select menu now has correct min_values: 0 and max_values: 25",
        "5. Added: Placeholder text 'Select roles or members...' for clarity"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
