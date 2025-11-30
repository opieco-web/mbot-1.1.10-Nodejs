export default {
    version: "1.0.77",
    releaseDate: "Nov 28, 2025 08:05 AM",
    releaseDateTimestamp: 1764324300,
    changesSummary: "Converted /roles-connection to full Component V2 container responses",

    changes: [
        "1. All /roles-connection responses now use Component V2 containers (type 17)",
        "2. Success messages use Correct emoji <:Correct:1440296238305116223>",
        "3. Error messages use Error emoji <:Error:1440296241090265088>",
        "4. Info messages use Warning emoji <:warning:1441531830607151195>",
        "5. List mode shows role connections in organized Component V2 format",
        "6. All responses consistent with bot's design system"
    ],

    versionGuide: `
📌 Versioning Guide

MAJOR.MINOR.PATCH (e.g., 1.0.11)
- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
    `
};
