import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const utilityCommands = [
    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View user avatar')
        .addUserOption(option => option.setName('user').setDescription('User to show avatar for (optional)').setRequired(false))
        .addBooleanOption(option => option.setName('server').setDescription('Show server avatar only (true/false)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('View comprehensive bot information, stats, and configuration')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search the web with DuckDuckGo or search local bot data')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('What do you want to search for?')
                .setRequired(true))
        .addBooleanOption(option =>
            option
                .setName('local')
                .setDescription('Search local bot data instead of DuckDuckGo? (default: false)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set AFK status with optional reason')
        .addStringOption(option => option.setName('note').setDescription('Reason for being AFK (optional)').setRequired(false))
];
