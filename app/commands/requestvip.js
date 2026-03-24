/**
 * Request VIP Command
 * Allows users to submit a request for premium (VIP) access to the bot developers.
 */
export const meta = {
  name: 'requestvip',
  version: '1.1.0',
  aliases: ['reqvip', 'viprequest'],
  description: 'Submit a request for premium (VIP) access to the developers.',
  author: 'ShawnDesu',
  category: 'system',
  type: 'anyone',
  cooldown: 120,
  guide: ['<reason/message>'],
  prefix: 'both'
};

export async function onStart({ event, args, response, usage }) {
  if (!args.length) return usage();

  const text = args.join(' ').trim();
  const devs = global.Reze.config.devID || [];

  if (!devs.length) {
    return response.reply('⚠️ **System Error**\nNo developers are configured to receive this request.');
  }

  const from     = event.from;
  const name     = [from.first_name, from.last_name].filter(Boolean).join(' ');
  const username = from.username ? `@${from.username}` : 'No Username';
  const userId   = from.id;

  const notification =
    `📩 **Premium (VIP) Request Received**\n\n` +
    `👤 **User:** ${name}\n` +
    `🏷️ **Username:** ${username}\n` +
    `🆔 **ID:** \`${userId}\`\n\n` +
    `📝 **Message:**\n_${text}_`;

  try {
    await response.forDev(notification);
    await response.reply('✅ **Request Sent**\nYour request has been forwarded to the developers for review.');
  } catch (err) {
    console.error('[RequestVIP] Error:', err.message);
    await response.reply(`⚠️ **Error:** Failed to send request.\n\`${err.message}\``);
  }
}
