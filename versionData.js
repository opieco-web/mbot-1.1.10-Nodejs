export default {
    version: "1.0.73",
    releaseDate: "Nov 28, 2025 07:20 AM",
    releaseDateTimestamp: 1764321600,
    changesSummary: "Fixed bot stability - added robust reconnection and error handling",

    changes: [
        "1. Added exponential backoff reconnection on disconnect (up to 5 attempts)",
        "2. Automatic reconnection with delays: 1s, 2s, 4s, 8s, 16s, max 30s",
        "3. Reset reconnect attempts counter on successful connection",
        "4. Added unhandled promise rejection listener",
        "5. Added uncaught exception listener",
        "6. Added detailed disconnect/reconnect console logging",
        "7. Improved error handling for connection failures"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
