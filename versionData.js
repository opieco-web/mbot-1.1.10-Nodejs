export default {
    version: "1.1.10",
    releaseDate: "Dec 01, 2025 11:50 AM",
    releaseDateTimestamp: 1764339600,
    changesSummary: "Added comprehensive logging to debug message deletion across channels",

    changes: [
        "1. Added: Detailed logging at each step of message deletion",
        "2. Logs: Channel count, messages found per channel, total collected",
        "3. Logs: Message grouping, deletion process, completion status",
        "4. This will help identify exactly where messages are/aren't being deleted",
        "5. Check console logs after running !bkl to see the full deletion process"
    ],

    versionGuide: `
📌 Versioning Guide (After v1.0.100)

MAJOR.MINOR.PATCH (e.g., 1.1.10)
- MAJOR: Stays 1 (Discord bot version)
- MINOR: 1 (after crossing v1.0.100, middle number becomes 1)
- PATCH: Increments (10 = 10th patch after v1.0.100)

Previous format: v1.0.0 → v1.0.100
New format: v1.1.0 → v1.1.10 (and beyond)
    `
};
