const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

// Replace all interaction.reply with type 17 containers
let fixed = content
  .replace(/await interaction\.reply\(\{\s*content: ' ',\s*components: \[\{\s*type: 17,/g, 'return v2Reply(interaction, { content: \'\', components: [{')
  .replace(/return interaction\.reply\(\{\s*content: ' ',\s*components: \[\{\s*type: 17,/g, 'return v2Reply(interaction, { content: \'\', components: [{');

// Fix flags: 32768 | MessageFlags.Ephemeral -> flags: 64
fixed = fixed.replace(/flags: 32768 \| MessageFlags\.Ephemeral/g, 'flags: 64');

// Fix remaining flags: 32768 -> flags: 64
fixed = fixed.replace(/flags: 32768/g, 'flags: 64');

// Fix v2Reply calls that have closing pattern
fixed = fixed.replace(/\]\}\]\),/g, ']}),');

fs.writeFileSync('index.js', fixed);
console.log('✅ Fixed all v2Reply patterns');
