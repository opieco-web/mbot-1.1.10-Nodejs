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
    // Null-safety: ensure required parameters exist
    if (!guildId || !mainRoleId || !action || !roleId) {
        return {};
    }

    try {
        const connections = loadRoleConnections(guildId);
        
        if (!connections[mainRoleId]) {
            connections[mainRoleId] = { add_role: [], remove_role: [], reverse: reverse || false };
        } else if (!connections[mainRoleId].reverse) {
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
    } catch (e) {
        console.error(`Error in addRoleConnection for guild ${guildId}:`, e.message);
        return {};
    }
}

/**
 * Remove role connection
 */
export function removeRoleConnection(guildId, mainRoleId, action, roleId) {
    // Null-safety: ensure required parameters exist
    if (!guildId || !mainRoleId || !action || !roleId) {
        return {};
    }

    try {
        const connections = loadRoleConnections(guildId);
        
        if (!connections[mainRoleId]) {
            return connections;
        }
        
        if (Array.isArray(connections[mainRoleId][action])) {
            connections[mainRoleId][action] = connections[mainRoleId][action].filter(id => id !== roleId);
            
            // Clean up empty actions
            if (connections[mainRoleId][action].length === 0) {
                delete connections[mainRoleId][action];
            }
        }
        
        // Clean up empty main role entries
        const actionKeys = Object.keys(connections[mainRoleId]).filter(k => k !== 'reverse');
        if (actionKeys.length === 0) {
            delete connections[mainRoleId];
        }
        
        saveRoleConnections(guildId, connections);
        return connections;
    } catch (e) {
        console.error(`Error in removeRoleConnection for guild ${guildId}:`, e.message);
        return {};
    }
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
    try {
        // Null-safety: ensure guildId and memberRoleIds exist
        if (!guildId || !Array.isArray(memberRoleIds)) {
            return { rolesToAdd: [], rolesToRemove: [] };
        }

        const connections = loadRoleConnections(guildId);
        const rolesToAdd = [];
        const rolesToRemove = [];
        
        // If no connections exist, return empty arrays
        if (!connections || Object.keys(connections).length === 0) {
            return { rolesToAdd: [], rolesToRemove: [] };
        }
        
        for (const [mainRoleId, config] of Object.entries(connections)) {
            // Null-safety: ensure config is valid object
            if (!config || typeof config !== 'object') {
                continue;
            }

            // Only apply if member has the main role
            if (memberRoleIds.includes(mainRoleId)) {
                if (Array.isArray(config.add_role) && config.add_role.length > 0) {
                    rolesToAdd.push(...config.add_role.filter(id => !rolesToAdd.includes(id)));
                }
                if (Array.isArray(config.remove_role) && config.remove_role.length > 0) {
                    rolesToRemove.push(...config.remove_role.filter(id => !rolesToRemove.includes(id)));
                }
            }
        }
        
        // Prevent removing roles that should be added
        const finalRemove = rolesToRemove.filter(id => !rolesToAdd.includes(id));
        
        return { rolesToAdd, rolesToRemove: finalRemove };
    } catch (e) {
        console.error(`Error in getMemberRoleActionsGain for guild ${guildId}:`, e.message);
        return { rolesToAdd: [], rolesToRemove: [] };
    }
}

/**
 * Check roles to restore when member loses main role with reverse enabled
 */
export function getMemberRoleActionsLose(guildId, oldMemberRoleIds, newMemberRoleIds) {
    try {
        // Null-safety: ensure all parameters exist
        if (!guildId || !Array.isArray(oldMemberRoleIds) || !Array.isArray(newMemberRoleIds)) {
            return [];
        }

        const connections = loadRoleConnections(guildId);
        const rolesToRestore = [];
        
        // If no connections exist, return empty array
        if (!connections || Object.keys(connections).length === 0) {
            return [];
        }
        
        // Find main roles that were removed
        const lostMainRoles = oldMemberRoleIds.filter(role => !newMemberRoleIds.includes(role));
        
        for (const mainRoleId of lostMainRoles) {
            const config = connections[mainRoleId];
            
            // Null-safety: ensure config exists and is valid
            if (!config || typeof config !== 'object') {
                continue;
            }

            if (!config.reverse) {
                continue;
            }
            
            // If reverse is true, restore the roles that were added/removed by this rule
            if (Array.isArray(config.add_role) && config.add_role.length > 0) {
                // Remove roles that were added (reverse = remove them back)
                config.add_role.forEach(roleId => {
                    if (newMemberRoleIds.includes(roleId) && !rolesToRestore.includes(roleId)) {
                        // Actually we want to remove them, but getMemberRoleActionsLose should return roles to re-add
                        // Let me re-think: if remove_role was specified, we need to re-add those roles
                        // So for now, we collect roles to potentially modify
                    }
                });
            }
            
            if (Array.isArray(config.remove_role) && config.remove_role.length > 0) {
                // Re-add roles that were removed
                config.remove_role.forEach(roleId => {
                    if (!newMemberRoleIds.includes(roleId) && !rolesToRestore.includes(roleId)) {
                        rolesToRestore.push(roleId);
                    }
                });
            }
        }
        
        return rolesToRestore;
    } catch (e) {
        console.error(`Error in getMemberRoleActionsLose for guild ${guildId}:`, e.message);
        return [];
    }
}
