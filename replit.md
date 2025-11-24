# Overview

This is a Discord bot built with discord.js v14 that provides nickname management, server customization, auto-response features, welcome messages, and fun interactive commands. The bot allows users to request nickname changes through a designated channel, with configurable approval modes (automatic or manual approval). It includes server-specific prefix management, custom auto-response triggers with reaction capabilities, AFK status system with timed message deletion, automated welcome messages for new members, and entertainment commands like enhanced Truth or Dare and Coin Flip.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Project Structure (Refactored)
```
/
├── index.js                    # Main entry point (clean, ~330 lines)
├── src/
│   ├── utils/                 # Utility functions & helpers
│   │   ├── helpers.js         # Cooldowns, duration, prefix, banned words
│   │   ├── components.js      # Avatar component builders
│   │   ├── status.js          # Bot status/presence management
│   │   └── index.js           # Export all utilities
│   ├── database/              # Data management
│   │   ├── data.json          # Central configuration storage
│   │   └── loadData.js        # Data loading & initialization
│   ├── data/                  # Static data
│   │   └── welcomeMessages.js # 60+ localized welcome messages
│   ├── commands/              # (Ready for command extraction)
│   ├── events/                # (Ready for event handlers)
│   └── config/                # Configuration files
├── activity.js                # Old event handler (legacy, unused)
└── package.json
```

## Core Framework
- **Discord.js v14**: Latest Discord API wrapper with slash commands
- **Node.js ESM**: ES modules with `"type": "module"` for modern syntax
- **File-based persistence**: JSON storage in `/src/database/data.json`

## Bot Architecture
- **Modular structure**: Separated utilities, data, components for maintainability
- **Command Collection Pattern**: Uses discord.js's built-in Collection for commands
- **Gateway Intents**: Configured for guilds, messages, content, and members
- **Stateless handlers**: Event-driven design with persistent data

## Data Storage
- **JSON File Storage**: `/src/database/data.json` persists all configuration
- **Data structure**:
  - `nickname`: Channel ID, mode (auto/approval), banned word filter
  - `prefix`: Server-specific prefixes (guildId → prefix)
  - `autoresponse`: Trigger-based responses (guildId → [triggers])
  - `status`: Bot activity & presence (type, text, emoji, url, state)
  - `welcome`: Welcome system per guild (channelId, delay, enabled)
  - `afk`: AFK user storage (userId → {reason, timestamp})

## Command System
- **Slash Commands**: Discord native API via REST
- **Prefix Commands**: Server-specific (default `!`)
- **Key commands**:
  1. `/nickname` - Setup channel/mode, reset nickname
  2. `/nicknamefilter` - Ban/unban words in nicknames
  3. `/afk` - Set AFK status with reason
  4. `/afklist` - View all AFK users (mod-only)
  5. `/avatar` - Display user avatar (default/server/both)
  6. `/truthordare` - Random truth question or dare
  7. `/autoresponse` - Manage triggers (text/emoji responses)
  8. `/coinflip` - Random coin flip result
  9. `/welcome` - Enable/disable welcome messages with delay
  10. `/botinfo` - View bot stats & information
  11. `/choose` - Random choice between 2-3 options
  12. `/send` - Send formatted Component V2 messages
  13. `/search` - Search Wikipedia or local bot data
  14. `/config` - Manage all bot settings (3-page UI)

- **Prefix Commands**: `!afk`, `!av`, `!td`, `!cf`, `!bi`, `!sh`, `!cs`

## Permission Model
- **Member Permissions**: Uses `setDefaultMemberPermissions()` for admin commands
- **PermissionsBitField**: Discord permission flags for access control

## Component V2 System
- **All responses**: Use Container format (type 17) for modern Discord UI
- **No embeds**: Purely Component V2 for consistency
- **Custom emojis**:
  - `<:Correct:1440296238305116223>` - Success
  - `<:Error:1440296241090265088>` - Error
  - `<:warning:1441531830607151195>` - Warning
  - And 6+ others for status feedback

## Event Handling
- **ClientReady**: Apply saved status, load AFK data, activate keep-alive
- **InteractionCreate**: Handle slash commands & buttons
- **MessageCreate**: Prefix commands, auto-responses, AFK mentions, nickname requests
- **GuildMemberAdd**: Send welcome messages with configurable delay

## AFK System
- **Persistent**: Saves to `/src/database/data.json` immediately
- **Restart-resilient**: Loads all AFK statuses on bot startup
- **Multiple users**: Each tracked by userId with reason & timestamp
- **Mention detection**: Replies when AFK user is tagged in chat
- **Return handling**: Removes AFK status when user sends a message

## Welcome System
- **60+ messages**: English, Bangla, and Banglish mix (ages 15-20)
- **Configurable delay**: 0-300 seconds before sending
- **Per-server settings**: Each guild can customize channel, delay, enabled state
- **Timed delivery**: Uses setTimeout for delayed sending

## Bot Status & Presence
- **Activity types**: Playing, Listening, Watching, Competing, Streaming
- **Presence states**: Online, Idle, Do Not Disturb, Invisible
- **Persistence**: Saved to data.json and restored on startup
- **Keep-alive**: Updates activity every 30 minutes to prevent idle timeout

## Utilities Modularized
- **helpers.js**: Cooldown management, duration calculation, prefix lookup, word filtering, delay parsing
- **components.js**: Avatar component building with media galleries
- **status.js**: Bot presence and activity management
- **loadData.js**: Data file initialization and topic loading

# External Dependencies

## NPM Packages
- **discord.js** (^14.13.0): Core Discord API
- **canvas**: Meme generation (prepared for future use)
- **openai**: AI integration (prepared for future use)

## Discord API
- **REST API**: Command registration & interactions
- **Gateway WebSocket**: Real-time event streaming
- **Required Intents**: Guilds, messages, message content, guild members

## Environment Variables
- `DISCORD_BOT_TOKEN`: Bot authentication
- `DISCORD_CLIENT_ID`: Application/client ID

## Recent Changes (Nov 24, 2025)
- Removed `/setprefix` and `/prefix` commands (functionality moved to `/config`)
- Removed `/meme` slash and prefix commands entirely
- Removed `activity.js` (legacy event handler)
- **REFACTORED**: Reorganized entire codebase from monolithic 2900-line file into modular structure
  - Extracted utilities to `/src/utils/` (helpers, components, status management)
  - Moved data handling to `/src/database/`
  - Organized static data in `/src/data/`
  - Created clean `index.js` (~330 lines) with organized imports
- Fixed AFK command ephemeral message deletion error
- Fixed JSON syntax error in data.json
