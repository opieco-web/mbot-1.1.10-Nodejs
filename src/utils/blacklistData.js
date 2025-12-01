/**
 * Blacklist system utilities for managing blacklisted users
 */

/**
 * Initialize blacklist config for a guild
 */
export function initializeBlacklistConfig(guildData) {
    if (!guildData.blacklist) {
        guildData.blacklist = {
            enabled: false,
            roleId: null,
            users: [],
            allowedIds: []
        };
    }
    return guildData;
}

/**
 * Get blacklist configuration
 */
export function getBlacklistConfig(guildData) {
    if (!guildData.blacklist) {
        return { enabled: false, roleId: null, users: [], allowedIds: [] };
    }
    return guildData.blacklist;
}

/**
 * Enable/disable blacklist system and set role
 */
export function setBlacklistSystem(guildData, enabled, roleId) {
    if (!guildData.blacklist) {
        guildData.blacklist = { enabled: false, roleId: null, users: [], allowedIds: [] };
    }
    guildData.blacklist.enabled = enabled;
    if (roleId) {
        guildData.blacklist.roleId = roleId;
    }
    return guildData;
}

/**
 * Get allowed IDs (roles and members) for prefix command
 */
export function getAllowedIds(guildData) {
    if (!guildData.blacklist || !guildData.blacklist.allowedIds) {
        return [];
    }
    return guildData.blacklist.allowedIds;
}

/**
 * Check if user has permission to use blacklist prefix command
 */
export function canUseBlacklistPrefix(member, guildData) {
    if (!member) return false;
    
    const allowedIds = getAllowedIds(guildData);
    if (allowedIds.length === 0) return false;
    
    // Check if user ID is in allowed list
    if (allowedIds.includes(member.id)) {
        return true;
    }
    
    // Check if user has any of the allowed roles
    return member.roles.cache.some(role => allowedIds.includes(role.id));
}

/**
 * Add user to blacklist
 */
export function addToBlacklist(guildData, userId) {
    if (!guildData.blacklist) {
        guildData.blacklist = { enabled: false, roleId: null, users: [], allowedIds: [] };
    }
    if (!guildData.blacklist.users) {
        guildData.blacklist.users = [];
    }
    
    // Prevent duplicates
    if (!guildData.blacklist.users.includes(userId)) {
        guildData.blacklist.users.push(userId);
    }
    
    return guildData;
}

/**
 * Remove user from blacklist
 */
export function removeFromBlacklist(guildData, userId) {
    if (!guildData.blacklist || !guildData.blacklist.users) {
        return guildData;
    }
    guildData.blacklist.users = guildData.blacklist.users.filter(id => id !== userId);
    return guildData;
}

/**
 * Check if user is blacklisted
 */
export function isBlacklisted(guildData, userId) {
    if (!guildData.blacklist || !guildData.blacklist.users) {
        return false;
    }
    return guildData.blacklist.users.includes(userId);
}

/**
 * Get blacklist role ID
 */
export function getBlacklistRoleId(guildData) {
    if (!guildData.blacklist) {
        return null;
    }
    return guildData.blacklist.roleId;
}

/**
 * Check if blacklist is enabled
 */
export function isBlacklistEnabled(guildData) {
    if (!guildData.blacklist) {
        return false;
    }
    return guildData.blacklist.enabled === true;
}

/**
 * Get all blacklisted users
 */
export function getBlacklistedUsers(guildData) {
    if (!guildData.blacklist || !guildData.blacklist.users) {
        return [];
    }
    return guildData.blacklist.users;
}
