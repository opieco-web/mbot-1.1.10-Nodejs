import fs from 'fs';
import path from 'path';

const SERVERS_FILE = './data/servers.json';

/**
 * Load all servers from servers.json
 * @returns {Object} All server data
 */
function loadAllServers() {
    try {
        if (!fs.existsSync(SERVERS_FILE)) {
            fs.writeFileSync(SERVERS_FILE, JSON.stringify({}, null, 2));
            return {};
        }
        const data = fs.readFileSync(SERVERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('<:Error:1440296241090265088> Failed to load servers.json:', error.message);
        return {};
    }
}

/**
 * Create default server profile
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name
 * @returns {Object} Default server data structure
 */
function createDefaultProfile(guildId, guildName) {
    return {
        guildId: guildId,
        guildName: guildName || 'Unknown Server',
        prefix: '#',
        welcome: {
            enabled: false,
            channelId: null,
            delay: 120000
        },
        nickname: {
            channelId: null,
            mode: 'auto',
            filter: []
        },
        afk: {},
        pendingNicknameRequests: {},
        config: {},
        autoresponse: [],
        topics: {},
        createdAt: new Date().toISOString()
    };
}

/**
 * Load server data by Guild ID
 * Creates a new profile if server doesn't exist
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name (optional)
 * @returns {Object} Server data or null
 */
export function loadServer(guildId, guildName = 'Unknown Server') {
    if (!guildId) {
        console.error('<:Error:1440296241090265088> loadServer: guildId is required');
        return null;
    }

    // CRITICAL: Mining Bangladesh must use mining-bangladesh.json ONLY
    if (guildId === '1296783492989980682') {
        console.error('<:Error:1440296241090265088> loadServer: Mining Bangladesh (1296783492989980682) must use mining-bangladesh.json');
        return null;
    }

    const allServers = loadAllServers();

    // Return existing server data
    if (allServers[guildId]) {
        console.log(`<:Correct:1440296238305116223> [LOAD] Server profile loaded: ${guildId}`);
        return allServers[guildId];
    }

    // Create new server profile if doesn't exist
    console.log(`<:warning:1441531830607151195> [LOAD] Creating new profile for: ${guildId}`);
    const newProfile = createDefaultProfile(guildId, guildName);
    allServers[guildId] = newProfile;

    try {
        fs.writeFileSync(SERVERS_FILE, JSON.stringify(allServers, null, 2));
        console.log(`<:Correct:1440296238305116223> [LOAD] New server profile created: ${guildId}`);
    } catch (error) {
        console.error(`<:Error:1440296241090265088> [LOAD] Failed to save new profile: ${error.message}`);
    }

    return newProfile;
}

/**
 * Load all servers data
 * @returns {Object} All server profiles
 */
export function loadAllServersData() {
    return loadAllServers();
}

/**
 * Check if server exists
 * @param {string} guildId - Discord Guild ID
 * @returns {boolean} True if server exists
 */
export function serverExists(guildId) {
    const allServers = loadAllServers();
    return allServers.hasOwnProperty(guildId);
}
