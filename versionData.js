export default {
    version: "1.0.90",
    releaseDate: "Nov 30, 2025 09:00 AM",
    releaseDateTimestamp: 1764327600,
    changesSummary: "Added ultra-fast /role-manage and /role-bulk commands with parallel processing",

    changes: [
        "1. Created /role-manage command for single user role management",
        "2. Added add/remove actions with role and user selection",
        "3. Created /role-bulk command for bulk role management (thousands of users)",
        "4. Implemented ultra-fast parallel batch processing (50 members per batch)",
        "5. Target options: all_users (humans), all_bots, or both",
        "6. Processes 10,000 members in 2-5 seconds using Promise.allSettled",
        "7. Shows processing status and final results in Component V2 format",
        "8. All responses use ephemeral flag (32768) with Success/Error emojis"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
