# Overview

This is a Discord bot built with discord.js v14 that provides nickname management, server customization, auto-response features, welcome messages, and fun interactive commands. The bot allows users to request nickname changes through a designated channel, with configurable approval modes (automatic or manual approval). It includes server-specific prefix management, custom auto-response triggers with reaction capabilities, AFK status system with timed message deletion, automated welcome messages for new members, and entertainment commands like enhanced Truth or Dare and Coin Flip.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Core Framework
- **Discord.js v14**: The bot uses the latest discord.js library with slash commands for all interactions
- **Node.js ESM**: Uses ES modules (`"type": "module"`) for modern JavaScript syntax
- **File-based persistence**: Simple JSON file storage (`data.json`) for configuration and state management

## Bot Architecture
- **Single-file monolithic structure**: All bot logic contained in `index.js` for simplicity
- **Command Collection Pattern**: Uses discord.js's built-in `Collection` for managing slash commands
- **Gateway Intents**: Configured for guilds, messages, message content, and guild members

## Data Storage
- **JSON File Storage**: All bot configuration persists in `data.json` for reliability and security
- **In-memory data loading**: Data is read on startup and written back on every change
- **Data structure includes**:
  - `channelId`: Designated channel for nickname requests
  - `mode`: Either "auto" (automatic approval) or "approval" (manual review)
  - `prefixes`: Server-specific command prefixes (object/map structure)
  - `autoresponses`: Trigger-based responses organized by guild ID, supporting react-type responses with custom emojis
  - `status`: Bot activity and presence configuration (type, text, emoji, streamUrl, presence, lastUpdatedBy, lastUpdatedAt)
  - `welcome`: Welcome message system configuration per guild (channelId, delay, enabled)
  - `afk`: AFK status storage (userId: {reason, timestamp}) - persists across bot restarts

## Command System
- **Slash Commands**: All interactions use Discord's native slash command API
- **Command Registration**: Commands registered via REST API with Discord
- **Key command categories**:
  1. **Nickname Management**: `/setchannel`, `/mode`, `/reset`
  2. **Server Configuration**: `/setprefix` (admin-only with ManageGuild permission), `/prefix`
  3. **Moderation Features**: `/autoresponse` with subcommands (`add`, `remove`, `list`) - all ephemeral
  4. **Welcome System**: `/welcome` with subcommands (`setchannel`, `delay`, `enable`, `disable`) - moderator-only, all ephemeral
  5. **Status Management**: `/status` with subcommands (`set`, `presence`, `emoji`, `remove`, `info`) - moderator-only, all ephemeral
  6. **User Features**: `/afk`, `/avatar`, `/ping` (moderator-only)
  7. **Fun Commands**: `/truthordare` (15 truths, 15 dares), `/coinflip` (public replies)
  8. **Bot Monitoring**: `/ping` - Shows WebSocket latency, hosting delay, response time, and uptime (ephemeral)
- **Prefix Commands**: Server-specific prefix (default `!`)
  - `!afk` - Set AFK status (message deleted after 5s, reply after 30s, persistent across bot restarts)
  - `!av` - Show user avatar
  - `!td` - Truth or Dare (same enhanced pool as slash command)
  - `!cf` - Coin flip (public reply)
  - `!bp` - Ping command (public reply)

## Permission Model
- **Permission-based commands**: Uses `setDefaultMemberPermissions()` for admin commands
- **PermissionsBitField**: Leverages discord.js permission flags for access control

## Event Handling
- **Gateway Events**: Bot listens to Discord gateway events
- **Message Content Intent**: Required for reading message content (auto-responses)
- **Button Interactions**: Uses ActionRowBuilder and ButtonBuilder for interactive components
- **Bot Ready Event**: Applies saved status and presence from data.json on startup, loads all AFK statuses
- **GuildMemberAdd Event**: Sends welcome messages to new members with configurable delay
- **MessageCreate Event**: Checks mentions for AFK users, handles AFK status removal on user return

## AFK System (Persistent Storage)
- **Persistent Storage**: All AFK data (userId, reason, timestamp) saved to data.json immediately
- **Bot Restart Resilience**: AFK statuses loaded from data.json on bot startup via ClientReady event
- **Concurrent Users**: Multiple users can set AFK simultaneously without conflicts (each user keyed by ID)
- **Message Deletion Timers**: User command deleted after 5s, bot confirmation deleted after 30s, mention response deleted after 60s
- **Mention Detection**: When AFK user is mentioned, bot replies with Discord relative timestamp
- **Return Handling**: When AFK user sends any message, they're removed from AFK status and receive welcome-back message with duration
- **Duration Format**: Uses Discord `<t:timestamp:R>` format for automatic relative time display (e.g., "5 minutes ago")

## Welcome Message System
- **Automated Greetings**: Sends random welcome messages when new members join
- **Message Pool**: 60 pre-configured messages in English, Bangla, and Banglish mix (ages 15-20)
- **Configurable Delay**: Set delay (0-300 seconds) before sending welcome message
- **Per-Server Settings**: Each server can configure its own welcome channel, delay, and enable/disable status
- **Permissions**: Welcome system management requires Manage Server or Administrator permissions

## Bot Status & Presence
- **Activity Types**: Supports Playing, Listening, Watching, Competing, and Streaming (with URL validation for Twitch/YouTube)
- **Presence States**: Online, Idle, Do Not Disturb, Invisible
- **Persistence**: Status and presence settings are saved to data.json and restored on bot restart
- **Permissions**: Status management requires Manage Server or Administrator permissions

# External Dependencies

## NPM Packages
- **discord.js** (^14.13.0): Primary Discord API wrapper
  - Includes sub-packages: @discordjs/builders, @discordjs/collection, @discordjs/formatters
  - Provides REST client, gateway connection, and command builders

## Discord API
- **REST API**: Used for slash command registration via Routes
- **Gateway WebSocket**: Real-time event streaming from Discord servers
- **Required Scopes**: Bot requires guilds, messages, message content, and guild members intents

## Environment Variables
- **DISCORD_BOT_TOKEN**: Authentication token for the Discord bot
- **DISCORD_CLIENT_ID**: Application/client ID for command registration

## File System
- **fs module**: Native Node.js module for reading/writing `data.json`
- **Synchronous file operations**: Uses `readFileSync` for initial data loading