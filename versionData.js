export default {
    version: "1.0.85",
    releaseDate: "Nov 28, 2025 08:25 AM",
    releaseDateTimestamp: 1764325500,
    changesSummary: "Added message delete time control for temporary welcome messages",

    changes: [
        "1. Temporary messages now have two delay controls:",
        "   - Message Delay: When the message appears (1-300 sec, default 120)",
        "   - Message Delete Time: When message auto-deletes (1-300 sec, default 60)",
        "2. Text input fields accept and validate delay values",
        "3. Both delays persist when settings are saved"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
