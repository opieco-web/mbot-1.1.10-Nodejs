import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { addRoleConnection, removeRoleConnection, getRoleConnections } from '../utils/rolesConnectionData.js';

export const rolesConnection = new SlashCommandBuilder()
    .setName('roles-connection')
    .setDescription('Manage automatic role connections for your server')
    .addStringOption(option =>
        option
            .setName('mode')
            .setDescription('Choose operation: add, remove, or list')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' },
                { name: 'List', value: 'list' }
            )
    )
    .addRoleOption(option =>
        option
            .setName('main-role')
            .setDescription('The main role to connect (required for add/remove)')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('action')
            .setDescription('Action to perform on roles (required for add/remove)')
            .setRequired(false)
            .addChoices(
                { name: 'Add Role', value: 'add_role' },
                { name: 'Remove Role', value: 'remove_role' }
            )
    )
    .addBooleanOption(option =>
        option
            .setName('reverse')
            .setDescription('Undo role changes when main role is removed (required only for ADD mode)')
            .setRequired(false)
    )
    .addRoleOption(option =>
        option
            .setName('connection-role1')
            .setDescription('Primary role to connect')
            .setRequired(false)
    )
    .addRoleOption(option =>
        option
            .setName('connection-role2')
            .setDescription('Secondary role to connect (optional)')
            .setRequired(false)
    );

/**
 * Create success embed
 */
function createSuccessEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`<:Correct:1440296238305116223> ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create error embed
 */
function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`<:Error:1440296241090265088> ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create info embed
 */
function createInfoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`<:warning:1441531830607151195> ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Handle the slash command
 */
export async function handleRolesConnection(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({
            embeds: [createErrorEmbed('Permission Denied', 'You need the **Manage Roles** permission to use this command.')],
            ephemeral: true
        });
    }

    const mode = interaction.options.getString('mode');
    const guildId = interaction.guildId;

    if (mode === 'list') {
        return handleListMode(interaction, guildId);
    }

    // For add/remove, check required options
    const mainRole = interaction.options.getRole('main-role');
    const action = interaction.options.getString('action');
    const reverse = interaction.options.getBoolean('reverse');
    const connectionRole1 = interaction.options.getRole('connection-role1');
    const connectionRole2 = interaction.options.getRole('connection-role2');

    if (!mainRole || !action || !connectionRole1) {
        const errorMsg = mode === 'add' 
            ? 'For **add** mode, you must provide:\n• Main Role\n• Action\n• Reverse (On/Off)\n• Connection Role 1'
            : 'For **remove** mode, you must provide:\n• Main Role\n• Action\n• Connection Role 1';
        
        return interaction.reply({
            embeds: [createErrorEmbed('Missing Parameters', errorMsg)],
            ephemeral: true
        });
    }

    // For add mode only, reverse is required
    if (mode === 'add' && reverse === null) {
        return interaction.reply({
            embeds: [createErrorEmbed('Missing Parameters', 'For **add** mode, the **Reverse** option is required (set to On or Off).')],
            ephemeral: true
        });
    }

    // Prevent bot role changes
    if (mainRole.managed || connectionRole1.managed || connectionRole2?.managed) {
        return interaction.reply({
            embeds: [createErrorEmbed('Invalid Roles', 'Cannot use bot-managed roles in connections.')],
            ephemeral: true
        });
    }

    // Prevent role hierarchy issues
    const botHighestRole = interaction.guild.members.me.roles.highest;
    if (mainRole.position >= botHighestRole.position || connectionRole1.position >= botHighestRole.position || connectionRole2?.position >= botHighestRole.position) {
        return interaction.reply({
            embeds: [createErrorEmbed('Role Hierarchy Issue', 'The bot cannot manage roles at or above its highest role.')],
            ephemeral: true
        });
    }

    if (mode === 'add') {
        return handleAddMode(interaction, guildId, mainRole, action, reverse, connectionRole1, connectionRole2);
    } else if (mode === 'remove') {
        return handleRemoveMode(interaction, guildId, mainRole, action, connectionRole1, connectionRole2);
    }
}

/**
 * Handle add mode
 */
async function handleAddMode(interaction, guildId, mainRole, action, reverse, connectionRole1, connectionRole2) {
    try {
        addRoleConnection(guildId, mainRole.id, action, connectionRole1.id, reverse);
        if (connectionRole2) {
            addRoleConnection(guildId, mainRole.id, action, connectionRole2.id, reverse);
        }

        const roleNames = connectionRole2 
            ? `${connectionRole1.name}, ${connectionRole2.name}`
            : connectionRole1.name;

        const reverseStatus = reverse ? '✅ ON' : '❌ OFF';
        const description = `**Main Role:** ${mainRole}\n**Action:** ${action === 'add_role' ? '➕ Add' : '➖ Remove'}\n**Connected Roles:** ${roleNames}\n**Reverse:** ${reverseStatus}`;

        return interaction.reply({
            embeds: [createSuccessEmbed('Role Connection Added', description)],
            ephemeral: true
        });
    } catch (e) {
        console.error('Error adding role connection:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            ephemeral: true
        });
    }
}

/**
 * Handle remove mode
 */
async function handleRemoveMode(interaction, guildId, mainRole, action, connectionRole1, connectionRole2) {
    try {
        removeRoleConnection(guildId, mainRole.id, action, connectionRole1.id);
        if (connectionRole2) {
            removeRoleConnection(guildId, mainRole.id, action, connectionRole2.id);
        }

        const roleNames = connectionRole2 
            ? `${connectionRole1.name}, ${connectionRole2.name}`
            : connectionRole1.name;

        const description = `**Main Role:** ${mainRole}\n**Action:** ${action === 'add_role' ? '➕ Add' : '➖ Remove'}\n**Removed Roles:** ${roleNames}`;

        return interaction.reply({
            embeds: [createSuccessEmbed('Role Connection Removed', description)],
            ephemeral: true
        });
    } catch (e) {
        console.error('Error removing role connection:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            ephemeral: true
        });
    }
}

/**
 * Handle list mode
 */
async function handleListMode(interaction, guildId) {
    try {
        const connections = getRoleConnections(guildId);

        if (Object.keys(connections).length === 0) {
            return interaction.reply({
                embeds: [createInfoEmbed('No Role Connections', 'This server has no role connections configured yet.')],
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('<:warning:1441531830607151195> Role Connections')
            .setTimestamp();

        for (const [mainRoleId, config] of Object.entries(connections)) {
            let fieldValue = '';

            if (config.add_role && config.add_role.length > 0) {
                const roleNames = config.add_role.map(id => `<@&${id}>`).join(', ');
                fieldValue += `**➕ Add:** ${roleNames}\n`;
            }

            if (config.remove_role && config.remove_role.length > 0) {
                const roleNames = config.remove_role.map(id => `<@&${id}>`).join(', ');
                fieldValue += `**➖ Remove:** ${roleNames}\n`;
            }

            const reverseStatus = config.reverse ? '✅ ON' : '❌ OFF';
            fieldValue += `**Reverse:** ${reverseStatus}`;

            embed.addFields({
                name: `Main Role: <@&${mainRoleId}>`,
                value: fieldValue,
                inline: false
            });
        }

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    } catch (e) {
        console.error('Error listing role connections:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            ephemeral: true
        });
    }
}
