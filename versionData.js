export default {
    version: "1.1.06",
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
📌 Versioning Guide (After v1.0.100)

MAJOR.MINOR.PATCH (e.g., 1.1.06)
- MAJOR: Stays 1 (Discord bot version)
- MINOR: 1 (after crossing v1.0.100, middle number becomes 1)
- PATCH: Increments (06 = 6th patch after v1.0.100)

Previous format: v1.0.0 → v1.0.100
New format: v1.1.0 → v1.1.06 (and beyond)
    `
};
