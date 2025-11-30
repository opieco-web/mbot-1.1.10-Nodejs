import { nicknameCommands } from './nickname.js';
import { funCommands } from './fun.js';
import { moderationCommands } from './moderation.js';
import { utilityCommands } from './utility.js';
import { configCommand } from './config.js';
import { rolesConnection } from './rolesConnection.js';
import { roleInfo } from './roleInfo.js';
import { roleManage } from './roleManage.js';
import { roleBulk } from './roleBulk.js';

export const allCommands = [
    ...nicknameCommands,
    ...funCommands,
    ...moderationCommands,
    ...utilityCommands,
    ...configCommand,
    rolesConnection,
    roleInfo,
    roleManage,
    roleBulk
];
