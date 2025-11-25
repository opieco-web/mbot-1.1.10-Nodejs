import { Client, GatewayIntentBits, Partials, Collection, ButtonStyle, ActionRowBuilder, ButtonBuilder, Events, PermissionsBitField, REST, Routes, SlashCommandBuilder, EmbedBuilder, MessageFlags, ActivityType, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } from 'discord.js';
import fs from 'fs';
import { createCanvas } from 'canvas';
import { allCommands } from './src/commands/index.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const BOT_NAME = packageJson.name;
const BOT_VERSION = packageJson.version;

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

// Initialize client
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

// Initialize topics when bot is ready
client.once('clientReady', async () => {
    console.log(`${client.user.tag} is online!`);
    await initializeTopics();
    
    // Keep-alive mechanism: Update activity every 30 minutes to prevent idle timeout
    setInterval(() => {
        try {
            const activities = [
                { name: 'your commands', type: 'LISTENING' },
                { name: 'Mining Bangladesh', type: 'WATCHING' },
                { name: 'Discord', type: 'PLAYING' }
            ];
            const activity = activities[Math.floor(Math.random() * activities.length)];
            client.user.setActivity(activity.name, { type: ActivityType[activity.type] }).catch(() => {});
        } catch (err) {
            console.error('Keep-alive activity update failed:', err.message);
        }
    }, 1800000); // 30 minutes
    
    console.log('✅ Keep-alive mechanism activated');
});

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

// ========================
// IMPORT MODULAR COMMANDS
// ========================
const commands = allCommands.map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

// Helper: Apply saved status
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

// BOT READY
client.once(Events.ClientReady, () => {
    console.log(`${client.user.tag} is online!`);
    applyBotStatus();
    
    // Load AFK data from storage
    if (data.afk) {
        afkUsers = { ...data.afk };
    }
});

// ========================
// DATA & GLOBAL VARIABLES
// ========================
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
function createAvatarComponent(username, defaultAvatarUrl, serverAvatarUrl = null, mode = 'both') {
    const items = [];
    let title = '';
    
    if (mode === 'server_only') {
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

// HELPER: Calculate AFK duration with smart format
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

// HELPER: Get prefix per guild
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

// ========================
// WELCOME MESSAGES (60+)
// ========================
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
    "Hey {user}! Glad you joined us — have fun!"
];

// Initialize status data
if (!data.status) data.status = { presence: 'online' };

// ========================
// ALL EVENT HANDLERS START
// ========================
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
            // Extract current page from the components
            const messageComponents = interaction.message.components[0].components;
            let currentPage = 1;
            
            // Look for page indicator in text components
            for (const comp of messageComponents) {
                if (comp.type === 17) {
                    for (const inner of comp.components) {
                        if (inner.content && inner.content.includes('Page')) {
                            const match = inner.content.match(/Page (\d+)\/3/);
                            if (match) {
                                currentPage = parseInt(match[1]);
                            }
                        }
                    }
                }
            }

            let nextPage = currentPage;
            if (customId === 'config_next' && currentPage < 3) {
                nextPage = currentPage + 1;
            } else if (customId === 'config_prev' && currentPage > 1) {
                nextPage = currentPage - 1;
            }

            const pageComponents = buildConfigPage(nextPage, guildId);
            return interaction.update({
                content: ' ',
                components: pageComponents,
                flags: 32768
            });
        }

        // Config: Approve Nickname button
        if (customId.startsWith('approve_')) {
            const userId = customId.replace('approve_', '');
            const user = await interaction.guild.members.fetch(userId);
            
            // Placeholder response - actual logic varies per command
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Approved' }] }], flags: 32768 | MessageFlags.Ephemeral });
        }

        // Config: Reject Nickname button
        if (customId.startsWith('reject_')) {
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:Error:1440296241090265088> Rejected' }] }], flags: 32768 | MessageFlags.Ephemeral });
        }
        }

        // ===== HANDLE MODAL SUBMISSIONS =====
        if (interaction.isModalSubmit()) {
            const customId = interaction.customId;

            if (customId === 'modal_set_prefix') {
                const prefixInput = interaction.fields.getTextInputValue('prefix_input');
                if (prefixInput) {
                    data.prefix = data.prefix || {};
                    data.prefix[guildId] = prefixInput;
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Prefix Updated' }, { type: 14 }, { type: 10, content: `New prefix: \`${prefixInput}\`` }] }], flags: 32768 | MessageFlags.Ephemeral });
                }
            }

            if (customId === 'modal_status_set') {
                const activityText = interaction.fields.getTextInputValue('status_activity_text');
                const streamUrl = interaction.fields.getTextInputValue('status_stream_url');
                const emoji = interaction.fields.getTextInputValue('status_emoji');

                if (activityText || streamUrl || emoji) {
                    data.status = data.status || {};
                    if (activityText) data.status.text = activityText;
                    if (streamUrl) data.status.streamUrl = streamUrl;
                    if (emoji) data.status.emoji = emoji;
                    
                    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
                    applyBotStatus();
                    return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '## <:1_yes_correct:1439893200981721140> Status Updated' }, { type: 14 }, { type: 10, content: 'Bot status has been configured.' }] }], flags: 32768 | MessageFiles.Ephemeral });
                }
            }
        }

        // ===== HANDLE SLASH COMMANDS =====
        if (!interaction.isChatInputCommand()) return;

        const { commandName, options } = interaction;

        // /afk command
        if (commandName === 'afk') {
            const note = options.getString('note') || 'AFK';
            afkUsers[interaction.user.id] = {
                reason: note,
                timestamp: Date.now()
            };
            data.afk[interaction.user.id] = afkUsers[interaction.user.id];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: '### <a:balloonpikachu:1441834282816377103> AFK Status Set' }, { type: 14, spacing: 1 }, { type: 10, content: `Status: **${note}**` }] }], flags: 32768 });
        }

        // /avatar command
        if (commandName === 'avatar') {
            const user = options.getUser('user') || interaction.user;
            const serverOption = options.getBoolean('server');
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            let mode = 'both';
            if (serverOption === true) mode = 'server_only';
            if (serverOption === false) mode = 'default_only';
            
            // Get server avatar if member has one
            const serverAvatarUrl = member && member.avatar ? member.avatarURL() : null;
            const avatarComponent = createAvatarComponent(user.username, user.displayAvatarURL(), serverAvatarUrl, mode);
            return interaction.reply(avatarComponent);
        }

        // /afklist command
        if (commandName === 'afklist') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({ content: '<:Error:1440296241090265088> You need ManageGuild permission!', flags: MessageFlags.Ephemeral });
            }
            
            const afkList = [];
            for (const [userId, afkData] of Object.entries(data.afk || {})) {
                const duration = calculateDuration(afkData.timestamp);
                afkList.push(`<@${userId}> - **${afkData.reason}** (${duration})`);
            }
            
            const listText = afkList.length > 0 
                ? afkList.join('\n')
                : 'No users are currently AFK.';
            
            return interaction.reply({ 
                content: ' ', 
                components: [{ 
                    type: 17, 
                    components: [
                        { type: 10, content: `## 😴 AFK Users (${afkList.length})` },
                        { type: 14, spacing: 1 },
                        { type: 10, content: listText }
                    ] 
                }], 
                flags: 32768 
            });
        }

        // /truthordare command
        if (commandName === 'truthordare') {
            const truths = [
                "What's your biggest secret?",
                "When was the last time you lied?",
                "What do you regret the most?",
                "What's something nobody knows about you?",
                "Who do you have a crush on?",
                "What's your biggest fear?",
                "Have you ever stolen anything?",
                "What's the most embarrassing thing that happened to you?",
                "Do you have a hidden talent?",
                "What would you do if nobody was watching?",
                "Have you ever cheated on someone?",
                "What's your darkest thought?",
                "Would you date someone shorter than you?",
                "Have you ever hurt someone intentionally?",
                "What's the rudest thing you've thought about someone?",
                "Do you believe in aliens?",
                "What's your biggest pet peeve?",
                "Have you ever been in love?",
                "What's your most controversial opinion?",
                "Would you give up your phone for a month?",
                "If you had supernatural powers, would you use them?",
                "Have you ever stalked someone on social media?",
                "What's the most embarrassing song you like?",
                "Would you change anything about your appearance?",
                "Have you ever cried watching a movie or anime?",
                "What's the biggest lie you've ever told your parents?",
                "Do you believe in ghosts?",
                "What's your biggest insecurity?",
                "Would you go back in time and change something?",
                "What's the worst advice you've ever given?",
                "Have you ever felt invisible?",
                "What's something you've done that you're really proud of?",
                "Would you rather be really popular or really smart?",
                "Have you ever failed at something important?",
                "What's the most ridiculous thing you've done for a friend?",
                "Do you prefer being alone or with people?",
                "What's a time you stood up for something?",
                "Have you ever completely changed your mind about someone?",
                "What's something you want to be better at?",
                "If you could change one person's mind, whose?",
                "What's the weirdest dream you've had?",
                "Have you ever felt misunderstood?",
                "What's something you're obsessed with?",
                "Would you rather travel or stay home?",
                "What's the kindest thing someone has done for you?",
                "Have you ever been betrayed?",
                "What's your guilty pleasure?",
                "If you could live anywhere, where?",
                "What's something you've always wanted to try?",
                "Would you sacrifice something for someone you love?",
                "What anime have you watched the most?",
                "Which anime character do you relate to the most?",
                "What's your favorite anime genre?",
                "If you could live in any anime world, which?",
                "What's the best anime opening song?",
                "Which anime made you cry?",
                "What anime do you secretly love?",
                "If you could have any anime power?",
                "What's your take on anime romance?",
                "Which anime friendship is goals?",
                "What's an overrated anime in your opinion?",
                "Which anime character would be your best friend?",
                "What anime has the best animation?",
                "If you could be reincarnated like in anime?",
                "What's your unpopular anime opinion?",
                "Which anime deserves more recognition?",
                "If anime was real, how would your life change?",
                "What's the most beautiful anime scene you've seen?",
                "Which anime has the best soundtrack?",
                "What anime made you feel things?",
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
                "If you could rewatch any anime for the first time, which?"
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
                "Tell us what you'd do with a million dollars."
            ];
            
            const tdEmojis = ['<a:cherry:1441782972486516946>', '<a:croissant:1441783019139502112>', '<a:balloonpikachu:1441834282816377103>'];
            const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
            const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
            const emoji = tdEmojis[Math.floor(Math.random() * tdEmojis.length)];
            
            return interaction.reply({ content: ' ', components: [{ type: 17, components: [{ type: 10, content: `### ${emoji} ${pick}` }, { type: 14, spacing: 1 }, { type: 10, content: question }] }], flags: 32768 });
        }

        // /coinflip command
        if (commandName === 'coinflip') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            const emoji = result === 'Heads' ? '<a:cherry:1441782972486516946>' : '<a:croissant:1441783019139502112>';
            return interaction.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: `### ${emoji} Coin Flip` },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**${result}**` }
                    ]
                }],
                flags: 32768
            });
        }

        // /choose command
        if (commandName === 'choose') {
            const subjectA = options.getString('a');
            const subjectB = options.getString('b');
            const subjectC = options.getString('c');
            
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
            const statusData = data.status || {};
            
            let pageComponents = [];
            
            if (pageNum === 1) {
                // Page 1: Prefix & Basic Settings
                pageComponents = [{
                    type: 17,
                    components: [
                        { type: 10, content: '## ⚙️ Bot Configuration' },
                        { type: 10, content: '**Page 1/3 - Prefix & Settings**' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**Current Prefix:** \`${prefix}\`\n**Nickname Mode:** ${data.nickname.mode || '❌ Not Set'}\n**Server:** ${interaction.guild.name}` },
                        { type: 14, spacing: 1 },
                        { type: 1, components: [
                            { type: 2, style: 1, label: 'Set Prefix', custom_id: 'config_set_prefix' }
                        ] },
                        { type: 1, components: [
                            { type: 2, style: 2, label: '← Previous', custom_id: 'config_prev' },
                            { type: 2, style: 1, label: 'Bot Status →', custom_id: 'config_next' }
                        ] }
                    ]
                }];
            } else if (pageNum === 2) {
                // Page 2: FULLY CUSTOMIZABLE BOT STATUS
                const activityTypes = ['Playing', 'Listening', 'Watching', 'Competing', 'Streaming'];
                const presenceOptions = ['online', 'idle', 'dnd', 'invisible'];
                
                pageComponents = [{
                    type: 17,
                    components: [
                        { type: 10, content: '## 🎮 Bot Status (Fully Customizable)' },
                        { type: 10, content: '**Page 2/3 - Activity & Presence**' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**Current Activity:** ${statusData.type || '❌ Not Set'}\n**Activity Text:** ${statusData.text || '(none)'}\n**Emoji:** ${statusData.emoji || '(none)'}\n**Presence:** ${statusData.presence || 'online'}` },
                        { type: 14, spacing: 1 },
                        { type: 1, components: [
                            { type: 3, custom_id: 'config_activity_type', placeholder: 'Choose activity type', options: activityTypes.map(t => ({ label: t, value: t })) }
                        ] },
                        { type: 1, components: [
                            { type: 3, custom_id: 'config_online_status', placeholder: 'Choose presence', options: presenceOptions.map(p => ({ label: p === 'dnd' ? 'Do Not Disturb' : p.charAt(0).toUpperCase() + p.slice(1), value: p })) }
                        ] },
                        { type: 1, components: [
                            { type: 2, style: 1, label: '✏️ Customize', custom_id: 'config_status_set' },
                            { type: 2, style: 4, label: '🔄 Reset', custom_id: 'config_status_reset' }
                        ] },
                        { type: 1, components: [
                            { type: 2, style: 2, label: '← Settings', custom_id: 'config_prev' },
                            { type: 2, style: 1, label: 'More →', custom_id: 'config_next' }
                        ] }
                    ]
                }];
            } else if (pageNum === 3) {
                // Page 3: Server Profile & Welcome
                pageComponents = [{
                    type: 17,
                    components: [
                        { type: 10, content: '## 🎨 Server Profile & Welcome' },
                        { type: 10, content: '**Page 3/3 - Welcome System**' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**Welcome:** ${data.welcome[guildId]?.enabled ? '✅ Enabled' : '❌ Disabled'}\n**Channel:** ${data.welcome[guildId]?.channelId ? `<#${data.welcome[guildId].channelId}>` : 'Not set'}\n**Delay:** ${data.welcome[guildId]?.delay ? Math.round(data.welcome[guildId].delay / 1000) + 's' : '120s'}` },
                        { type: 14, spacing: 1 },
                        { type: 1, components: [
                            { type: 2, style: 1, label: '📧 Setup Welcome', custom_id: 'config_welcome_setup' }
                        ] },
                        { type: 1, components: [
                            { type: 2, style: 2, label: '← Status', custom_id: 'config_prev' }
                        ] }
                    ]
                }];
            }
            
            return pageComponents;
        }

        // /config command
        if (commandName === 'config') {
            const pageComponents = buildConfigPage(1, guildId);
            return interaction.reply({
                content: ' ',
                components: pageComponents,
                flags: 32768
            });
        }

        // Fallback for any unhandled commands
        return interaction.reply({ content: 'Command not yet implemented!', flags: MessageFlags.Ephemeral });

    } catch (error) {
        console.error('Interaction handler error:', error);
        return interaction.reply({ content: 'Error processing command', flags: MessageFlags.Ephemeral }).catch(() => {});
    }
});

// ========================
// MESSAGE EVENTS (AFK, Prefix Commands, Auto-responses)
// ========================
client.on(Events.MessageCreate, async msg => {
    if (msg.author.bot) return;
    if (!msg.guild) return;

    const guildId = msg.guild.id;
    const prefix = getPrefix(guildId);

    // Check if user is AFK and remove status when they send a message
    if (data.afk && data.afk[msg.author.id]) {
        delete data.afk[msg.author.id];
        delete afkUsers[msg.author.id];
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
        
        await msg.reply({
            content: ' ',
            components: [{
                type: 17,
                components: [
                    { type: 10, content: '### <:Correct:1440296238305116223> Welcome Back!' },
                    { type: 14, spacing: 1 },
                    { type: 10, content: 'Your AFK status has been removed.' }
                ]
            }],
            flags: 32768
        }).catch(() => {});
    }

    // Check if anyone mentioned is AFK
    if (msg.mentions && msg.mentions.size > 0) {
        for (const mentionedUser of msg.mentions.values()) {
            if (data.afk && data.afk[mentionedUser.id]) {
                const afkInfo = data.afk[mentionedUser.id];
                const duration = calculateDuration(afkInfo.timestamp);
                
                await msg.reply({
                    content: ' ',
                    components: [{
                        type: 17,
                        components: [
                            { type: 10, content: `### 😴 ${mentionedUser.username} is AFK` },
                            { type: 14, spacing: 1 },
                            { type: 10, content: `**Reason:** ${afkInfo.reason}` },
                            { type: 10, content: `**Away for:** ${duration}` }
                        ]
                    }],
                    flags: 32768
                }).catch(() => {});
            }
        }
    }

    // Prefix commands
    if (msg.content.startsWith(prefix)) {
        const args = msg.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        // !afk command
        if (cmd === 'afk') {
            const reason = args.join(' ') || 'AFK';
            afkUsers[msg.author.id] = { reason, timestamp: Date.now() };
            data.afk[msg.author.id] = afkUsers[msg.author.id];
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
            
            return msg.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: '### <a:balloonpikachu:1441834282816377103> AFK Status Set' },
                        { type: 14, spacing: 1 },
                        { type: 10, content: `**${reason}**` }
                    ]
                }],
                flags: 32768
            }).catch(() => {});
        }

        // !av command (avatar prefix commands)
        if (cmd === 'av') {
            let user = msg.author;
            let mode = 'server_only'; // default for !av is server avatar only
            
            // Parse arguments: !av, !av df, !av @user, !av @user df
            if (args.length > 0) {
                if (args[0] === 'df') {
                    // !av df - your default account avatar
                    mode = 'default_only';
                } else if (msg.mentions.size > 0) {
                    // !av @user or !av @user df
                    user = msg.mentions.first();
                    if (args[1] === 'df') {
                        // !av @user df - user default account avatar
                        mode = 'default_only';
                    } else {
                        // !av @user - user specific server avatar
                        mode = 'server_only';
                    }
                }
            }
            
            // Get server avatar if member has one
            const member = await msg.guild.members.fetch(user.id).catch(() => null);
            const serverAvatarUrl = member && member.avatar ? member.avatarURL() : null;
            const avatarComponent = createAvatarComponent(user.username, user.displayAvatarURL(), serverAvatarUrl, mode);
            return msg.reply(avatarComponent).catch(() => {});
        }

        // !td command (truthordare)
        if (cmd === 'td') {
            const truths = [
                "What's your biggest secret?",
                "When was the last time you lied?",
                "What do you regret the most?"
            ];
            const dares = [
                "Describe your favorite movie without using the title.",
                "Tell us about a conspiracy theory you find interesting."
            ];
            
            const pick = Math.random() < 0.5 ? 'Truth' : 'Dare';
            const question = pick === 'Truth' ? truths[Math.floor(Math.random()*truths.length)] : dares[Math.floor(Math.random()*dares.length)];
            
            return msg.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: `### ${pick}` },
                        { type: 14, spacing: 1 },
                        { type: 10, content: question }
                    ]
                }],
                flags: 32768
            }).catch(() => {});
        }

        // !cf command (coinflip)
        if (cmd === 'cf') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            return msg.reply({
                content: ' ',
                components: [{
                    type: 17,
                    components: [
                        { type: 10, content: `### ${result}` }
                    ]
                }],
                flags: 32768
            }).catch(() => {});
        }
    }

    // ----- Auto-response triggers -----
    if (data.autoresponse[guildId]) {
        for (const ar of data.autoresponse[guildId]) {
            if (msg.content.includes(ar.trigger)) {
                if (ar.type === 'text') {
                    const isComponent = tryParseAndSendComponent(msg, ar.response);
                    if (!isComponent) {
                        msg.reply(ar.response).catch(() => {});
                    }
                } else if (ar.type === 'react') {
                    msg.react(ar.response).catch(() => {});
                }
            }
        }
    }
});

// ========================
// NICKNAME MESSAGE HANDLER
// ========================
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

// ========================
// GUILD MEMBER ADD (WELCOME SYSTEM)
// ========================
client.on(Events.GuildMemberAdd, async member => {
    const guildId = member.guild.id;
    
    const welcomeConfig = data.welcome[guildId];
    if (!welcomeConfig || !welcomeConfig.enabled || !welcomeConfig.channelId) {
        return;
    }

    const delay = (typeof welcomeConfig.delay === 'number') ? welcomeConfig.delay : 120000;

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
    }, delay);
});

// ========================
client.login(TOKEN);
