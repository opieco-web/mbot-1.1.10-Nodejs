import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'data.json');

export function loadData() {
    let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    
    data.prefixes = data.prefixes || {};
    data.autoresponses = data.autoresponses || {};
    data.status = data.status || {};
    data.welcome = data.welcome || {};
    data.afk = data.afk || {};
    data.nickname = data.nickname || { filter: [] };
    data.nickname.filter = data.nickname.filter || [];
    data.autoresponse = data.autoresponse || {};
    
    return { data, dataFile };
}

export function initializeTopics(client, data, dataFile, welcomeMessages) {
    return async function() {
        for (const [topicName, topicData] of Object.entries(data.topics || {})) {
            if (topicData && topicData.channelId && topicData.messageId && !topicData.content) {
                try {
                    let channel = await client.channels.fetch(topicData.channelId);
                    
                    if (topicData.threadId && channel.threads) {
                        channel = await channel.threads.fetch(topicData.threadId);
                    }
                    
                    if (channel && channel.isTextBased()) {
                        const message = await channel.messages.fetch(topicData.messageId);
                        
                        let content = message.content || '';
                        
                        if (!content && message.embeds && message.embeds.length > 0) {
                            const embed = message.embeds[0];
                            const parts = [];
                            if (embed.title) parts.push(embed.title);
                            if (embed.description) parts.push(embed.description);
                            content = parts.join('\n\n');
                        }
                        
                        data.topics[topicName].content = content || '[Component V2 Message - See full message for formatted content]';
                        data.topics[topicName].link = `https://discord.com/channels/${message.guildId}/${topicData.channelId}/${topicData.messageId}`;
                    }
                } catch (err) {
                    console.error(`Failed to fetch topic "${topicName}":`, err.message);
                }
            }
        }
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    };
}
