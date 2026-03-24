/**
 * Token Management Command
 * Hot-add or hot-remove bot tokens without restarting Reze.
 * Restricted to private chat / developers only.
 */
import fs            from 'fs-extra';
import path          from 'path';
import TelegramBot   from 'node-telegram-bot-api';
import Groq          from 'groq-sdk';
import { pathToFileURL } from 'url';

const TOKENS_PATH = path.resolve(process.cwd(), 'json', 'tokens.json');

export const meta = {
  name: 'token',
  version: '2.0.0',
  aliases: ['addtoken', 'tokens'],
  description: 'Add or remove a bot token (Hot Reload). Private chat only.',
  author: 'AjiroDesu',
  category: 'private',
  type: 'private',
  cooldown: 5,
  guide: ['add <token>', 'remove <token>'],
  prefix: 'both'
};

// --- Helpers ---

async function saveTokens(list) {
  await fs.writeFile(TOKENS_PATH, JSON.stringify(list, null, 2), 'utf8');
}

/**
 * Hot-start a new bot instance and attach Reze's full handler pipeline.
 */
async function hotStartBot(token) {
  const { createHandlerAction } = await import(
    pathToFileURL(path.resolve(process.cwd(), 'core', 'system', 'handlerAction.js')).href
  );

  // Re-use Groq key from config if available
  const groqKey = global.Reze.config.groqKey || global.Reze.api?.groq || '';
  const groq    = groqKey ? new Groq({ apiKey: groqKey }) : null;

  const bot = new TelegramBot(token, { polling: true });
  const me  = await bot.getMe(); // validates token immediately

  const handlerAction = createHandlerAction(bot, groq);

  bot.on('message',          msg => handlerAction({ message: msg }));
  bot.on('edited_message',   msg => handlerAction({ edited_message: msg }));
  bot.on('callback_query',   cbq => handlerAction({ callback_query: cbq }));
  bot.on('message_reaction', rxn => handlerAction({ message_reaction: rxn }));
  bot.on('polling_error',    err => global.Reze.log.error(`[Hot-Bot @${me.username}] ${err.message}`));

  const nextIndex = (global.Reze.bots.length || 0) + 1;
  global.Reze.bots.push({ bot, username: me.username, index: nextIndex, token });

  global.Reze.log.commands(`Hot-started @${me.username} as bot #${nextIndex}`);
  return me.username;
}

/**
 * Hot-stop a bot instance by token.
 */
async function hotStopBot(token) {
  const idx = global.Reze.bots.findIndex(b => b.token === token);
  if (idx === -1) return false;

  const { bot, username } = global.Reze.bots[idx];
  try {
    await bot.stopPolling();
    global.Reze.bots.splice(idx, 1);
    global.Reze.log.commands(`Hot-stopped @${username}`);
    return true;
  } catch {
    return false;
  }
}

// --- Main ---

export async function onStart({ bot, event, args, response, usage }) {
  if (args.length < 2) return usage();

  const action = args[0].toLowerCase();
  const token  = args[1];

  // Validate token format
  if (!/^\d+:[A-Za-z0-9_-]{35}$/.test(token)) {
    return response.reply('⚠️ **Invalid Format**\nPlease provide a valid Telegram bot token (ID:Secret).');
  }

  const loading = await response.reply('⚙️ **Processing token...**');

  try {
    const current = await fs.readJson(TOKENS_PATH).catch(() => []);

    // ADD
    if (action === 'add') {
      if (current.includes(token)) {
        return response.edit('text', loading, 'ℹ️ **Exists**\nThis token is already saved.');
      }

      const username = await hotStartBot(token);
      current.push(token);
      await saveTokens(current);

      return response.edit(
        'text', loading,
        `✅ **Token Added & Started**\n\n` +
        `Bot **@${username}** is now online.\n` +
        `🆔 \`${token.split(':')[0]}****\``
      );
    }

    // REMOVE
    if (action === 'remove' || action === 'delete') {
      if (!current.includes(token)) {
        return response.edit('text', loading, '⚠️ **Not Found**\nThis token is not saved.');
      }

      await saveTokens(current.filter(t => t !== token));
      const stopped = await hotStopBot(token);

      return response.edit(
        'text', loading,
        stopped
          ? '🗑️ **Token Removed & Stopped**\nThe instance has been terminated.'
          : '🗑️ **Token Removed**\nRemoved from file (instance was not running).'
      );
    }

    return response.edit('text', loading, '❌ **Invalid Action**\nUse `add` or `remove`.');

  } catch (err) {
    console.error('[Token Cmd]', err);
    await response.edit('text', loading, `⚠️ **System Error**\n\`${err.message}\``);
  }
}
