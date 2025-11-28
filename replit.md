# Overview

This is a Discord bot built with discord.js v14 that provides nickname management, server customization, auto-response features, welcome messages, and fun interactive commands. The bot allows users to request nickname changes through a designated channel, with configurable approval modes (automatic or manual approval). It includes server-specific prefix management, custom auto-response triggers with reaction capabilities, AFK status system with timed message deletion, automated welcome messages for new members, and entertainment commands like enhanced Truth or Dare and Coin Flip.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Data Management (Multi-Server with Complete Isolation)

**Files:**
- `mining-bangladesh.json` - Mining Bangladesh server ONLY (exclusive features)
- `servers.json` - All other servers (shared file with complete data isolation)

**Architecture:**
- Mining Bangladesh gets full features: AFK system, nickname management, bot status control, welcome messages, moderation
- Other servers get server-specific features with separate data storage
- Zero cross-server data contamination through strict file separation
- Automatic server cleanup when bot is kicked/banned/leaves

## Project Structure
```
/
├── index.js                    # Main entry point (~3,400 lines)
├── src/
│   ├── commands/              # 7 modular commands (organized by category)
│   │   ├── nickname.js        # Nickname + nicknamefilter commands
│   │   ├── fun.js             # truthordare, coinflip, choose commands
│   │   ├── moderation.js      # autoresponse, welcome, afklist, send commands
│   │   ├── utility.js         # avatar, botinfo, search, afk commands
│   │   ├── config.js          # config command
│   │   ├── mining-only.js     # setbotonstatus, setactivitytype, nickname system (Mining Bangladesh exclusive)
│   │   └── index.js           # Export all commands
│   ├── utils/                 # Utility functions
│   │   ├── loadServer.js      # Load server data
│   │   ├── saveServer.js      # Save server data
│   │   └── cleanupServer.js   # Cleanup when bot leaves server
│   └── ...
├── data/
│   ├── mining-bangladesh.json # Mining Bangladesh exclusive data
│   └── servers.json           # All other servers (consolidated)
├── package.json
├── versionData.js             # Version tracking & changelog
└── MULTI_SERVER_GUIDE.md      # Multi-server implementation guide
```

## Core Framework
- **Discord.js v14**: Latest Discord API wrapper with slash commands
- **Node.js ESM**: ES modules with modern syntax
- **File-based persistence**: JSON storage with complete data isolation

## Bot Architecture
- **Modular structure**: 7 commands organized by category
- **Multi-server support**: Mining Bangladesh (exclusive features) + other servers (standard features)
- **Component V2 UI**: Modern Discord UI with containers and text displays
- **Robust reconnection**: Exponential backoff on disconnect (up to 5 attempts)
- **Automatic server cleanup**: Removes data when bot leaves/is kicked

## Connection Stability
- **Exponential backoff reconnection**: 1s, 2s, 4s, 8s, 16s delays (max 30s)
- **Unhandled error listeners**: Promise rejections and uncaught exceptions handled
- **Automatic reset**: Reconnect attempts reset on successful connection
- **Detailed logging**: Console messages for all connection events

## Component V2 System
- **All responses**: Use Container format (type 17) for modern Discord UI
- **No embeds**: Purely Component V2 for consistency
- **Custom emojis** for status feedback:
  - `<:Correct:1440296238305116223>` - Success
  - `<:Error:1440296241090265088>` - Error
  - `<:warning:1441531830607151195>` - Warning

## Command Categories

**📝 Nickname** - Nickname management
**🎮 Fun** - Entertainment commands
**🛡️ Moderation** - Server management
**🔧 Utility** - Helpful tools
**⚙️ Config** - Bot configuration
**🔐 Mining Bangladesh Only** - Exclusive features

# Version Management

**Current Version**: 1.0.74
**Last Updated**: Nov 28, 2025 07:25 AM

## Versioning Format (Semantic)
- **MAJOR.MINOR.PATCH**
- PATCH: Bug fixes, small improvements
- MINOR: New features
- MAJOR: Breaking changes

## Recent Changes
- ✅ Fixed bot stability with robust reconnection logic
- ✅ Added startup console message (bot online status)
- ✅ Consolidated servers.json (removed redundant other-servers.json)
- ✅ Cleaned up all backup and temporary files
- ✅ 50+ responses use consistent Component V2 format
- ✅ Strict multi-server data isolation implemented
- ✅ Automatic server cleanup system active

# External Dependencies

## NPM Packages
- **discord.js** (^14.13.0): Core Discord API
- **canvas**: Image generation
- **openai**: AI integration

## Environment Variables
- `DISCORD_BOT_TOKEN`: Bot authentication
- `DISCORD_CLIENT_ID`: Application/client ID
