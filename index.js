import { Client, GatewayIntentBits, Partials, Collection, ButtonStyle, ActionRowBuilder, ButtonBuilder, Events, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActivityType, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';
import fs from 'fs';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Get bot name and version from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const BOT_NAME = packageJson.name;
const BOT_VERSION = packageJson.version;

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
const startTime = Date.now();

// ------------------------
// COMMAND REGISTRATION
// ------------------------
const commands = [
    // Nickname commands
    new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Request or reset nickname (mod only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Set channel and mode: Auto (instant) or Approved (manual)')
                .addChannelOption(option => option.setName('channel').setDescription('Nickname request channel').setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('mode')
                        .setDescription('Auto = instant approval, Approved = manual approval via buttons')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Auto', value: 'auto' },
                            { name: 'Approved', value: 'approval' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset your nickname back to your username')),

    new SlashCommandBuilder()
        .setName('nicknamefilter')
        .setDescription('Manage banned nickname words (mod only)')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('add = ban a word, remove = unban a word, list = show all banned words')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' },
                    { name: 'list', value: 'list' }
                ))
        .addStringOption(option =>
            option
                .setName('word')
                .setDescription('Word to ban or unban (not needed for list action)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageNicknames),

    // Prefix / AFK / Avatar commands
    new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Change server prefix (admin only)')
        .addStringOption(option => option.setName('prefix').setDescription('New prefix character(s)').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Show the current server prefix for prefix commands'),

    new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set AFK status with optional reason')
        .addStringOption(option => option.setName('note').setDescription('Reason for being AFK (optional)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('afklist')
        .setDescription('View all AFK users (mod only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('View user avatar')
        .addUserOption(option => option.setName('user').setDescription('User to show avatar for (optional)').setRequired(false))
        .addBooleanOption(option => option.setName('server').setDescription('Show server avatar only (true/false)').setRequired(false)),

    // Fun commands
    new SlashCommandBuilder()
        .setName('truthordare')
        .setDescription('Play Truth or Dare: get a random truth question or dare challenge'),

    // Moderation: Auto response
    new SlashCommandBuilder()
        .setName('autoresponse')
        .setDescription('Auto-respond to triggers: add/remove/list (mod only)')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('add = create trigger, remove = delete trigger, list = show all triggers')
                .setRequired(true)
                .addChoices(
                    { name: 'add', value: 'add' },
                    { name: 'remove', value: 'remove' },
                    { name: 'list', value: 'list' }
                ))
        .addStringOption(option =>
            option
                .setName('trigger')
                .setDescription('Trigger word (required for add/remove, e.g., "hello")')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Response type: text = reply message, emoji = react with emoji (required for add)')
                .setRequired(false)
                .addChoices(
                    { name: 'text', value: 'text' },
                    { name: 'emoji', value: 'emoji' }
                ))
        .addStringOption(option =>
            option
                .setName('response')
                .setDescription('Response message or emoji (required for add)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    // Fun: Coin Flip
    new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin: get random Heads or Tails result'),

    // Welcome System
    new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Manage welcome messages (mod only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Enable welcomes: set channel, delay (5s/1m/1h), view messages')
                .addChannelOption(option =>
                    option.setName('setchannel')
                        .setDescription('Channel where welcome messages are sent to new members')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('delaytime')
                        .setDescription('Delay before sending welcome (e.g., 5s, 10s, 1m, 1h) - default is 120s')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('list')
                        .setDescription('Show sample of welcome messages available (yes/no)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable welcome messages - new members won\'t receive greetings'))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    // Ping command
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot health & uptime (mod only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    // Status Management
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Manage bot status (mod only)')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('set = customize, reset = default, view = show current status')
                .setRequired(true)
                .addChoices(
                    { name: 'set', value: 'set' },
                    { name: 'reset', value: 'reset' },
                    { name: 'view', value: 'view' }
                ))
        .addStringOption(option =>
            option
                .setName('activity_text')
                .setDescription('Activity text (e.g., "Minecraft" or "Netflix") - use with set action')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('activity_type')
                .setDescription('What the bot is doing: Playing/Watching/Listening/Competing/Streaming - use with set action')
                .setRequired(false)
                .addChoices(
                    { name: 'Playing', value: 'Playing' },
                    { name: 'Watching', value: 'Watching' },
                    { name: 'Listening', value: 'Listening' },
                    { name: 'Competing', value: 'Competing' },
                    { name: 'Streaming', value: 'Streaming' }
                ))
        .addStringOption(option =>
            option
                .setName('stream_url')
                .setDescription('Twitch or YouTube URL (only for Streaming activity type)')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('Emoji to add before status text (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('online_status')
                .setDescription('Bot visibility: Online/Idle/Do Not Disturb/Invisible')
                .setRequired(false)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Idle', value: 'idle' },
                    { name: 'Do Not Disturb', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                ))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

// ------------------------
// HELPER: Apply saved status
// ------------------------
function applyBotStatus() {
    const presenceData = {
        status: data.status.presence || 'online',
        activities: []
    };
    
    if (data.status.type && data.status.text) {
        const activityTypeMap = {
            'Playing': ActivityType.Playing,
            'Listening': ActivityType.Listening,
            'Watching': ActivityType.Watching,
            'Competing': ActivityType.Competing,
            'Streaming': ActivityType.Streaming
        };

        let name = data.status.text;
        if (data.status.emoji) {
            name = `${data.status.emoji} ${name}`;
        }

        const activity = {
            name: name,
            type: activityTypeMap[data.status.type]
        };

        if (data.status.type === 'Streaming' && data.status.streamUrl) {
            activity.url = data.status.streamUrl;
        }

        presenceData.activities = [activity];
    }
    
    client.user.setPresence(presenceData);
}

// ------------------------
// BOT READY
// ------------------------
client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} is online!`);
    applyBotStatus();
    
    // Load AFK data from storage
    if (data.afk) {
        afkUsers = { ...data.afk };
    }
});

// ------------------------
// DATA / PREFIX / AFK / AUTORESPONSE
// ------------------------
const defaultPrefix = '!';
let afkUsers = {}; // { userId: { reason: string, timestamp: number } }
data.prefixes = data.prefixes || {}; // { guildId: prefix }
data.autoresponses = data.autoresponses || {}; // { guildId: [{trigger, type, response}] }
data.status = data.status || {}; // { type, text, emoji, streamUrl, presence, lastUpdatedBy, lastUpdatedAt }
data.welcome = data.welcome || {}; // { guildId: { channelId, delay, enabled } }
data.afk = data.afk || {}; // { userId: { reason: string, timestamp: number } }
data.nicknameFilter = data.nicknameFilter || []; // [ word, word, ... ]

// HELPER: Create Component V2 format for avatar display
// mode: 'both' (default), 'server_only', 'default_only'
function createAvatarComponent(username, defaultAvatarUrl, serverAvatarUrl = null, mode = 'both') {
    const items = [];
    let title = '';
    
    if (mode === 'server_only') {
        items.push(
            new MediaGalleryItemBuilder()
                .setURL(serverAvatarUrl)
                .setDescription(`${username}'s Server Avatar`)
        );
        title = `${username}'s Server Avatar`;
    } else if (mode === 'default_only') {
        items.push(
            new MediaGalleryItemBuilder()
                .setURL(defaultAvatarUrl)
                .setDescription(`${username}'s Discord Avatar`)
        );
        title = `${username}'s Discord Avatar`;
    } else {
        // Show both
        if (serverAvatarUrl) {
            items.push(
                new MediaGalleryItemBuilder()
                    .setURL(serverAvatarUrl)
                    .setDescription(`${username}'s Server Avatar`)
            );
        }
        items.push(
            new MediaGalleryItemBuilder()
                .setURL(defaultAvatarUrl)
                .setDescription(`${username}'s Discord Avatar`)
        );
        title = `${username}'s Avatar${serverAvatarUrl ? 's' : ''}`;
    }
    
    const gallery = new MediaGalleryBuilder().addItems(...items);
    const textDisplay = new TextDisplayBuilder().setContent(`## ${title}`);
    
    const container = new ContainerBuilder()
        .addTextDisplayComponents(textDisplay)
        .addMediaGalleryComponents(gallery);
    
    return {
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}

// HELPER: Create Component V2 response (text-based)
function createComponentV2(content) {
    const textDisplay = new TextDisplayBuilder().setContent(content);
    const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
    
    return {
        content: ' ',
        components: [container],
        flags: MessageFlags.IsComponentsV2
    };
}

// HELPER: Calculate AFK duration with smart format (shows only relevant units)
function calculateDuration(time) {
    const now = Date.now();
    const diffMs = now - time;
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let duration = '';
    if (hours > 0) {
        duration = hours + 'h ' + minutes + 'm ' + seconds + 's';
    } else if (minutes > 0) {
        duration = minutes + 'm ' + seconds + 's';
    } else {
        duration = seconds + 's';
    }
    
    return '**' + duration + '**';
}

// HELPER: Format bot uptime
function formatUptime(time) {
    const now = Date.now();
    const diffMs = now - time;
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${days}d ${hours}h ${mins}m`;
}

// ------------------------
// HELPER: get prefix per guild
// ------------------------
function getPrefix(guildId) {
    return data.prefixes[guildId] || defaultPrefix;
}

// HELPER: Check if nickname contains banned words
function containsBannedWord(nickname) {
    const lowerNickname = nickname.toLowerCase();
    for (const word of data.nicknameFilter) {
        if (lowerNickname.includes(word.toLowerCase())) {
            return word;
        }
    }
    return null;
}

// HELPER: Parse delay string format (e.g., 5s, 10s, 1m, 1h) to milliseconds
function parseDelayString(delayStr) {
    if (!delayStr) return 120000; // default 120 seconds
    
    const match = delayStr.match(/^(\d+)([smh])$/);
    if (!match) return 120000;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch(unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        default: return 120000;
    }
}

// ------------------------
// WELCOME MESSAGES
// ------------------------
const welcomeMessages = [
    "Hey {user}! Welcome to the squad! 🎉",
    "Yo {user}! Glad you're here, let's vibe! ✨",
    "{user} just joined! Ekdom perfect timing! 🔥",
    "Welcome {user}! Amra wait korchilam! 💫",
    "{user} has entered the chat! Let's goooo! 🚀",
    "Ayee {user}! Welcome to the fam! 🌟",
    "{user} just pulled up! Lesss gooo! 💪",
    "Yooo {user}! Tomar jonno wait korchilam! ⭐",
    "Welcome aboard {user}! Enjoy your stay! 🎊",
    "{user} joined! Ekta fresh vibe! 🌈",
    "Hey {user}! Ready to have some fun? 🎮",
    "Welcome {user}! Cholo shuru kori! 🎯",
    "{user} is here! Time to light it up! 💡",
    "Ayoo {user}! Khub bhalo lagche! 😄",
    "{user} joined the party! Let's rock! 🎸",
    "Welcome {user}! Amader sathe thako! 🤝",
    "{user} just landed! Feeling good! ☀️",
    "Yoo {user}! Great to see you here! 👋",
    "{user} arrived! Besh moja hobe! 🎭",
    "Hey {user}! Let's make some memories! 📸",
    "{user} is in! Ajke moja korbo! 🎪",
    "Welcome {user}! Tumi amader ekjon! 💙",
    "{user} just joined! Awesome energy! ⚡",
    "Ayee {user}! Chill koro, enjoy koro! 🍃",
    "{user} has arrived! Let's hang! 🌙",
    "Welcome {user}! Bhalo theko always! 🌸",
    "{user} joined! New adventure starts! 🗺️",
    "Yo {user}! Tumake peyechhi! 🎁",
    "{user} is here! Good vibes only! ✌️",
    "Hey {user}! Amra ready! 🎬",
    "{user} entered! Shobai mile moja! 🎉",
    "Welcome {user}! Khela hobe! 🏆",
    "{user} joined the crew! Epic! 🌊",
    "Ayoo {user}! Tomar jonno special! 🌹",
    "{user} is in the house! Yay! 🏠",
    "Welcome {user}! Let's create magic! 🪄",
    "{user} arrived! Ekdom fresh! 🍀",
    "Hey {user}! Shobai tomake chene! 👀",
    "{user} just joined! Stay awesome! 🌟",
    "Yo {user}! Amader circle complete! ⭕",
    "{user} has landed! Fun times ahead! 🎢",
    "Welcome {user}! Bhalo lage tomar vibe! 💖",
    "{user} is here! Let's do this! 💥",
    "Ayee {user}! Chill mode on! 😎",
    "{user} joined! Positive vibes! 🌻",
    "Hey {user}! Amra eksathe! 🤗",
    "{user} pulled up! Looking good! 👌",
    "Welcome {user}! Ekta notun chapter! 📖",
    "{user} arrived! Moja guarantee! 🎊",
    "Yo {user}! Happy to have you! 💚",
    "{user} is in! Ebar masti shuru! 🎈",
    "Welcome {user}! Tumi special! 💎",
    "{user} just joined! Keep smiling! 😊",
    "Hey {user}! Let's vibe together! 🎵",
    "{user} has arrived! Good energy! 🔆",
    "Ayoo {user}! Amra ready for fun! 🎯",
    "{user} joined! Shobai mile happy! 😄",
    "Welcome {user}! Bhalo thakish! 🌺",
    "{user} is here! Let's enjoy! 🎪",
    "Yo {user}! Tumi awesome! 🌟",
    "Welcome {user}! Hope you have a great time here.",
    "Glad to have you {user}! Feel free to explore.",
    "Welcome {user}! Make yourself comfortable and say hi anytime.",
    "Nice to see you {user}! Enjoy your stay!",
    "Hey {user}! Welcome — hope this place feels like home soon.",
    "Happy to have you {user}! Join the conversations!",
    "Welcome {user}! We're glad you joined us today.",
    "Great to see you {user}! Hope you enjoy the server.",
    "Welcome {user}! We're happy you're here.",
    "Glad you joined {user}! Feel free to look around.",
    "স্বাগতম {user}! আশা করি এখানে তোমার ভালো লাগবে।",
    "ভালো লাগলো {user} যোগ দিলে — আরাম করে থাকো।",
    "স্বাগতম {user}! নিজের মতো করে server explore করতে পারো।",
    "এলে ভালো হলো {user} — আশা করি সময়টা enjoy করবে।",
    "স্বাগতম {user}! এখানে সবাই বেশ friendly.",
    "Welcome {user}! Take your time and enjoy the vibe.",
    "Nice to meet you {user} — hope you have fun.",
    "Welcome {user}! Join whenever you're comfortable.",
    "Happy you joined {user}! Feel free to connect with others.",
    "Welcome {user}! Wishing you a good experience here.",
    "Ei server e {user} স্বাগতম — enjoy your time.",
    "Welcome {user}! Feel free to chill around.",
    "Good to have you {user} — hope you like the environment.",
    "Welcome {user}! You're always free to join any chat.",
    "Hello {user}! Thanks for joining us today.",
    "স্বাগতম {user}! তোমার সাথে পরিচয় ভালো লাগলো।",
    "Glad you're here {user}! Stay as long as you like.",
    "Welcome {user}! Hope your time here is enjoyable.",
    "Nice to see you {user}! Take it easy and relax.",
    "Welcome {user}! Feel free to express yourself here.",
    "Hey {user}! Glad you joined us — have fun!",
    "স্বাগতম {user}! চাইলে সবাইকে হাই বলতে পারো।",
    "Welcome {user}! Hope you meet great people here.",
    "Happy to see you {user}! Enjoy the space.",
    "Welcome {user}! Always open for conversation.",
    "Hey {user}! Good to have you with us.",
    "Glad you're here {user}! Let's make it a good experience.",
    "Welcome {user}! You're always welcome to join the flow.",
    "স্বাগতম {user}! সার্ভারটা explore করে দেখো।",
    "Welcome {user}! Feel free to settle in.",
    "Nice to have you {user} — hope you enjoy your time."
];

// ------------------------
// HANDLE SLASH COMMANDS
// ------------------------
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guildId, member, user } = interaction;

    // ------------------------
    // NICKNAME SYSTEM
    // ------------------------
    if (commandName === 'nickname') {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            if (!member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', flags: MessageFlags.Ephemeral });

            const channel = interaction.options.getChannel('channel');
            const mode = interaction.options.getString('mode').toLowerCase();

            if (!['auto', 'approval'].includes(mode))
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Mode must be auto or approval', flags: MessageFlags.Ephemeral });

            data.channelId = channel.id;
            data.mode = mode;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ content: `<:1_yes_correct:1439893200981721140> Nickname system setup complete! Channel: ${channel}, Mode: **${mode}**`, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'reset') {
            try {
                await member.setNickname(null);
                return interaction.reply({ content: '<:1_yes_correct:1439893200981721140> Your nickname has been reset.', flags: MessageFlags.Ephemeral });
            } catch {
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Could not reset your nickname.', flags: MessageFlags.Ephemeral });
            }
        }
    }

    if (commandName === 'nicknamefilter') {
        const action = interaction.options.getString('action');
        const word = interaction.options.getString('word')?.toLowerCase();

        if (action === 'add') {
            if (!word)
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Please provide a word to ban.'), flags: MessageFlags.Ephemeral });

            if (data.nicknameFilter.includes(word))
                return interaction.reply({ ...createComponentV2(`## Error\n<:2_no_wrong:1439893245130838047> Word "${word}" is already banned.`), flags: MessageFlags.Ephemeral });

            data.nicknameFilter.push(word);
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ ...createComponentV2(`## Success\n<:1_yes_correct:1439893200981721140> Word "${word}" has been added to the ban list.`), flags: MessageFlags.Ephemeral });
        }

        if (action === 'remove') {
            if (!word)
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Please provide a word to unban.'), flags: MessageFlags.Ephemeral });

            const index = data.nicknameFilter.indexOf(word);
            if (index === -1)
                return interaction.reply({ ...createComponentV2(`## Error\n<:2_no_wrong:1439893245130838047> Word "${word}" is not in the ban list.`), flags: MessageFlags.Ephemeral });

            data.nicknameFilter.splice(index, 1);
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ ...createComponentV2(`## Success\n<:1_yes_correct:1439893200981721140> Word "${word}" has been removed from the ban list.`), flags: MessageFlags.Ephemeral });
        }

        if (action === 'list') {
            if (data.nicknameFilter.length === 0)
                return interaction.reply({ ...createComponentV2('## Banned Words\n<:mg_question:1439893408041930894> No banned words configured.'), flags: MessageFlags.Ephemeral });

            const list = data.nicknameFilter.map(w => '• ' + w).join('\n');
            return interaction.reply({ ...createComponentV2('## Banned Words\n' + list), flags: MessageFlags.Ephemeral });
        }
    }

    // ------------------------
    // PREFIX / AFK / AVATAR SLASH COMMANDS
    // ------------------------
    if (commandName === 'setprefix') {
        const newPrefix = interaction.options.getString('prefix');
        data.prefixes[guildId] = newPrefix;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ ...createComponentV2(`## Prefix Updated\n<:1_yes_correct:1439893200981721140> New prefix: \`${newPrefix}\``), flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'prefix') {
        const prefix = getPrefix(guildId);
        return interaction.reply({ ...createComponentV2(`## Current Prefix\n<:mg_question:1439893408041930894> \`${prefix}\``), flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'ping') {
        const wsLatency = client.ws.ping;
        const responseTime = Date.now() - interaction.createdTimestamp;
        const uptime = formatUptime(startTime);
        
        const content = `## Bot Status\n📡 **Pong!**\n\n**WebSocket:** ${wsLatency}ms\n**Hosting Delay:** ${wsLatency}ms\n**Response:** ${responseTime}ms\n**Uptime:** ${uptime}`;
        return interaction.reply({ ...createComponentV2(content), flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'afk') {
        const reason = interaction.options.getString('note') || 'I am currently AFK.';
        afkUsers[user.id] = { reason, timestamp: Date.now() };
        data.afk[user.id] = afkUsers[user.id];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        const replyMsg = await interaction.reply({ content: `<:mg_alert:1439893442065862698> AFK set: ${reason}`, fetchReply: true, flags: MessageFlags.Ephemeral });

        // Delete bot reply after 30s
        setTimeout(() => replyMsg.delete().catch(() => {}), 30000);
    }

    if (commandName === 'afklist') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> You do not have permission.'), flags: MessageFlags.Ephemeral });
        }

        if (Object.keys(afkUsers).length === 0) {
            return interaction.reply({ ...createComponentV2('## AFK List\n<:mg_question:1439893408041930894> No one is currently AFK.'), flags: MessageFlags.Ephemeral });
        }

        let afkList = '## Currently AFK\n\n';
        for (const userId in afkUsers) {
            const afkData = afkUsers[userId];
            const duration = calculateDuration(afkData.timestamp);
            
            try {
                const member = await interaction.guild.members.fetch(userId);
                const displayName = member.nickname || member.displayName;
                afkList += '**' + displayName + '** — ' + afkData.reason + ' (' + duration + ')\n';
            } catch (e) {
                try {
                    const user = await client.users.fetch(userId);
                    afkList += '**' + user.displayName + '** — ' + afkData.reason + ' (' + duration + ')\n';
                } catch (e2) {
                    afkList += '**Unknown User** — ' + afkData.reason + ' (' + duration + ')\n';
                }
            }
        }

        return interaction.reply({ ...createComponentV2(afkList), flags: MessageFlags.Ephemeral });
    }

    if (commandName === 'avatar') {
        const target = interaction.options.getUser('user') || user;
        const showServerOnly = interaction.options.getBoolean('server');
        let guildAvatar = null;
        let displayName = target.displayName;
        
        try {
            const member = await interaction.guild.members.fetch(target.id);
            // Get server nickname if available, otherwise use display name
            displayName = member.nickname || member.displayName || target.displayName;
            // Check for server-specific avatar - use member's avatar method
            if (member.avatar) {
                guildAvatar = member.avatarURL({ dynamic: true, size: 1024 });
            }
        } catch (e) {
            // User not in guild or error fetching member
            displayName = target.displayName;
        }
        
        // Get default avatar from user object
        const defaultAvatar = target.displayAvatarURL({ dynamic: true, size: 1024 });
        
        let response;
        if (showServerOnly === true) {
            // Show server avatar only
            if (guildAvatar) {
                response = createAvatarComponent(displayName, defaultAvatar, guildAvatar, 'server_only');
            } else {
                response = { content: '<:2_no_wrong:1439893245130838047> This user has no server-specific avatar set.', flags: MessageFlags.Ephemeral };
            }
        } else if (showServerOnly === false) {
            // Show default avatar only
            response = createAvatarComponent(displayName, defaultAvatar, null, 'default_only');
        } else {
            // Show both (server if available, default always)
            response = createAvatarComponent(displayName, defaultAvatar, guildAvatar, 'both');
        }
        
        return interaction.reply(response);
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
        return interaction.reply({ ...createComponentV2(`## ${pick}\n${question}`) });
    }

    // ------------------------
    // FUN COMMAND: Coin Flip
    // ------------------------
    if (commandName === 'coinflip') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return interaction.reply({ ...createComponentV2(`## Coin Flip\n<:Tails:1441153955412312134> **${result}**!`) });
    }

    // ------------------------
    // MODERATION: Auto-response
    // ------------------------
    if (commandName === 'autoresponse') {
        const action = interaction.options.getString('action');
        const trigger = interaction.options.getString('trigger');
        const type = interaction.options.getString('type');
        const response = interaction.options.getString('response');

        if (action === 'add') {
            if (!trigger)
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Trigger is required.'), flags: MessageFlags.Ephemeral });
            if (!type)
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Type is required.'), flags: MessageFlags.Ephemeral });

            data.autoresponses[guildId] = data.autoresponses[guildId] || [];
            data.autoresponses[guildId].push({ trigger, type, response: response || '' });
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ ...createComponentV2(`## Auto-Response Added\n<:1_yes_correct:1439893200981721140> Trigger: **${trigger}** (${type})`), flags: MessageFlags.Ephemeral });
        }

        if (action === 'remove') {
            if (!trigger)
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Trigger is required.'), flags: MessageFlags.Ephemeral });

            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> No auto-responses configured.'), flags: MessageFlags.Ephemeral });
            }

            const initialLength = data.autoresponses[guildId].length;
            data.autoresponses[guildId] = data.autoresponses[guildId].filter(ar => ar.trigger !== trigger);

            if (data.autoresponses[guildId].length === initialLength) {
                return interaction.reply({ ...createComponentV2(`## Error\n<:2_no_wrong:1439893245130838047> No auto-response for **${trigger}**`), flags: MessageFlags.Ephemeral });
            }

            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ ...createComponentV2(`## Auto-Response Removed\n<:1_yes_correct:1439893200981721140> Trigger: **${trigger}**`), flags: MessageFlags.Ephemeral });
        }

        if (action === 'list') {
            if (!data.autoresponses[guildId] || data.autoresponses[guildId].length === 0) {
                return interaction.reply({ ...createComponentV2('## Auto-Responses\n<:mg_question:1439893408041930894> No auto-responses configured.'), flags: MessageFlags.Ephemeral });
            }

            let list = '## Auto-Responses\n\n';
            data.autoresponses[guildId].forEach((ar, index) => {
                list += `${index + 1}. **${ar.trigger}** (${ar.type}) → ${ar.response || '(no response)'}\n`;
            });

            return interaction.reply({ ...createComponentV2(list), flags: MessageFlags.Ephemeral });
        }
    }

    // ------------------------
    // BOT MANAGEMENT (Status)
    // ------------------------
    if (commandName === 'status') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You need ManageGuild permission to use this command.', flags: MessageFlags.Ephemeral });
        }

        const action = interaction.options.getString('action');

        if (action === 'set') {
            const activityText = interaction.options.getString('activity_text');
            const activityType = interaction.options.getString('activity_type');
            const streamUrl = interaction.options.getString('stream_url');
            const emoji = interaction.options.getString('emoji');
            const onlineStatus = interaction.options.getString('online_status');

            if (!activityType || !activityText) {
                return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Provide both type and text.'), flags: MessageFlags.Ephemeral });
            }

            if (activityType === 'Streaming' && streamUrl) {
                const validStreamUrl = streamUrl.match(/^https?:\/\/(www\.)?(twitch\.tv|youtube\.com|youtu\.be)\/.+$/i);
                if (!validStreamUrl) {
                    return interaction.reply({ ...createComponentV2('## Error\n<:2_no_wrong:1439893245130838047> Invalid URL. Use Twitch/YouTube.'), flags: MessageFlags.Ephemeral });
                }
            }

            data.status = {
                text: activityText,
                type: activityType,
                emoji: emoji || null,
                streamUrl: streamUrl || null,
                presence: onlineStatus || 'online',
                lastUpdatedBy: user.id,
                lastUpdatedAt: new Date().toISOString()
            };
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            applyBotStatus();

            const displayText = emoji ? `${emoji} ${activityText}` : activityText;
            return interaction.reply({ ...createComponentV2(`## Status Updated\n<:1_yes_correct:1439893200981721140> **${activityType}** ${displayText}`), flags: MessageFlags.Ephemeral });
        }

        if (action === 'reset') {
            data.status = {};
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            applyBotStatus();

            return interaction.reply({ ...createComponentV2('## Status Reset\n<:1_yes_correct:1439893200981721140> Bot is now online with no activity.'), flags: MessageFlags.Ephemeral });
        }

        if (action === 'view') {
            const statusEmbed = new EmbedBuilder()
                .setTitle('🤖 Current Bot Status')
                .setColor(0x37373D)
                .setTimestamp();

            if (!data.status.text || !data.status.type) {
                statusEmbed.setDescription('✅ Bot is online with no custom activity set.');
            } else {
                const displayName = data.status.emoji ? `${data.status.emoji} ${data.status.text}` : data.status.text;
                statusEmbed.addFields({ name: 'Activity', value: `**${data.status.type}** ${displayName}`, inline: false });
                
                if (data.status.type === 'Streaming' && data.status.streamUrl) {
                    statusEmbed.addFields({ name: 'Stream URL', value: data.status.streamUrl, inline: false });
                }
                
                statusEmbed.addFields({ name: 'Visibility', value: data.status.presence || 'online', inline: true });
                
                if (data.status.lastUpdatedBy) {
                    statusEmbed.addFields({ name: 'Updated By', value: `<@${data.status.lastUpdatedBy}>`, inline: true });
                }
                
                if (data.status.lastUpdatedAt) {
                    const date = new Date(data.status.lastUpdatedAt);
                    statusEmbed.addFields({ name: 'Updated', value: `<t:${Math.floor(date.getTime() / 1000)}:R>`, inline: true });
                }
            }

            return interaction.reply({ embeds: [statusEmbed], flags: MessageFlags.Ephemeral });
        }
    }

    // ------------------------
    // WELCOME SYSTEM
    // ------------------------
    if (commandName === 'welcome') {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'enable') {
            const channel = interaction.options.getChannel('setchannel');
            const delayStr = interaction.options.getString('delaytime');
            const showList = interaction.options.getBoolean('list');

            data.welcome[guildId] = data.welcome[guildId] || {};
            data.welcome[guildId].channelId = channel.id;
            data.welcome[guildId].delay = parseDelayString(delayStr);
            data.welcome[guildId].enabled = true;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            let reply = `<:1_yes_correct:1439893200981721140> Welcome messages **enabled**!\nChannel: ${channel}\nDelay: **${delayStr || '120s'}**`;

            if (showList) {
                reply += '\n\n**Welcome Message Samples:**\n';
                reply += welcomeMessages.slice(0, 10).map((msg, i) => `${i + 1}. ${msg}`).join('\n');
                reply += `\n...\n(${welcomeMessages.length} total messages available)`;
            }

            return interaction.reply({ content: reply, flags: MessageFlags.Ephemeral });
        }

        if (subcommand === 'disable') {
            data.welcome[guildId] = data.welcome[guildId] || {};
            data.welcome[guildId].enabled = false;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ content: '<:1_yes_correct:1439893200981721140> Welcome messages **disabled**!', flags: MessageFlags.Ephemeral });
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

    // ----- Check mentions for AFK -----
    msg.mentions.users.forEach(async user => {
        if (afkUsers[user.id]) {
            const afkData = afkUsers[user.id];
            const timestampSeconds = Math.floor(afkData.timestamp / 1000);
            
            try {
                const member = await msg.guild.members.fetch(user.id);
                const displayName = `**${member.nickname || member.displayName}**`;
                const replyMsg = await msg.reply(`<:mg_alert:1439893442065862698> ${displayName} is AFK for <t:${timestampSeconds}:R> — ${afkData.reason}.`);
                setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
            } catch (e) {
                const replyMsg = await msg.reply(`<:mg_alert:1439893442065862698> **${user.displayName}** is AFK for <t:${timestampSeconds}:R> — ${afkData.reason}.`);
                setTimeout(() => replyMsg.delete().catch(() => {}), 60000);
            }
        }
    });

    // ----- Reset AFK on any message -----
    if (afkUsers[msg.author.id]) {
        const afkData = afkUsers[msg.author.id];
        const duration = calculateDuration(afkData.timestamp);
        delete afkUsers[msg.author.id];
        delete data.afk[msg.author.id];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        await msg.reply(`<:1_yes_correct:1439893200981721140> Welcome back ${msg.author}! You were AFK for ${duration}.`);
    }

    // ----- Handle prefix commands -----
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        // AFK
        if (cmd === 'afk') {
            const reason = args.join(' ') || 'I am currently AFK.';
            afkUsers[msg.author.id] = { reason, timestamp: Date.now() };
            data.afk[msg.author.id] = afkUsers[msg.author.id];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            const replyMsg = await msg.reply(`<:mg_alert:1439893442065862698> AFK set: ${reason}`);

            // Delete user message after 5s
            setTimeout(() => msg.delete().catch(() => {}), 5000);
            // Delete bot reply after 30s
            setTimeout(() => replyMsg.delete().catch(() => {}), 30000);
        }

        // Avatar
        if (cmd === 'av') {
            let targetUser = msg.author;
            let showDefaultOnly = false;
            let displayName = msg.author.displayName;
            
            // Check if user mentioned
            if (msg.mentions.users.size > 0) {
                targetUser = msg.mentions.users.first();
            }
            
            // Check for 'df' parameter to show default avatar only
            // If user mentioned, 'df' would be at index 1, otherwise at index 0
            const paramIndex = msg.mentions.users.size > 0 ? 1 : 0;
            if (args.length > paramIndex && args[paramIndex].toLowerCase() === 'df') {
                showDefaultOnly = true;
            }
            
            let guildAvatar = null;
            try {
                const member = await msg.guild.members.fetch(targetUser.id);
                // Get server nickname if available, otherwise use display name
                displayName = member.nickname || member.displayName || targetUser.displayName;
                // Get server-specific avatar if exists
                if (member.avatar) {
                    guildAvatar = member.avatarURL({ dynamic: true, size: 1024 });
                }
            } catch (e) {
                // User not in guild or fetch failed
                displayName = targetUser.displayName;
            }
            
            // Get default avatar from user
            const defaultAvatar = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
            
            let mode = 'server_only';
            if (showDefaultOnly) {
                mode = 'default_only';
            }
            
            const response = createAvatarComponent(displayName, defaultAvatar, guildAvatar, mode);
            return msg.reply(response);
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
            return msg.reply(createComponentV2(`## ${pick}\n${question}`));
        }

        // Fun command: Coin Flip
        if (cmd === 'cf') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            return msg.reply(createComponentV2(`## Coin Flip\n<:Tails:1441153955412312134> **${result}**!`));
        }

        // Ping command
        if (cmd === 'bp') {
            const wsLatency = client.ws.ping;
            const responseTime = Date.now() - msg.createdTimestamp;
            const uptime = formatUptime(startTime);
            
            const content = `## Bot Status\n📡 **Pong!**\n\n**WebSocket:** ${wsLatency}ms\n**Hosting Delay:** ${wsLatency}ms\n**Response:** ${responseTime}ms\n**Uptime:** ${uptime}`;
            return msg.reply(createComponentV2(content));
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
        return msg.reply('<:1_yes_correct:1439893200981721140> Your nickname has been reset.');
    }

    if (data.mode === 'auto') {
        const bannedWord = containsBannedWord(nickname);
        if (bannedWord)
            return msg.reply(`<:wrong:1440296241090265088> Cannot use "${bannedWord}" in your nickname.`);

        try {
            const before = msg.member.nickname || msg.member.displayName;
            await msg.member.setNickname(nickname);
            msg.reply(`<:1_yes_correct:1439893200981721140> Your nickname has been changed from **${before}** to **${nickname}**`);
        } catch {
            msg.reply('<:warning:1441531830607151195> Failed to change nickname.');
        }
    } else if (data.mode === 'approval') {
        const bannedWord = containsBannedWord(nickname);
        if (bannedWord)
            return msg.reply(`<:wrong:1440296241090265088> Cannot use "${bannedWord}" in your nickname.`);

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
                    await i.update({ content: '<:warning:1441531830607151195> Failed to change nickname.', components: [] });
                }
            } else if (i.customId === `reject_${msg.author.id}`) {
                await i.update({ content: `<:2_no_wrong:1439893245130838047> ${msg.author} nickname request rejected.`, components: [] });
            }
            collector.stop();
        });
    }
});

// ------------------------
// GUILD MEMBER ADD (WELCOME SYSTEM)
// ------------------------
client.on(Events.GuildMemberAdd, async member => {
    const guildId = member.guild.id;
    
    const welcomeConfig = data.welcome[guildId];
    if (!welcomeConfig || !welcomeConfig.enabled || !welcomeConfig.channelId) {
        return;
    }

    const delay = (typeof welcomeConfig.delay === 'number') ? welcomeConfig.delay : 0;

    setTimeout(async () => {
        try {
            const channel = await member.guild.channels.fetch(welcomeConfig.channelId);
            if (!channel) return;

            const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            const welcomeText = randomMessage.replace('{user}', `<@${member.id}>`);

            await channel.send(welcomeText);
        } catch (error) {
            console.error('Welcome message error:', error);
        }
    }, delay * 1000);
});

// ------------------------
client.login(TOKEN);