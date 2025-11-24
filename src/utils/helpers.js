import { EmbedBuilder, MessageFlags } from 'discord.js';

export function checkAndWarnCooldown(userId, commandName, cooldownMs = 5000, commandCooldowns) {
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

export function calculateDuration(time) {
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

export function formatUptime(time) {
    const now = Date.now();
    const diffMs = now - time;
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${days}d ${hours}h ${mins}m`;
}

export function getPrefix(guildId, data, defaultPrefix = '!') {
    return data.prefix[guildId] || defaultPrefix;
}

export function containsBannedWord(nickname, data) {
    const lowerNickname = nickname.toLowerCase();
    for (const word of data.nickname.filter) {
        if (lowerNickname.includes(word.toLowerCase())) {
            return word;
        }
    }
    return null;
}

export function parseDelayString(delayStr) {
    if (!delayStr) return 120000;
    
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

export function createModeratorEmbed(title, description, color = 0x2F3136) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);
}

export function tryParseAndSendComponent(msg, responseText, { ContainerBuilder, TextDisplayBuilder, MessageFlags }) {
    try {
        const jsonData = JSON.parse(responseText);
        
        if (jsonData.components && Array.isArray(jsonData.components)) {
            msg.reply({ content: ' ', components: jsonData.components, flags: MessageFlags.IsComponentsV2 }).catch(() => {});
            return true;
        }
        
        const container = new ContainerBuilder();
        
        if (jsonData.text) {
            const textDisplay = new TextDisplayBuilder().setContent(jsonData.text);
            container.addTextDisplayComponents(textDisplay);
        }
        
        if (jsonData.separator === true) {
            container.addComponent({ type: 14, spacing: 1 });
        }
        
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
        
        if (jsonData.text || jsonData.separator === true || jsonData.blocks) {
            msg.reply({ content: ' ', components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
            return true;
        }
        
        return false;
    } catch (e) {
        return false;
    }
}
