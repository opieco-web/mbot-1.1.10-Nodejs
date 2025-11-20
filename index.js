import { Client, GatewayIntentBits, Partials, Collection, ButtonStyle, ActionRowBuilder, ButtonBuilder, Events, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import fs from 'fs';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const dataFile = './data.json';
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// ------------------------
// Initialize client
// ------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// ------------------------
// COMMAND REGISTRATION
// ------------------------
const commands = [
    // Nickname commands
    new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Select nickname request channel')
        .addChannelOption(option => option.setName('channel').setDescription('Channel').setRequired(true)),

    new SlashCommandBuilder()
        .setName('mode')
        .setDescription('Switch mode')
        .addStringOption(option => option.setName('type').setDescription('auto / approval').setRequired(true)),

    new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset your nickname'),

    // Prefix / AFK / Avatar commands
    new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Set a new prefix (admin only)')
        .addStringOption(option => option.setName('prefix').setDescription('New prefix').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Show current prefix'),

    new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option => option.setName('note').setDescription('AFK note').setRequired(false)),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Show avatar')
        .addUserOption(option => option.setName('user').setDescription('User to show').setRequired(false)),

    // Fun commands
    new SlashCommandBuilder()
        .setName('truthordare')
        .setDescription('Pick a Truth or Dare'),

    // Moderation: Auto response
    new SlashCommandBuilder()
        .setName('autoresponse')
        .setDescription('Manage auto responses (mod only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add an auto response')
                .addStringOption(option => option.setName('trigger').setDescription('Trigger word').setRequired(true))
                .addStringOption(option => option.setName('type').setDescription('Response type: text or react').setRequired(true))
                .addStringOption(option => option.setName('response').setDescription('Text or emoji').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove an auto response')
                .addStringOption(option => option.setName('trigger').setDescription('Trigger word to remove').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all auto responses'))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    // Fun: Coin Flip
    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin - Heads or Tails')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

// ------------------------
// BOT READY
// ------------------------
client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} is online!`);
});

// ------------------------
// DATA / PREFIX / AFK / AUTORESPONSE
// ------------------------
const defaultPrefix = '!';
let afkUsers = {}; // { userId: note }
data.prefixes = data.prefixes || {}; // { guildId: prefix }
data.autoresponses = data.autoresponses || {}; // { guildId: [{trigger, type, response}] }

// ------------------------
// HELPER: get prefix per guild
// ------------------------
function getPrefix(guildId) {
    return data.prefixes[guildId] || defaultPrefix;
}

// ------------------------
// HANDLE SLASH COMMANDS
// ------------------------
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guildId, member, user } = interaction;

    // ------------------------
    // NICKNAME SYSTEM
    // ------------------------
    if (commandName === 'setchannel') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        data.channelId = channel.id;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Nickname request channel set to ${channel}`, ephemeral: true });
    }

    if (commandName === 'mode') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', ephemeral: true });

        const type = interaction.options.getString('type').toLowerCase();
        if (!['auto','approval'].includes(type)) return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Mode must be auto or approval', ephemeral: true });

        data.mode = type;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Mode set to **${type}**`, ephemeral: true });
    }

    if (commandName === 'reset') {
        try {
            await member.setNickname(null);
            return interaction.reply({ content: '<:1_yes_correct:1439893200981721140> Your nickname has been reset!', ephemeral: true });
        } catch {
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Could not reset your nickname.', ephemeral: true });
        }
    }

    // ------------------------
    // PREFIX / AFK / AVATAR SLASH COMMANDS
    // ------------------------
    if (commandName === 'setprefix') {
        const newPrefix = interaction.options.getString('prefix');
        data.prefixes[guildId] = newPrefix;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Prefix updated to: ${newPrefix}`, ephemeral: true });
    }

    if (commandName === 'prefix') {
        const prefix = getPrefix(guildId);
        return interaction.reply({ content: `<:mg_question:1439893408041930894> Current prefix is: ${prefix}`, ephemeral: true });
    }

    if (commandName === 'afk') {
        const note = interaction.options.getString('note') || 'I am currently AFK.';
        afkUsers[user.id] = note;
        const replyMsg = await interaction.reply({ content: `<:mg_alert:1439893442065862698> AFK set: ${note}`, fetchReply: true, ephemeral: true });

        // Delete bot reply after 60s
        setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
    }

    if (commandName === 'avatar') {
        const target = interaction.options.getUser('user') || user;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${target.tag}'s Avatar`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(0x37373D);
        return interaction.reply({ embeds: [avatarEmbed], ephemeral: true });
    }

    // ------------------------
    // FUN COMMAND: Truth or Dare
    // ------------------------
    if (commandName === 'truthordare') {
        const truths = [
            "What's your biggest fear?",
            "Have you ever lied to your best friend?",
            "What's your secret hobby?",
            "What's the most embarrassing thing you've done?",
            "Who was your first crush?",
            "What's a secret you've never told anyone?",
            "Have you ever cheated on a test?",
            "What's your biggest regret?",
            "What's the worst gift you've ever received?",
            "Have you ever ghosted someone?",
            "What's something you're glad your parents don't know about?",
            "What's your most unpopular opinion?",
            "Have you ever pretended to be sick to skip school or work?",
            "What's the longest you've gone without showering?",
            "What's a weird habit you have?"
        ];
        const dares = [
            "Do 10 push-ups.",
            "Sing a song loudly.",
            "Post a funny selfie.",
            "Send a voice message singing the alphabet.",
            "Change your nickname to something embarrassing for 1 hour.",
            "React to the last 5 messages with random emojis.",
            "Share the last photo in your camera roll.",
            "Do your best impression of a celebrity.",
            "Type your next message with your eyes closed.",
            "Compliment everyone online right now.",
            "Send a message in all caps for the next 5 minutes.",
            "Share an embarrassing story from your childhood.",
            "Let someone else write your status for 24 hours.",
            "Do 20 jumping jacks and post a video.",
            "Text a random contact 'I miss you' without context."
        ];
        const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
        const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
        return interaction.reply({ content: `**${pick}:** ${question}` });
    }

    // ------------------------
    // FUN COMMAND: Coin Flip
    // ------------------------
    if (commandName === 'coinflip') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return interaction.reply({ content: `🪙 The coin landed on: **${result}**!` });
    }

    // ------------------------
    // MODERATION: Auto-response
    // ------------------------
    if (commandName === 'autoresponse') {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const trigger = interaction.options.getString('trigger');
            const type = interaction.options.getString('type').toLowerCase();
            const response = interaction.options.getString('response');

            if (!['text','react'].includes(type)) return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Type must be "text" or "react"', ephemeral: true });

            data.autoresponses[guildId] = data.autoresponses[guildId] || [];
            data.autoresponses[guildId].push({ trigger, type, response });
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Auto-response added for "${trigger}"`, ephemeral: true });
        }

        if (subcommand === 'remove') {
            const trigger = interaction.options.getString('trigger');

            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> No auto-responses configured for this server.', ephemeral: true });
            }

            const initialLength = data.autoresponses[guildId].length;
            data.autoresponses[guildId] = data.autoresponses[guildId].filter(ar => ar.trigger !== trigger);

            if (data.autoresponses[guildId].length === initialLength) {
                return interaction.reply({ content: `<:2_no_wrong:1439893245130838047> No auto-response found for trigger "${trigger}"`, ephemeral: true });
            }

            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Auto-response removed for "${trigger}"`, ephemeral: true });
        }

        if (subcommand === 'list') {
            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ content: '<:mg_question:1439893408041930894> No auto-responses configured for this server.', ephemeral: true });
            }

            let list = '**Auto-Responses for this server:**\n\n';
            data.autoresponses[guildId].forEach((ar, index) => {
                list += `${index + 1}. Trigger: \`${ar.trigger}\` | Type: \`${ar.type}\` | Response: \`${ar.response}\`\n`;
            });

            return interaction.reply({ content: list, ephemeral: true });
        }
    }
});

// ------------------------
// HANDLE MESSAGES
// ------------------------
client.on(Events.MessageCreate, async msg => {
    if (msg.author.bot) return;

    const guildId = msg.guildId;
    const prefix = getPrefix(guildId);

    // ----- Reset AFK on any message -----
    if (afkUsers[msg.author.id]) {
        delete afkUsers[msg.author.id];
        const replyMsg = await msg.reply(`<:1_yes_correct:1439893200981721140> Welcome back! Your AFK status has been removed.`);
        setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
    }

    // ----- Check mentions for AFK -----
    msg.mentions.users.forEach(async user => {
        if (afkUsers[user.id]) {
            const replyMsg = await msg.reply(`<:mg_alert:1439893442065862698> ${user.tag} is AFK: ${afkUsers[user.id]}`);
            setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
        }
    });

    // ----- Handle prefix commands -----
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        // AFK
        if (cmd === 'afk') {
            const note = args.join(' ') || 'I am currently AFK.';
            afkUsers[msg.author.id] = note;

            const replyMsg = await msg.reply(`<:mg_alert:1439893442065862698> AFK set: ${note}`);

            // Delete user message after 5s
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            // Delete bot reply after 60s
            setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
        }

        // Avatar
        if (cmd === 'av') {
            const user = msg.mentions.users.first() || msg.author;
            const avatarEmbed = new EmbedBuilder()
                .setTitle(`${user.tag}'s Avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .setColor(0x37373D);
            return msg.reply({ embeds: [avatarEmbed] });
        }

        // Fun command: Truth or Dare
        if (cmd === 'tb') {
            const truths = [
                "What's your biggest fear?",
                "Have you ever lied to your best friend?",
                "What's your secret hobby?",
                "What's the most embarrassing thing you've done?",
                "Who was your first crush?",
                "What's a secret you've never told anyone?",
                "Have you ever cheated on a test?",
                "What's your biggest regret?",
                "What's the worst gift you've ever received?",
                "Have you ever ghosted someone?",
                "What's something you're glad your parents don't know about?",
                "What's your most unpopular opinion?",
                "Have you ever pretended to be sick to skip school or work?",
                "What's the longest you've gone without showering?",
                "What's a weird habit you have?"
            ];
            const dares = [
                "Do 10 push-ups.",
                "Sing a song loudly.",
                "Post a funny selfie.",
                "Send a voice message singing the alphabet.",
                "Change your nickname to something embarrassing for 1 hour.",
                "React to the last 5 messages with random emojis.",
                "Share the last photo in your camera roll.",
                "Do your best impression of a celebrity.",
                "Type your next message with your eyes closed.",
                "Compliment everyone online right now.",
                "Send a message in all caps for the next 5 minutes.",
                "Share an embarrassing story from your childhood.",
                "Let someone else write your status for 24 hours.",
                "Do 20 jumping jacks and post a video.",
                "Text a random contact 'I miss you' without context."
            ];
            const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
            const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
            return msg.reply({ content: `**${pick}:** ${question}` });
        }

        // Fun command: Coin Flip
        if (cmd === 'cf') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            return msg.reply({ content: `🪙 The coin landed on: **${result}**!` });
        }
    }

    // ----- Auto-response triggers -----
    if (data.autoresponses[guildId]) {
        for (const ar of data.autoresponses[guildId]) {
            if (msg.content.includes(ar.trigger)) {
                if (ar.type === 'text') {
                    msg.reply(ar.response).catch(() => {});
                } else if (ar.type === 'react') {
                    msg.react(ar.response).catch(() => {});
                }
            }
        }
    }
});

// ------------------------
// NICKNAME MESSAGE HANDLER
// (Unchanged from your original system)
// ------------------------
client.on(Events.MessageCreate, async msg => {
    if (msg.author.bot) return;
    if (!data.channelId || msg.channel.id !== data.channelId) return;

    const nickname = msg.content.trim();
    if (nickname.toLowerCase() === 'reset') {
        await msg.member.setNickname(null);
        return msg.reply('<:1_yes_correct:1439893200981721140> Your nickname has been reset!');
    }

    if (data.mode === 'auto') {
        try {
            await msg.member.setNickname(nickname);
            msg.reply(`<:1_yes_correct:1439893200981721140> Your nickname has been changed to **${nickname}**`);
        } catch {
            msg.reply('<:2_no_wrong:1439893245130838047> Failed to change nickname.');
        }
    } else if (data.mode === 'approval') {
        const approveBtn = new ButtonBuilder()
            .setCustomId(`approve_${msg.author.id}`)
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success);

        const rejectBtn = new ButtonBuilder()
            .setCustomId(`reject_${msg.author.id}`)
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(approveBtn, rejectBtn);

        const requestMsg = await msg.channel.send({
            content: `**Nickname Request:**\nUser: ${msg.author}\nNickname: "${nickname}"`,
            components: [row]
        });

        const filter = i => i.user.id !== msg.author.id;
        const collector = requestMsg.createMessageComponentCollector({ filter, time: 3600000 });

        collector.on('collect', async i => {
            if (!i.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
                return i.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot approve/reject.', ephemeral: true });
            }

            if (i.customId === `approve_${msg.author.id}`) {
                try {
                    await msg.member.setNickname(nickname);
                    await i.update({ content: `<:1_yes_correct:1439893200981721140> ${msg.author} nickname approved: **${nickname}**`, components: [] });
                } catch {
                    await i.update({ content: '<:2_no_wrong:1439893245130838047> Failed to change nickname.', components: [] });
                }
            } else if (i.customId === `reject_${msg.author.id}`) {
                await i.update({ content: `<:2_no_wrong:1439893245130838047> ${msg.author} nickname request rejected.`, components: [] });
            }
            collector.stop();
        });
    }
});

// ------------------------
client.login(TOKEN);