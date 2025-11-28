import fs from 'fs';
import { deleteServer } from './saveServer.js';

const SERVERS_FILE = './data/servers.json';

/**
 * Load all servers from servers.json
 * @returns {Object} All server data
 */
function loadAllServers() {
    try {
        if (!fs.existsSync(SERVERS_FILE)) {
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
 * When bot is kicked from a server - delete its data
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name (optional)
 * @returns {boolean} Success status
 */
export function cleanupKickedServer(guildId, guildName = 'Unknown') {
    if (guildId === '1296783492989980682') {
        console.log(`[CLEANUP] Mining Bangladesh cannot be kicked, skipping cleanup`);
        return true;
    }
    console.log(`[CLEANUP] Bot kicked from: ${guildName} (${guildId})`);
    return deleteServer(guildId);
}

/**
 * When bot is banned from a server - delete its data
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name (optional)
 * @returns {boolean} Success status
 */
export function cleanupBannedServer(guildId, guildName = 'Unknown') {
    if (guildId === '1296783492989980682') {
        console.log(`[CLEANUP] Mining Bangladesh cannot be banned, skipping cleanup`);
        return true;
    }
    console.log(`[CLEANUP] Bot banned from: ${guildName} (${guildId})`);
    return deleteServer(guildId);
}

/**
 * When guild is deleted by owner - bot's data is gone anyway
 * Delete the entry to keep database clean
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name (optional)
 * @returns {boolean} Success status
 */
export function cleanupDeletedServer(guildId, guildName = 'Unknown') {
    console.log(`[CLEANUP] Server deleted: ${guildName} (${guildId})`);
    return deleteServer(guildId);
}

/**
 * When bot leaves server voluntarily - clean up
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {string} guildName - Discord Guild Name (optional)
 * @returns {boolean} Success status
 */
export function cleanupLeftServer(guildId, guildName = 'Unknown') {
    if (guildId === '1296783492989980682') {
        console.log(`[CLEANUP] Mining Bangladesh cannot be left by bot, skipping cleanup`);
        return true;
    }
    console.log(`[CLEANUP] Bot left server: ${guildName} (${guildId})`);
    return deleteServer(guildId);
}

/**
 * Clean up orphaned servers (servers bot is no longer in)
 * Call this periodically to remove ghost entries
 * @param {Array} activeGuildIds - Array of guild IDs the bot is currently in
 * @returns {Object} Cleanup report { removed: number, kept: number }
 */
export function cleanupOrphanedServers(activeGuildIds) {
    const allServers = loadAllServers();
    const activeSet = new Set(activeGuildIds);
    let removedCount = 0;
    let keptCount = 0;

    const serverIds = Object.keys(allServers);
    
    for (const guildId of serverIds) {
        if (!activeSet.has(guildId)) {
            // This server is orphaned (bot no longer there)
            console.log(`[CLEANUP] Orphaned entry found: ${guildId}`);
            deleteServer(guildId);
            removedCount++;
        } else {
            keptCount++;
        }
    }

    console.log(`<:Correct:1440296238305116223> [CLEANUP] Orphan cleanup complete: ${removedCount} removed, ${keptCount} kept`);
    return { removed: removedCount, kept: keptCount };
}

/**
 * Get cleanup statistics
 * @returns {Object} Stats { total: number, list: Array }
 */
export function getCleanupStats() {
    const allServers = loadAllServers();
    const serverIds = Object.keys(allServers);

    return {
        total: serverIds.length,
        list: serverIds
    };
}
