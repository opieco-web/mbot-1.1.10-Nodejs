# Multi-Server Data Management Guide

## Structure Overview

```
project/
├── data/
│   └── servers.json          # Single file with ALL server profiles
├── src/
│   ├── commands/
│   │   ├── index.js
│   │   └── setprefix.js       # Example command
│   ├── utils/
│   │   ├── loadServer.js      # Load server data
│   │   └── saveServer.js      # Save server data
│   └── ...
└── index.js                   # Main bot file
```

## servers.json Format

```json
{
  "GUILD_ID_1": {
    "guildId": "GUILD_ID_1",
    "guildName": "Server Name",
    "prefix": "#",
    "welcome": { "enabled": false, "channelId": null },
    "nickname": { "channelId": null, "mode": "auto", "filter": [] },
    "afk": {},
    "config": {},
    "autoresponse": [],
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "GUILD_ID_2": {
    "guildId": "GUILD_ID_2",
    "guildName": "Another Server",
    "prefix": "!",
    ...
  }
}
```

## Usage Examples

### Load Server Data
```javascript
import { loadServer } from './src/utils/loadServer.js';

// Automatically creates profile if it doesn't exist
const serverData = loadServer(message.guildId, message.guild.name);
console.log(serverData.prefix);  // Get prefix
```

### Save Server Data
```javascript
import { saveServer } from './src/utils/saveServer.js';

// Update entire server data
serverData.prefix = '!';
saveServer(message.guildId, serverData);
```

### Update Single Property
```javascript
import { updateServerProperty } from './src/utils/saveServer.js';

// Update specific property (nested or not)
updateServerProperty(message.guildId, 'prefix', '!');
updateServerProperty(message.guildId, 'welcome.enabled', true);
```

### Delete Server Profile
```javascript
import { deleteServer } from './src/utils/saveServer.js';

// Delete when bot leaves
deleteServer(guildId);
```

## Safety Guarantees

✅ **Per-Guild Isolation**: Each guild's data is completely isolated
✅ **No Data Mixing**: Operations only affect the target guild
✅ **No Overwrites**: Other servers are never touched
✅ **Atomic Writes**: File is rewritten completely after each change
✅ **Error Handling**: All functions include error catching
✅ **Auto-Creation**: New profiles created automatically on first load

## Best Practices

1. **Always load before saving**
   ```javascript
   const serverData = loadServer(guildId);
   serverData.prefix = '!';
   saveServer(guildId, serverData);
   ```

2. **Use updateServerProperty for single changes**
   ```javascript
   updateServerProperty(guildId, 'prefix', '!');
   // Instead of loading entire data and saving back
   ```

3. **Check if server exists before operations**
   ```javascript
   import { serverExists } from './src/utils/loadServer.js';
   if (serverExists(guildId)) { ... }
   ```

4. **Handle errors gracefully**
   ```javascript
   if (!saveServer(guildId, data)) {
       await message.reply('Failed to save settings');
   }
   ```
