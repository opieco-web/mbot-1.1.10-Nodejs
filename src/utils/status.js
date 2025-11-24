import { ActivityType } from 'discord.js';

export function applyBotStatus(client, data) {
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
