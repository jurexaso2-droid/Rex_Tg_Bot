/**
 * Prefix Command
 * Displays current prefix/subprefix settings and allows developers to change them.
 * Changes are persisted to json/config.json and hot-reloaded by Reze's watcher.
 */
import fs   from 'fs-extra';
import path from 'path';

const CONFIG_PATH = path.resolve(process.cwd(), 'json', 'config.json');

export const meta = {
  name: 'prefix',
  version: '1.2.0',
  aliases: ['setprefix', 'pref'],
  description: 'View or change the bot prefix. Developer-only modification.',
  author: 'AjiroDesu',
  prefix: 'both',
  category: 'utility',
  type: 'anyone',
  cooldown: 3,
  guide: ['[new_prefix]']
};

export async function onStart({ event, response, args }) {
  try {
    const senderId    = String(event.from?.id);
    const isDeveloper = (global.Reze.config.devID || []).includes(senderId);
    const prefix      = global.Reze.config.prefix;
    const subprefixes = global.Reze.config.subprefix || [];

    if (!args || args.length === 0) {
      return await response.reply(buildDisplay(prefix, subprefixes));
    }

    const newPrefix = args[0].trim();

    if (!isDeveloper) {
      return await response.reply(
        `🔒 Access Restricted\n\n` +
        `You don't have permission to modify the prefix.\n` +
        `This action is reserved for bot developers only.\n\n` +
        `🏷️ Active Prefix  ›  \`${prefix}\``
      );
    }

    if (!/^[^a-zA-Z0-9\s]+$/.test(newPrefix)) {
      return await response.reply(
        `⚠️ Invalid Prefix\n\n` +
        `Prefix must consist of special characters only.\n` +
        `Letters, numbers, and spaces are not allowed.\n\n` +
        `✅ Valid examples\n` +
        `\`!\`  \`/\`  \`$\`  \`>>\`  \`%%\`  \`~\`\n\n` +
        `❌ You entered  ›  \`${newPrefix}\``
      );
    }

    // Apply to runtime
    global.Reze.config.prefix = newPrefix;

    // Persist to config.json (Reze's hot-reload watcher will pick it up)
    const raw = await fs.readFile(CONFIG_PATH, 'utf8');
    const cfg = JSON.parse(raw);
    cfg.prefix = newPrefix;
    await fs.writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');

    return await response.reply(
      `✅ Prefix Updated\n\n` +
      `The bot prefix has been successfully changed.\n` +
      `All commands will now use the new prefix.\n\n` +
      buildDisplay(newPrefix, subprefixes)
    );

  } catch (err) {
    console.error('[PREFIX] Error:', err);
    await response.reply(
      `💥 Unexpected Error\n\n` +
      `Something went wrong while processing your request.\n\n` +
      `📋 Details  ›  \`${err.message}\``
    );
  }
}

function buildDisplay(prefix, subprefixes) {
  const subs = (subprefixes || []).map(s => `\`${s}\``).join('  ');
  return (
    `⚙️ Prefix Configuration\n\n` +
    `🏷️ Main Prefix    ››  \`${prefix}\`\n` +
    `🔗 Subprefixes   ››  ${subs || '_None_'}`
  );
}
