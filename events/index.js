import { Events } from 'discord.js';
import { handleReady, handleDisconnect, handleError, handleWarn } from './ready.js';

export function setupEvents(client, handlers) {
    const { applyBotStatus } = handlers;
    
    // Ready event
    handleReady(client, applyBotStatus);
    
    // Disconnection event
    client.on('disconnect', handleDisconnect());
    
    // Error event
    client.on('error', handleError());
    
    // Warning event
    client.on('warn', handleWarn());
}
