import { Client, GatewayIntentBits, Partials, Collection, ButtonStyle, ActionRowBuilder, ButtonBuilder, Events, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActivityType, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';
import { Player } from 'discord-player';
import fs from 'fs';
import { createCanvas } from 'canvas';
import { allCommands } from './src/commands/index.js';
import { createMusicControlPanel } from './src/commands/music.js';
import versionData from './versionData.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const BOT_NAME = packageJson.name;
const BOT_VERSION = versionData.version;

const dataFile = './data.json';
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// Helper: Try to parse response as JSON and send as Component V2
function tryParseAndSendComponent(msg, responseText) {
    try {
        const jsonData = JSON.parse(responseText);
        
        // Check if it's a full Component V2 structure with components array
        if (jsonData.components && Array.isArray(jsonData.components)) {
            // Send the full Component V2 structure as-is
            msg.reply({ content: ' ', components: jsonData.components, flags: MessageFlags.IsComponentsV2 }).catch(() => {});
            return true;
        }
        
        // Otherwise, build a simple component from the JSON
        const container = new ContainerBuilder();
        
        // If it has "text" field, add as TextDisplay
        if (jsonData.text) {
            const textDisplay = new TextDisplayBuilder().setContent(jsonData.text);
            container.addTextDisplayComponents(textDisplay);
        }
        
        // If it has "separator" field, add as Separator
        if (jsonData.separator === true) {
            container.addComponent({ type: 14, spacing: 1 });
        }
        
        // If it has multiple text blocks, add all of them
        if (Array.isArray(jsonData.blocks)) {
            for (const block of jsonData.blocks) {
                if (block.text) {
                    const textDisplay = new TextDisplayBuilder().setContent(block.text);
                    container.addTextDisplayComponents(textDisplay);
                }
                if (block.separator === true) {
                    container.addComponent({ type: 14, spacing: 1 });
                }
            }
        }
        
        // Only send if we actually added something to the container
        if (jsonData.text || jsonData.separator === true || jsonData.blocks) {
            msg.reply({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
            return true;
        }
        
        return false;
    } catch (e) {
        // Not valid JSON or parsing failed, return false to send as plain text
        return false;
    }
}

// ------------------------
// Initialize client
// ------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client, {
    leaveOnEmpty: true,
    leaveOnEnd: false,
    leaveOnStop: true
});

client.commands = new Collection();
const startTime = Date.now();

// Function to initialize topic messages on bot startup
async function initializeTopics() {
    for (const [topicName, topicData] of Object.entries(data.topics || {})) {
        if (topicData && topicData.channelId && topicData.messageId && !topicData.content) {
            try {
                let channel = await client.channels.fetch(topicData.channelId);
                
                // If it's a thread, fetch the thread
                if (topicData.threadId && channel.threads) {
                    channel = await channel.threads.fetch(topicData.threadId);
                }
                
                if (channel && channel.isTextBased()) {
                    const message = await channel.messages.fetch(topicData.messageId);
                    
                    // Try to get content - handle both plain text and Component V2 messages
                    let content = message.content || '';
                    
                    // If content is empty, try to extract from embeds (common with rich messages)
                    if (!content && message.embeds && message.embeds.length > 0) {
                        const embed = message.embeds[0];
                        const parts = [];
                        if (embed.title) parts.push(embed.title);
                        if (embed.description) parts.push(embed.description);
                        content = parts.join('\n\n');
                    }
                    
                    // Store the content (even if empty for Component V2, the link will direct them to the full message)
                    data.topics[topicName].content = content || '[Component V2 Message - See full message for formatted content]';
                    data.topics[topicName].link = `https://discord.com/channels/${message.guildId}/${topicData.channelId}/${topicData.messageId}`;
                }
            } catch (err) {
                console.error(`Failed to fetch topic "${topicName}":`, err.message);
            }
        }
    }
    // Save updated data with cached content
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// Initialize topics when bot is ready (moved to Events.ClientReady handler below)

// Auto-reconnection on disconnect
client.on('disconnect', () => {
    console.log('⚠️ Bot disconnected, attempting to reconnect...');
});

// Handle connection errors
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

// Handle warnings
client.on('warn', (info) => {
    console.warn('⚠️ Discord warning:', info);
});

// ------------------------
// COMMAND REGISTRATION
// ------------------------
const commands = allCommands.map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

// ------------------------
// HELPER: Apply saved status
// ------------------------
function applyBotStatus() {
    const statusData = data.status || {};
    const presenceData = {
        status: statusData.presence || 'online',
        activities: []
    };
    
    if (statusData.type && statusData.text) {
        const activityTypeMap = {
            'Playing': ActivityType.Playing,
            'Listening': ActivityType.Listening,
            'Watching': ActivityType.Watching,
            'Competing': ActivityType.Competing,
            'Streaming': ActivityType.Streaming
        };

        let name = statusData.text;
        if (statusData.emoji) {
            name = `${statusData.emoji} ${name}`;
        }

        const activity = {
            name: name,
            type: activityTypeMap[statusData.type]
        };

        if (statusData.type === 'Streaming' && statusData.streamUrl) {
            activity.url = statusData.streamUrl;
        }

        presenceData.activities = [activity];
    }
    
    client.user.setPresence(presenceData);
}

// ------------------------
// BOT READY
// ------------------------
client.once(Events.ClientReady, async () => {
    console.log(`${client.user.tag} is online!`);
    
    // Initialize topics
    await initializeTopics();
    
    // Apply custom status from saved data
    applyBotStatus();
    
    // Load AFK data from storage
    if (data.afk) {
        afkUsers = { ...data.afk };
    }
    
    // Update bot role name in all guilds with version number
    const botRoleName = `${BOT_NAME}│v${BOT_VERSION}`;
    try {
        for (const guild of client.guilds.cache.values()) {
            try {
                const botRole = guild.roles.cache.find(role => role.name === `${BOT_NAME}` || role.name.includes(BOT_NAME));
                if (botRole && botRole.managed) {
                    // Only update if role name is different
                    if (botRole.name !== botRoleName) {
                        await botRole.setName(botRoleName).catch(() => {});
                        console.log(`✅ Updated bot role in ${guild.name} to: ${botRoleName}`);
                    }
                }
            } catch (guildError) {
                // Skip this guild if error occurs
            }
        }
    } catch (error) {
        console.error('Error updating bot role names:', error);
    }
});

// ------------------------
// DATA / PREFIX / AFK / AUTORESPONSE
// ------------------------
const defaultPrefix = '!';
let afkUsers = {}; // { userId: { reason: string, timestamp: number } }
const commandCooldowns = new Map(); // { userId: { commandName: timestamp } }
data.prefixes = data.prefixes || {}; // { guildId: prefix }
data.autoresponses = data.autoresponses || {}; // { guildId: [{trigger, type, response}] }
data.status = data.status || {}; // { type, text, emoji, streamUrl, presence, lastUpdatedBy, lastUpdatedAt }
data.welcome = data.welcome || {}; // { guildId: { channelId, delay, enabled } }
data.afk = data.afk || {}; // { userId: { reason: string, timestamp: number } }
data.nickname.filter = data.nickname.filter || []; // [ word, word, ... ]
data.autoresponse = data.autoresponse || {}; // { guildId: [{ id, title, content, created }, ...] }

// HELPER: Check cooldown and warn user
function checkAndWarnCooldown(userId, commandName, cooldownMs = 5000) {
    const now = Date.now();
    if (!commandCooldowns.has(userId)) {
        commandCooldowns.set(userId, {});
    }
    
    const userCooldowns = commandCooldowns.get(userId);
    const lastUsed = userCooldowns[commandName];
    
    if (lastUsed && (now - lastUsed) < cooldownMs) {
        const remainingMs = cooldownMs - (now - lastUsed);
        const remainingSecs = Math.ceil(remainingMs / 1000);
        return remainingSecs;
    }
    
    userCooldowns[commandName] = now;
    return 0;
}

// HELPER: Create Component V2 format for avatar display
// mode: 'both' (default), 'server_only', 'default_only'
function createAvatarComponent(username, defaultAvatarUrl, serverAvatarUrl = null, mode = 'both') {
    const items = [];
    let title = '';
    
    if (mode === 'server_only') {
        // If no server avatar, fall back to default
        const avatarUrl = serverAvatarUrl || defaultAvatarUrl;
        const description = serverAvatarUrl ? `${username}'s Server Avatar` : `${username}'s Discord Avatar`;
        items.push(
            new MediaGalleryItemBuilder()
                .setURL(avatarUrl)
                .setDescription(description)
        );
        title = serverAvatarUrl ? `${username}'s Server Avatar` : `${username}'s Discord Avatar`;
    } else if (mode === 'default_only') {
        items.push(
            new MediaGalleryItemBuilder()
                .setURL(defaultAvatarUrl)
                .setDescription(`${username}'s Discord Avatar`)
        );
        title = `${username}'s Discord Avatar`;
    } else {
        // Show both (or just default if no server avatar)
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

// HELPER: Create beautiful embed response for moderator commands
function createModeratorEmbed(title, description, color = 0x2F3136) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);
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
    return data.prefix[guildId] || defaultPrefix;
}

// HELPER: Check if nickname contains banned words
function containsBannedWord(nickname) {
    const lowerNickname = nickname.toLowerCase();
    for (const word of data.nickname.filter) {
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

// Initialize status data
if (!data.status) data.status = { presence: 'online' };

// ------------------------
// HANDLE SLASH COMMANDS & BUTTONS
// ------------------------
client.on(Events.InteractionCreate, async interaction => {
    const { guildId } = interaction;

    try {
        // ===== HANDLE SELECT MENUS (DROPDOWNS) =====
        if (interaction.isStringSelectMenu()) {
            const customId = interaction.customId;

            // Config: Online Status dropdown
            if (customId === 'config_online_status') {
                const newStatus = interaction.values[0];
                data.status = data.status || { presence: 'online' };
                data.status.presence = newStatus;
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                applyBotStatus();
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Online Status Updated' }, { type: 14 }, { type: 10, content: `Bot visibility set to: **${newStatus === 'dnd' ? 'Do Not Disturb' : newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}**` }] }], flags: 32768 | MessageFlags.Ephemeral });
            }

            // Config: Activity Type dropdown
            if (customId === 'config_activity_type') {
                const newType = interaction.values[0];
                data.status = data.status || { presence: 'online' };
                data.status.type = newType;
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                applyBotStatus();
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Activity Type Updated' }, { type: 14 }, { type: 10, content: `Activity type set to: **${newType}**` }] }], flags: 32768 | MessageFlags.Ephemeral });
            }
        }

        // ===== HANDLE BUTTONS =====
        if (interaction.isButton()) {
            const customId = interaction.customId;

            // Config: Set Prefix button
            if (customId === 'config_set_prefix') {
            const modal = {
                custom_id: 'modal_set_prefix',
                title: 'Set Server Prefix',
                components: [{
                    type: 1,
                    components: [{
                        type: 4,
                        custom_id: 'prefix_input',
                        label: 'Enter new prefix (1-3 characters)',
                        style: 1,
                        placeholder: '!',
                        max_length: 3,
                        min_length: 1,
                        required: true
                    }]
                }]
            };
            return interaction.showModal(modal);
        }

        // Config: Status Set button
        if (customId === 'config_status_set') {
            const modal = {
                custom_id: 'modal_status_set',
                title: 'Configure Bot Status',
                components: [
                    {
                        type: 1,
                        components: [{
                            type: 4,
                            custom_id: 'status_activity_text',
                            label: 'Activity Text (optional)',
                            style: 1,
                            placeholder: 'e.g., Minecraft, Netflix',
                            max_length: 128,
                            required: false
                        }]
                    },
                    {
                        type: 1,
                        components: [{
                            type: 4,
                            custom_id: 'status_stream_url',
                            label: 'Stream URL (optional)',
                            style: 1,
                            placeholder: 'https://twitch.tv/... or https://youtube.com/...',
                            max_length: 255,
                            required: false
                        }]
                    },
                    {
                        type: 1,
                        components: [{
                            type: 4,
                            custom_id: 'status_emoji',
                            label: 'Emoji (optional)',
                            style: 1,
                            placeholder: '😎',
                            max_length: 10,
                            required: false
                        }]
                    }
                ]
            };
            return interaction.showModal(modal);
        }

            // Config: Status Reset button
        if (customId === 'config_status_reset') {
            data.status = { presence: 'online' };
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            applyBotStatus();

            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Status Cleared' }, { type: 14 }, { type: 10, content: 'Bot status reset to online.' }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        // Config: Page Navigation buttons
        if (customId === 'config_prev' || customId === 'config_next') {
            // Extract current page from the message content
            const messageContent = interaction.message.content;
            const components = interaction.message.components[0].components;
            let currentPage = 1;
            
            // Look for page indicator in all components
            for (const comp of components) {
                if (comp.content && comp.content.includes('Page')) {
                    const match = comp.content.match(/Page (\d+)\/3/);
                    if (match) {
                        currentPage = parseInt(match[1]);
                        break;
                    }
                }
            }
            
            let nextPage = currentPage;
            if (customId === 'config_next' && currentPage < 3) nextPage = currentPage + 1;
            if (customId === 'config_prev' && currentPage > 1) nextPage = currentPage - 1;
            
            const pageComponents = buildConfigPage(nextPage, guildId);
            
            const configPanel = {
                content: ' ',
                components: [{
                    type: 17,
                    components: pageComponents
                }],
                flags: 32768 | MessageFlags.Ephemeral
            };
            
            return interaction.update(configPanel);
        }

        // Config: Header Attachment button
        if (customId === 'config_header_attach') {
            await interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '### 📎 Header Attachment' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: '**Upload a header image for your server profile**\n\nRecommended size: **1920x480px**\n\n⏳ Waiting for file... (60 seconds)' }
                    ]
                }],
                flags: 32768 | MessageFlags.Ephemeral
            });

            // Create a message collector for file uploads
            const filter = msg => msg.author.id === interaction.user.id && msg.attachments.size > 0;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async msg => {
                const attachment = msg.attachments.first();
                if (attachment) {
                    try {
                        // Fetch and set bot avatar for this server
                        const response = await fetch(attachment.url);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        await client.user.setAvatar(buffer);

                        // Save server-specific header to data.json
                        data.config = data.config || {};
                        data.config[guildId] = data.config[guildId] || {};
                        data.config[guildId].headerAttachment = attachment.url;
                        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

                        await msg.reply({
                            content: ' ',
                            components: [{
                                type: 17,
                                components: [
                                    { type: 10, content: '## <:Correct:1440296238305116223> Bot Avatar Updated (This Server)' },
                                    { type: 14, spacing: 1 },
                                    { type: 10, content: `✅ Bot avatar changed for this server!\n\n[View Image](${attachment.url})` }
                                ]
                            }],
                            flags: 32768
                        });
                    } catch (error) {
                        await msg.reply({
                            content: ' ',
                            components: [{
                                type: 17,
                                components: [
                                    { type: 10, content: '## <:Error:1440296241090265088> Failed' },
                                    { type: 14, spacing: 1 },
                                    { type: 10, content: `❌ Error updating avatar: ${error.message}` }
                                ]
                            }],
                            flags: 32768
                        });
                    }
                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.followUp({
                        content: '⏰ Upload timeout - no file received.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            });
        }

        // Config: BG Attachment button
        if (customId === 'config_banner_attach') {
            await interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '### 🎨 BG Attachment' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: '**Upload a background image for your server**\n\nRecommended size: **1200x300px**\n\n⏳ Waiting for file... (60 seconds)' }
                    ]
                }],
                flags: 32768 | MessageFlags.Ephemeral
            });

            // Create a message collector for file uploads
            const filter = msg => msg.author.id === interaction.user.id && msg.attachments.size > 0;
            const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async msg => {
                const attachment = msg.attachments.first();
                if (attachment) {
                    try {
                        // Fetch and set server banner
                        const response = await fetch(attachment.url);
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        await interaction.guild.setBanner(buffer);

                        // Save server-specific background to data.json
                        data.config = data.config || {};
                        data.config[guildId] = data.config[guildId] || {};
                        data.config[guildId].bgAttachment = attachment.url;
                        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

                        await msg.reply({
                            content: ' ',
                            components: [{
                                type: 17,
                                components: [
                                    { type: 10, content: '## <:Correct:1440296238305116223> Server Banner Updated' },
                                    { type: 14, spacing: 1 },
                                    { type: 10, content: `✅ Server banner changed!\n\n[View Image](${attachment.url})` }
                                ]
                            }],
                            flags: 32768
                        });
                    } catch (error) {
                        await msg.reply({
                            content: ' ',
                            components: [{
                                type: 17,
                                components: [
                                    { type: 10, content: '## <:Error:1440296241090265088> Failed' },
                                    { type: 14, spacing: 1 },
                                    { type: 10, content: `❌ Error updating banner: ${error.message}` }
                                ]
                            }],
                            flags: 32768
                        });
                    }
                }
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.followUp({
                        content: '⏰ Upload timeout - no file received.',
                        flags: MessageFlags.Ephemeral
                    });
                }
            });
        }
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
    }

    // ===== HANDLE MODAL SUBMISSIONS =====
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'modal_set_prefix') {
            const newPrefix = interaction.fields.getTextInputValue('prefix_input');
            data.prefix[guildId] = newPrefix;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '## <:Correct:1440296238305116223> Prefix Updated' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `New prefix: \`${newPrefix}\`` }
                    ]
                }],
                flags: 32768 | MessageFlags.Ephemeral
            });
        }

        if (interaction.customId === 'modal_status_set') {
            try {
                const activityText = interaction.fields.getTextInputValue('status_activity_text');
                const streamUrl = interaction.fields.getTextInputValue('status_stream_url');
                const emoji = interaction.fields.getTextInputValue('status_emoji') || null;

                data.status = data.status || { presence: 'online' };
                if (activityText) {
                    data.status.text = activityText;
                }
                if (streamUrl) {
                    data.status.streamUrl = streamUrl;
                }
                if (emoji) {
                    data.status.emoji = emoji;
                }
                data.status.lastUpdatedBy = interaction.user.id;
                data.status.lastUpdatedAt = new Date().toISOString();
                fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                applyBotStatus();

                let msg = 'Status info updated: ';
                if (activityText) msg += `Activity: ${activityText} `;
                if (emoji) msg += `Emoji: ${emoji} `;
                if (streamUrl) msg += `Stream: ${streamUrl}`;
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Status Updated' }, { type: 14 }, { type: 10, content: msg || 'No changes made.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            } catch (err) {
                console.error('Modal status set error:', err);
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: `Error updating status: ${err.message}` }] }], flags: 32768 | MessageFlags.Ephemeral });
            }
        }
    }

    // ===== HANDLE SLASH COMMANDS =====
    if (!interaction.isChatInputCommand()) return;

    const { commandName, member, user } = interaction;

    // NICKNAME SYSTEM - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'nickname') {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            if (!member.permissions.has(PermissionsBitField.Flags.ManageNicknames))
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> You cannot use this command.', flags: MessageFlags.Ephemeral });

            const channel = interaction.options.getChannel('channel');
            const mode = interaction.options.getString('mode').toLowerCase();

            if (!['auto', 'approval'].includes(mode))
                return interaction.reply({ content: '<:2_no_wrong:1439893245130838047> Mode must be auto or approval', flags: MessageFlags.Ephemeral });

            data.nickname.channelId = channel.id;
            data.nickname.mode = mode;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## ✅ Setup Complete' }, { type: 14, spacing: 1 }, { type: 10, content: `Channel: ${channel}\nMode: **${mode}**` }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (subcommand === 'reset') {
            try {
                await member.setNickname(null);
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## Reset' }, { type: 14, spacing: 1 }, { type: 10, content: 'Nickname reset to default.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            } catch {
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## Failed' }, { type: 14, spacing: 1 }, { type: 10, content: 'Couldn\'t reset nickname.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            }
        }
    }

    // NICKNAME FILTER - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'nicknamefilter') {
        const action = interaction.options.getString('action');
        const word = interaction.options.getString('word')?.toLowerCase();

        if (action === 'add') {
            if (!word)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14, spacing: 1 }, { type: 10, content: 'Please provide a word to ban.' }] }], flags: 32768 | MessageFlags.Ephemeral });

            if (data.nickname.filter.includes(word))
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14, spacing: 1 }, { type: 10, content: `Word "**${word}**" is already banned.` }] }], flags: 32768 | MessageFlags.Ephemeral });

            data.nickname.filter.push(word);
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Bin:1441777857205637254> Word Added' }, { type: 14, spacing: 1 }, { type: 10, content: `"**${word}**" added to ban list.` }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (action === 'remove') {
            if (!word)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14, spacing: 1 }, { type: 10, content: 'Please provide a word to unban.' }] }], flags: 32768 | MessageFlags.Ephemeral });

            const index = data.nickname.filter.indexOf(word);
            if (index === -1)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14, spacing: 1 }, { type: 10, content: `No ban found for "**${word}**".` }] }], flags: 32768 | MessageFlags.Ephemeral });

            data.nickname.filter.splice(index, 1);
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Correct:1440296238305116223> Word Removed' }, { type: 14, spacing: 1 }, { type: 10, content: `"**${word}**" removed from ban list.` }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (action === 'list') {
            if (data.nickname.filter.length === 0)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## 📋 Banned Words' }, { type: 14, spacing: 1 }, { type: 10, content: 'No words configured yet.' }] }], flags: 32768 | MessageFlags.Ephemeral });

            const list = data.nickname.filter.map((w, i) => `${i+1}. **${w}**`).join('\n');
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## 🚫 Banned Words' }, { type: 14, spacing: 1 }, { type: 10, content: list }] }], flags: 32768 | MessageFlags.Ephemeral });
        }
    }

    // SETPREFIX - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'setprefix') {
        const newPrefix = interaction.options.getString('prefix');
        data.prefix[guildId] = newPrefix;
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Prefix Updated' }, { type: 14 }, { type: 10, content: `New prefix: **${newPrefix}**` }] }], flags: 32768 | MessageFlags.Ephemeral });
    }

    // PREFIX - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'prefix') {
        const prefix = getPrefix(guildId);
        return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:mg_question:1439893408041930894> Current Prefix' }, { type: 14 }, { type: 10, content: `\`${prefix}\`` }] }], flags: 32768 | MessageFlags.Ephemeral });
    }

    // BOTINFO - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator | type 9 = Content Accessory
    if (commandName === 'botinfo') {
        const botName = client.user.username;
        const prefix = getPrefix(guildId);
        const wsLatency = client.ws.ping;
        const responseTime = Date.now() - interaction.createdTimestamp;
        const uptime = formatUptime(startTime);
        const botAvatar = client.user.displayAvatarURL({ dynamic: true, size: 1024 });
        
        const infoText = `**${packageJson.description}**\n\n**Prefix:** \`${prefix}\`\n**Ping:** ${wsLatency}ms\n**Response Time:** ${responseTime}ms\n**Uptime:** ${uptime}\n**Total Commands:** 15+`;
        
        const payload = {
            content: ' ',
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: `## ${BOT_NAME}│v${BOT_VERSION}`
                        },
                        {
                            type: 14
                        },
                        {
                            type: 9,
                            components: [
                                {
                                    type: 10,
                                    content: infoText
                                }
                            ],
                            accessory: {
                                type: 11,
                                media: {
                                    url: botAvatar
                                }
                            }
                        }
                    ]
                }
            ],
            flags: 32768 | MessageFlags.Ephemeral
        };
        
        return interaction.reply(payload);
    }

    // AFK - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'afk') {
        const reason = interaction.options.getString('note') || 'I am currently AFK.';
        const originalNickname = member.nickname || user.displayName;
        const newNickname = `AFK - ${originalNickname}`;
        
        afkUsers[user.id] = { reason, timestamp: Date.now(), originalNickname };
        data.afk[user.id] = afkUsers[user.id];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        
        try {
            await member.setNickname(newNickname);
        } catch (e) {
            console.error('Failed to set AFK nickname:', e);
        }
        
        const { resource: replyMsg } = await interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:mg_alert:1439893442065862698> AFK Set' }, { type: 14 }, { type: 10, content: reason }] }], flags: 32768 | MessageFlags.Ephemeral, withResponse: true });

        setTimeout(() => replyMsg.delete().catch(() => {}), 30000);
    }

    // AFKLIST - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'afklist') {
        if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## 🚫 Permission Denied' }, { type: 14, spacing: 1 }, { type: 10, content: 'You need ManageGuild permission.' }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (Object.keys(afkUsers).length === 0) {
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## ⏱️ AFK Status' }, { type: 14, spacing: 1 }, { type: 10, content: 'No users are currently AFK.' }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        let afkList = '';
        for (const userId in afkUsers) {
            const afkData = afkUsers[userId];
            const duration = calculateDuration(afkData.timestamp);
            
            try {
                const member = await interaction.guild.members.fetch(userId);
                const displayName = member.nickname || member.displayName;
                afkList += `**${displayName}** — ${afkData.reason} (${duration})\n`;
            } catch (e) {
                try {
                    const user = await client.users.fetch(userId);
                    afkList += `**${user.displayName}** — ${afkData.reason} (${duration})\n`;
                } catch (e2) {
                    afkList += `**Unknown User** — ${afkData.reason} (${duration})\n`;
                }
            }
        }

        return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## 🚫 Currently AFK' }, { type: 14, spacing: 1 }, { type: 10, content: afkList }] }], flags: 32768 | MessageFlags.Ephemeral });
    }

    // AVATAR - Component V2 Container (via createAvatarComponent)
    // type 17 = Container | type 10 = TextDisplay | type 12 = MediaGallery | type 14 = Separator
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
                response = { content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:2_no_wrong:1439893245130838047> No Server Avatar' }, { type: 14 }, { type: 10, content: 'This user has no server-specific avatar set.' }] }], flags: 32768 | MessageFlags.Ephemeral };
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

    // PLAY - Music command with discord-player
    if (commandName === 'play') {
        if (!member.voice.channel) {
            return interaction.reply({ 
                content: ' ', 
                components: [{ 
                    type: 17, 
                    components: [
                        { type: 10, content: '## 🚫 Voice Channel Required' }, 
                        { type: 14, spacing: 1 }, 
                        { type: 10, content: 'You must be in a voice channel to use this command.' }
                    ] 
                }], 
                flags: 32768 | MessageFlags.Ephemeral 
            });
        }

        const query = interaction.options.getString('queue');
        
        try {
            let queue = player.nodes.get(interaction.guildId);
            if (!queue) {
                queue = player.nodes.create(interaction.guildId, {
                    metadata: { channel: interaction.channel }
                });
            }

            if (!queue.connection) {
                queue.connect(member.voice.channel);
            }

            const result = await player.search(query, { requestedBy: user });
            if (!result || !result.tracks.length) {
                return interaction.reply({ 
                    content: ' ', 
                    components: [{ 
                        type: 17, 
                        components: [
                            { type: 10, content: '## ❌ No Results' }, 
                            { type: 14, spacing: 1 }, 
                            { type: 10, content: `No songs found for: ${query}` }
                        ] 
                    }], 
                    flags: 32768 | MessageFlags.Ephemeral 
                });
            }

            result.tracks.forEach(track => queue.addTrack(track));
            if (!queue.isPlaying()) await queue.node.play();

            const track = result.tracks[0];
            const mockTrack = {
                name: track.title,
                url: track.url,
                artist: track.author,
                length: track.duration ? `${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}` : '0:00',
                thumbnail: track.thumbnail
            };

            const panel = createMusicControlPanel(mockTrack, user, 100, '▶️ Now Playing');
            return interaction.reply(panel);
        } catch (error) {
            console.error('[PLAY] Error:', error);
            return interaction.reply({ 
                content: ' ', 
                components: [{ 
                    type: 17, 
                    components: [
                        { type: 10, content: '## ❌ Playback Error' }, 
                        { type: 14, spacing: 1 }, 
                        { type: 10, content: error.message || 'Failed to play music' }
                    ] 
                }], 
                flags: 32768 | MessageFlags.Ephemeral 
            });
        }
    }

    // ------------------------
    // FUN COMMAND: Truth or Dare
    // ------------------------
    if (commandName === 'truthordare') {
        const cooldownRemaining = checkAndWarnCooldown(user.id, 'truthordare', 5000);
        if (cooldownRemaining > 0) {
            return interaction.reply({ content: `⏳ Slow down! You can use this command again in **${cooldownRemaining}s**.`, flags: MessageFlags.Ephemeral });
        }

        const truths = [
            "If you could master any skill instantly, what would it be?",
            "What's the most interesting conspiracy theory you've heard?",
            "If money wasn't a concern, what would you do with your time?",
            "What's the weirdest fact you know that most people don't?",
            "If you could have dinner with any historical figure, who would it be?",
            "What's a topic you could talk about for hours?",
            "What's the most underrated movie or show you've watched?",
            "If you could live in any fictional universe, which one?",
            "What's something you've changed your mind about?",
            "What's the best piece of advice you've given someone?",
            "If you could solve one world problem, what would it be?",
            "What's a skill you wish more people had?",
            "What's the most valuable thing you've learned from a game?",
            "If you could pick any career for a day, what would it be?",
            "What's the most thought-provoking question you've heard?",
            "If you could visit any time period, when would it be?",
            "What's something you find beautiful that others might not?",
            "What's the most interesting story you know?",
            "If you could have any job in the world, what would it be?",
            "What's something you're passionate about explaining to others?",
            "If AI could do one thing better, what should it be?",
            "What's the most mind-bending concept you understand?",
            "If you could create a new holiday, what would it celebrate?",
            "What's the best decision you've made?",
            "If you had to teach something to others, what would you pick?",
            "What's a genre you didn't expect to enjoy but do?",
            "If you could redesign one system in the world, what would it be?",
            "What's the most interesting conversation you've had?",
            "If you could understand any language instantly, which one?",
            "What's something you'd love to do but haven't yet?",
            "If you could write a book about anything, what's the topic?",
            "What's the most useful thing you've learned from the internet?",
            "If you had to debate any topic, which would you choose?",
            "What's something you realized was more complex than you thought?",
            "If you could attend any lecture or talk, what would it be?",
            "What's the most interesting pattern you've noticed?",
            "If you could master one video game completely, which one?",
            "What's something you think is overrated?",
            "If you could solve a mystery, what would it be?",
            "What's the most fascinating culture or tradition you know about?",
            "If you could have a superpower for one day, what would you pick?",
            "What's something you believe that most people don't?",
            "If you could ask the internet one question, what would it be?",
            "What's the most interesting piece of trivia you know?",
            "If you could design your perfect day, what would it look like?",
            "What's something you've learned that changed your perspective?",
            "If you could be an expert in something, what would it be?",
            "What's the most innovative idea you've heard?",
            "If you could unlock one secret of the universe, what would it be?",
            "What's something you think deserves more attention?",
            "If you could explore any field deeply, what would it be?",
            "What's your favorite type of story to hear or read?",
            "What invention would make the world better?",
            "What's the best plot twist you've experienced?",
            "If you could only eat food from one cuisine, which would it be?",
            "What's something everyone should know about?",
            "What type of problem do you enjoy solving?",
            "If you could have written any book, which would it be?",
            "What's the coolest technology you've learned about?",
            "What's something you think is underrated?",
            "If you could change the ending of any story, would you?",
            "What's the most random skill you have?",
            "What do you think makes a good leader?",
            "If you could live in any country, where would it be?",
            "What's your take on the most debated topic in your hobby?",
            "What's something you thought was boring but turned out cool?",
            "If you could have any view from your window, what would it be?",
            "What's the best advice you've received?",
            "What's something people often misunderstand about your interests?",
            "If you could master one language, which would it be?",
            "What's the most hilarious misunderstanding you've had?",
            "If you could design a perfect society, what would it look like?",
            "What's something you admire in other people?",
            "If you could bring back any trend, what would it be?",
            "What's the most useful lesson life taught you?",
            "If you could only listen to one artist forever, who?",
            "What's the best decision you've made recently?",
            "What's something that surprised you about yourself?",
            "If you could witness any historical moment, which one?",
            "What's your take on a heated internet debate?",
            "What do you think we'll look back on and find weird in 20 years?",
            "What's the most interesting fact about your favorite hobby?",
            "If you could have a conversation with any character, who?",
            "What's something you're proud of that nobody knows about?",
            "What do you think is the most underrated form of entertainment?",
            "If you could live in any era, when would you pick?",
            "What's the best piece of media you've ever experienced?",
            "What's something you disagree with most people about?",
            "If you could solve any puzzle, what would it be?",
            "What's your hot take on a popular franchise?",
            "What's the most thought-provoking book/game/show you know?",
            "Which anime character personality do you relate to most?",
            "What's your favorite anime genre and why?",
            "If you could live in any anime world, which would it be?",
            "What anime plot twist shocked you the most?",
            "Which anime has the best soundtrack in your opinion?",
            "What's your take on anime adaptations of manga?",
            "Which anime ending did you think was perfect?",
            "What anime taught you something meaningful?",
            "If you could have any anime superpower, what would it be?",
            "What's the most underrated anime you've watched?",
            "Which anime character would you want as a friend?",
            "What's your favorite anime moment that made you emotional?",
            "If you could recommend one anime to everyone, which?",
            "What anime trope do you love or hate?",
            "Which anime has the best character development?",
            "What's your unpopular opinion about a popular anime?",
            "If you could meet any anime creator, who?",
            "What would be your ideal job or life path in real life?",
            "What's the best advice you've gotten from someone you respect?",
            "If you could change one thing about school or work, what?",
            "What's your favorite childhood memory from real life?",
            "What hobby did you discover by accident in real life?",
            "If you could have any job without worrying about money, what?",
            "What's the most embarrassing thing that happened to you?",
            "What goal are you working toward in your life right now?",
            "What's the kindest thing someone did for you?",
            "If you could go back in time, what would you tell yourself?",
            "What person in your life has influenced you the most?",
            "What's something you're learning right now?",
            "What challenge are you currently facing?",
            "What makes you feel proud of yourself?",
            "If you could spend a day with anyone, who would it be?",
            "What's the best compliment you've ever received?",
            "What's your biggest dream for the future?",
            "What habit would you like to start or break?",
            "What skill do you want to learn?",
            "What's something you wish more people understood?",
            "What does Pohela Boishakh mean to you?",
            "What's your favorite Bengali food?",
            "Do you speak Bengali or Banglish? Tell us about it.",
            "What's your favorite Bangladeshi celebration or festival?",
            "What aspect of Bengali culture do you love most?",
            "If you could visit any place in Bangladesh, where?",
            "What's something unique about Bengali traditions?",
            "What's a Bengali phrase or word that makes you laugh?",
            "What do you love about Bengali cinema or music?",
            "If you could learn more about Bangladeshi history, what period?",
            "What traditional Bengali dish do you wish everyone tried?",
            "What's your take on Bengali art and literature?",
            "Do you celebrate any Bengali festivals? Tell us about them.",
            "What's something uniquely Bengali that you're proud of?",
            "What would you tell someone who wants to learn about Bengali culture?",
            "What's your favorite memory related to Bengali culture?",
            "If you could bring back any Bengali tradition, what would it be?",
            "What do you think makes Bengali people special?",
            "What's the most interesting Bengali story you know?",
            "How important is your cultural heritage to you?",
            "What's your take on mixing different cultures together?",
            "What would you want your friends to know about your culture?",
            "If you could blend anime culture with your real life, how?",
            "What's your favorite anime that relates to school life?",
            "Which anime character's life lesson stuck with you?",
            "What anime made you think differently about something?",
            "If you could create your own anime, what would it be about?",
            "What's the best anime opening or ending theme ever?",
            "What anime romance do you root for the most?",
            "Which anime friendship goals do you want in real life?",
            "What anime rivalry was the most intense?",
            "If you could experience any anime arc, which one?",
            "What's your favorite anime school setting?",
            "Which anime battle was the most epic?",
            "What anime made you laugh the most?",
            "If you had to choose a favorite anime studio, which?",
            "What's your take on anime pacing and storytelling?",
            "Which anime deserves a second season?",
            "What anime theme resonates with you personally?",
            "If anime was real, how would your life change?",
            "What's the best anime cliffhanger you've experienced?",
            "Which anime world-building impressed you most?",
            "What anime inspired you to pursue an interest?",
            "What's your take on anime vs manga differences?",
            "If you could rewatch any anime for the first time, which?",
            "What anime crossover would you want to see?",
            "What anime character personality type matches yours?",
            "Which anime setting do you wish you lived in?"
        ];
        const dares = [
            "Describe your favorite movie without using the title.",
            "Tell us about a conspiracy theory you find interesting.",
            "Recommend a song and explain why you love it.",
            "Explain a video game mechanic like you're teaching a kid.",
            "Share your take on a trending topic right now.",
            "Tell us about an interesting historical event.",
            "Recommend a book, show, or movie in 30 seconds.",
            "Explain your favorite meme's origin story.",
            "Describe your dream vacation in detail.",
            "Tell us what you'd do with a million dollars.",
            "Explain why your favorite hobby is actually cool.",
            "Share an unpopular opinion you actually believe.",
            "Tell us about the most interesting thing you learned this month.",
            "Explain a scientific concept in simple terms.",
            "Describe an alternate ending to your favorite show.",
            "Tell us why your favorite game is underrated.",
            "Share your theory about something mysterious.",
            "Explain what makes a perfect day for you.",
            "Tell us about the weirdest internet rabbit hole you've fallen down.",
            "Describe your ideal world in 5 sentences.",
            "Recommend something niche nobody's heard of.",
            "Tell us your take on AI and the future.",
            "Explain why you think something popular is overrated.",
            "Share an interesting fact that blew your mind.",
            "Describe the most interesting person you know (without revealing identity).",
            "Tell us about a skill you wish you had.",
            "Explain your philosophy on friendship.",
            "Share your best advice about something.",
            "Tell us what you'd change about the world.",
            "Describe what makes you laugh the hardest.",
            "Explain your dream career and why.",
            "Tell us about a book/game/show that changed your perspective.",
            "Share your take on a complicated topic.",
            "Describe your perfect creative project.",
            "Tell us what you'd want to be remembered for.",
            "Explain why your favorite genre deserves respect.",
            "Share the most interesting thing about your interests.",
            "Tell us your theory on why humans are weird.",
            "Describe what you think the future will look like.",
            "Explain the appeal of your favorite hobby.",
            "Tell us your hottest take on a popular franchise.",
            "Share what fascinates you most about science.",
            "Describe your ideal learning experience.",
            "Tell us what makes a good story.",
            "Explain why you'd survive in any fictional world.",
            "Share your thoughts on what makes someone interesting.",
            "Tell us about the coolest concept you've learned.",
            "Describe your personal theory about something weird.",
            "Explain what you think is underrated in your interests.",
            "Tell us what you'd want to explore endlessly.",
            "Recommend your favorite underrated creator.",
            "Explain your favorite running joke or meme.",
            "Tell us about the best community you're part of.",
            "Describe what your ideal weekend looks like.",
            "Explain a hobby you're passionate about.",
            "Share the most random knowledge you have.",
            "Tell us your take on a common misconception.",
            "Describe a skill you'd love to learn.",
            "Explain why a movie/show everyone loves doesn't appeal to you.",
            "Share your theory on why a famous thing became famous.",
            "Tell us about the weirdest subreddit or forum you know.",
            "Describe your perfect collaboration with someone.",
            "Explain what you'd teach in your ideal class.",
            "Share an unpopular opinion about a popular series.",
            "Tell us what makes content viral in your opinion.",
            "Describe your personal philosophy about life.",
            "Explain the appeal of something you didn't expect to like.",
            "Share what you think the internet got right.",
            "Tell us what you'd change about social media.",
            "Describe the most interesting documentary you've watched.",
            "Explain your favorite form of art or entertainment.",
            "Share what you think makes a great character.",
            "Tell us about your take on a heated fandom debate.",
            "Describe your ideal creative process.",
            "Explain why you think a certain style is underrated.",
            "Share what you'd want your legacy to be.",
            "Tell us about your hot take on technology.",
            "Describe what you think makes good writing.",
            "Explain your thoughts on a controversial topic.",
            "Share what fascinates you about how things work.",
            "Tell us your theory on internet trends.",
            "Describe what you think defines success.",
            "Explain why your interests are cool and valid.",
            "Share what you think the next big thing will be.",
            "Tell us what makes you feel connected to others.",
            "Describe your personal take on authenticity.",
            "Explain what you value most in people.",
            "Share your thoughts on creativity and innovation.",
            "Tell us what you'd do to make the world better.",
            "Describe what you think is beautiful about human nature.",
            "Describe your favorite anime in 3 sentences.",
            "Recommend an anime based on someone's mood.",
            "Explain why a specific anime character is iconic.",
            "Tell us your unpopular anime opinion confidently.",
            "Describe an anime plot if it was real life.",
            "Recommend an anime nobody's heard of.",
            "Explain an anime trope that always appears.",
            "Tell us about your favorite anime moment.",
            "Describe how you discovered your favorite anime.",
            "Explain what makes a good anime opening.",
            "Tell us your anime guilty pleasure.",
            "Recommend an anime for someone who doesn't watch anime.",
            "Explain your favorite anime character's backstory.",
            "Tell us about the anime that made you cry.",
            "Describe your ideal anime adaptation.",
            "Explain why you think anime is underrated.",
            "Tell us about an anime that changed your perspective.",
            "Share something funny from your real life.",
            "Tell us about a goal you're trying to achieve.",
            "Describe your perfect day in real life.",
            "Recommend something you love in real life.",
            "Explain why you love a certain hobby.",
            "Tell us about someone who inspires you.",
            "Describe what you want to improve about yourself.",
            "Share advice you'd give to younger people.",
            "Tell us about a challenge you overcame.",
            "Describe what friendship means to you.",
            "Explain what success looks like to you.",
            "Tell us about your favorite memory with friends.",
            "Describe how you spend your free time.",
            "Share what makes you happy in daily life.",
            "Tell us about a skill you're proud of.",
            "Explain what you value most in people.",
            "Describe your ideal weekend.",
            "Tell us about something you're currently learning.",
            "Share your thoughts on work-life balance.",
            "Describe what you want for your future.",
            "Tell us about Pohela Boishakh traditions.",
            "Describe your favorite Bengali dish and why.",
            "Recommend a Bengali movie or song.",
            "Tell us about a Bengali festival you celebrate.",
            "Explain what Bengali culture means to you.",
            "Share a Bengali word or phrase you love.",
            "Describe a traditional Bengali celebration.",
            "Tell us about Bangladeshi art or craft.",
            "Recommend a Bengali artist or creator.",
            "Explain the beauty of the Bengali language.",
            "Tell us about Bengali literature you know.",
            "Describe what makes Bengali music special.",
            "Share your connection to Bengali heritage.",
            "Explain Bengali hospitality traditions.",
            "Tell us about your favorite Bangladeshi memory.",
            "Describe how you celebrate your cultural identity.",
            "Share what you love about being Bengali.",
            "Explain a traditional Bengali custom you follow.",
            "Tell us about your favorite Bengali recipe.",
            "Recommend a Bengali book or story.",
            "Describe Bengali fashion or traditional wear.",
            "Share your thoughts on preserving culture.",
            "Tell us about Bangladeshi history you admire.",
            "Explain why your culture matters to you.",
            "Describe how your culture influences your life.",
            "Recommend your culture to someone curious.",
            "Tell us about anime + real life moments you've had.",
            "Explain how anime inspired you in real life.",
            "Share what connects you to anime culture.",
            "Describe anime references you use in everyday life.",
            "Tell us about blending your interests together.",
            "Explain your dream lifestyle inspired by anime.",
            "Share how anime taught you life lessons.",
            "Recommend an anime that matches your real life.",
            "Describe your anime merchandise if you have any.",
            "Tell us about your anime journey so far.",
            "Explain what anime community means to you.",
            "Share your thoughts on anime fandom culture.",
            "Describe how your interests shape your identity.",
            "Tell us what makes your interests unique.",
            "Explain why you're passionate about what you love.",
            "Share how you connect with people over shared interests.",
            "Describe your ideal group of friends.",
            "Tell us what brings people together in your view.",
            "Explain what makes a good community.",
            "Share your vision for a perfect world.",
            "Describe what you'd create if you could.",
            "Tell us about your creative inspirations."
        ];
        const tdEmojis = ['<a:cherry:1441782972486516946>', '<a:croissant:1441783019139502112>', '<a:balloonpikachu:1441834282816377103>', '<a:mymelody:1441834292400623646>', '<a:orangeblossom:1441834288193605856>', '<a:snowmanhellokitty:1441834296804638800>'];
        const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
        const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
        const emoji = tdEmojis[Math.floor(Math.random() * tdEmojis.length)];
        
        return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: `### ${emoji} ${pick}` }, { type: 14, spacing: 1 }, { type: 10, content: question }] }], flags: 32768 });
    }

    // CHOOSE - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'choose') {
        const subjectA = interaction.options.getString('a');
        const subjectB = interaction.options.getString('b');
        const subjectC = interaction.options.getString('c');
        
        const subjects = [subjectA, subjectB];
        if (subjectC) subjects.push(subjectC);
        
        const styles = ['I choose…', 'I picked…', "I'll go for…", 'My decision is…', "I'm choosing…"];
        const style = styles[Math.floor(Math.random() * styles.length)];
        const emoji = Math.random() < 0.5 ? '<a:croissant:1441783019139502112>' : '<a:cherry:1441782972486516946>';
        const choice = subjects[Math.floor(Math.random() * subjects.length)];
        
        return interaction.reply({
            content: ' ',
            components: [{
                type: 17,
                components: [
                    { type: 10, content: `### ${emoji} ${style}` },
                    { type: 14, spacing: 1 },
                    { type: 10, content: `**${choice}**` }
                ]
            }],
            flags: 32768
        });
    }

    // Helper function to build config pages
    function buildConfigPage(pageNum, guildId) {
        const prefix = getPrefix(guildId);
        const serverConfig = data.config?.[guildId] || {};
        const headerUrl = serverConfig.headerAttachment;
        const bgUrl = serverConfig.bgAttachment;
        
        let pageComponents = [];
        
        // Page indicator at the top (stored in content for tracking, but not used in Components V2 display)
        let pageIndicator = `Page ${pageNum}/3`;
        
        if (pageNum === 1) {
            // Page 1: Prefix Settings
            pageComponents = [
                { type: 10, content: `## 🎛️ ${BOT_NAME} Configuration` },
                { type: 10, content: `**📄 Page 1/3**` },
                { type: 14, spacing: 1 },
                { type: 10, content: '### 📌 Prefix Settings' },
                { type: 10, content: `**Current Prefix:** \`${prefix}\`` },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, label: 'Set Prefix', custom_id: 'config_set_prefix' }
                    ]
                }
            ];
        } else if (pageNum === 2) {
            // Page 2: Bot Status
            let statusText = '';
            if (!data.status?.text || !data.status?.type) {
                statusText = '🟢 Bot is online with no custom activity.';
            } else {
                const displayName = data.status.emoji ? `${data.status.emoji} ${data.status.text}` : data.status.text;
                statusText = `**Activity:** ${data.status.type} ${displayName}\n`;
                if (data.status.type === 'Streaming' && data.status.streamUrl) {
                    statusText += `**Stream:** ${data.status.streamUrl}\n`;
                }
                statusText += `**Visibility:** ${data.status.presence || 'online'}`;
            }
            
            pageComponents = [
                { type: 10, content: `## 🎛️ ${BOT_NAME} Configuration` },
                { type: 10, content: `**📄 Page 2/3**` },
                { type: 14, spacing: 1 },
                { type: 10, content: '### 🤖 Bot Status' },
                { type: 10, content: statusText },
                { type: 14, spacing: 1 },
                { type: 10, content: '**📝 Set Status Section**' },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, label: 'Add Status Info', custom_id: 'config_status_set' }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: 'config_online_status',
                            placeholder: 'Select Online Status',
                            options: [
                                { label: 'Online', value: 'online', default: (data.status?.presence || 'online') === 'online' },
                                { label: 'Idle', value: 'idle', default: data.status?.presence === 'idle' },
                                { label: 'Do Not Disturb', value: 'dnd', default: data.status?.presence === 'dnd' },
                                { label: 'Invisible', value: 'invisible', default: data.status?.presence === 'invisible' }
                            ]
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: 'config_activity_type',
                            placeholder: 'Select Activity Type',
                            options: [
                                { label: 'Playing', value: 'Playing', default: data.status?.type === 'Playing' },
                                { label: 'Watching', value: 'Watching', default: data.status?.type === 'Watching' },
                                { label: 'Listening', value: 'Listening', default: data.status?.type === 'Listening' },
                                { label: 'Competing', value: 'Competing', default: data.status?.type === 'Competing' },
                                { label: 'Streaming', value: 'Streaming', default: data.status?.type === 'Streaming' }
                            ]
                        }
                    ]
                },
                { type: 14, spacing: 1 },
                { type: 10, content: '**🔄 Reset Status Section**' },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 4, label: 'Reset Status', custom_id: 'config_status_reset' }
                    ]
                }
            ];
        } else if (pageNum === 3) {
            // Page 3: Bot Version & Latest Changes
            pageComponents = [
                { type: 10, content: `## 🎛️ ${BOT_NAME} Configuration` },
                { type: 10, content: `**📄 Page 3/3**` },
                { type: 14, spacing: 1 },
                { type: 10, content: '### 📜 Bot Version & Changes' },
                { type: 10, content: `**Version:** v${versionData.version}` },
                { type: 10, content: `**Released:** <t:${versionData.releaseDateTimestamp}:f>` },
                { type: 14, spacing: 1 },
                { type: 10, content: `**Latest Updates:**` },
                { type: 10, content: versionData.changesSummary }
            ];
        }
        
        // Add pagination buttons
        pageComponents.push({ type: 14, spacing: 1 });
        pageComponents.push({
            type: 1,
            components: [
                { type: 2, style: 2, label: '◀ Previous', custom_id: 'config_prev', disabled: pageNum === 1 },
                { type: 2, style: 2, label: 'Next ▶', custom_id: 'config_next', disabled: pageNum === 3 }
            ]
        });
        
        return pageComponents;
    }

    // CONFIG COMMAND - Component V2 Configuration Panel with Pagination
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator | type 1 = Row | type 2 = Button | type 12 = MediaGallery
    if (commandName === 'config') {
        const pageComponents = buildConfigPage(1, guildId);
        
        const configPanel = {
            content: ' ',
            components: [{
                type: 17,
                components: pageComponents
            }],
            flags: 32768 | MessageFlags.Ephemeral
        };

        return interaction.reply(configPanel);
    }

    // SEARCH - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator | type 9 = Content Accessory
    if (commandName === 'search') {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const searchLocal = interaction.options.getBoolean('local') || false;
        const botAvatar = client.user.displayAvatarURL({ dynamic: true, size: 1024 });

        try {
            let resultText = '';
            let mediaUrl = null;
            let pageTitle = null;

            if (searchLocal) {
                // Local search - lookup stored topics with cached content
                const searchResults = [];
                const queryLower = query.toLowerCase();
                
                // Check if query matches a topic
                let foundTopic = null;
                let matchedTopicName = '';
                if (data.topics) {
                    for (const [topicName, topicData] of Object.entries(data.topics)) {
                        if (topicName.toLowerCase().includes(queryLower) || queryLower.includes(topicName.toLowerCase())) {
                            foundTopic = topicData;
                            matchedTopicName = topicName;
                            break;
                        }
                    }
                }
                
                if (foundTopic && typeof foundTopic === 'object') {
                    if (foundTopic.content) {
                        // Display summary with link to full message
                        const link = foundTopic.link || `https://discord.com/channels/${guildId}/${foundTopic.channelId}/${foundTopic.messageId}`;
                        resultText = `**${matchedTopicName}**\n\n${foundTopic.content}\n\n<:question:1441531934332424314> [**Read Full Message**](${link})`;
                    } else {
                        resultText = `Topic "${query}" not found.`;
                    }
                } else {
                    // Search in autoresponses
                    if (data.autoresponse[guildId]) {
                        data.autoresponse[guildId].forEach(ar => {
                            if (ar.trigger.toLowerCase().includes(queryLower) || ar.response.toLowerCase().includes(queryLower)) {
                                searchResults.push(`**${ar.trigger}** → ${ar.response}`);
                            }
                        });
                    }
                    
                    if (searchResults.length > 0) {
                        resultText = searchResults.slice(0, 5).join('\n');
                    } else {
                        const availableTopics = Object.keys(data.topics || {}).join(', ');
                        resultText = `No topic or auto-response found for "${query}".\n\nAvailable topics: ${availableTopics}`;
                    }
                }
            } else {
                // Wikipedia API search (free, popular, reliable)
                try {
                    const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
                    const searchData = await searchResponse.json();
                    
                    let results = [];

                    if (searchData.query && searchData.query.search && searchData.query.search.length > 0) {
                        pageTitle = searchData.query.search[0].title;
                        results.push(searchData.query.search[0].snippet.replace(/<[^>]*>/g, '').substring(0, 500));

                        const pageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages&exintro&piprop=original&format=json&origin=*`);
                        const pageData = await pageResponse.json();
                        const pages = pageData.query.pages;
                        const firstPage = pages[Object.keys(pages)[0]];
                        
                        if (firstPage && firstPage.extract) {
                            const cleanText = firstPage.extract.replace(/<[^>]*>/g, '').substring(0, 1000);
                            if (cleanText) results.push(cleanText);
                        }
                        
                        if (firstPage && firstPage.original && firstPage.original.source) {
                            mediaUrl = firstPage.original.source;
                        }
                    }

                    if (results.length > 0) {
                        resultText = results.join('\n');
                    } else {
                        resultText = 'No detailed results found on Wikipedia. Try a different search query.';
                    }
                } catch (wikiError) {
                    resultText = 'Wikipedia search unavailable. Try again later.';
                }
            }

            // Limit line breaks to max 3 for compact display
            const limitedText = resultText.replace(/\n{4,}/g, '\n\n\n').substring(0, 2000);
            
            // Add clickable Wikipedia link if we have a page title
            let displayText = limitedText;
            if (pageTitle && !searchLocal) {
                const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
                displayText = `${limitedText}\n\n<:question:1441531934332424314> [**Read Full Article:**](${wikiUrl})`;
            }

            const containerComponents = [
                {
                    type: 9,
                    components: [
                        {
                            type: 10,
                            content: `**@${interaction.user.username}** searched\n## 🔍 ${query}`
                        }
                    ],
                    accessory: {
                        type: 11,
                        media: {
                            url: botAvatar
                        }
                    }
                },
                {
                    type: 14
                },
                {
                    type: 10,
                    content: displayText
                }
            ];

            const payload = {
                content: ' ',
                components: [
                    {
                        type: 17,
                        components: containerComponents
                    }
                ],
                flags: 32768
            };

            return interaction.editReply(payload);
        } catch (error) {
            return interaction.editReply({
                content: `<:Error:1440296241090265088> Search failed: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // MEME GENERATOR - Component V2 Container
    // type 17 = Container (main wrapper for Component V2)
    // type 10 = TextDisplay (for title/text)
    // type 12 = MediaGallery (for image display)
    // type 14 = Separator (visual line)
    if (commandName === 'meme') {
        await interaction.deferReply();
        const topText = interaction.options.getString('top_text') || '';
        const bottomText = interaction.options.getString('bottom_text') || '';
        const imageAttachment = interaction.options.getAttachment('image');
        
        try {
            let imageUrl = imageAttachment?.url || data.meme?.templates?.[Math.floor(Math.random() * data.meme.templates.length)]?.url;
            if (!imageUrl) return interaction.editReply('❌ No image found');
            
            const buffer = await (await fetch(imageUrl)).arrayBuffer();
            const img = new (await import('canvas')).Image();
            img.src = Buffer.from(buffer);
            
            const cv = createCanvas(img.width, img.height);
            const ctx = cv.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const fontSize = Math.min(img.width / 8, 60);
            ctx.font = `bold ${fontSize}px Impact`;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.max(2, fontSize / 20);
            ctx.textAlign = 'center';
            
            const drawText = (text, isTop) => {
                const lines = text.match(/(.{1,30})/g) || [];
                lines.forEach((line, i) => {
                    const y = isTop ? fontSize * (i + 1.5) : img.height - (fontSize * (lines.length - i - 0.5));
                    ctx.strokeText(line, img.width / 2, y);
                    ctx.fillText(line, img.width / 2, y);
                });
            };
            
            if (topText) drawText(topText, true);
            if (bottomText) drawText(bottomText, false);
            
            const memeBuffer = cv.toBuffer('image/png');
            const responses = ['🎉 Your meme is ready!', '😂 LOL!', 'Nice meme!', '🔥 Fire!', 'Hilarious!'];
            const msg = responses[Math.floor(Math.random() * responses.length)];
            
            const payload = {
                content: ' ',
                components: [
                    {
                        type: 17,
                        components: [
                            { type: 10, content: `### ${msg}` },
                            { type: 14 },
                            { type: 12, items: [{ type: 1, media: { url: `attachment://meme.png` } }] }
                        ]
                    }
                ],
                files: [{ attachment: memeBuffer, name: 'meme.png' }],
                flags: 32768
            };
            
            return interaction.editReply(payload);
        } catch (error) {
            return interaction.editReply(`❌ Failed: ${error.message}`);
        }
    }

    // SEND - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator | type 9 = Content Accessory
    if (commandName === 'send') {
        const title = interaction.options.getString('title');
        const content = interaction.options.getString('content');
        const thumbnailAttachment = interaction.options.getAttachment('thumbnail');
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

        try {
            // Build Component V2 structure - Common builder format
            const components = [];

            // 1. Add title
            components.push({
                type: 10,
                content: title
            });

            // 2. Add separator
            components.push({
                type: 14
            });

            // 3. Add content with thumbnail accessory (default to bot avatar)
            const thumbnailUrl = thumbnailAttachment 
                ? thumbnailAttachment.url 
                : client.user.displayAvatarURL({ dynamic: true, size: 1024 });

            const contentComponent = {
                type: 9,
                components: [
                    {
                        type: 10,
                        content: content || ''
                    }
                ],
                accessory: {
                    type: 11,
                    media: {
                        url: thumbnailUrl
                    }
                }
            };

            components.push(contentComponent);

            const payload = {
                content: ' ',
                components: [
                    {
                        type: 17,
                        components: components
                    }
                ],
                flags: 32768
            };

            await targetChannel.send(payload);
            return interaction.reply({
                content: `<:Correct:1440296238305116223> Message sent to ${targetChannel}`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            return interaction.reply({
                content: `<:Error:1440296241090265088> Failed to send message: ${error.message}`,
                flags: MessageFlags.Ephemeral
            });
        }
    }

    // COINFLIP - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'coinflip') {
        const cooldownRemaining = checkAndWarnCooldown(user.id, 'coinflip', 5000);
        if (cooldownRemaining > 0) {
            return interaction.reply({ content: `⏳ Slow down! You can use this command again in **${cooldownRemaining}s**.`, flags: MessageFlags.Ephemeral });
        }

        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        
        return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:Tails:1441153955412312134> Coin Flip' }, { type: 14, spacing: 1 }, { type: 10, content: `The coin landed on: **${result}**!` }] }], flags: 32768 });
    }

    // AUTORESPONSE - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
    if (commandName === 'autoresponse') {
        const action = interaction.options.getString('action');
        const trigger = interaction.options.getString('trigger');
        const type = interaction.options.getString('type');
        const response = interaction.options.getString('response');
        const selectFromBackup = interaction.options.getString('select_from_backup');

        if (action === 'add') {
            if (!trigger)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'Trigger is required.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            if (!type)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'Response type is required.' }] }], flags: 32768 | MessageFlags.Ephemeral });

            let finalResponse = null;
            let isFromBackup = false;

            if (type === 'text') {
                if (selectFromBackup) {
                    // User selected a saved custom message
                    finalResponse = selectFromBackup;
                    isFromBackup = true;
                } else if (response) {
                    // User typed custom text
                    finalResponse = response;
                    isFromBackup = false;
                } else {
                    return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'Provide either custom text (response) or select a saved message (select_from_backup).' }] }], flags: 32768 | MessageFlags.Ephemeral });
                }
            } else if (type === 'emoji') {
                if (!response)
                    return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'Emoji response is required.' }] }], flags: 32768 | MessageFlags.Ephemeral });
                finalResponse = response;
            }

            data.autoresponse[guildId] = data.autoresponse[guildId] || [];
            data.autoresponse[guildId].push({ 
                trigger, 
                type, 
                response: finalResponse,
                isFromBackup: isFromBackup
            });
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            const displayText = type === 'text' 
                ? (isFromBackup ? `Saved Message: ${finalResponse}` : `Custom Text: ${finalResponse.substring(0, 50)}${finalResponse.length > 50 ? '...' : ''}`)
                : `Emoji: ${finalResponse}`;
            const addTitle = `## <:Correct:1440296238305116223> Auto-Response Added`;
            const addContent = `**Trigger:** ${trigger}\n**Response Type:** ${type.charAt(0).toUpperCase() + type.slice(1)}\n**Response:** ${displayText}`;
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: addTitle }, { type: 14, spacing: 1 }, { type: 10, content: addContent }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (action === 'remove') {
            if (!trigger)
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'Trigger is required.' }] }], flags: 32768 | MessageFlags.Ephemeral });

            if (!data.autoresponse[guildId] || data.autoresponse[guildId].length === 0) {
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: 'No auto-responses configured.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            }

            const initialLength = data.autoresponse[guildId].length;
            data.autoresponse[guildId] = data.autoresponse[guildId].filter(ar => ar.trigger !== trigger);

            if (data.autoresponse[guildId].length === initialLength) {
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Error' }, { type: 14 }, { type: 10, content: `No response found for "${trigger}".` }] }], flags: 32768 | MessageFlags.Ephemeral });
            }

            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            const removeTitle = `## <:Correct:1440296238305116223> Auto-Response Removed`;
            const removeContent = `**Trigger:** ${trigger}\n\nThis auto-response has been successfully removed from your server.`;
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: removeTitle }, { type: 14, spacing: 1 }, { type: 10, content: removeContent }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        if (action === 'list') {
            if (!data.autoresponse[guildId] || data.autoresponse[guildId].length === 0) {
                return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## 🔄 Auto-Responses' }, { type: 14 }, { type: 10, content: 'None configured yet.' }] }], flags: 32768 | MessageFlags.Ephemeral });
            }

            let list = '';
            data.autoresponse[guildId].forEach((ar, index) => {
                let responseDisplay = '';
                if (ar.type === 'text') {
                    responseDisplay = ar.isFromBackup ? `📦 Saved: ${ar.response}` : `✏️ Text: ${ar.response.substring(0, 40)}${ar.response.length > 40 ? '...' : ''}`;
                } else {
                    responseDisplay = `Emoji: ${ar.response}`;
                }
                list += `${index + 1}. **${ar.trigger}** (${ar.type})\n   → ${responseDisplay}\n`;
            });

            const listTitle = `## 🔄 Auto-Responses Configured`;
            const listContent = `${list}\n**Total:** ${data.autoresponse[guildId].length} response(s) active`;
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: listTitle }, { type: 14, spacing: 1 }, { type: 10, content: listContent }] }], flags: 32768 | MessageFlags.Ephemeral });
        }
    }

    // WELCOME - Component V2 Container
    // type 17 = Container | type 10 = TextDisplay | type 14 = Separator
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

            if (showList) {
                const sampleList = welcomeMessages.slice(0, 10).map((msg, i) => `${i + 1}. ${msg}`).join('\n');
                const contentText = `**Channel:** ${channel}\n**Delay:** ${delayStr || '120s'}\n\n**Sample Messages:**\n${sampleList}\n\n... (${welcomeMessages.length} total messages available)`;
                
                return interaction.reply({ 
                    content: ' ', 
                    components: [{ 
                        type: 17, 
                        components: [
                            { type: 10, content: '### <:1_yes_correct:1439893200981721140> Welcome Enabled' },
                            { type: 14, spacing: 1 },
                            { type: 10, content: contentText }
                        ] 
                    }], 
                    flags: 32768 | MessageFlags.Ephemeral 
                });
            } else {
                const contentText = `**Channel:** ${channel}\n**Delay:** ${delayStr || '120s'}`;
                
                return interaction.reply({ 
                    content: ' ', 
                    components: [{ 
                        type: 17, 
                        components: [
                            { type: 10, content: '### <:1_yes_correct:1439893200981721140> Welcome Enabled' },
                            { type: 14, spacing: 1 },
                            { type: 10, content: contentText }
                        ] 
                    }], 
                    flags: 32768 | MessageFlags.Ephemeral 
                });
            }
        }

        if (subcommand === 'disable') {
            data.welcome[guildId] = data.welcome[guildId] || {};
            data.welcome[guildId].enabled = false;
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            return interaction.reply({ 
                content: ' ', 
                components: [{ 
                    type: 17, 
                    components: [
                        { type: 10, content: '### <:1_yes_correct:1439893200981721140> Welcome Disabled' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: 'Welcome messages have been disabled for this server.' }
                    ] 
                }], 
                flags: 32768 | MessageFlags.Ephemeral 
            });
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
        
        try {
            const member = await msg.guild.members.fetch(msg.author.id);
            if (afkData.originalNickname) {
                await member.setNickname(afkData.originalNickname);
            } else {
                await member.setNickname(null);
            }
        } catch (e) {
            console.error('Failed to restore nickname:', e);
        }
        
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
            const originalNickname = msg.member.nickname || msg.author.displayName;
            const newNickname = `AFK - ${originalNickname}`;
            
            afkUsers[msg.author.id] = { reason, timestamp: Date.now(), originalNickname };
            data.afk[msg.author.id] = afkUsers[msg.author.id];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));

            try {
                await msg.member.setNickname(newNickname);
            } catch (e) {
                console.error('Failed to set AFK nickname:', e);
            }

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

        // Play/Music - Prefix commands !p and !play with discord-player
        if (cmd === 'p' || cmd === 'play') {
            if (!msg.member.voice.channel) {
                return msg.reply('🚫 You must be in a voice channel to use this command.');
            }

            const query = args.join(' ');
            if (!query) {
                return msg.reply('❌ Usage: `!play <song name or URL>`');
            }

            try {
                let queue = player.nodes.get(msg.guildId);
                if (!queue) {
                    queue = player.nodes.create(msg.guildId, {
                        metadata: { channel: msg.channel }
                    });
                }

                if (!queue.connection) {
                    queue.connect(msg.member.voice.channel);
                }

                const result = await player.search(query, { requestedBy: msg.author });
                if (!result || !result.tracks.length) {
                    return msg.reply('❌ No songs found for: ' + query);
                }

                result.tracks.forEach(track => queue.addTrack(track));
                if (!queue.isPlaying()) await queue.node.play();

                const track = result.tracks[0];
                const mockTrack = {
                    name: track.title,
                    url: track.url,
                    artist: track.author,
                    length: track.duration ? `${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}` : '0:00',
                    thumbnail: track.thumbnail
                };

                const panel = createMusicControlPanel(mockTrack, msg.author, 100, '▶️ Now Playing');
                return msg.reply(panel);
            } catch (error) {
                console.error('[PLAY] Error:', error);
                return msg.reply('❌ Failed to play music: ' + error.message);
            }
        }

        // Prefix Meme - Component V2 Container
        if (cmd === 'meme') {
            const [topText, bottomText] = args.join(' ').split(',').map(p => p.trim());
            if (!topText) return msg.reply('❌ Usage: `!meme <top text>, <bottom text>`');
            
            const wait = await msg.reply('🎨 Generating...');
            try {
                const imageUrl = data.meme?.templates?.[Math.floor(Math.random() * data.meme.templates.length)]?.url;
                if (!imageUrl) return wait.edit('❌ No templates found');
                
                const buffer = await (await fetch(imageUrl)).arrayBuffer();
                const img = new (await import('canvas')).Image();
                img.src = Buffer.from(buffer);
                
                const cv = createCanvas(img.width, img.height);
                const ctx = cv.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const fontSize = Math.min(img.width / 8, 60);
                ctx.font = `bold ${fontSize}px Impact`;
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = Math.max(2, fontSize / 20);
                ctx.textAlign = 'center';
                
                const drawText = (text, isTop) => {
                    const lines = text.match(/(.{1,30})/g) || [];
                    lines.forEach((line, i) => {
                        const y = isTop ? fontSize * (i + 1.5) : img.height - (fontSize * (lines.length - i - 0.5));
                        ctx.strokeText(line, img.width / 2, y);
                        ctx.fillText(line, img.width / 2, y);
                    });
                };
                
                if (topText) drawText(topText, true);
                if (bottomText) drawText(bottomText, false);
                
                const memeBuffer = cv.toBuffer('image/png');
                const responses = ['🎉 Your meme is ready!', '😂 LOL!', 'Nice meme!', '🔥 Fire!', 'Hilarious!'];
                const msgText = responses[Math.floor(Math.random() * responses.length)];
                
                const payload = {
                    content: ' ',
                    components: [
                        {
                            type: 17,
                            components: [
                                { type: 10, content: `### ${msgText}` },
                                { type: 14 },
                                { type: 12, items: [{ type: 1, media: { url: `attachment://meme.png` } }] }
                            ]
                        }
                    ],
                    files: [{ attachment: memeBuffer, name: 'meme.png' }]
                };
                
                await wait.delete();
                return msg.reply(payload);
            } catch (error) {
                return wait.edit(`❌ Failed: ${error.message}`);
            }
        }

        // Fun command: Truth or Dare
        if (cmd === 'td') {
            const cooldownRemaining = checkAndWarnCooldown(msg.author.id, 'td', 5000);
            if (cooldownRemaining > 0) {
                const warnMsg = await msg.reply({ content: `⏳ Slow down! You can use this command again in **${cooldownRemaining}s**.`, flags: MessageFlags.Ephemeral });
                setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
                return;
            }

            const truths = [
                "If you could master any skill instantly, what would it be?",
                "What's the most interesting conspiracy theory you've heard?",
                "If money wasn't a concern, what would you do with your time?",
                "What's the weirdest fact you know that most people don't?",
                "If you could have dinner with any historical figure, who would it be?",
                "What's a topic you could talk about for hours?",
                "What's the most underrated movie or show you've watched?",
                "If you could live in any fictional universe, which one?",
                "What's something you've changed your mind about?",
                "What's the best piece of advice you've given someone?",
                "If you could solve one world problem, what would it be?",
                "What's a skill you wish more people had?",
                "What's the most valuable thing you've learned from a game?",
                "If you could pick any career for a day, what would it be?",
                "What's the most thought-provoking question you've heard?",
                "If you could visit any time period, when would it be?",
                "What's something you find beautiful that others might not?",
                "What's the most interesting story you know?",
                "If you could have any job in the world, what would it be?",
                "What's something you're passionate about explaining to others?",
                "If AI could do one thing better, what should it be?",
                "What's the most mind-bending concept you understand?",
                "If you could create a new holiday, what would it celebrate?",
                "What's the best decision you've made?",
                "If you had to teach something to others, what would you pick?",
                "What's a genre you didn't expect to enjoy but do?",
                "If you could redesign one system in the world, what would it be?",
                "What's the most interesting conversation you've had?",
                "If you could understand any language instantly, which one?",
                "What's something you'd love to do but haven't yet?",
                "If you could write a book about anything, what's the topic?",
                "What's the most useful thing you've learned from the internet?",
                "If you had to debate any topic, which would you choose?",
                "What's something you realized was more complex than you thought?",
                "If you could attend any lecture or talk, what would it be?",
                "What's the most interesting pattern you've noticed?",
                "If you could master one video game completely, which one?",
                "What's something you think is overrated?",
                "If you could solve a mystery, what would it be?",
                "What's the most fascinating culture or tradition you know about?",
                "If you could have a superpower for one day, what would you pick?",
                "What's something you believe that most people don't?",
                "If you could ask the internet one question, what would it be?",
                "What's the most interesting piece of trivia you know?",
                "If you could design your perfect day, what would it look like?",
                "What's something you've learned that changed your perspective?",
                "If you could be an expert in something, what would it be?",
                "What's the most innovative idea you've heard?",
                "If you could unlock one secret of the universe, what would it be?",
                "What's something you think deserves more attention?",
                "If you could explore any field deeply, what would it be?",
                "What's your favorite type of story to hear or read?",
                "What invention would make the world better?",
                "What's the best plot twist you've experienced?",
                "If you could only eat food from one cuisine, which would it be?",
                "What's something everyone should know about?",
                "What type of problem do you enjoy solving?",
                "If you could have written any book, which would it be?",
                "What's the coolest technology you've learned about?",
                "What's something you think is underrated?",
                "If you could change the ending of any story, would you?",
                "What's the most random skill you have?",
                "What do you think makes a good leader?",
                "If you could live in any country, where would it be?",
                "What's your take on the most debated topic in your hobby?",
                "What's something you thought was boring but turned out cool?",
                "If you could have any view from your window, what would it be?",
                "What's the best advice you've received?",
                "What's something people often misunderstand about your interests?",
                "If you could master one language, which would it be?",
                "What's the most hilarious misunderstanding you've had?",
                "If you could design a perfect society, what would it look like?",
                "What's something you admire in other people?",
                "If you could bring back any trend, what would it be?",
                "What's the most useful lesson life taught you?",
                "If you could only listen to one artist forever, who?",
                "What's the best decision you've made recently?",
                "What's something that surprised you about yourself?",
                "If you could witness any historical moment, which one?",
                "What's your take on a heated internet debate?",
                "What do you think we'll look back on and find weird in 20 years?",
                "What's the most interesting fact about your favorite hobby?",
                "If you could have a conversation with any character, who?",
                "What's something you're proud of that nobody knows about?",
                "What do you think is the most underrated form of entertainment?",
                "If you could live in any era, when would you pick?",
                "What's the best piece of media you've ever experienced?",
                "What's something you disagree with most people about?",
                "If you could solve any puzzle, what would it be?",
                "What's your hot take on a popular franchise?",
                "What's the most thought-provoking book/game/show you know?"
            ];
            const dares = [
                "Describe your favorite movie without using the title.",
                "Tell us about a conspiracy theory you find interesting.",
                "Recommend a song and explain why you love it.",
                "Explain a video game mechanic like you're teaching a kid.",
                "Share your take on a trending topic right now.",
                "Tell us about an interesting historical event.",
                "Recommend a book, show, or movie in 30 seconds.",
                "Explain your favorite meme's origin story.",
                "Describe your dream vacation in detail.",
                "Tell us what you'd do with a million dollars.",
                "Explain why your favorite hobby is actually cool.",
                "Share an unpopular opinion you actually believe.",
                "Tell us what you learned this month that was interesting.",
                "Explain a scientific concept in simple terms.",
                "Describe an alternate ending to your favorite show.",
                "Tell us why your favorite game is underrated.",
                "Share your theory about something mysterious.",
                "Explain what makes a perfect day for you.",
                "Tell us about the weirdest internet rabbit hole you've fallen down.",
                "Describe your ideal world in 5 sentences.",
                "Recommend something niche nobody's heard of.",
                "Tell us your take on AI and the future.",
                "Explain why something popular is actually overrated.",
                "Share an interesting fact that blew your mind.",
                "Describe what makes a good character in fiction.",
                "Tell us about a skill you wish you had.",
                "Explain your philosophy on friendship.",
                "Share your best advice about something.",
                "Tell us what you'd change about the world.",
                "Describe what makes you laugh the hardest.",
                "Explain your dream career and why.",
                "Tell us about media that changed your perspective.",
                "Share your take on a complicated topic.",
                "Describe your perfect creative project.",
                "Tell us what you'd want to be remembered for.",
                "Explain why your favorite genre deserves respect.",
                "Share the most interesting thing about your interests.",
                "Tell us your theory on why humans are weird.",
                "Describe what you think the future will look like.",
                "Explain the appeal of your favorite hobby.",
                "Tell us your hottest take on a popular franchise.",
                "Share what fascinates you most about science.",
                "Describe your ideal learning experience.",
                "Tell us what makes a good story.",
                "Explain why you'd survive in any fictional world.",
                "Share your thoughts on what makes someone interesting.",
                "Tell us about the coolest concept you've learned.",
                "Describe your personal theory about something weird.",
                "Explain what you think is underrated in your interests.",
                "Tell us what you'd want to explore endlessly."
            ];
            const tdEmojis = ['<a:cherry:1441782972486516946>', '<a:croissant:1441783019139502112>', '<a:balloonpikachu:1441834282816377103>', '<a:mymelody:1441834292400623646>', '<a:orangeblossom:1441834288193605856>', '<a:snowmanhellokitty:1441834296804638800>'];
            const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
            const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
            const emoji = tdEmojis[Math.floor(Math.random() * tdEmojis.length)];
            
            return msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: `### ${emoji} ${pick}` }, { type: 14, spacing: 1 }, { type: 10, content: question }] }], flags: 32768 });
        }

        // Fun command: Choose
        if (cmd === 'cs') {
            const parts = msg.content.substring(4).trim();
            const subjects = parts.split(',').map(p => p.trim());
            
            if (subjects.length < 2) {
                const usageText = `**Choose between 2-3 options:**\n\n\`!cs <Subject A> , <Subject B>\`\n\n**or**\n\n\`!cs <Subject A> , <Subject B> , <Subject C>\``;
                const warnMsg = await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:warning:1441531830607151195> Usage Format' }, { type: 14 }, { type: 10, content: usageText }] }], flags: 32768 | MessageFlags.Ephemeral });
                msg.delete().catch(() => {});
                setTimeout(() => warnMsg.delete().catch(() => {}), 10000);
                return;
            }
            
            const styles = ['I choose…', 'I picked…', "I'll go for…", 'My decision is…', "I'm choosing…"];
            const style = styles[Math.floor(Math.random() * styles.length)];
            const emoji = Math.random() < 0.5 ? '<a:croissant:1441783019139502112>' : '<a:cherry:1441782972486516946>';
            const choice = subjects[Math.floor(Math.random() * subjects.length)];
            
            return msg.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: `### ${emoji} ${style}` },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**${choice}**` }
                    ]
                }],
                flags: 32768
            });
        }

        // Fun command: Coin Flip
        if (cmd === 'cf') {
            const cooldownRemaining = checkAndWarnCooldown(msg.author.id, 'cf', 5000);
            if (cooldownRemaining > 0) {
                const warnMsg = await msg.reply({ content: `⏳ Slow down! You can use this command again in **${cooldownRemaining}s**.`, flags: MessageFlags.Ephemeral });
                setTimeout(() => warnMsg.delete().catch(() => {}), 5000);
                return;
            }

            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            
            return msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:Tails:1441153955412312134> Coin Flip' }, { type: 14, spacing: 1 }, { type: 10, content: `The coin landed on: **${result}**!` }] }], flags: 32768 });
        }

        // Bot Info command
        if (cmd === 'bi') {
            const botName = client.user.username;
            const prefix = getPrefix(guildId);
            const wsLatency = client.ws.ping;
            const responseTime = Date.now() - msg.createdTimestamp;
            const uptime = formatUptime(startTime);
            const botAvatar = client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            
            const infoText = `**${packageJson.description}**\n\n**Prefix:** \`${prefix}\`\n**Ping:** ${wsLatency}ms\n**Response Time:** ${responseTime}ms\n**Uptime:** ${uptime}\n**Total Commands:** 15+`;
            
            const payload = {
                content: ' ',
                components: [
                    {
                        type: 17,
                        components: [
                            {
                                type: 10,
                                content: `## ${BOT_NAME}│v${BOT_VERSION}`
                            },
                            {
                                type: 14
                            },
                            {
                                type: 9,
                                components: [
                                    {
                                        type: 10,
                                        content: infoText
                                    }
                                ],
                                accessory: {
                                    type: 11,
                                    media: {
                                        url: botAvatar
                                    }
                                }
                            }
                        ]
                    }
                ],
                flags: 32768
            };
            
            return msg.reply(payload);
        }

        // Search command
        if (cmd === 'sh') {
            const fullQuery = args.join(' ');
            if (!fullQuery) {
                return msg.reply({ content: '<:Error:1440296241090265088> Usage: `!sh <query>` or `!sh <query> , local` to search local data', flags: MessageFlags.Ephemeral });
            }

            // Check for comma to determine if local search
            const parts = fullQuery.split(',');
            const query = parts[0].trim();
            const searchLocal = parts.length > 1;

            try {
                const waitMsg = await msg.reply('<:question:1441531934332424314> Searching...');
                const botAvatar = client.user.displayAvatarURL({ dynamic: true, size: 1024 });
                let resultText = '';
                let mediaUrl = null;
                let pageTitle = null;

                if (searchLocal) {
                    // Local search - search all server data
                    const searchResults = [];
                    
                    // Search in autoresponses
                    if (data.autoresponse[guildId]) {
                        data.autoresponse[guildId].forEach(ar => {
                            if (ar.trigger.toLowerCase().includes(query.toLowerCase()) || ar.response.toLowerCase().includes(query.toLowerCase())) {
                                searchResults.push(`**AR:** ${ar.trigger} → ${ar.response}`);
                            }
                        });
                    }

                    // Search in banned words
                    if (data.nickname.filter && data.nickname.filter.length > 0) {
                        data.nickname.filter.forEach(word => {
                            if (word.toLowerCase().includes(query.toLowerCase())) {
                                searchResults.push(`**Filter:** ${word}`);
                            }
                        });
                    }

                    // Search in AFK data
                    for (const [userId, afkData] of Object.entries(data.afk || {})) {
                        if (afkData.reason.toLowerCase().includes(query.toLowerCase())) {
                            searchResults.push(`**AFK:** <@${userId}> - ${afkData.reason}`);
                        }
                    }

                    // Search in welcome data
                    for (const [guildIdKey, welcomeData] of Object.entries(data.welcome || {})) {
                        if (guildIdKey === guildId) {
                            if (query.toLowerCase().includes('welcome') || query.toLowerCase().includes('join')) {
                                searchResults.push(`**Welcome:** <#${welcomeData.channelId}> (${welcomeData.enabled ? 'Enabled' : 'Disabled'})`);
                            }
                        }
                    }

                    // Search in prefix data
                    if (data.prefix[guildId]) {
                        const prefixChar = data.prefix[guildId];
                        if (query.toLowerCase().includes('prefix')) {
                            searchResults.push(`**Prefix:** \`${prefixChar}\``);
                        }
                    }

                    // Search in bot status
                    if (data.bot?.status) {
                        const status = data.bot.status;
                        if (status.text.toLowerCase().includes(query.toLowerCase()) || status.emoji.toLowerCase().includes(query.toLowerCase())) {
                            searchResults.push(`**Status:** ${status.text} ${status.emoji}`);
                        }
                    }

                    if (searchResults.length > 0) {
                        resultText = searchResults.slice(0, 15).join('\n');
                    } else {
                        resultText = 'No local data found matching your search.';
                    }
                } else {
                    // Wikipedia API search (free, popular, reliable)
                    try {
                        const searchResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
                        const wikiSearch = await searchResponse.json();
                        
                        let results = [];

                        if (wikiSearch.query && wikiSearch.query.search && wikiSearch.query.search.length > 0) {
                            pageTitle = wikiSearch.query.search[0].title;
                            results.push(wikiSearch.query.search[0].snippet.replace(/<[^>]*>/g, '').substring(0, 500));

                            const pageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts|pageimages&exintro&piprop=original&format=json&origin=*`);
                            const pageInfo = await pageResponse.json();
                            const pages = pageInfo.query.pages;
                            const firstPage = pages[Object.keys(pages)[0]];
                            
                            if (firstPage && firstPage.extract) {
                                const cleanText = firstPage.extract.replace(/<[^>]*>/g, '').substring(0, 1000);
                                if (cleanText) results.push(cleanText);
                            }
                            
                            if (firstPage && firstPage.original && firstPage.original.source) {
                                mediaUrl = firstPage.original.source;
                            }
                        }

                        if (results.length > 0) {
                            resultText = results.join('\n');
                        } else {
                            resultText = 'No detailed results found on Wikipedia. Try a different search query.';
                        }
                    } catch (wikiError) {
                        resultText = 'Wikipedia search unavailable. Try again later.';
                    }
                }

                // Limit line breaks to max 3 for compact display
                const limitedText = resultText.replace(/\n{4,}/g, '\n\n\n').substring(0, 2000);
                
                // Add clickable Wikipedia link if we have a page title
                let displayText = limitedText;
                if (pageTitle && !searchLocal) {
                    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;
                    displayText = `${limitedText}\n\n<:question:1441531934332424314> [**Read Full Article:**](${wikiUrl})`;
                }

                const containerComponents = [
                    {
                        type: 9,
                        components: [
                            {
                                type: 10,
                                content: `**@${msg.author.username}** searched\n## 🔍 ${query}`
                            }
                        ],
                        accessory: {
                            type: 11,
                            media: {
                                url: botAvatar
                            }
                        }
                    },
                    {
                        type: 14
                    },
                    {
                        type: 10,
                        content: displayText
                    }
                ];

                const payload = {
                    content: ' ',
                    components: [
                        {
                            type: 17,
                            components: containerComponents
                        }
                    ],
                    flags: 32768
                };

                await waitMsg.edit(payload);
            } catch (error) {
                return msg.reply({
                    content: `<:Error:1440296241090265088> Search failed: ${error.message}`,
                    flags: MessageFlags.Ephemeral
                }).catch(() => {});
            }
        }

    }

    // ----- Auto-response triggers -----
    if (data.autoresponse[guildId]) {
        for (const ar of data.autoresponse[guildId]) {
            if (msg.content.includes(ar.trigger)) {
                if (ar.type === 'text') {
                    if (ar.isFromBackup) {
                        // Text response from saved custom message
                        const customMsg = data.autoresponse[guildId]?.find(m => m.title === ar.response);
                        if (customMsg) {
                            // Reconstruct Component V2 message from saved data
                            const container = new ContainerBuilder();
                            
                            // Add title
                            const titleDisplay = new TextDisplayBuilder().setContent(`### ${customMsg.title}`);
                            container.addTextDisplayComponents(titleDisplay);
                            
                            // Add any stored content
                            if (customMsg.content) {
                                const contentDisplay = new TextDisplayBuilder().setContent(customMsg.content);
                                container.addTextDisplayComponents(contentDisplay);
                            }
                            
                            msg.reply({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
                        } else {
                            msg.reply(`<:warning:1441531830607151195> Saved message "${ar.response}" not found.`).catch(() => {});
                        }
                    } else {
                        // Plain text or JSON response - try to parse as Component V2 first
                        const isComponent = tryParseAndSendComponent(msg, ar.response);
                        if (!isComponent) {
                            msg.reply(ar.response).catch(() => {});
                        }
                    }
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
    if (!data.nickname.channelId || msg.channel.id !== data.nickname.channelId) return;

    const nickname = msg.content.trim();
    if (nickname.toLowerCase() === 'reset') {
        await msg.member.setNickname(null);
        await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:Correct:1440296238305116223> Reset' }, { type: 14, spacing: 1 }, { type: 10, content: 'Your nickname has been reset to default.' }] }], flags: 32768 });
        return;
    }

    if (data.nickname.mode === 'auto') {
        const bannedWord = containsBannedWord(nickname);
        if (bannedWord) {
            await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:Bin:1441777857205637254> Cannot Set' }, { type: 14, spacing: 1 }, { type: 10, content: `Word "**${bannedWord}**" is not allowed.` }] }], flags: 32768 });
            return;
        }

        try {
            const before = msg.member.nickname || msg.member.displayName;
            await msg.member.setNickname(nickname);
            await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: `### <:Correct:1440296238305116223> Changed To ${nickname}` }, { type: 14, spacing: 1 }, { type: 10, content: `Your previous nickname was **${before}**` }] }], flags: 32768 }).catch(() => {});
        } catch {
            await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:warning:1441531830607151195> Failed' }, { type: 14, spacing: 1 }, { type: 10, content: 'Couldn\'t change your nickname. Try again or contact a moderator.' }] }], flags: 32768 }).catch(() => {});
        }
    } else if (data.nickname.mode === 'approval') {
        const bannedWord = containsBannedWord(nickname);
        if (bannedWord) {
            await msg.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <:Bin:1441777857205637254> Cannot Set' }, { type: 14, spacing: 1 }, { type: 10, content: `Word "**${bannedWord}**" is not allowed.` }] }], flags: 32768 });
            return;
        }

        const approveBtn = new ButtonBuilder()
            .setCustomId(`approve_${msg.author.id}`)
            .setLabel('Approve')
            .setStyle(ButtonStyle.Success);

        const rejectBtn = new ButtonBuilder()
            .setCustomId(`reject_${msg.author.id}`)
            .setLabel('Reject')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(approveBtn, rejectBtn);

        const requestText = `### 📝 Nickname Request\n\n**User:** ${msg.author}\n**Requested:** "${nickname}"`;
        const textDisplay = new TextDisplayBuilder().setContent(requestText);
        const container = new ContainerBuilder()
            .addTextDisplayComponents(textDisplay)
            .addActionRowComponents(row);
        
        const requestMsg = await msg.channel.send({
            content: ' ',
            components: [container],
            flags: MessageFlags.IsComponentsV2
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
                    const approvedText = `## <:Correct:1440296238305116223> Approved\n\n${msg.author} nickname has been successfully set to **${nickname}**\n\nThe request has been approved by a moderator.`;
                    const textDisplay = new TextDisplayBuilder().setContent(approvedText);
                    const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
                    await i.update({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 });
                } catch {
                    const failedText = `## <:warning:1441531830607151195> Failed\n\nCouldn't change nickname for ${msg.author}.\n\nPlease try again or contact a moderator.`;
                    const textDisplay = new TextDisplayBuilder().setContent(failedText);
                    const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
                    await i.update({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 });
                }
            } else if (i.customId === `reject_${msg.author.id}`) {
                const rejectedText = `## <:Error:1440296241090265088> Rejected\n\n${msg.author} request has been rejected by a moderator.\n\nPlease submit a new request with a different nickname.`;
                const textDisplay = new TextDisplayBuilder().setContent(rejectedText);
                const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
                await i.update({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 });
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
    console.log(`[WELCOME] New member joined: ${member.user.tag} in guild ${guildId}`);
    
    const welcomeConfig = data.welcome[guildId];
    if (!welcomeConfig) {
        console.log(`[WELCOME] No welcome config for guild ${guildId}`);
        return;
    }
    if (!welcomeConfig.enabled) {
        console.log(`[WELCOME] Welcome disabled for guild ${guildId}`);
        return;
    }
    if (!welcomeConfig.channelId) {
        console.log(`[WELCOME] No channel ID set for guild ${guildId}`);
        return;
    }

    const delay = (typeof welcomeConfig.delay === 'number') ? welcomeConfig.delay : 120000;
    console.log(`[WELCOME] Will send welcome message after ${delay}ms delay`);

    setTimeout(async () => {
        try {
            const channel = await member.guild.channels.fetch(welcomeConfig.channelId);
            if (!channel) {
                console.error(`[WELCOME] Channel ${welcomeConfig.channelId} not found`);
                return;
            }

            const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            const welcomeText = randomMessage.replace('{user}', `<@${member.id}>`);

            await channel.send(welcomeText);
            console.log(`[WELCOME] Welcome message sent to ${channel.name}`);
        } catch (error) {
            console.error('[WELCOME] Error sending welcome message:', error.message);
        }
    }, delay);
});

// ------------------------
client.login(TOKEN);