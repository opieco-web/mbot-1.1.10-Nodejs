# Server Cleanup Strategy

## Problem
When a bot is kicked, banned, or removed from a server, that server's data entry in `servers.json` becomes **useless orphaned data**. It consumes storage and clutters the database.

## Solution
Automatically delete server data when the bot loses access.

---

## Cleanup Triggers

### 1. **Bot Kicked from Server**
```
Event: GuildDelete (fires when bot is removed)
Action: cleanupKickedServer(guildId)
Result: Server entry DELETED from servers.json ✅
```

### 2. **Bot Banned from Server**
```
Event: Client.on('guildUnavailable') or GuildDelete
Action: cleanupBannedServer(guildId)
Result: Server entry DELETED ✅
```

### 3. **Server Deleted by Owner**
```
Event: GuildDelete
Action: cleanupDeletedServer(guildId)
Result: Server entry DELETED ✅
```

### 4. **Bot Voluntarily Leaves**
```
Event: GuildMemberRemove (when client.user.id leaves)
Action: cleanupLeftServer(guildId)
Result: Server entry DELETED ✅
```

### 5. **Periodic Cleanup (Optional)**
```
Trigger: On bot startup or timer
Action: cleanupOrphanedServers(client.guilds.cache.map(g => g.id))
Purpose: Find & delete entries for servers bot is no longer in
Result: Database stays clean ✅
```

---

## Before/After Comparison

### Before Cleanup
```json
{
  "GUILD_1": { ... },
  "GUILD_2": { ... },
  "GUILD_3": { ... },      ← Bot was kicked from here
  "GUILD_4": { ... },      ← Server was deleted
  "GUILD_5": { ... }
}
```

### After Cleanup
```json
{
  "GUILD_1": { ... },
  "GUILD_2": { ... },
  "GUILD_5": { ... }
}
```

Result: Database is lean, contains ONLY active servers. ✅

---

## Implementation in Bot Events

### In index.js

```javascript
import { cleanupKickedServer } from './src/utils/cleanupServer.js';

// When bot is removed from server
client.on(Events.GuildDelete, async guild => {
    cleanupKickedServer(guild.id, guild.name);
});

// When bot voluntarily leaves
client.on(Events.GuildMemberRemove, async member => {
    if (member.id === client.user.id) {
        cleanupLeftServer(guild.id, guild.name);
    }
});

// Optional: Cleanup on startup
client.on(Events.ClientReady, async () => {
    const activeGuilds = client.guilds.cache.map(g => g.id);
    cleanupOrphanedServers(activeGuilds);
});
```

---

## Storage Impact

### Example: 1000 Server Bot

**Without Cleanup:**
- Active servers: 800
- Orphaned/kicked: 200 (useless data sitting in JSON)
- Database bloat: 20%+ wasted space

**With Cleanup:**
- Active servers: 800
- Orphaned/kicked: 0 (automatically deleted)
- Database bloat: 0% ✅

---

## Safety Guarantees

✅ **Only deletes when bot loses access** - Never deletes active servers
✅ **Fresh start** - If bot rejoin later, gets new default profile
✅ **No accidental loss** - Server data is irrelevant once bot is gone anyway
✅ **Automatic** - No manual intervention needed
✅ **Atomic** - Each delete is safe, doesn't affect other servers

---

## Available Functions

```javascript
// Manual cleanup for specific scenarios
cleanupKickedServer(guildId)          // Bot kicked
cleanupBannedServer(guildId)          // Bot banned
cleanupDeletedServer(guildId)         // Server deleted
cleanupLeftServer(guildId)            // Bot left voluntarily

// Automatic cleanup
cleanupOrphanedServers(activeGuildIds)  // Find & delete orphaned entries

// Inspection
getCleanupStats()                     // See how many servers in database
```

---

## Bottom Line
When a bot loses access to a server, its data is **immediately deleted**. This keeps the database lean, prevents bloat, and ensures `servers.json` only contains data for servers the bot is actually in.
