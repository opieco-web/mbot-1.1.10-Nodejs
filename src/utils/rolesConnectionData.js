import fs from 'fs';
import path from 'path';

const dataDir = './serverData';

/**
 * Ensure serverData directory exists
 */
function ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

/**
 * Get path to guild data file
 */
function getGuildFilePath(guildId) {
    ensureDataDir();
    return path.join(dataDir, `${guildId}.json`);
}

/**
 * Load role connections for a guild
 */
export function loadRoleConnections(guildId) {
    const filePath = getGuildFilePath(guildId);
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return data.roleConnections || {};
        }
    } catch (e) {
        console.error(`Failed to load role connections for ${guildId}:`, e.message);
    }
    return {};
}

/**
 * Save role connections for a guild
 */
export function saveRoleConnections(guildId, roleConnections) {
    const filePath = getGuildFilePath(guildId);
    try {
        ensureDataDir();
        const data = { roleConnections };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error(`Failed to save role connections for ${guildId}:`, e.message);
        return false;
    }
}

/**
 * Add role connection
 */
export function addRoleConnection(guildId, mainRoleId, action, roleId) {
    const connections = loadRoleConnections(guildId);
    
    if (!connections[mainRoleId]) {
        connections[mainRoleId] = { add_role: [], remove_role: [] };
    }
    
    // Prevent duplicates
    if (!connections[mainRoleId][action]) {
        connections[mainRoleId][action] = [];
    }
    
    if (!connections[mainRoleId][action].includes(roleId)) {
        connections[mainRoleId][action].push(roleId);
    }
    
    saveRoleConnections(guildId, connections);
    return connections;
}

/**
 * Remove role connection
 */
export function removeRoleConnection(guildId, mainRoleId, action, roleId) {
    const connections = loadRoleConnections(guildId);
    
    if (!connections[mainRoleId]) {
        return connections;
    }
    
    if (connections[mainRoleId][action]) {
        connections[mainRoleId][action] = connections[mainRoleId][action].filter(id => id !== roleId);
        
        // Clean up empty actions
        if (connections[mainRoleId][action].length === 0) {
            delete connections[mainRoleId][action];
        }
    }
    
    // Clean up empty main role entries
    if (Object.keys(connections[mainRoleId]).length === 0) {
        delete connections[mainRoleId];
    }
    
    saveRoleConnections(guildId, connections);
    return connections;
}

/**
 * Get role connections for a guild
 */
export function getRoleConnections(guildId) {
    return loadRoleConnections(guildId);
}

/**
 * Check if member should trigger auto-role changes
 */
export function getMemberRoleActions(guildId, memberId, memberRoleIds) {
    const connections = loadRoleConnections(guildId);
    const rolesToAdd = [];
    const rolesToRemove = [];
    
    for (const [mainRoleId, actions] of Object.entries(connections)) {
        // Only apply if member has the main role
        if (memberRoleIds.includes(mainRoleId)) {
            if (actions.add_role) {
                rolesToAdd.push(...actions.add_role.filter(id => !rolesToAdd.includes(id)));
            }
            if (actions.remove_role) {
                rolesToRemove.push(...actions.remove_role.filter(id => !rolesToRemove.includes(id)));
            }
        }
    }
    
    // Prevent removing roles that should be added
    const finalRemove = rolesToRemove.filter(id => !rolesToAdd.includes(id));
    
    return { rolesToAdd, rolesToRemove: finalRemove };
}
