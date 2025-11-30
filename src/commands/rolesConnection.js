import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
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
 * Create Component V2 success response
 */
function createSuccessResponse(title, description) {
    return {
        content: ' ',
        ephemeral: true,
        components: [{
            type: 17,
            components: [
                { type: 10, content: `## <:Correct:1440296238305116223> ${title}` },
                { type: 14 },
                { type: 10, content: description }
            ]
        }]
    };
}

/**
 * Create Component V2 error response
 */
function createErrorResponse(title, description) {
    return {
        content: ' ',
        ephemeral: true,
        components: [{
            type: 17,
            components: [
                { type: 10, content: `## <:Error:1440296241090265088> ${title}` },
                { type: 14 },
                { type: 10, content: description }
            ]
        }]
    };
}

/**
 * Create Component V2 info response
 */
function createInfoResponse(title, description) {
    return {
        content: ' ',
        ephemeral: true,
        components: [{
            type: 17,
            components: [
                { type: 10, content: `## <:warning:1441531830607151195> ${title}` },
                { type: 14 },
                { type: 10, content: description }
            ]
        }]
    };
}

/**
 * Handle the slash command
 */
export async function handleRolesConnection(interaction) {
    // Check permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply(createErrorResponse(
            'Permission Denied',
            'You need the **Manage Roles** permission to use this command.'
        ));
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
        
        return interaction.reply(createErrorResponse('Missing Parameters', errorMsg));
    }

    // For add mode only, reverse is required
    if (mode === 'add' && reverse === null) {
        return interaction.reply(createErrorResponse(
            'Missing Parameters',
            'For **add** mode, the **Reverse** option is required (set to On or Off).'
        ));
    }

    // Prevent bot role changes
    if (mainRole.managed || connectionRole1.managed || connectionRole2?.managed) {
        return interaction.reply(createErrorResponse(
            'Invalid Roles',
            'Cannot use bot-managed roles in connections.'
        ));
    }

    // Prevent role hierarchy issues
    const botHighestRole = interaction.guild.members.me.roles.highest;
    if (mainRole.position >= botHighestRole.position || connectionRole1.position >= botHighestRole.position || connectionRole2?.position >= botHighestRole.position) {
        return interaction.reply(createErrorResponse(
            'Role Hierarchy Issue',
            'The bot cannot manage roles at or above its highest role.'
        ));
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

        return interaction.reply(createSuccessResponse('Role Connection Added', description));
    } catch (e) {
        console.error('Error adding role connection:', e);
        return interaction.reply(createErrorResponse('Operation Failed', `Error: ${e.message}`));
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

        return interaction.reply(createSuccessResponse('Role Connection Removed', description));
    } catch (e) {
        console.error('Error removing role connection:', e);
        return interaction.reply(createErrorResponse('Operation Failed', `Error: ${e.message}`));
    }
}

/**
 * Handle list mode
 */
async function handleListMode(interaction, guildId) {
    try {
        const connections = getRoleConnections(guildId);

        if (Object.keys(connections).length === 0) {
            return interaction.reply(createInfoResponse('No Role Connections', 'This server has no role connections configured yet.'));
        }

        let content = '📋 **Role Connections**\n\n';

        for (const [mainRoleId, config] of Object.entries(connections)) {
            content += `**Main Role:** <@&${mainRoleId}>\n`;

            if (config.add_role && config.add_role.length > 0) {
                const roleNames = config.add_role.map(id => `<@&${id}>`).join(', ');
                content += `  **➕ Add:** ${roleNames}\n`;
            }

            if (config.remove_role && config.remove_role.length > 0) {
                const roleNames = config.remove_role.map(id => `<@&${id}>`).join(', ');
                content += `  **➖ Remove:** ${roleNames}\n`;
            }

            const reverseStatus = config.reverse ? '✅ ON' : '❌ OFF';
            content += `  **Reverse:** ${reverseStatus}\n\n`;
        }

        return interaction.reply({
            content: ' ',
            ephemeral: true,
            components: [{
                type: 17,
                components: [
                    { type: 10, content: '## <:warning:1441531830607151195> Role Connections' },
                    { type: 14 },
                    { type: 10, content: content }
                ]
            }]
        });
    } catch (e) {
        console.error('Error listing role connections:', e);
        return interaction.reply(createErrorResponse('Operation Failed', `Error: ${e.message}`));
    }
}
