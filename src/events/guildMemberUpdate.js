import { Events } from 'discord.js';
import { getMemberRoleActionsGain, getMemberRoleActionsLose } from '../utils/rolesConnectionData.js';

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
        const oldMemberRoleIds = Array.from(oldMember.roles.cache.keys());
        const newMemberRoleIds = Array.from(newMember.roles.cache.keys());

        // Check if member gained any main roles
        const gainedRoles = newMemberRoleIds.filter(role => !oldMemberRoleIds.includes(role));
        const lostRoles = oldMemberRoleIds.filter(role => !newMemberRoleIds.includes(role));

        // Get roles to add/remove based on connections when gaining main role
        const { rolesToAdd, rolesToRemove } = getMemberRoleActionsGain(guildId, newMemberRoleIds);
        
        // Get roles to restore if losing main role with reverse enabled
        const rolesToRestore = getMemberRoleActionsLose(guildId, oldMemberRoleIds, newMemberRoleIds);

        if (rolesToAdd.length === 0 && rolesToRemove.length === 0 && rolesToRestore.length === 0) {
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

            if (rolesToRestore.length > 0) {
                await newMember.roles.add(rolesToRestore, 'Reversing role connection');
            }
        } catch (e) {
            console.error(`Failed to apply role connections for ${newMember.user.tag}:`, e.message);
        }
    } catch (e) {
        console.error('Error in guildMemberUpdate event:', e);
    }
}
