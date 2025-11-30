export default {
    version: "1.0.89",
    releaseDate: "Nov 30, 2025 09:05 AM",
    releaseDateTimestamp: 1764327900,
    changesSummary: "Fixed rate limit error in /role-info member fetching",

    changes: [
        "1. Fixed GatewayRateLimitError by using member cache first",
        "2. Only fetches members if cache is empty",
        "3. Gracefully handles rate limit errors by using cached members",
        "4. Prevents rapid member list requests from causing bot delays",
        "5. Improves performance by leveraging cached member data"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
