import { SlashCommandBuilder } from 'discord.js';

export const funCommands = [
    new SlashCommandBuilder()
        .setName('truthordare')
        .setDescription('Play Truth or Dare: get a random truth question or dare challenge'),

    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin: get random Heads or Tails result'),

    new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Let the bot randomly choose between options')
        .addStringOption(option =>
            option
                .setName('a')
                .setDescription('Subject A')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('b')
                .setDescription('Subject B')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('c')
                .setDescription('Subject C (optional)')
                .setRequired(false))
];
