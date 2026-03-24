export const meta = {
  name: 'goodbye',
  version: '1.0.0',
  author: 'AjiroDesu',
  description: 'Says goodbye to members who leave the group.',
  category: 'events',
};

export async function onEvent({ event, response }) {
  const msg = event.message;
  if (!msg?.left_chat_member) return;
  const m    = msg.left_chat_member;
  if (m.is_bot) return;
  const name = m.first_name + (m.last_name ? ` ${m.last_name}` : '');
  const user = m.username ? `@${m.username}` : name;
  await response.send(`👋 Goodbye, ${user}! We'll miss you.`);
}
