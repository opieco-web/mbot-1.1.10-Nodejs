import fs from 'fs';

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
 * Save server data by Guild ID
 * SAFE: Only modifies specified guild, never touches other servers
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {Object} serverData - Server data to save
 * @returns {boolean} Success status
 */
export function saveServer(guildId, serverData) {
    if (!guildId || !serverData) {
        console.error('<:Error:1440296241090265088> [SAVE] guildId and serverData are required');
        return false;
    }

    // CRITICAL: Mining Bangladesh must use mining-bangladesh.json ONLY
    if (guildId === '1296783492989980682') {
        console.error('<:Error:1440296241090265088> [SAVE] Mining Bangladesh (1296783492989980682) must use mining-bangladesh.json');
        return false;
    }

    try {
        const allServers = loadAllServers();

        // Preserve guildId and createdAt timestamp
        allServers[guildId] = {
            guildId: guildId,
            ...serverData,
            createdAt: allServers[guildId]?.createdAt || new Date().toISOString()
        };

        // Write back to file
        fs.writeFileSync(SERVERS_FILE, JSON.stringify(allServers, null, 2));
        console.log(`<:Correct:1440296238305116223> [SAVE] Server data saved: ${guildId}`);
        return true;
    } catch (error) {
        console.error(`<:Error:1440296241090265088> [SAVE] Failed to save server ${guildId}: ${error.message}`);
        return false;
    }
}

/**
 * Update a specific property of server data
 * SAFE: Only updates the specified property
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @param {string} property - Property path (e.g., 'prefix' or 'welcome.enabled')
 * @param {*} value - New value
 * @returns {boolean} Success status
 */
export function updateServerProperty(guildId, property, value) {
    if (!guildId || !property) {
        console.error('<:Error:1440296241090265088> [UPDATE] guildId and property are required');
        return false;
    }

    // CRITICAL: Mining Bangladesh must use mining-bangladesh.json ONLY
    if (guildId === '1296783492989980682') {
        console.error('<:Error:1440296241090265088> [UPDATE] Mining Bangladesh (1296783492989980682) must use mining-bangladesh.json');
        return false;
    }

    try {
        const allServers = loadAllServers();

        if (!allServers[guildId]) {
            console.error(`<:Error:1440296241090265088> [UPDATE] Server ${guildId} not found`);
            return false;
        }

        // Handle nested properties (e.g., 'welcome.enabled')
        const keys = property.split('.');
        let current = allServers[guildId];

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;

        // Write back to file
        fs.writeFileSync(SERVERS_FILE, JSON.stringify(allServers, null, 2));
        console.log(`<:Correct:1440296238305116223> [UPDATE] Property updated: ${guildId}.${property}`);
        return true;
    } catch (error) {
        console.error(`<:Error:1440296241090265088> [UPDATE] Failed: ${error.message}`);
        return false;
    }
}

/**
 * Delete server profile
 * WARNING: Do NOT use for Mining Bangladesh (1296783492989980682) - use mining-bangladesh.json only
 * @param {string} guildId - Discord Guild ID
 * @returns {boolean} Success status
 */
export function deleteServer(guildId) {
    if (!guildId) {
        console.error('<:Error:1440296241090265088> [DELETE] guildId is required');
        return false;
    }

    // CRITICAL: Mining Bangladesh must use mining-bangladesh.json ONLY
    if (guildId === '1296783492989980682') {
        console.error('<:Error:1440296241090265088> [DELETE] Mining Bangladesh (1296783492989980682) must use mining-bangladesh.json');
        return false;
    }

    try {
        const allServers = loadAllServers();

        if (!allServers[guildId]) {
            console.warn(`<:warning:1441531830607151195> [DELETE] Server ${guildId} not found`);
            return false;
        }

        delete allServers[guildId];
        fs.writeFileSync(SERVERS_FILE, JSON.stringify(allServers, null, 2));
        console.log(`<:Correct:1440296238305116223> [DELETE] Server profile deleted: ${guildId}`);
        return true;
    } catch (error) {
        console.error(`<:Error:1440296241090265088> [DELETE] Failed: ${error.message}`);
        return false;
    }
}
