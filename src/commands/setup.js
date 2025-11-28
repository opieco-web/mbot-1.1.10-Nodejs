import { SlashCommandBuilder } from 'discord.js';

// Toggle button states per session
export const toggleStates = new Map();

// Setup Wizard Pages - Direct JSON structure ready to use
const setupPagesBase = {
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
      "type": 10,
      "content": "## Random Welcome Messages\nBot automatically sends random welcome messages"
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "-# Bot sends 100+ different random messages in your channel when users join"
        }
      ],
      "accessory": "toggle_welcome_randomized"
    },
    {
      "type": 1,
      "components": [
        {
          "type": 8,
          "custom_id": "setup_welcome_randomized_channel",
          "min_values": 1,
          "max_values": 1,
          "placeholder": "Pick 1 channel for random messages"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "When to Send",
          "emoji": {
            "id": "1443156335809007697",
            "name": "editmessage",
            "animated": false
          },
          "custom_id": "setup_welcome_randomized_delay_btn"
        }
      ]
    },
    {
      "type": 14
    },
    {
      "type": 10,
      "content": "## Temporary Welcome Messages\nMessages that auto-delete after time"
    },
    {
      "type": 9,
      "components": [
        {
          "type": 10,
          "content": "-# Send custom message or random message, then auto-delete in multiple channels"
        }
      ],
      "accessory": "toggle_welcome_temporary"
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "Custom Message",
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
          "label": "Random Message",
          "emoji": {
            "id": "1443156329068888105",
            "name": "notificationsettings1",
            "animated": false
          },
          "custom_id": "setup_welcome_randomized_type"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "type": 8,
          "custom_id": "setup_welcome_temporary_channels",
          "min_values": 1,
          "max_values": 5,
          "placeholder": "Pick channels (up to 5)"
        }
      ]
    },
    {
      "type": 1,
      "components": [
        {
          "style": 2,
          "type": 2,
          "label": "When to Send",
          "emoji": {
            "id": "1443156335809007697",
            "name": "editmessage",
            "animated": false
          },
          "custom_id": "setup_welcome_temporary_delay_btn"
        },
        {
          "style": 2,
          "type": 2,
          "label": "When to Delete",
          "emoji": {
            "id": "1441777857205637254",
            "name": "Bin",
            "animated": false
          },
          "custom_id": "setup_welcome_temporary_delete_time_btn"
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
      "accessory": "toggle_nickname_blocklist"
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
      "accessory": "toggle_nickname_channel"
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
            "name": "Success",
            "animated": false
          }
        }
      ]
    }
  ]
};

function buildToggleButton(toggleId, isEnabled) {
  if (isEnabled) {
    return {
      "style": 3,
      "type": 2,
      "label": "Disable",
      "emoji": {
        "id": "1440296241090265088",
        "name": "Error",
        "animated": false
      },
      "custom_id": toggleId
    };
  } else {
    return {
      "style": 2,
      "type": 2,
      "label": "Enable",
      "emoji": {
        "id": "1440296238305116223",
        "name": "Success",
        "animated": false
      },
      "custom_id": toggleId
    };
  }
}

export const setupCommand = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Start the server configuration wizard (Menu → Welcome → Nickname)')
];

export function getSetupPage(pageNum, userId) {
  const page = setupPagesBase[pageNum] || setupPagesBase[1];
  const userState = toggleStates.get(userId) || {};
  
  // Deep clone the page
  let components = JSON.parse(JSON.stringify(page));
  
  // Replace status placeholders with actual status
  const welcomeStatus = userState.welcome_enabled ? '✅ active' : '❌ inactive';
  const nicknameStatus = userState.nickname_enabled ? '✅ active' : '❌ inactive';
  
  components = components.map(component => {
    if (component.type === 10 && component.content) {
      component.content = component.content
        .replace('<status_welcome>', welcomeStatus)
        .replace('<status_nickname>', nicknameStatus);
    }
    
    // Replace toggle accessory placeholders with actual toggle buttons
    if (component.type === 9 && component.accessory && typeof component.accessory === 'string') {
      const toggleId = component.accessory;
      let isEnabled = false;
      
      if (toggleId === 'toggle_welcome_randomized') isEnabled = userState.welcome_randomized || false;
      else if (toggleId === 'toggle_welcome_temporary') isEnabled = userState.welcome_temporary || false;
      else if (toggleId === 'toggle_nickname_blocklist') isEnabled = userState.nickname_blocklist || false;
      else if (toggleId === 'toggle_nickname_channel') isEnabled = userState.nickname_channel || false;
      
      component.accessory = buildToggleButton(toggleId, isEnabled);
    }
    
    return component;
  });
  
  return components;
}

export function handleSetupInteraction(customId) {
  // Navigation
  if (customId === 'setup_page_next_1') return { action: 'navigate', nextPage: 2 };
  if (customId === 'setup_page_next_2') return { action: 'navigate', nextPage: 3 };
  if (customId === 'setup_page_prev_2') return { action: 'navigate', nextPage: 1 };
  if (customId === 'setup_page_prev_3') return { action: 'navigate', nextPage: 2 };
  if (customId === 'setup_page_save_3') return { action: 'save' };
  
  // Toggles - all toggle interactions are valid
  if (customId.startsWith('toggle_')) return { action: 'toggle', toggleId: customId };
  
  // Mode selections
  if (customId === 'setup_nickname_auto_mode') return { action: 'mode', mode: 'auto' };
  if (customId === 'setup_nickname_approval_mode') return { action: 'mode', mode: 'approval' };
  if (customId === 'setup_welcome_customized') return { action: 'welcome_type', type: 'customized' };
  if (customId === 'setup_welcome_randomized_type') return { action: 'welcome_type', type: 'randomized' };
  
  // All other interactions are valid (dropdowns, text inputs, etc)
  return { action: 'interaction', customId };
}

export function toggleFeature(userId, toggleId) {
  const userState = toggleStates.get(userId) || {};
  
  if (toggleId === 'toggle_welcome_randomized') {
    userState.welcome_randomized = !userState.welcome_randomized;
    userState.welcome_enabled = userState.welcome_randomized || userState.welcome_temporary;
  } else if (toggleId === 'toggle_welcome_temporary') {
    userState.welcome_temporary = !userState.welcome_temporary;
    userState.welcome_enabled = userState.welcome_temporary || userState.welcome_randomized;
  } else if (toggleId === 'toggle_nickname_blocklist') {
    userState.nickname_blocklist = !userState.nickname_blocklist;
    userState.nickname_enabled = userState.nickname_blocklist || userState.nickname_channel;
  } else if (toggleId === 'toggle_nickname_channel') {
    userState.nickname_channel = !userState.nickname_channel;
    userState.nickname_enabled = userState.nickname_blocklist || userState.nickname_channel;
  }
  
  toggleStates.set(userId, userState);
  return userState;
}
