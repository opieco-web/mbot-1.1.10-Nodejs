export default {
    version: "1.0.10",

    changelog: `
# Changelog

## 1.0.10 — (2025-11-25)
- Restructured bot to use organized modular command system
- Fixed avatar command to properly display server avatars
- Migrated all commands to src/commands/ folder structure
- Improved code maintainability and organization

## 1.0.9
- Added avatar command with server/default avatar switching
- Implemented modular command architecture

## 1.0.8
- Fixed AFK auto-remove bug
- Improved welcome message system
- Added /status config page 2

## 1.0.7
- Added nickname formatter
- Implemented nickname filtering system

## 1.0.6
- Added welcome message system
- Implemented bot configuration panel

## 1.0.5
- Added auto-response triggers
- Implemented prefix customization

## 1.0.4
- Added AFK status tracking
- Implemented mention notifications for AFK users

## 1.0.3
- Initial stable release
- Core commands implemented
    `,

    versionGuide: `
📌 Versioning Guide (How to Update the Bot Version)

The bot uses the standard "Semantic Versioning" system:
MAJOR.MINOR.PATCH

Example: 1.0.10

➤ 1 = MAJOR Version
   - Increase this when big or breaking changes happen.
   - Example: 1.0.0 → 2.0.0

➤ 0 = MINOR Version
   - Increase this when adding new features.
   - Example: 1.0.0 → 1.1.0 → 1.2.0

➤ 10 = PATCH Version
   - Increase this for small fixes and improvements.
   - Example: 1.0.1 → 1.0.2 → 1.0.10

Summary:
- Big changes = MAJOR++
- New features = MINOR++
- Small bug fixes = PATCH++
    `
};
