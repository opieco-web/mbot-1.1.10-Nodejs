import { Events } from 'discord.js';

export function handleReady(client, applyBotStatus) {
    client.once(Events.ClientReady, () => {
        console.log(`${client.user.tag} is online!`);
        applyBotStatus();
        
        // Keep-alive mechanism: Update activity every 30 minutes to prevent idle timeout
        setInterval(() => {
            try {
                const { ActivityType } = require('discord.js');
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
}

export function handleDisconnect() {
    return () => {
        console.log('⚠️ Bot disconnected, attempting to reconnect...');
    };
}

export function handleError() {
    return (error) => {
        console.error('❌ Discord client error:', error);
    };
}

export function handleWarn() {
    return (info) => {
        console.warn('⚠️ Discord warning:', info);
    };
}
