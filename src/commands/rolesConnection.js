import { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } from 'discord.js';
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
        .setTitle(`✅ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create error embed
 */
function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(`❌ ${title}`)
        .setDescription(description)
        .setTimestamp();
}

/**
 * Create info embed
 */
function createInfoEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`ℹ️ ${title}`)
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
            flags: 32768
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
    const connectionRole1 = interaction.options.getRole('connection-role1');
    const connectionRole2 = interaction.options.getRole('connection-role2');

    if (!mainRole || !action || !connectionRole1) {
        return interaction.reply({
            embeds: [createErrorEmbed('Missing Parameters', 'For **add** or **remove** mode, you must provide:\n• Main Role\n• Action\n• Connection Role 1')],
            flags: 32768
        });
    }

    // Prevent bot role changes
    if (mainRole.managed || connectionRole1.managed || connectionRole2?.managed) {
        return interaction.reply({
            embeds: [createErrorEmbed('Invalid Roles', 'Cannot use bot-managed roles in connections.')],
            flags: 32768
        });
    }

    // Prevent role hierarchy issues
    const botHighestRole = interaction.guild.members.me.roles.highest;
    if (mainRole.position >= botHighestRole.position || connectionRole1.position >= botHighestRole.position || connectionRole2?.position >= botHighestRole.position) {
        return interaction.reply({
            embeds: [createErrorEmbed('Role Hierarchy Issue', 'The bot cannot manage roles at or above its highest role.')],
            flags: 32768
        });
    }

    if (mode === 'add') {
        return handleAddMode(interaction, guildId, mainRole, action, connectionRole1, connectionRole2);
    } else if (mode === 'remove') {
        return handleRemoveMode(interaction, guildId, mainRole, action, connectionRole1, connectionRole2);
    }
}

/**
 * Handle add mode
 */
async function handleAddMode(interaction, guildId, mainRole, action, connectionRole1, connectionRole2) {
    try {
        addRoleConnection(guildId, mainRole.id, action, connectionRole1.id);
        if (connectionRole2) {
            addRoleConnection(guildId, mainRole.id, action, connectionRole2.id);
        }

        const roleNames = connectionRole2 
            ? `${connectionRole1.name}, ${connectionRole2.name}`
            : connectionRole1.name;

        const embed = createSuccessEmbed(
            'Role Connection Added',
            `**Main Role:** ${mainRole}\n**Action:** ${action === 'add_role' ? '➕ Add' : '➖ Remove'}\n**Connected Roles:** ${roleNames}`
        );

        return interaction.reply({ embeds: [embed], flags: 32768 });
    } catch (e) {
        console.error('Error adding role connection:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            flags: 32768
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

        const embed = createSuccessEmbed(
            'Role Connection Removed',
            `**Main Role:** ${mainRole}\n**Action:** ${action === 'add_role' ? '➕ Add' : '➖ Remove'}\n**Removed Roles:** ${roleNames}`
        );

        return interaction.reply({ embeds: [embed], flags: 32768 });
    } catch (e) {
        console.error('Error removing role connection:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            flags: 32768
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
            const embed = createInfoEmbed('No Role Connections', 'This server has no role connections configured yet.');
            return interaction.reply({ embeds: [embed], flags: 32768 });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📋 Role Connections')
            .setTimestamp();

        for (const [mainRoleId, actions] of Object.entries(connections)) {
            let fieldValue = '';

            if (actions.add_role && actions.add_role.length > 0) {
                const roleNames = actions.add_role.map(id => `<@&${id}>`).join(', ');
                fieldValue += `**➕ Add:** ${roleNames}\n`;
            }

            if (actions.remove_role && actions.remove_role.length > 0) {
                const roleNames = actions.remove_role.map(id => `<@&${id}>`).join(', ');
                fieldValue += `**➖ Remove:** ${roleNames}`;
            }

            if (fieldValue) {
                embed.addFields({
                    name: `Main Role: <@&${mainRoleId}>`,
                    value: fieldValue,
                    inline: false
                });
            }
        }

        return interaction.reply({ embeds: [embed], flags: 32768 });
    } catch (e) {
        console.error('Error listing role connections:', e);
        return interaction.reply({
            embeds: [createErrorEmbed('Operation Failed', `Error: ${e.message}`)],
            flags: 32768
        });
    }
}
