import { Client, GatewayIntentBits, Partials, Collection, ButtonStyle, ActionRowBuilder, ButtonBuilder, Events, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActivityType } from 'discord.js';
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
        .setDescription('Flip a coin - Heads or Tails'),

    // Status Management
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Manage bot status and activity (moderator only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set bot activity')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Activity type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Playing', value: 'Playing' },
                            { name: 'Listening', value: 'Listening' },
                            { name: 'Watching', value: 'Watching' },
                            { name: 'Competing', value: 'Competing' },
                            { name: 'Streaming', value: 'Streaming' }
                        ))
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Activity text')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji (optional)')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('stream_url')
                        .setDescription('Streaming URL (required for Streaming type)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('presence')
                .setDescription('Set bot presence status')
                .addStringOption(option =>
                    option.setName('status')
                        .setDescription('Presence status')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Online', value: 'online' },
                            { name: 'Idle', value: 'idle' },
                            { name: 'Do Not Disturb', value: 'dnd' },
                            { name: 'Invisible', value: 'invisible' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('emoji')
                .setDescription('Update or remove emoji from current activity')
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji (leave empty to remove)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Clear all status and activity'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Show current bot status information'))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

// ------------------------
// HELPER: Apply saved status
// ------------------------
function applyBotStatus() {
    if (!data.status.type && !data.status.presence) {
        client.user.setPresence({ status: 'online' });
        return;
    }

    const presenceData = {};
    
    if (data.status.type && data.status.text) {
        const activityTypeMap = {
            'Playing': ActivityType.Playing,
            'Listening': ActivityType.Listening,
            'Watching': ActivityType.Watching,
            'Competing': ActivityType.Competing,
            'Streaming': ActivityType.Streaming
        };

        const activity = {
            name: data.status.text,
            type: activityTypeMap[data.status.type]
        };

        if (data.status.emoji) {
            activity.name = `${data.status.emoji} ${data.status.text}`;
        }

        if (data.status.type === 'Streaming' && data.status.streamUrl) {
            activity.url = data.status.streamUrl;
        }

        presenceData.activities = [activity];
    }

    presenceData.status = data.status.presence || 'online';
    
    client.user.setPresence(presenceData);
}

// ------------------------
// BOT READY
// ------------------------
client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} is online!`);
    applyBotStatus();
});

// ------------------------
// DATA / PREFIX / AFK / AUTORESPONSE
// ------------------------
const defaultPrefix = '!';
let afkUsers = {}; // { userId: note }
data.prefixes = data.prefixes || {}; // { guildId: prefix }
data.autoresponses = data.autoresponses || {}; // { guildId: [{trigger, type, response}] }
data.status = data.status || {}; // { type, text, emoji, streamUrl, presence, lastUpdatedBy, lastUpdatedAt }

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
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');
        data.channelId = channel.id;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Nickname request channel set to ${channel}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'mode') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', flags: MessageFlags.Ephemeral });

        const type = interaction.options.getString('type').toLowerCase();
        if (!['auto','approval'].includes(type)) return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Mode must be auto or approval', flags: MessageFlags.Ephemeral });

        data.mode = type;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Mode set to **${type}**`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'reset') {
        try {
            await member.setNickname(null);
            return interaction.reply({ content: '<:1_yes_correct:1439893200981721140> Your nickname has been reset!', flags: MessageFlags.Ephemeral });
        } catch {
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Could not reset your nickname.', flags: MessageFlags.Ephemeral });
        }
    }

    // ------------------------
    // PREFIX / AFK / AVATAR SLASH COMMANDS
    // ------------------------
    if (commandName === 'setprefix') {
        const newPrefix = interaction.options.getString('prefix');
        data.prefixes[guildId] = newPrefix;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Prefix updated to: ${newPrefix}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'prefix') {
        const prefix = getPrefix(guildId);
        return interaction.reply({ content: `<:mg_question:1439893408041930894> Current prefix is: ${prefix}`, flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'afk') {
        const note = interaction.options.getString('note') || 'I am currently AFK.';
        afkUsers[user.id] = note;
        const replyMsg = await interaction.reply({ content: `<:mg_alert:1439893442065862698> AFK set: ${note}`, fetchReply: true, flags: MessageFlags.Ephemeral });

        // Delete bot reply after 60s
        setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
    }

    if (commandName === 'avatar') {
        const target = interaction.options.getUser('user') || user;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${target.tag}'s Avatar`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor(0x37373D);
        return interaction.reply({ embeds: [avatarEmbed], flags: MessageFlags.Ephemeral });
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
        return interaction.reply({ content: `<:Tails:1441153955412312134> The coin landed on: **${result}**!` });
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

            if (!['text','react'].includes(type)) return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Type must be "text" or "react"', flags: MessageFlags.Ephemeral });

            data.autoresponses[guildId] = data.autoresponses[guildId] || [];
            data.autoresponses[guildId].push({ trigger, type, response });
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Auto-response added for "${trigger}"`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'remove') {
            const trigger = interaction.options.getString('trigger');

            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> No auto-responses configured for this server.', flags: MessageFlags.Ephemeral });
            }

            const initialLength = data.autoresponses[guildId].length;
            data.autoresponses[guildId] = data.autoresponses[guildId].filter(ar => ar.trigger !== trigger);

            if (data.autoresponses[guildId].length === initialLength) {
                return interaction.reply({ content: `<:2_no_wrong:1439893245130838047> No auto-response found for trigger "${trigger}"`, flags: MessageFlags.Ephemeral });
            }

            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Auto-response removed for "${trigger}"`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'list') {
            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ content: '<:mg_question:1439893408041930894> No auto-responses configured for this server.', flags: MessageFlags.Ephemeral });
            }

            let list = '**Auto-Responses for this server:**\n\n';
            data.autoresponses[guildId].forEach((ar, index) => {
                list += `${index + 1}. Trigger: \`${ar.trigger}\` | Type: \`${ar.type}\` | Response: \`${ar.response}\`\n`;
            });

            return interaction.reply({ content: list, flags: MessageFlags.Ephemeral });
        }
    }

    // ------------------------
    // STATUS MANAGEMENT
    // ------------------------
    if (commandName === 'status') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const type = interaction.options.getString('type');
            const text = interaction.options.getString('text');
            const emoji = interaction.options.getString('emoji') || null;
            const streamUrl = interaction.options.getString('stream_url') || null;

            if (type === 'Streaming') {
                if (!streamUrl) {
                    return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Streaming URL is required for Streaming type.', flags: MessageFlags.Ephemeral });
                }
                
                const validStreamUrl = streamUrl.match(/^https?:\/\/(www\.)?(twitch\.tv|youtube\.com|youtu\.be)\/.+$/i);
                if (!validStreamUrl) {
                    return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Invalid streaming URL. Please provide a valid Twitch or YouTube URL.', flags: MessageFlags.Ephemeral });
                }
            }

            data.status.type = type;
            data.status.text = text;
            data.status.emoji = emoji;
            data.status.streamUrl = streamUrl;
            data.status.lastUpdatedBy = user.id;
            data.status.lastUpdatedAt = new Date().toISOString();
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            applyBotStatus();

            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Bot activity updated to: **${type}** ${emoji || ''} ${text}`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'presence') {
            const status = interaction.options.getString('status');

            data.status.presence = status;
            data.status.lastUpdatedBy = user.id;
            data.status.lastUpdatedAt = new Date().toISOString();
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            applyBotStatus();

            const statusNames = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible' };
            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Bot presence updated to: **${statusNames[status]}**`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'emoji') {
            const emoji = interaction.options.getString('emoji') || null;

            if (!data.status.type || !data.status.text) {
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> No activity is currently set. Use `/status set` first.', flags: MessageFlags.Ephemeral });
            }

            data.status.emoji = emoji;
            data.status.lastUpdatedBy = user.id;
            data.status.lastUpdatedAt = new Date().toISOString();
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            applyBotStatus();

            if (emoji) {
                return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Activity emoji updated to: ${emoji}`, flags: MessageFlags.Ephemeral });
            } else {
                return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Activity emoji removed.`, flags: MessageFlags.Ephemeral });
            }
        }

        if (subcommand === 'remove') {
            data.status = {};
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            client.user.setPresence({ status: 'online', activities: [] });

            return interaction.reply({ content: '<:1_yes_correct:1439893200981721140> All status and activity cleared. Bot reset to default (online, no activity).', flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'info') {
            const statusEmbed = new EmbedBuilder()
                .setTitle('Current Bot Status Information')
                .setColor(0x37373D)
                .setTimestamp();

            if (!data.status.type && !data.status.presence) {
                statusEmbed.setDescription('No custom status or activity configured. Bot is using default settings (online, no activity).');
            } else {
                if (data.status.type) statusEmbed.addFields({ name: 'Activity Type', value: data.status.type, inline: true });
                if (data.status.text) statusEmbed.addFields({ name: 'Activity Text', value: data.status.text, inline: true });
                if (data.status.emoji) statusEmbed.addFields({ name: 'Emoji', value: data.status.emoji, inline: true });
                if (data.status.type === 'Streaming' && data.status.streamUrl) {
                    statusEmbed.addFields({ name: 'Stream URL', value: data.status.streamUrl, inline: false });
                }
                statusEmbed.addFields({ name: 'Presence', value: data.status.presence || 'online', inline: true });
                if (data.status.lastUpdatedBy) {
                    statusEmbed.addFields({ name: 'Last Updated By', value: `<@${data.status.lastUpdatedBy}>`, inline: true });
                }
                if (data.status.lastUpdatedAt) {
                    statusEmbed.addFields({ name: 'Last Updated At', value: new Date(data.status.lastUpdatedAt).toLocaleString(), inline: false });
                }
            }

            return interaction.reply({ embeds: [statusEmbed], flags: MessageFlags.Ephemeral });
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
        if (cmd === 'td') {
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
            return msg.reply({ content: `<:Tails:1441153955412312134> The coin landed on: **${result}**!` });
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
                return i.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot approve/reject.', flags: MessageFlags.Ephemeral });
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