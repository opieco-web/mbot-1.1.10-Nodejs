import { SlashCommandBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder } from 'discord.js';

// Setup page content
const setupContent = {
  1: {
    title: '# Set Up Menu',
    description: 'Choose what to configure:\n\n**Welcome Setup** - Page 2\nConfigure randomized welcome messages and temporary message settings\n\n**Nickname Setup** - Page 3\nConfigure blocklist and nickname channels with auto/approval modes'
  },
  2: {
    title: '# Welcome Setup',
    description: 'Page 2 of 3\n\n**Randomized Messages** - 100+ different welcome messages\n**Temporary Messages** - Set time-based messages for specific channels'
  },
  3: {
    title: '# Nickname Setup',
    description: 'Page 3 of 3 (Final)\n\n**Blocklist** - Manage banned words/phrases\n**Channels & Mode** - Set nickname channel with automatic or approval mode'
  }
};

export const setupCommand = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Start the server configuration wizard (Menu → Welcome → Nickname)')
];

export function getSetupPage(pageNum) {
  const page = pageNum || 1;
  const content = setupContent[page] || setupContent[1];
  
  // Build buttons
  const buttons = new ActionRowBuilder();
  
  if (page > 1) {
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId('setup_page_prev_' + page)
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)
    );
  }
  
  if (page < 3) {
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId('setup_page_next_' + page)
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
    );
  } else {
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId('setup_page_save_3')
        .setLabel('Save & Complete')
        .setStyle(ButtonStyle.Success)
    );
  }
  
  // Build channel selector for specific pages
  const components = [buttons];
  
  if (page === 2) {
    const welcomeSelectors = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup_welcome_randomized_channel')
        .setPlaceholder('Select channel for randomized messages')
    );
    components.push(welcomeSelectors);
  }
  
  if (page === 3) {
    const nicknameSelectors = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId('setup_nickname_channel_select')
        .setPlaceholder('Select channel for nickname requests')
    );
    components.push(nicknameSelectors);
  }
  
  return {
    content: `${content.title}\n\n${content.description}`,
    components: components,
    flags: MessageFlags.Ephemeral
  };
}

export function handleSetupInteraction(customId) {
  if (customId === 'setup_page_next_1') return { nextPage: 2 };
  if (customId === 'setup_page_next_2') return { nextPage: 3 };
  if (customId === 'setup_page_prev_2') return { nextPage: 1 };
  if (customId === 'setup_page_prev_3') return { nextPage: 2 };
  if (customId === 'setup_page_save_3') return { save: true };
  
  return null;
}
