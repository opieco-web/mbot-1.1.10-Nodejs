import { nicknameCommands } from './nickname.js';
import { funCommands } from './fun.js';
import { moderationCommands } from './moderation.js';
import { utilityCommands } from './utility.js';
import { configCommand } from './config.js';
import { musicCommands } from './music.js';

export const allCommands = [
    ...nicknameCommands,
    ...funCommands,
    ...moderationCommands,
    ...utilityCommands,
    ...configCommand,
    ...musicCommands
];
