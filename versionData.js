export default {
    version: "1.0.74",
    releaseDate: "Nov 28, 2025 07:25 AM",
    releaseDateTimestamp: 1764322500,
    changesSummary: "Comprehensive cleanup and stability improvements",

    changes: [
        "1. Fixed bot stability with exponential backoff reconnection",
        "2. Added startup console message (bot online status)",
        "3. Consolidated data files (servers.json unified)",
        "4. Cleaned up all backup and temporary files",
        "5. Improved error handling for connection failures",
        "6. Added unhandled promise rejection listeners"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
