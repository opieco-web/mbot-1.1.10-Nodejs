import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const roleBulk = new SlashCommandBuilder()
    .setName('role-bulk')
    .setDescription('Bulk add or remove role from thousands of users (optimized for speed)')
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
    .addStringOption(option =>
        option
            .setName('target')
            .setDescription('Who to target: all users, all bots, or both')
            .setRequired(true)
            .addChoices(
                { name: 'All Users (humans only)', value: 'all_users' },
                { name: 'All Bots', value: 'all_bots' },
                { name: 'Both (users and bots)', value: 'both' }
            )
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles);

/**
 * Process members in parallel batches for ultra-fast role distribution
 */
async function processMembersInBatches(members, role, action, batchSize = 50) {
    const totalMembers = members.length;
    let processed = 0;
    let success = 0;
    let failed = 0;
    const startTime = Date.now();

    // Create batches
    const batches = [];
    for (let i = 0; i < members.length; i += batchSize) {
        batches.push(members.slice(i, i + batchSize));
    }

    // Process each batch in parallel
    for (const batch of batches) {
        const promises = batch.map(member => {
            return (async () => {
                try {
                    if (action === 'add') {
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            success++;
                        }
                    } else {
                        if (member.roles.cache.has(role.id)) {
                            await member.roles.remove(role);
                            success++;
                        }
                    }
                } catch (err) {
                    failed++;
                }
                processed++;
            })();
        });

        // Wait for batch to complete before moving to next
        await Promise.allSettled(promises);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    return { processed, success, failed, duration, total: totalMembers };
}

/**
 * Handle role bulk command
 */
export function handleRoleBulk(interaction) {
    return execute(interaction);
}

async function execute(interaction) {
    try {
        const action = interaction.options.getString('action');
        const role = interaction.options.getRole('role');
        const target = interaction.options.getString('target');

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
                        content: `## <:Error:1440296241090265088> Error\n\nBot role is too low. Bot role must be higher than the target role.`
                    }]
                }]
            });
        }

        // Defer reply - this might take a moment
        await interaction.deferReply({ flags: 32768 });

        // Fetch all members
        const allMembers = await interaction.guild.members.fetch();

        // Filter members based on target
        let targetMembers = [];
        if (target === 'all_users') {
            targetMembers = allMembers.filter(m => !m.user.bot).map(m => m);
        } else if (target === 'all_bots') {
            targetMembers = allMembers.filter(m => m.user.bot).map(m => m);
        } else {
            targetMembers = allMembers.map(m => m);
        }

        // Show processing message
        await interaction.editReply({
            content: ' ',
            components: [{
                type: 17,
                components: [{
                    type: 10,
                    content: `## ⏳ Processing\n\nApplying roles to ${targetMembers.length} members...`
                }]
            }]
        });

        // Process members with ultra-fast parallel batches
        const result = await processMembersInBatches(targetMembers, role, action);

        // Send final result
        return interaction.editReply({
            content: ' ',
            components: [{
                type: 17,
                components: [{
                    type: 10,
                    content: `## <:Success:1440296238305116223> Bulk Operation Complete\n\n**Action:** ${action === 'add' ? 'Added' : 'Removed'}\n**Target:** ${target === 'all_users' ? 'All Humans' : target === 'all_bots' ? 'All Bots' : 'All Users + Bots'}\n**Role:** ${role}\n**Success:** ${result.success}/${result.total}\n**Failed:** ${result.failed}\n**Duration:** ${result.duration}s`
                }]
            }]
        });

    } catch (error) {
        console.error('Error in role-bulk command:', error);
        
        try {
            return interaction.editReply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [{
                        type: 10,
                        content: `## <:Error:1440296241090265088> Error\n\n${error.message}`
                    }]
                }]
            });
        } catch (e) {
            // If editReply fails, try reply
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
}
