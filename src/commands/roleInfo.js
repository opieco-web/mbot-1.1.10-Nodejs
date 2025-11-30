import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const roleInfo = new SlashCommandBuilder()
    .setName('role-info')
    .setDescription('Get detailed information about a role')
    .addRoleOption(option =>
        option
            .setName('role')
            .setDescription('The role to get information about')
            .setRequired(true)
    )
    .addBooleanOption(option =>
        option
            .setName('full_member_list')
            .setDescription('Show all members who have this role')
            .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles);

/**
 * Get important permissions ordered by danger level
 */
function getImportantPermissions(permissions) {
    // Ordered from most dangerous/powerful to least
    const permissionHierarchy = [
        'Administrator',
        'ManageGuild',
        'ManageRoles',
        'ManageChannels',
        'ViewAuditLog',
        'KickMembers',
        'BanMembers',
        'ModerateMembers',
        'MuteMembers',
        'DeafenMembers',
        'MoveMembers',
        'ManageMessages',
        'ManageNicknames',
        'ManageWebhooks',
        'ManageEmojisAndStickers',
        'CreateInstantInvite'
    ];

    if (!permissions || permissions.bitfield === 0n) {
        return [];
    }

    const perms = permissions.toArray();

    // Map to readable names
    const permissionNames = {
        'Administrator': 'Administrator',
        'ManageGuild': 'Manage Server',
        'ManageRoles': 'Manage Roles',
        'ManageChannels': 'Manage Channels',
        'ViewAuditLog': 'View Audit Log',
        'KickMembers': 'Kick',
        'BanMembers': 'Ban',
        'ModerateMembers': 'Moderate',
        'MuteMembers': 'Mute',
        'DeafenMembers': 'Deafen',
        'MoveMembers': 'Move',
        'ManageMessages': 'Manage Messages',
        'ManageNicknames': 'Manage Nicknames',
        'ManageWebhooks': 'Manage Webhooks',
        'ManageEmojisAndStickers': 'Manage Emojis',
        'CreateInstantInvite': 'Create Invite'
    };

    // Return permissions in hierarchy order
    const result = [];
    for (const perm of permissionHierarchy) {
        if (perms.includes(perm)) {
            result.push(permissionNames[perm]);
        }
    }

    return result;
}

/**
 * Handle role info command
 */
export async function handleRoleInfo(interaction) {
    try {
        const role = interaction.options.getRole('role');
        const fullMemberList = interaction.options.getBoolean('full_member_list') || false;

        // Get creation date
        const createdTimestamp = Math.floor(role.createdTimestamp / 1000);

        // Get role icon/image URL
        const roleIcon = role.iconURL({ dynamic: true, size: 256 }) || role.icon;

        // Get members with role - try cache first, then fetch
        let membersWithRole;
        try {
            membersWithRole = interaction.guild.members.cache.size > 0 
                ? interaction.guild.members.cache 
                : await interaction.guild.members.fetch({ limit: 0 });
        } catch (fetchError) {
            // If fetch fails due to rate limit or other issues, use cache only
            if (fetchError.code === 'GatewayRateLimitError') {
                membersWithRole = interaction.guild.members.cache;
            } else {
                throw fetchError;
            }
        }
        
        const membersArray = membersWithRole.filter(member => member.roles.cache.has(role.id)).map(m => m);
        const memberCount = membersArray.length;

        // Get role hoisted status and position
        const isHoisted = role.hoist ? '<:Correct:1440296238305116223>' : '<:Error:1440296241090265088>';
        const rolePosition = role.position;

        // Format color
        const colorHex = role.color ? `#${role.color.toString(16).toUpperCase().padStart(6, '0')}` : 'None';

        // Get important permissions
        const importantPerms = getImportantPermissions(role.permissions);
        const permissionsText = importantPerms.length > 0 ? importantPerms.join(', ') : 'None';

        // Build role info text - exact format provided
        let roleInfoContent = `> Role: ${role}\n> Name: ${role.name}\n> ID: \`${role.id}\`\n> Color: \`${colorHex}\`\n> Members: \`${memberCount}\`\n> Created: <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)\n> Hoisted: ${isHoisted}\n> Position: \`${rolePosition}\``;

        // Add icon link if available
        if (roleIcon) {
            roleInfoContent += `\n> [IconLink](${roleIcon}),`;
        }

        // Build permissions text - format nicely with line breaks for better display
        let permissionsContent = `> **Permissions:**`;
        if (importantPerms.length > 0) {
            permissionsContent += `\n> ${importantPerms.join(', ')}`;
        } else {
            permissionsContent += `\n> None`;
        }

        // Build component array
        const components = [
            {
                type: 10,
                content: `-# The information about\n## ${role}`
            },
            {
                type: 14
            },
            {
                type: 10,
                content: roleInfoContent
            },
            {
                type: 14
            },
            {
                type: 10,
                content: permissionsContent
            }
        ];

        // If full_member_list is requested
        if (fullMemberList) {
            const MAX_CHARS = 4000;
            let memberListContent = `### **Members:** \`${memberCount}\`\n\n`;
            let addedMembers = 0;
            let tooManyMembers = false;

            // Try to add members one by one
            for (let i = 0; i < membersArray.length; i++) {
                const member = membersArray[i];
                const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);
                const memberLine = `${i + 1}. <@${member.id}> on <t:${joinedTimestamp}:R>\n`;

                // Check if adding this member exceeds the limit
                if ((memberListContent + memberLine).length > MAX_CHARS) {
                    tooManyMembers = true;
                    break;
                }

                memberListContent += memberLine;
                addedMembers++;
            }

            // If too many members to display, show only the warning
            if (tooManyMembers && addedMembers === 0) {
                components.push({
                    type: 10,
                    content: `### **Members:** Too many to display`
                });
            } else if (tooManyMembers && addedMembers > 0) {
                // Show what we could fit
                components.push({
                    type: 10,
                    content: memberListContent
                });
            } else if (memberCount > 0) {
                // All members fit
                components.push({
                    type: 10,
                    content: memberListContent
                });
            } else {
                // No members
                components.push({
                    type: 10,
                    content: `### **Members:** \`0\``
                });
            }
        }

        // Filter out any undefined values and build clean response
        const cleanComponents = components.filter(c => c !== undefined && c !== null);
        
        const response = {
            content: ' ',
            flags: 32768,
            components: [
                {
                    type: 17,
                    components: cleanComponents
                }
            ]
        };

        // Clean response to remove undefined values
        return interaction.reply(JSON.parse(JSON.stringify(response)));

    } catch (error) {
        console.error('Error in role-info command:', error);

        const errorResponse = {
            content: ' ',
            flags: 32768,
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: `## <:Error:1440296241090265088> Error\n\nFailed to retrieve role information: ${error.message}`
                        }
                    ]
                }
            ]
        };

        return interaction.reply(errorResponse);
    }
}
