import { SlashCommandBuilder } from 'discord.js';

// Toggle button states per session
export const toggleStates = new Map();

// Setup Wizard Pages - Direct JSON structure ready to use
const setupPages = {
  1: [
    {
      "type": 10,
      "content": "# <:Lines3:1443008801509740646> Set Up Menu"
    },
    {
      "type": 14
    },
    {
      "type": 10,
      "content": "### <:20251126_151801:1443168966678810734> Welcome Setup\non page 2  •  Status: <status_welcome>"
    },
    {
      "type": 14
    },
    {
      "type": 10,
      "content": "### <:20251126_151801:1443168966678810734> Nickname Setup\non page 3  •  Status: <status_nickname>"
    },
    {
      "type": 14
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "Continue",
          "emoji": {
            "id": "1442984948305887362",
            "name": "Page",
            "animated": false
          },
          "custom_id": "setup_page_next_1"
        }
      ]
    }
  ],
  2: [
    {
      "type": 10,
      "content": "# <:Settings:1442984189073821776> Welcome Setup"
    },
    {
      "type": 14
    },
    {
      "type": 10,
      "content": "<:Page:1442984948305887362> page 2/3\nStatus: <status_welcome>"
    },
    {
      "type": 14
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "## Randomized\n-# More than 100 different messages will welcome you within a specific channel."
        }
      ],
      "accessory": {
        "style": 1,
        "type": 2,
        "label": "Enable/Disable",
        "custom_id": "setup_welcome_randomized_toggle"
      }
    },
    {
      "type": 1,
      "components": [
        {
          "type": 8,
          "custom_id": "setup_welcome_randomized_channel",
          "min_values": 1,
          "max_values": 1,
          "placeholder": "Select channel"
        }
      ]
    },
    {
      "type": 14
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "## Temporary \n-# It is possible to set the time for the welcome message to appear in one or more channels."
        }
      ],
      "accessory": {
        "style": 1,
        "type": 2,
        "label": "Enable/Disable",
        "custom_id": "setup_welcome_temporary_toggle"
      }
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "Customized",
          "emoji": {
            "id": "1443156335809007697",
            "name": "editmessage",
            "animated": false
          },
          "custom_id": "setup_welcome_customized"
        },
        {
          "style": 2,
          "type": 2,
          "label": "Randomized",
          "emoji": {
            "id": "1443156329068888105",
            "name": "notificationsettings1",
            "animated": false
          },
          "custom_id": "setup_welcome_randomized"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 8,
          "custom_id": "setup_welcome_temporary_channel",
          "min_values": 1,
          "max_values": 1,
          "placeholder": "Select channel"
        }
      ]
    },
    {
      "type": 14
    },
    {
      "type": 1,
      "components": [
        {
          "style": 1,
          "type": 2,
          "label": "◀ Previous",
          "custom_id": "setup_page_prev_2"
        },
        {
          "style": 3,
          "type": 2,
          "label": "Next ▶",
          "custom_id": "setup_page_next_2"
        }
      ]
    }
  ],
  3: [
    {
      "type": 10,
      "content": "# <:Settings:1442984189073821776> Nickname Setup"
    },
    {
      "type": 14
    },
    {
      "type": 10,
      "content": "<:Page:1442984948305887362> page 3/3\nStatus: <status_nickname>"
    },
    {
      "type": 14
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "## Blocklist \n-# You can see all the lists of words that have been banned and there is also an option to turn it off or on."
        }
      ],
      "accessory": {
        "style": 1,
        "type": 2,
        "label": "Enable/Disable",
        "custom_id": "setup_nickname_blocklist_toggle"
      }
    },
    {
      "type": 1,
      "components": [
        {
          "type": 3,
          "custom_id": "setup_nickname_blocklist_action",
          "options": [
            {
              "label": "Add",
              "value": "add",
              "emoji": {
                "id": "1443156335809007697",
                "name": "editmessage",
                "animated": false
              }
            },
            {
              "label": "Remove",
              "value": "remove",
              "emoji": {
                "id": "1441777857205637254",
                "name": "Bin",
                "animated": false
              }
            },
            {
              "label": "List",
              "value": "list",
              "emoji": {
                "id": "1443156338011017317",
                "name": "1780channelbrowse",
                "animated": false
              }
            }
          ],
          "placeholder": "Blocklist Actions",
          "min_values": 1,
          "max_values": 1
        }
      ]
    },
    {
      "type": 14
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "## Channels & Mode\n-# You can add a nickname setup within a specific channel in either automatic or approval mode."
        }
      ],
      "accessory": {
        "style": 1,
        "type": 2,
        "label": "Enable/Disable",
        "custom_id": "setup_nickname_channel_toggle"
      }
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "Automatic",
          "emoji": {
            "id": "1443167979725520938",
            "name": "accountswitchwhite",
            "animated": false
          },
          "custom_id": "setup_nickname_auto_mode"
        },
        {
          "style": 2,
          "type": 2,
          "label": "Approval",
          "emoji": {
            "id": "1443167987422199913",
            "name": "markasreadwhite",
            "animated": false
          },
          "custom_id": "setup_nickname_approval_mode"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 8,
          "custom_id": "setup_nickname_channel_select",
          "min_values": 1,
          "max_values": 1,
          "placeholder": "Select channel"
        }
      ]
    },
    {
      "type": 14
    },
    {
      "type": 1,
      "components": [
        {
          "style": 1,
          "type": 2,
          "label": "◀ Previous",
          "custom_id": "setup_page_prev_3"
        },
        {
          "style": 3,
          "type": 2,
          "label": "Save & Complete",
          "custom_id": "setup_page_save_3",
          "emoji": {
            "id": "1440296238305116223",
            "name": "Correct",
            "animated": false
          }
        }
      ]
    }
  ]
};

export const setupCommand = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Start the server configuration wizard (Menu → Welcome → Nickname)')
];

export function getSetupPage(pageNum, userId) {
  const page = setupPages[pageNum] || setupPages[1];
  const userState = toggleStates.get(userId) || {};
  
  // Replace status placeholders with actual status
  const welcomeStatus = userState.welcome_enabled ? '✅ active' : '❌ inactive';
  const nicknameStatus = userState.nickname_enabled ? '✅ active' : '❌ inactive';
  
  return JSON.parse(JSON.stringify(page)).map(component => {
    if (component.type === 10 && component.content) {
      component.content = component.content
        .replace('<status_welcome>', welcomeStatus)
        .replace('<status_nickname>', nicknameStatus);
    }
    return component;
  });
}

export function handleSetupInteraction(customId) {
  // Navigation
  if (customId === 'setup_page_next_1') return { action: 'navigate', nextPage: 2 };
  if (customId === 'setup_page_next_2') return { action: 'navigate', nextPage: 3 };
  if (customId === 'setup_page_prev_2') return { action: 'navigate', nextPage: 1 };
  if (customId === 'setup_page_prev_3') return { action: 'navigate', nextPage: 2 };
  if (customId === 'setup_page_save_3') return { action: 'save' };
  
  // Toggles - all toggle interactions are valid
  if (customId.includes('_toggle')) return { action: 'toggle', toggleId: customId };
  
  // Mode selections
  if (customId === 'setup_nickname_auto_mode') return { action: 'mode', mode: 'auto' };
  if (customId === 'setup_nickname_approval_mode') return { action: 'mode', mode: 'approval' };
  if (customId === 'setup_welcome_customized') return { action: 'welcome_type', type: 'customized' };
  if (customId === 'setup_welcome_randomized') return { action: 'welcome_type', type: 'randomized' };
  
  // All other interactions are valid (dropdowns, etc)
  return { action: 'interaction', customId };
}

export function toggleFeature(userId, toggleId) {
  const userState = toggleStates.get(userId) || {};
  
  if (toggleId === 'setup_welcome_randomized_toggle') {
    userState.welcome_randomized = !userState.welcome_randomized;
    if (!userState.welcome_randomized && !userState.welcome_temporary) {
      userState.welcome_enabled = false;
    } else if (userState.welcome_randomized || userState.welcome_temporary) {
      userState.welcome_enabled = true;
    }
  } else if (toggleId === 'setup_welcome_temporary_toggle') {
    userState.welcome_temporary = !userState.welcome_temporary;
    if (!userState.welcome_temporary && !userState.welcome_randomized) {
      userState.welcome_enabled = false;
    } else if (userState.welcome_temporary || userState.welcome_randomized) {
      userState.welcome_enabled = true;
    }
  } else if (toggleId === 'setup_nickname_blocklist_toggle') {
    userState.nickname_blocklist = !userState.nickname_blocklist;
    userState.nickname_enabled = userState.nickname_blocklist || userState.nickname_channel;
  } else if (toggleId === 'setup_nickname_channel_toggle') {
    userState.nickname_channel = !userState.nickname_channel;
    userState.nickname_enabled = userState.nickname_blocklist || userState.nickname_channel;
  }
  
  toggleStates.set(userId, userState);
  return userState;
}
