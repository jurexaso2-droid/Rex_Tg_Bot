/**
 * VIP / Premium Management Command
 * Manage premium users (list/add/remove) — persists to json/config.json.
 */
import fs   from 'fs-extra';
import path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), 'json', 'config.json');

export const meta = {
  name: 'vip',
  version: '2.0.0',
  description: 'Manage premium (VIP) users.',
  author: 'AjiroDesu',
  prefix: 'both',
  category: 'system',
  type: 'developer',
  cooldown: 2,
  guide: [
    '(no args) - List premium users',
    'add <uid/reply> - Add premium user',
    'remove <uid/reply> - Remove premium user'
  ]
};

// --- Helpers ---

const normalizeId = (id) => {
  if (!id) return null;
  const match = String(id).match(/-?\d+/);
  return match ? match[0] : null;
};

const resolveTarget = (event, args) => {
  if (event.reply_to_message?.from?.id) return String(event.reply_to_message.from.id);
  if (args[1]) return normalizeId(args[1]);
  return null;
};

const getUserDisplay = async (bot, userId) => {
  try {
    const chat = await bot.getChat(userId);
    const name = [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.title || 'Unknown';
    const user = chat.username ? `@${chat.username}` : null;
    return user ? `${name} (${user})` : name;
  } catch {
    return 'Unknown User';
  }
};

/** Write premium list back to config.json and update in-memory config. */
async function savePremiumList(list) {
  global.Reze.config.premium = list;
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  const cfg = JSON.parse(raw);
  cfg.premium = list;
  await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

// --- Handlers ---

async function handleList(bot, response) {
  const vip = global.Reze.config.premium || [];

  if (!vip.length) {
    return response.reply('👑 **Premium (VIP) List**\n\n_No premium users configured._');
  }

  const loading = await response.reply('🔄 **Fetching premium list...**');

  const entries = await Promise.all(vip.map(async (id, index) => {
    const name = await getUserDisplay(bot, id);
    return `${index + 1}. **${name}** \`[${id}]\``;
  }));

  await response.edit('text', loading, `👑 **Premium (VIP) List**\n\n${entries.join('\n')}`);
}

async function handleModify(bot, event, args, response, action) {
  const devs     = global.Reze.config.devID || [];
  const vip      = global.Reze.config.premium || [];
  const senderId = String(event.from.id);

  if (devs.length > 0 && !devs.includes(senderId)) {
    return response.reply('⛔ **Access Denied**\nOnly developers can manage the premium list.');
  }

  const targetId = resolveTarget(event, args);
  if (!targetId) {
    return response.reply(`⚠️ **Missing Target**\nReply to a user or provide an ID.\nUsage: \`/vip ${action} <id>\``);
  }

  let updated = [...vip];
  let message = '';

  if (action === 'add') {
    if (updated.includes(targetId)) return response.reply(`ℹ️ User \`${targetId}\` is already premium.`);
    updated.push(targetId);
    message = `✅ **Premium Added**\nUser \`${targetId}\` has been granted premium privileges.`;
  } else if (action === 'remove') {
    if (!updated.includes(targetId)) return response.reply(`ℹ️ User \`${targetId}\` is not in the premium list.`);
    updated = updated.filter(id => id !== targetId);
    message = `🗑️ **Premium Removed**\nUser \`${targetId}\` has been removed.`;
  }

  try {
    await savePremiumList(updated);
    await response.reply(message);
  } catch (err) {
    await response.reply(`⚠️ **System Error**\nFailed to save: ${err.message}`);
  }
}

// --- Main ---

export async function onStart({ bot, event, args, response, usage }) {
  if (!args.length) return handleList(bot, response);

  switch (args[0].toLowerCase()) {
    case 'list': case 'ls':
      return handleList(bot, response);
    case 'add':
      return handleModify(bot, event, args, response, 'add');
    case 'remove': case 'rm': case 'del':
      return handleModify(bot, event, args, response, 'remove');
    default:
      return usage();
  }
}
