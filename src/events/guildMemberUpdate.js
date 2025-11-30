import { Events } from 'discord.js';
import { getMemberRoleActions } from '../utils/rolesConnectionData.js';

export const name = Events.GuildMemberUpdate;

/**
 * Handle automatic role changes when member gains/loses roles
 */
export async function execute(oldMember, newMember) {
    try {
        // Check if roles changed
        if (oldMember.roles.cache.equals(newMember.roles.cache)) {
            return;
        }

        const guildId = newMember.guild.id;
        const memberRoleIds = Array.from(newMember.roles.cache.keys());

        // Get roles to add/remove based on connections
        const { rolesToAdd, rolesToRemove } = getMemberRoleActions(guildId, newMember.id, memberRoleIds);

        if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
            return;
        }

        // Check bot permissions
        if (!newMember.guild.members.me.permissions.has('ManageRoles')) {
            return;
        }

        // Apply role changes
        try {
            if (rolesToAdd.length > 0) {
                await newMember.roles.add(rolesToAdd, 'Automatic role connection');
            }

            if (rolesToRemove.length > 0) {
                await newMember.roles.remove(rolesToRemove, 'Automatic role connection');
            }
        } catch (e) {
            console.error(`Failed to apply role connections for ${newMember.user.tag}:`, e.message);
        }
    } catch (e) {
        console.error('Error in guildMemberUpdate event:', e);
    }
}
