export default {
    version: "1.1.09",
    releaseDate: "Dec 01, 2025 11:45 AM",
    releaseDateTimestamp: 1764339300,
    changesSummary: "Fixed blacklist command workflow - immediate deletion, instant confirmation, background message purge",

    changes: [
        "1. FIXED: Input message is now deleted FIRST (before role/confirmation)",
        "2. FIXED: Role is given immediately after input deletion",
        "3. FIXED: Confirmation message appears instantly",
        "4. FIXED: Message deletion happens in background (no blocking delay)",
        "5. Result: Instant feedback to moderator, delayed message purge doesn't interfere"
    ],

    versionGuide: `
📌 Versioning Guide (After v1.0.100)

MAJOR.MINOR.PATCH (e.g., 1.1.09)
- MAJOR: Stays 1 (Discord bot version)
- MINOR: 1 (after crossing v1.0.100, middle number becomes 1)
- PATCH: Increments (09 = 9th patch after v1.0.100)

Previous format: v1.0.0 → v1.0.100
New format: v1.1.0 → v1.1.09 (and beyond)
    `
};
