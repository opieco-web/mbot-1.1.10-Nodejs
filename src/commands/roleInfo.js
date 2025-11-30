import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChannelType } from 'discord.js';

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
 * Format permissions in readable way
 */
function formatPermissions(permissions) {
    const permissionNames = {
        'CreateInstantInvite': 'Create Invite',
        'KickMembers': 'Kick Members',
        'BanMembers': 'Ban Members',
        'Administrator': 'Administrator',
        'ManageChannels': 'Manage Channels',
        'ManageGuild': 'Manage Server',
        'AddReactions': 'Add Reactions',
        'ViewAuditLog': 'View Audit Log',
        'PrioritySpeaker': 'Priority Speaker',
        'Stream': 'Stream',
        'ViewChannel': 'View Channels',
        'SendMessages': 'Send Messages',
        'SendTTSMessages': 'Send TTS Messages',
        'ManageMessages': 'Manage Messages',
        'EmbedLinks': 'Embed Links',
        'AttachFiles': 'Attach Files',
        'ReadMessageHistory': 'Read Message History',
        'MentionEveryone': 'Mention @everyone',
        'UseExternalEmojis': 'Use External Emojis',
        'ViewGuildInsights': 'View Server Insights',
        'Connect': 'Connect to Voice',
        'Speak': 'Speak',
        'MuteMembers': 'Mute Members',
        'DeafenMembers': 'Deafen Members',
        'MoveMembers': 'Move Members',
        'UseVAD': 'Use Voice Activity Detection',
        'ChangeNickname': 'Change Nickname',
        'ManageNicknames': 'Manage Nicknames',
        'ManageRoles': 'Manage Roles',
        'ManageWebhooks': 'Manage Webhooks',
        'ManageEmojisAndStickers': 'Manage Emojis',
        'UseApplicationCommands': 'Use App Commands',
        'RequestToSpeak': 'Request to Speak',
        'ManageEvents': 'Manage Events',
        'ManageThreads': 'Manage Threads',
        'CreatePublicThreads': 'Create Public Threads',
        'CreatePrivateThreads': 'Create Private Threads',
        'UseExternalStickers': 'Use External Stickers',
        'SendMessagesInThreads': 'Send Messages in Threads',
        'UseEmbeddedActivities': 'Use Embedded Activities',
        'ModerateMembers': 'Moderate Members',
        'ViewCreatorMonetizationAnalytics': 'View Monetization Analytics',
        'UseSoundboard': 'Use Soundboard',
        'CreateExpressions': 'Create Expressions',
        'CreateEvents': 'Create Events'
    };

    if (!permissions || permissions.bitfield === 0n) {
        return 'No permissions';
    }

    const perms = permissions.toArray();
    if (perms.length > 0) {
        return perms.map(perm => permissionNames[perm] || perm).join(', ');
    }

    return 'No permissions';
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
        const roleIcon = role.iconURL({ dynamic: true, size: 256 });

        // Get members with role
        const membersWithRole = await interaction.guild.members.fetch();
        const membersArray = membersWithRole.filter(member => member.roles.cache.has(role.id)).map(m => m);
        const memberCount = membersArray.length;

        // Create main info embed
        const infoEmbed = new EmbedBuilder()
            .setColor(role.color || 0x808080)
            .setTitle(`<:info:1441531934332424314> Role Information`)
            .setThumbnail(roleIcon)
            .addFields(
                { name: '📛 Name', value: `${role.name}`, inline: true },
                { name: '👥 Members', value: `${memberCount}`, inline: true },
                { name: '🔗 Mention', value: `${role}`, inline: true },
                { name: '🎨 Color', value: role.color ? `#${role.color.toString(16).toUpperCase().padStart(6, '0')}` : 'None', inline: true },
                { name: '📅 Created', value: `<t:${createdTimestamp}:F>`, inline: true },
                { name: '🆔 ID', value: `${role.id}`, inline: true },
                { name: '✅ Permissions', value: formatPermissions(role.permissions) || 'No permissions', inline: false }
            )
            .setTimestamp();

        // If full_member_list is false, just send role info
        if (!fullMemberList) {
            return interaction.reply({
                embeds: [infoEmbed],
                flags: 32768
            });
        }

        // If there are no members, send just the info embed
        if (memberCount === 0) {
            return interaction.reply({
                embeds: [infoEmbed],
                flags: 32768
            });
        }

        // Build member list - split into chunks if too large
        const memberChunks = [];
        let currentChunk = '';

        for (let i = 0; i < membersArray.length; i++) {
            const member = membersArray[i];
            const joinedTimestamp = Math.floor(member.joinedTimestamp / 1000);
            const memberLine = `<@${member.id}> on <t:${joinedTimestamp}:R>\n`;

            if ((currentChunk + memberLine).length > 1024) {
                memberChunks.push(currentChunk);
                currentChunk = memberLine;
            } else {
                currentChunk += memberLine;
            }
        }

        if (currentChunk) {
            memberChunks.push(currentChunk);
        }

        // Create embeds for each chunk
        const embeds = [infoEmbed];

        memberChunks.forEach((chunk, index) => {
            const memberEmbed = new EmbedBuilder()
                .setColor(role.color || 0x808080)
                .setThumbnail(roleIcon)
                .setTitle(`👥 Members with this role (${index + 1}/${memberChunks.length})`)
                .setDescription(chunk)
                .setTimestamp();

            embeds.push(memberEmbed);
        });

        return interaction.reply({
            embeds: embeds,
            flags: 32768
        });

    } catch (error) {
        console.error('Error in role-info command:', error);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('<:Error:1440296241090265088> Error')
            .setDescription(`Failed to retrieve role information: ${error.message}`)
            .setTimestamp();

        return interaction.reply({
            embeds: [errorEmbed],
            flags: 32768
        });
    }
}
