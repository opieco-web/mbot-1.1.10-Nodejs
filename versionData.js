export default {
    version: "1.1.07",
    releaseDate: "Dec 01, 2025 11:35 AM",
    releaseDateTimestamp: 1764338700,
    changesSummary: "Fixed role/member ID distinction, immediate message deletion, and bulk message purge on blacklist",

    changes: [
        "1. FIXED: Role/Member ID bug - roles now stored with 'role:' prefix to distinguish from user IDs",
        "2. FIXED: Display now correctly shows roles separately from individual members (no mixed mentions)",
        "3. FIXED: Prefix command message deletion is now immediate (not 10s delay)",
        "4. NEW: When user is blacklisted, their last 40 messages are automatically purged from the channel",
        "5. Improved: Console logging shows exact number of messages deleted"
    ],

    versionGuide: `
📌 Versioning Guide (After v1.0.100)

MAJOR.MINOR.PATCH (e.g., 1.1.07)
- MAJOR: Stays 1 (Discord bot version)
- MINOR: 1 (after crossing v1.0.100, middle number becomes 1)
- PATCH: Increments (07 = 7th patch after v1.0.100)

Previous format: v1.0.0 → v1.0.100
New format: v1.1.0 → v1.1.07 (and beyond)
    `
};
