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

        // Get members with role
        const membersWithRole = await interaction.guild.members.fetch();
        const membersArray = membersWithRole.filter(member => member.roles.cache.has(role.id)).map(m => m);
        const memberCount = membersArray.length;

        // Get role hoisted status and position
        const isHoisted = role.hoist ? '<:Correct:1440296238305116223>' : '<:Error:1440296241090265088>';
        const rolePosition = role.position;

        // Format color
        const colorHex = role.color ? `#${role.color.toString(16).toUpperCase().padStart(6, '0')}` : 'None';

        // Build role info text
        const roleInfoText = `> **Role:** ${role}\n> **Name:** ${role.name}\n> **ID:** \`${role.id}\`\n> **Color:** \`${colorHex}\`\n> **Members:** \`${memberCount}\`\n> **Created:** <t:${createdTimestamp}:F> (<t:${createdTimestamp}:R>)\n> **Hoisted:** ${isHoisted}\n> **Position:** \`${rolePosition}\`` + (roleIcon ? `\n> **[Icon](${roleIcon})** ` : '');

        // Build component array
        const components = [
            {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: `-# The information about\n## ${role}`
                    }
                ],
                accessory: roleIcon ? {
                    type: 11,
                    media: {
                        url: roleIcon
                    }
                } : undefined
            },
            {
                type: 14
            },
            {
                type: 10,
                content: roleInfoText
            },
            {
                type: 14
            }
        ];

        // If full_member_list is requested and there are members
        if (fullMemberList && memberCount > 0) {
            let memberListContent = `### **Members:** \`${memberCount}\`\n\n`;

            // Add members with count
            membersArray.forEach((member, index) => {
                const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);
                memberListContent += `${index + 1}. <@${member.id}> on <t:${joinedTimestamp}:R>\n`;
            });

            components.push({
                type: 10,
                content: memberListContent
            });
        }

        const response = {
            content: ' ',
            flags: 32768,
            components: [
                {
                    type: 17,
                    components: components
                }
            ]
        };

        return interaction.reply(response);

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
