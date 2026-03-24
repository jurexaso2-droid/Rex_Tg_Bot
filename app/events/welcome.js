export const meta = {
  name: 'welcome',
  version: '1.0.0',
  author: 'AjiroDesu',
  description: 'Welcomes new members to the group.',
  category: 'events',
};

export async function onEvent({ event, response, config }) {
  const msg = event.message;
  if (!msg?.new_chat_members) return;

  for (const member of msg.new_chat_members) {
    if (member.is_bot) continue;
    const name  = member.first_name + (member.last_name ? ` ${member.last_name}` : '');
    const user  = member.username ? `@${member.username}` : name;
    const group = msg.chat.title || 'this group';
    await response.send(`👋 Welcome to **${group}**, ${user}!\nUse \`${config.prefix}help\` to see what I can do. 🤖`);
  }
}
