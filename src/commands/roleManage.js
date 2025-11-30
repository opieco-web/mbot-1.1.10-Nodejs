import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const roleManage = new SlashCommandBuilder()
    .setName('role-manage')
    .setDescription('Add or remove a role from a user')
    .addStringOption(option =>
        option
            .setName('action')
            .setDescription('Add or remove role')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' }
            )
    )
    .addRoleOption(option =>
        option
            .setName('role')
            .setDescription('Role to manage')
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to manage')
            .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles);

/**
 * Handle role manage command
 */
export function handleRoleManage(interaction) {
    return execute(interaction);
}

async function execute(interaction) {
    try {
        const action = interaction.options.getString('action');
        const role = interaction.options.getRole('role');
        const user = interaction.options.getUser('user');

        // Get member from guild
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({
                content: ' ',
                flags: 32768,
                components: [{
                    type: 17,
                    components: [{
                        type: 10,
                        content: `## <:Error:1440296241090265088> Error\n\nUser not found in this server.`
                    }]
                }]
            });
        }

        // Check if bot can manage this role
        const botRole = interaction.guild.members.me.roles.highest;
        if (botRole.position <= role.position) {
            return interaction.reply({
                content: ' ',
                flags: 32768,
                components: [{
                    type: 17,
                    components: [{
                        type: 10,
                        content: `## <:Error:1440296241090265088> Error\n\nBoth role is too high to manage. Bot role must be higher than the target role.`
                    }]
                }]
            });
        }

        // Add or remove role
        if (action === 'add') {
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: ' ',
                    flags: 32768,
                    components: [{
                        type: 17,
                        components: [{
                            type: 10,
                            content: `## <:warning:1441531830607151195> Already Has Role\n\n${user} already has ${role}`
                        }]
                    }]
                });
            }

            await member.roles.add(role);
            return interaction.reply({
                content: ' ',
                flags: 32768,
                components: [{
                    type: 17,
                    components: [{
                        type: 10,
                        content: `## <:Success:1440296238305116223> Role Added\n\nAdded ${role} to ${user}`
                    }]
                }]
            });
        } else {
            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({
                    content: ' ',
                    flags: 32768,
                    components: [{
                        type: 17,
                        components: [{
                            type: 10,
                            content: `## <:warning:1441531830607151195> Doesn't Have Role\n\n${user} doesn't have ${role}`
                        }]
                    }]
                });
            }

            await member.roles.remove(role);
            return interaction.reply({
                content: ' ',
                flags: 32768,
                components: [{
                    type: 17,
                    components: [{
                        type: 10,
                        content: `## <:Success:1440296238305116223> Role Removed\n\nRemoved ${role} from ${user}`
                    }]
                }]
            });
        }

    } catch (error) {
        console.error('Error in role-manage command:', error);
        return interaction.reply({
            content: ' ',
            flags: 32768,
            components: [{
                type: 17,
                components: [{
                    type: 10,
                    content: `## <:Error:1440296241090265088> Error\n\n${error.message}`
                }]
            }]
        });
    }
}
