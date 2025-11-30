export default {
    version: "1.0.98",
    releaseDate: "Nov 30, 2025 09:40 AM",
    releaseDateTimestamp: 1764330000,
    changesSummary: "Fixed other server commands - Added comprehensive null-safety checks to all role connection functions",

    changes: [
        "1. Added null-safety checks in getMemberRoleActionsGain() for undefined connections",
        "2. Added null-safety checks in getMemberRoleActionsLose() for undefined connections",
        "3. Added validation that config objects are valid before accessing properties",
        "4. Added Array.isArray() checks before processing role arrays",
        "5. Added try-catch blocks in all connection utility functions",
        "6. Ensures all functions return valid defaults (empty arrays/objects) on error",
        "7. Prevents 'Cannot set properties of undefined' errors for other servers"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
