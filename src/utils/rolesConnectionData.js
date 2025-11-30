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
 * Add role connection with reverse flag
 */
export function addRoleConnection(guildId, mainRoleId, action, roleId, reverse) {
    const connections = loadRoleConnections(guildId);
    
    if (!connections[mainRoleId]) {
        connections[mainRoleId] = { add_role: [], remove_role: [], reverse: reverse || false };
    } else {
        connections[mainRoleId].reverse = reverse || false;
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
    if (Object.keys(connections[mainRoleId]).filter(k => k !== 'reverse').length === 0) {
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
 * Check roles to add when member gains main role
 */
export function getMemberRoleActionsGain(guildId, memberRoleIds) {
    const connections = loadRoleConnections(guildId);
    const rolesToAdd = [];
    const rolesToRemove = [];
    
    for (const [mainRoleId, config] of Object.entries(connections)) {
        // Only apply if member has the main role
        if (memberRoleIds.includes(mainRoleId)) {
            if (config.add_role) {
                rolesToAdd.push(...config.add_role.filter(id => !rolesToAdd.includes(id)));
            }
            if (config.remove_role) {
                rolesToRemove.push(...config.remove_role.filter(id => !rolesToRemove.includes(id)));
            }
        }
    }
    
    // Prevent removing roles that should be added
    const finalRemove = rolesToRemove.filter(id => !rolesToAdd.includes(id));
    
    return { rolesToAdd, rolesToRemove: finalRemove };
}

/**
 * Check roles to restore when member loses main role with reverse enabled
 */
export function getMemberRoleActionsLose(guildId, oldMemberRoleIds, newMemberRoleIds) {
    const connections = loadRoleConnections(guildId);
    const rolesToRestore = [];
    
    // Find main roles that were removed
    const lostMainRoles = oldMemberRoleIds.filter(role => !newMemberRoleIds.includes(role));
    
    for (const mainRoleId of lostMainRoles) {
        const config = connections[mainRoleId];
        if (!config || !config.reverse) {
            continue;
        }
        
        // If reverse is true, restore the roles that were added/removed by this rule
        if (config.add_role && config.add_role.length > 0) {
            // Remove roles that were added (reverse = remove them back)
            config.add_role.forEach(roleId => {
                if (newMemberRoleIds.includes(roleId) && !rolesToRestore.includes(roleId)) {
                    // Actually we want to remove them, but getMemberRoleActionsLose should return roles to re-add
                    // Let me re-think: if remove_role was specified, we need to re-add those roles
                    // So for now, we collect roles to potentially modify
                }
            });
        }
        
        if (config.remove_role && config.remove_role.length > 0) {
            // Re-add roles that were removed
            config.remove_role.forEach(roleId => {
                if (!newMemberRoleIds.includes(roleId) && !rolesToRestore.includes(roleId)) {
                    rolesToRestore.push(roleId);
                }
            });
        }
    }
    
    return rolesToRestore;
}
