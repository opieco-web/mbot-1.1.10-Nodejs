# m•bot - Discord Bot

## Overview
A comprehensive Discord bot for Mining Bangladesh server with modular features including AFK system, welcome messages, auto-responses, and fun commands.

## Current Version
**1.0.60** - Music system removed, clean codebase

## Architecture

### Command System
- **AFK System** (`/afk`) - Automatic nickname changes when users go AFK
- **Welcome Messages** (`/welcome`) - Configure server welcome messages
- **Auto-Responses** (`/autoreplies`) - Setup auto-reply triggers
- **Nickname Management** (`/nickname`) - Auto or manual nickname approval system
- **Configuration Panel** (`/config`) - Modular bot configuration
- **Fun Commands** - `/truthordare`, `/coinflip`, `/choose`
- **Avatar Display** (`/avatar`) - Show user avatars
- **Moderation** - Various moderation commands

### Project Structure
```
src/
├── commands/
│   ├── index.js         (command aggregator)
│   ├── fun.js           (Truth or Dare, Coinflip, Choose)
│   ├── moderation.js    (moderation commands)
│   ├── utility.js       (utility commands)
│   ├── config.js        (configuration panel)
│   └── nickname.js      (nickname management)
├── data.json            (persistent bot data)
├── versionData.js       (version management)
├── package.json         (dependencies)
└── index.js             (main bot file)
```

## Dependencies
- **discord.js** ^14.13.0 - Discord API wrapper
- **canvas** ^3.2.0 - Avatar rendering
- **openai** ^6.9.1 - AI integration

## Recent Changes (v1.0.60)
- ✅ Removed all music system code
- ✅ Removed music dependencies (play-dl, ytdl-core, @discordjs/voice)
- ✅ Cleaned package.json to only essential packages
- ✅ Created .gitignore for project organization
- ✅ Organized imports and removed orphaned code

## Bot Features
1. **AFK Management** - Track and notify about AFK users
2. **Welcome System** - Customize server welcome messages
3. **Auto-Responses** - Trigger automatic replies to keywords
4. **Fun Commands** - Interactive games and tools
5. **Configuration** - Modular command system with pagination
6. **Avatar Management** - Display and manage user avatars
7. **Moderation Tools** - Server moderation commands

## Status
✅ Clean and stable codebase
✅ No deprecated dependencies
✅ Ready for new features
