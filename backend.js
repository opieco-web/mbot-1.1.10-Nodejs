import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const MINING_BANGLADESH_GUILD = '1296783492989980682';
const DATA_DIR = path.join(__dirname, 'data');

app.use(bodyParser.json());

// Load guild data
function loadGuildData(guildId) {
  try {
    if (guildId === MINING_BANGLADESH_GUILD) {
      const filePath = path.join(DATA_DIR, 'mining-bangladesh.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } else {
      const filePath = path.join(DATA_DIR, 'servers.json');
      if (fs.existsSync(filePath)) {
        const allServers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return allServers[guildId] || getDefaultGuildData();
      }
    }
  } catch (err) {
    console.error(`Error loading guild data for ${guildId}:`, err);
  }
  return getDefaultGuildData();
}

// Save guild data
function saveGuildData(guildId, data) {
  try {
    if (guildId === MINING_BANGLADESH_GUILD) {
      fs.writeFileSync(path.join(DATA_DIR, 'mining-bangladesh.json'), JSON.stringify(data, null, 2));
    } else {
      const filePath = path.join(DATA_DIR, 'servers.json');
      let allServers = {};
      if (fs.existsSync(filePath)) {
        allServers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      allServers[guildId] = data;
      fs.writeFileSync(filePath, JSON.stringify(allServers, null, 2));
    }
  } catch (err) {
    console.error(`Error saving guild data for ${guildId}:`, err);
  }
}

function getDefaultGuildData() {
  return {
    prefix: '!',
    welcome: { enabled: false, randomized: null, temporary: null },
    nickname: { enabled: false, channelId: null, mode: null, filter: [], blocklist_enabled: false },
    afk: {},
    status: { presence: 'online' }
  };
}

// Button interaction endpoint
app.post('/interact', async (req, res) => {
  const { customId, serverId, userId, page = 1 } = req.body;

  console.log(`[BACKEND] Interaction: ${customId} from user ${userId} on server ${serverId}`);

  const guildData = loadGuildData(serverId);

  switch (customId) {
    case 'setup_randomized_toggle':
      if (!guildData.welcome.randomized) {
        guildData.welcome.randomized = { channelId: null, delay: 120000, enabled: true };
      } else {
        guildData.welcome.randomized.enabled = !guildData.welcome.randomized.enabled;
      }
      break;

    case 'setup_temporary_toggle':
      if (!guildData.welcome.temporary) {
        guildData.welcome.temporary = { channelIds: [], type: 'random', sendDelay: 120000, deleteTime: 300000, enabled: true };
      } else {
        guildData.welcome.temporary.enabled = !guildData.welcome.temporary.enabled;
      }
      break;

    case 'setup_nickname_blocklist_toggle':
      guildData.nickname.blocklist_enabled = !guildData.nickname.blocklist_enabled;
      break;

    case 'setup_page_next_1':
    case 'setup_page_next_2':
      // Navigation handled by bot
      break;

    case 'setup_page_prev_2':
    case 'setup_page_prev_3':
      // Navigation handled by bot
      break;

    default:
      console.log(`[BACKEND] Unknown interaction: ${customId}`);
  }

  saveGuildData(serverId, guildData);

  res.json({
    success: true,
    message: 'Settings updated',
    data: guildData,
    page: page
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get guild data
app.get('/guild/:serverId', (req, res) => {
  const guildData = loadGuildData(req.params.serverId);
  res.json(guildData);
});

const PORT = 6000;
app.listen(PORT, () => {
  console.log(`[BACKEND] Settings API running on port ${PORT}`);
});
