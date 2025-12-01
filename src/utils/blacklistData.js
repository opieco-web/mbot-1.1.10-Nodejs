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
            users: []
        };
    }
    return guildData;
}

/**
 * Get blacklist configuration
 */
export function getBlacklistConfig(guildData) {
    if (!guildData.blacklist) {
        return { enabled: false, roleId: null, users: [] };
    }
    return guildData.blacklist;
}

/**
 * Enable/disable blacklist system and set role
 */
export function setBlacklistSystem(guildData, enabled, roleId) {
    if (!guildData.blacklist) {
        guildData.blacklist = { enabled: false, roleId: null, users: [] };
    }
    guildData.blacklist.enabled = enabled;
    if (roleId) {
        guildData.blacklist.roleId = roleId;
    }
    return guildData;
}

/**
 * Add user to blacklist
 */
export function addToBlacklist(guildData, userId) {
    if (!guildData.blacklist) {
        guildData.blacklist = { enabled: false, roleId: null, users: [] };
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
