# Data Structure - Complete Separation

## System Overview

The bot uses **two completely separate data systems** with zero cross-contamination:

### 1. MINING BANGLADESH (Main Server)
```
File: data/mining-bangladesh.json
Guild ID: 1296783492989980682

RULES:
✅ ALL access goes ONLY through mining-bangladesh.json
✅ NEVER stored in servers.json
✅ NEVER touched by servers.json functions
✅ Private, exclusive data for main server

Functions that work here:
- getGuildData('1296783492989980682') in index.js
- saveGuildData('1296783492989980682', data) in index.js
- Direct file operations in main bot code
```

### 2. OTHER SERVERS
```
File: data/servers.json
Guild IDs: Any server EXCEPT 1296783492989980682

RULES:
✅ ALL access goes ONLY through servers.json
✅ NEVER stored in mining-bangladesh.json
✅ Completely isolated from main server data
✅ Per-server profiles

Functions that work here:
- loadServer(guildId) - loads & auto-creates profiles
- saveServer(guildId, data) - saves server data
- updateServerProperty(guildId, property, value) - updates single field
- deleteServer(guildId) - removes server profile
- cleanupKickedServer(guildId) - cleanup on kick/ban/leave
```

---

## File Structures

### mining-bangladesh.json
```json
{
  "bot": {
    "status": { ... }
  },
  "nickname": { ... },
  "prefix": "!",
  "autoresponse": [ ... ],
  "afk": { ... },
  "welcome": { ... },
  "config": { ... },
  "topics": { ... },
  "createdAt": "..."
}
```

### servers.json
```json
{
  "GUILD_ID_1": {
    "guildId": "GUILD_ID_1",
    "guildName": "Server Name",
    "prefix": "#",
    "welcome": { ... },
    "nickname": { ... },
    "afk": { ... },
    "config": { ... },
    "autoresponse": [ ... ],
    "createdAt": "..."
  },
  "GUILD_ID_2": {
    ...
  }
}
```

---

## Guardrails in Place

All utility functions check the guild ID:

```javascript
if (guildId === '1296783492989980682') {
    console.error('Mining Bangladesh must use mining-bangladesh.json');
    return false; // or null
}
```

This means:
❌ `loadServer('1296783492989980682')` → ERROR (use mining-bangladesh.json)
❌ `saveServer('1296783492989980682', data)` → ERROR (use mining-bangladesh.json)
❌ `deleteServer('1296783492989980682')` → ERROR (use mining-bangladesh.json)
✅ `loadServer('OTHER_GUILD_ID')` → Works perfectly
✅ `saveServer('OTHER_GUILD_ID', data)` → Works perfectly

---

## Flow Example

### Mining Bangladesh Operation
```
Command in Mining Bangladesh server
  ↓
getGuildData('1296783492989980682')
  ↓
Read/Write mining-bangladesh.json directly
  ↓
✅ Complete isolation, never touches servers.json
```

### Other Server Operation
```
Command in Other Server (e.g., Guild 999)
  ↓
loadServer('999')
  ↓
Read/Write servers.json (ONLY Guild 999 entry)
  ↓
✅ Complete isolation, never touches mining-bangladesh.json
```

---

## Summary

| Aspect | Mining Bangladesh | Other Servers |
|--------|-------------------|---------------|
| **File** | mining-bangladesh.json | servers.json |
| **Guild ID** | 1296783492989980682 | Any other |
| **Load Function** | getGuildData() | loadServer() |
| **Save Function** | saveGuildData() | saveServer() |
| **Update Function** | Direct in code | updateServerProperty() |
| **Delete Function** | Manual removal | deleteServer() |
| **Auto-Create** | No | Yes |
| **Cross-Contamination** | Zero ✅ | Zero ✅ |

**Both systems are completely isolated and will never interfere with each other.**
