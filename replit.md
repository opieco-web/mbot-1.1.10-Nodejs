# Overview

This is a Discord bot built with discord.js v14 that provides nickname management, server customization, auto-response features, welcome messages, and fun interactive commands. The bot allows users to request nickname changes through a designated channel, with configurable approval modes (automatic or manual approval). It includes server-specific prefix management, custom auto-response triggers with reaction capabilities, AFK status system with timed message deletion, automated welcome messages for new members, and entertainment commands like enhanced Truth or Dare and Coin Flip.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Project Structure (Fully Modularized - Nov 25, 2025)
```
/
├── index.js                    # Main entry point (~550 lines, imports modular commands)
├── src/
│   ├── commands/              # Modular command definitions (organized by category)
│   │   ├── nickname.js        # Nickname + nicknamefilter commands
│   │   ├── fun.js             # truthordare, coinflip, choose commands
│   │   ├── moderation.js      # autoresponse, welcome, afklist, send commands
│   │   ├── utility.js         # avatar, botinfo, search, afk commands
│   │   ├── config.js          # config command
│   │   └── index.js           # Export all commands
│   ├── events/                # Event handlers (ready to expand)
│   │   ├── ready.js           # ClientReady event
│   │   └── index.js           # Event setup coordination
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
│   └── config/                # Configuration files
├── package.json               # Dependencies
└── index.js.backup            # Backup of working version
```

## Core Framework
- **Discord.js v14**: Latest Discord API wrapper with slash commands
- **Node.js ESM**: ES modules with `"type": "module"` for modern syntax
- **File-based persistence**: JSON storage in `/src/database/data.json`

## Bot Architecture
- **Modular structure**: Commands organized by category (5 category-grouped files instead of monolithic)
- **Category-grouped commands**: Related commands grouped together (e.g., all nickname commands in one file)
- **Command Collection Pattern**: Uses discord.js's built-in Collection for commands
- **Gateway Intents**: Configured for guilds, messages, content, and members
- **Event-driven design**: Event handlers separate from command logic
- **Persistent data**: All configuration saved to data.json on every change

## Data Storage
- **JSON File Storage**: `/src/database/data.json` persists all configuration
- **Data structure**:
  - `nickname`: Channel ID, mode (auto/approval), banned word filter
  - `prefix`: Server-specific prefixes (guildId → prefix)
  - `autoresponse`: Trigger-based responses (guildId → [triggers])
  - `status`: Bot activity & presence (type, text, emoji, url, state)
  - `welcome`: Welcome system per guild (channelId, delay, enabled)
  - `afk`: AFK user storage (userId → {reason, timestamp})

## Command Organization (Modular Categories)

**📝 Nickname Category** (`/src/commands/nickname.js`)
- `/nickname setup` - Set channel and mode (Auto or Approval)
- `/nickname reset` - Reset your nickname to default
- `/nicknamefilter add` - Ban a word from nicknames
- `/nicknamefilter remove` - Unban a word
- `/nicknamefilter list` - Show all banned words

**🎮 Fun Category** (`/src/commands/fun.js`)
- `/truthordare` - Random truth question or dare
- `/coinflip` - Get Heads or Tails
- `/choose` - Bot chooses between 2-3 options

**🛡️ Moderation Category** (`/src/commands/moderation.js`)
- `/autoresponse add` - Create text/emoji trigger
- `/autoresponse remove` - Delete trigger
- `/autoresponse list` - Show all triggers
- `/welcome enable` - Set welcome channel & delay
- `/welcome disable` - Disable welcomes
- `/afklist` - View all AFK users (mod-only)
- `/send` - Send formatted Component V2 message (mod-only)

**🔧 Utility Category** (`/src/commands/utility.js`)
- `/avatar` - Display user avatar (default/server/both)
- `/botinfo` - View bot stats & configuration
- `/search` - Search Wikipedia or local bot data
- `/afk` - Set AFK status with reason

**⚙️ Config Category** (`/src/commands/config.js`)
- `/config` - 3-page configuration UI panel

**Prefix Commands** (default `!`)
- `!afk [reason]` - Set AFK status
- `!av [@user]` - Show avatar
- `!td` - Truth or Dare
- `!cf` - Coin flip
- (More prefix commands available)

## Permission Model
- **Member Permissions**: Uses `setDefaultMemberPermissions()` for admin commands
- **PermissionsBitField**: Discord permission flags for access control
- **Moderator-only**: Commands like `/send`, `/afklist` require ManageGuild/ManageMessages

## Component V2 System
- **All responses**: Use Container format (type 17) for modern Discord UI
- **No embeds**: Purely Component V2 for consistency
- **Custom emojis** for status feedback:
  - `<:Correct:1440296238305116223>` - Success
  - `<:Error:1440296241090265088>` - Error
  - `<:warning:1441531830607151195>` - Warning
  - And 6+ others for rich responses

## Event Handling (Organized)
- **ClientReady** (`/src/events/ready.js`): Bot startup, keep-alive activation
- **InteractionCreate** (inline in index.js): Slash commands, buttons, modals
- **MessageCreate** (inline in index.js): Prefix commands, auto-responses, AFK mentions
- **GuildMemberAdd** (inline in index.js): Send welcome messages with configurable delay
- **Disconnect/Error/Warn** (`/src/events/ready.js`): Connection management

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

# Recent Changes (Nov 25, 2025)
- **COMPLETED: Full Modularization**
  - ✅ Extracted 14+ commands into 5 category-grouped files (instead of monolithic)
  - ✅ Organized: Nickname, Fun, Moderation, Utility, Config categories
  - ✅ Created modular structure: `/src/commands/`, `/src/events/`
  - ✅ Updated index.js to import all commands from modular files
  - ✅ Reduced main index.js from 3,089 to ~550 lines (with all handlers intact)
  - ✅ Bot remains 100% functional with all commands working

- **Previous (Nov 24, 2025)**
  - Removed `/setprefix` and `/prefix` commands (functionality moved to `/config`)
  - Removed `/meme` slash and prefix commands entirely
  - Removed `activity.js` (legacy event handler)
  - Fixed AFK command ephemeral message deletion error
  - Fixed JSON syntax error in data.json
