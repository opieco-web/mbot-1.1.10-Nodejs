import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { loadServer } from '../utils/loadServer.js';
import { updateServerProperty } from '../utils/saveServer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Change the bot prefix for this server')
        .addStringOption(option =>
            option
                .setName('prefix')
                .setDescription('New prefix (1-3 characters)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const newPrefix = interaction.options.getString('prefix');

        // Validation
        if (!newPrefix || newPrefix.length > 3) {
            return interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '## <:Error:1440296241090265088> Invalid Prefix' },
                        { type: 14 },
                        { type: 10, content: 'Prefix must be 1-3 characters long.' }
                    ]
                }],
                flags: MessageFlags.Ephemeral
            });
        }

        // Load server data (auto-creates if needed)
        const serverData = loadServer(guildId, interaction.guild.name);

        if (!serverData) {
            return interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '## <:Error:1440296241090265088> Failed to Load Server Data' },
                        { type: 14 },
                        { type: 10, content: 'Could not access server configuration.' }
                    ]
                }],
                flags: MessageFlags.Ephemeral
            });
        }

        // Update only the prefix property (safe update)
        const success = updateServerProperty(guildId, 'prefix', newPrefix);

        if (!success) {
            return interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '## <:Error:1440296241090265088> Failed to Save' },
                        { type: 14 },
                        { type: 10, content: 'Could not save the new prefix. Please try again.' }
                    ]
                }],
                flags: MessageFlags.Ephemeral
            });
        }

        // Success response
        return interaction.reply({
            content: ' ',
            components: [{
                type: 17,
                components: [
                    { type: 10, content: '## <:Correct:1440296238305116223> Prefix Updated' },
                    { type: 14 },
                    { type: 10, content: `New prefix: \`${newPrefix}\`\n\nExample: \`${newPrefix}help\`` }
                ]
            }],
            flags: MessageFlags.Ephemeral
        });
    }
};
