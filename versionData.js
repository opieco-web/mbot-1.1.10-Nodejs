export default {
    version: "1.1.08",
    releaseDate: "Dec 01, 2025 11:40 AM",
    releaseDateTimestamp: 1764339000,
    changesSummary: "Fixed bulk message deletion to work across entire server, not just current channel",

    changes: [
        "1. FIXED: Message deletion now scans ALL text channels in the guild",
        "2. IMPROVED: Collects user's messages across all channels (not limited to current channel)",
        "3. FIXED: Correctly selects and deletes their 40 most recent messages globally",
        "4. OPTIMIZED: Groups messages by channel before bulk deletion for efficiency",
        "5. Enhanced: Console log shows total deleted + number of channels affected"
    ],

    versionGuide: `
📌 Versioning Guide (After v1.0.100)

MAJOR.MINOR.PATCH (e.g., 1.1.08)
- MAJOR: Stays 1 (Discord bot version)
- MINOR: 1 (after crossing v1.0.100, middle number becomes 1)
- PATCH: Increments (08 = 8th patch after v1.0.100)

Previous format: v1.0.0 → v1.0.100
New format: v1.1.0 → v1.1.08 (and beyond)
    `
};
