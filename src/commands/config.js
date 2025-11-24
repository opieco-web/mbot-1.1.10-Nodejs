import { SlashCommandBuilder } from 'discord.js';

export const configCommand = [
    new SlashCommandBuilder()
        .setName('config')
        .setDescription('View and manage bot configuration settings')
];
