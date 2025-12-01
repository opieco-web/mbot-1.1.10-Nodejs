import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export const moderationCommands = [
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
                .setDescription('Response type: text = custom message, emoji = react with emoji (required for add)')
                .setRequired(false)
                .addChoices(
                    { name: 'text', value: 'text' },
                    { name: 'emoji', value: 'emoji' }
                ))
        .addStringOption(option =>
            option
                .setName('response')
                .setDescription('For text: write custom response | For emoji: reaction emoji')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('select_from_backup')
                .setDescription('For text type: select a saved custom message instead of typing')
                .setRequired(false)
                .setAutocomplete(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

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

    new SlashCommandBuilder()
        .setName('afklist')
        .setDescription('View all AFK users (mod only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a formatted message using Component V2 container (mod only)')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Title for the message (shown as heading)')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('content')
                .setDescription('Message content (optional)')
                .setRequired(false))
        .addAttachmentOption(option =>
            option
                .setName('thumbnail')
                .setDescription('Select media file for thumbnail (optional)')
                .setRequired(false))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Target channel to send message to (optional, defaults to current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    new SlashCommandBuilder()
        .setName('blacklist-system')
        .setDescription('Configure blacklist system (mod only)')
        .addBooleanOption(option =>
            option
                .setName('enabled')
                .setDescription('Enable or disable the blacklist system')
                .setRequired(true))
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Select the role to assign to blacklisted users')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Add a user to the blacklist (mod only)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to add to blacklist')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild),

    new SlashCommandBuilder()
        .setName('blacklist-moderators')
        .setDescription('Configure troll boss roles for !bkl prefix command (admin only)')
        .addStringOption(option =>
            option
                .setName('action')
                .setDescription('Add or remove a role')
                .setRequired(true)
                .addChoices(
                    { name: 'Add Role', value: 'add' },
                    { name: 'Remove Role', value: 'remove' }
                ))
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The troll boss role to add or remove')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
];
