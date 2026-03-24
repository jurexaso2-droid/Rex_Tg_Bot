# 🤖 Reze Bot

A multipurpose Telegram bot where **Reze AI is the core engine** — not a command. Reze understands natural language, executes commands on your behalf, and powers every AI feature through Groq (llama-3.3-70b-versatile).

---

## 📁 Project Structure

```
reze-bot/
├── core/
│   ├── main.js                  # Entry point — boots all bot instances, hosts Reze AI engine
│   └── system/
│       ├── handlerEvent.js      # All event routing (onStart, onChat, onReply, onCallback, ...)
│       ├── handlerAction.js     # Update type dispatcher (messages, callbacks, reactions)
│       ├── Response.js          # Telegram message wrapper — all API calls go through here
│       ├── log.js               # Styled chalk logger
│       ├── login.js             # Command/event loader with boot logs
│       └── config.json          # Log label config
├── app/
│   ├── commands/                # Bot commands (no cross-imports — everything via params)
│   └── events/                  # Telegram event handlers (join/leave/etc.)
├── json/
│   ├── config.json              # Bot config (groqKey, prefix, devID, timezone, ...)
│   ├── tokens.json              # Bot token(s) — array supports multiple bots
│   └── api.json                 # Third-party API base URLs
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your bot token — `json/tokens.json`
```json
["YOUR_BOT_TOKEN"]
```
Run multiple bots from one process by adding more tokens:
```json
["TOKEN_1", "TOKEN_2", "TOKEN_3"]
```

### 3. Configure the bot — `json/config.json`
```json
{
  "groqKey": "gsk_...",
  "groqModel": "llama-3.3-70b-versatile",
  "timezone": "Asia/Manila",
  "developer": "YourName",
  "prefix": "/",
  "subprefix": ["#", "-", "+"],
  "devID": ["YOUR_TELEGRAM_USER_ID"],
  "premium": ["PREMIUM_USER_ID"],
  "maintenance": false,
  "maintenanceIgnore": [],
  "hideNotiMessage": {
    "commandNotFound": false,
    "needRoleToUseCmd": false
  },
  "autoRestart": null
}
```

| Field | Description |
|-------|-------------|
| `groqKey` | Your Groq API key — powers all AI features |
| `groqModel` | Groq model to use (default: `llama-3.3-70b-versatile`) |
| `timezone` | Used by Reze AI for time-aware responses |
| `developer` | Developer name Reze uses when asked who made it |
| `prefix` | Primary command prefix |
| `subprefix` | Additional accepted prefixes |
| `devID` | Telegram user IDs with developer role (full access) |
| `premium` | Telegram user IDs with premium role |
| `maintenance` | Set to `true` to enable maintenance mode — blocks all commands for non-developers |
| `maintenanceIgnore` | Array of command names that remain usable during maintenance |
| `hideNotiMessage.commandNotFound` | Suppress "command not found" messages |
| `hideNotiMessage.needRoleToUseCmd` | Suppress permission denied messages |
| `autoRestart` | Auto-restart interval in ms, or `null` to disable |

### 4. API keys — `json/api.json`
Optional third-party API base URLs used by various commands:
```json
{
  "openweather": "",
  "shin": "https://shin-apis.gleeze.com",
  "nekolabs": "https://...",
  "nexray": "https://...",
  "deline": "https://...",
  "danzy": "https://..."
}
```
Access these in any command via the `api` parameter.

### 5. Start
```bash
npm start
```

---

## 🤖 How Reze AI Works

Reze AI is **not a command** — it is the core engine living in `core/main.js`. Every non-prefix message is automatically passed through `processWithReze()`.

**In private chat:** fires on every message.
**In group chat:** only fires when the message contains the word `reze`.

### What Reze does with your message:
1. Builds a system prompt containing all loaded commands, current time, and developer name
2. Sends your conversation to Groq with per-user memory of up to 20 messages
3. If Groq decides a command should run, it replies with `EXECUTE: /command args`
4. Reze injects that as a real command call — fully self-executing
5. Otherwise Reze replies naturally in Telegram Markdown

### Groq response format Reze understands:
```
EXECUTE: /command args
LOADING: Loading text to show while running...
DONE: Confirmation text to show after it finishes
MESSAGE: Optional message to send alongside
```

### Examples:
- *"Hey reze play Enchanted by Taylor Swift"* → Reze calls `/music Enchanted Taylor Swift` automatically
- *"Reze what time is it?"* → Reze reads `config.timezone` and answers directly
- *"Who made you?"* → Reze reads `config.developer` and answers
- *"Reze flip a coin"* → Reze calls `/dice` automatically

Direct AI chat is also available via `/ask <message>` or `/venice <message>`.

---

## 💬 Message Reactions

Every command automatically gets emoji reactions placed on the user's triggering message. No per-command setup is needed — this is handled centrally in `core/system/handlerEvent.js`.

| Emoji | Meaning | When |
|-------|---------|------|
| 🔥 | Success | Fires immediately after the command executes without error |
| 🤔 | Failed | Fires immediately when the command throws an error |

Reactions apply to both `onStart` and `onReply` handlers. On failure, 🤔 fires **before** the error message is sent so feedback is instant.

---

## 🎮 Commands

| Command | Aliases | Description | Access |
|---------|---------|-------------|--------|
| `/help` | cmds, commands | List or detail commands | anyone |
| `/ask` | ai, chat | Direct Groq AI chat | anyone |
| `/up` | uptime, ping | Bot uptime | anyone |
| `/info` | about, botinfo | Bot info and stats | anyone |
| `/time` | clock, date | Current time (uses config timezone) | anyone |
| `/weather` | w, forecast | AI-powered weather info | anyone |
| `/music` | — | Music search | anyone |
| `/spotify` | — | Spotify track search | anyone |
| `/lyrics` | — | Song lyrics lookup | anyone |
| `/imagine` | describe, draw | AI visual description | anyone |
| `/calc` | calculator | Interactive calculator | anyone |
| `/poll` | vote | Create a Telegram poll | anyone |
| `/remind` | reminder, remindme | Set a timed reminder | anyone |
| `/wordle` | word | Play Wordle | anyone |
| `/quiz` | trivia, question, test | Random trivia quiz | anyone |
| `/rps` | — | Rock Paper Scissors | anyone |
| `/dice` | — | Roll a dice | anyone |
| `/say` | tts | Text-to-speech | anyone |
| `/trans` | translate, tr | Translate text | anyone |
| `/wiki` | wikipedia, wp | Wikipedia search | anyone |
| `/bible` | verse, scripture, gospel | Bible verse lookup | anyone |
| `/joke` | — | Random joke | anyone |
| `/quote` | — | Random quote | anyone |
| `/advice` | — | Random advice | anyone |
| `/funfact` | — | Fun fact | anyone |
| `/catfact` | — | Cat fact | anyone |
| `/meme` | — | Random meme | anyone |
| `/animeme` | — | Anime meme | anyone |
| `/waifu` | — | Waifu image | anyone |
| `/neko` | — | Neko image | anyone |
| `/cosplay` | — | Cosplay image | anyone |
| `/dog` | — | Dog image | anyone |
| `/art` | — | AI art prompt | anyone |
| `/wallpaper` | — | Random wallpaper | anyone |
| `/recipe` | — | Random recipe | anyone |
| `/zodiac` | — | Zodiac info | anyone |
| `/generatepass` | genpass, password | Password generator | anyone |
| `/uid` | id, userid, whoami | Get your Telegram user ID | anyone |
| `/gid` | chatid, tid | Get the current chat ID | anyone |
| `/stalk` | whois, userinfo | User info lookup | anyone |
| `/stats` | — | Bot usage statistics | anyone |
| `/detect` | — | Detect text language | anyone |
| `/ip` | — | IP address lookup | anyone |
| `/npm` | — | NPM package info | anyone |
| `/screenshot` | — | Screenshot a URL | anyone |
| `/venice` | veniceai, ven, ai | Venice AI chat | anyone |
| `/pollinations` | polli, poli | AI image generation | anyone |
| `/prefix` | setprefix, pref | View or change command prefix | anyone |
| `/requestvip` | reqvip, viprequest | Request VIP/premium access | anyone |
| `/vip` | — | Manage VIP users | developer |
| `/dev` | — | Manage developer list | developer |
| `/devmode` | — | Toggle maintenance mode | developer |
| `/devname` | — | Set the developer display name | developer |
| `/devbypass` | — | Bypass bot restrictions | developer |
| `/token` | addtoken, tokens | Hot-add bot tokens at runtime | developer |
| `/shell` | sh, exec | Run shell commands | developer |
| `/eval` | e, run | Evaluate JavaScript code | developer |
| `/notif` | — | Send dashboard notifications | developer |

---

## 🛠️ Creating Commands

Commands live in `app/commands/`. Each file is a pure ESM module with named exports. **You do not need to import anything from the bot** — all dependencies are injected through function parameters.

### Minimal command template
```js
export const meta = {
  name: 'example',
  aliases: ['ex'],
  version: '1.0.0',
  author: 'YourName',
  description: 'An example command.',
  guide: ['<text>'],        // shown by usage()
  cooldown: 3,              // seconds (bypassed for premium/developer)
  type: 'anyone',           // see roles section
  category: 'utility',
};

export async function onStart({ args, response, usage }) {
  if (!args.length) return usage();
  await response.reply(`You said: ${args.join(' ')}`);
}
```

Drop the file in `app/commands/` and restart (or hot-add via `/token`). The bot scans the folder automatically on boot.

---

## 📦 Available Parameters

All handlers receive the same base object. Use only what you need.

| Parameter | Type | Description |
|-----------|------|-------------|
| `bot` | `TelegramBot` | Raw node-telegram-bot-api instance |
| `groq` | `function` | `groq(messages, opts?)` — call Groq AI directly |
| `api` | `object` | Third-party API base URLs from `json/api.json` |
| `event` | `object` | The resolved Telegram message object |
| `body` | `string` | Full message text or caption |
| `args` | `string[]` | Message split by whitespace (for `onStart`: everything after the command name) |
| `response` | `Response` | Message helper — see Response API below |
| `role` | `number` | `0` = anyone, `1` = premium, `2` = developer |
| `config` | `object` | Contents of `json/config.json` |
| `senderID` | `string` | Telegram user ID of the sender |
| `chatId` | `number` | Telegram chat ID |
| `messageID` | `number` | Message ID of the triggering message |
| `isGroup` | `boolean` | `true` if the message is in a group or supergroup |
| `from` | `object` | Raw Telegram `from` user object |
| `commandName` | `string` | Resolved command name |
| `usedPrefix` | `string` | The prefix the user typed (e.g. `/`, `#`) |
| `usage` | `function` | Sends the formatted usage guide from `meta.guide` |

`onCallback` additionally receives:

| Parameter | Type | Description |
|-----------|------|-------------|
| `callbackQuery` | `object` | Raw Telegram callback query object |
| `payload` | `object` | Parsed `callback_data` — always `{ command, args?, ...custom }` |
| `messageId` | `number` | Message ID of the button message |

`onReply` additionally receives:

| Parameter | Type | Description |
|-----------|------|-------------|
| `Reply` | `object` | Saved reply data + `Reply.delete()` to remove the listener |

`onReaction` additionally receives:

| Parameter | Type | Description |
|-----------|------|-------------|
| `Reaction` | `object` | Saved reaction data + `Reaction.delete()` to remove the listener |

---

## 📡 Response API

All Telegram API calls go through the `response` object injected into every handler. Text supports Telegram Markdown automatically — `**bold**` is converted to `*bold*` for you.

### Sending messages
```js
// Send without quoting (no reply_to in groups)
await response.send('Hello!');

// Reply — quotes the user's message in groups automatically
await response.reply('Hello!');

// Send to a specific chat ID
await response.sendTo(chatId, 'Hello!');

// Send to all developers (devID list in config)
await response.forDev('Something happened.');
```

### Uploading media
```js
await response.upload('photo',      fileOrUrl, { caption: 'Caption' });
await response.upload('audio',      fileOrUrl, { caption: 'Track name' });
await response.upload('video',      fileOrUrl);
await response.upload('document',   buffer,    { filename: 'file.json' });
await response.upload('sticker',    fileOrUrl);
await response.upload('animation',  fileOrUrl);
await response.upload('voice',      fileOrUrl);
await response.upload('video_note', fileOrUrl);
await response.upload('media_group', [
  { type: 'photo', media: url1, caption: 'First' },
  { type: 'photo', media: url2 },
]);
```

### Special sends
```js
await response.location(lat, lng);
await response.venue(lat, lng, 'Title', 'Address');
await response.contact('+63912345678', 'John');
await response.poll('Best fruit?', ['Apple', 'Mango', 'Banana']);
await response.dice();
await response.action('typing');   // 'typing' | 'upload_photo' | 'upload_document' | etc.
```

### Editing messages
`target` can be a message object, a `message_id` number, or `{ chat_id, message_id }`.
```js
// Edit text
await response.edit('text', sentMsg, 'New text');

// Edit caption
await response.edit('caption', sentMsg, 'New caption');

// Swap media
await response.edit('media', sentMsg, { type: 'photo', media: newUrl });

// Replace inline keyboard only
await response.edit('markup', sentMsg, { inline_keyboard: [...] });

// Dedicated loading → result edit (used by Reze AI internally)
await response.update(loadingMsg, 'Done!');
```

### Deleting messages
```js
await response.delete(sentMsg);
await response.delete(messageId);
```

### Reactions
```js
// React to the user's triggering message
await response.react('🔥');

// React to a specific message
await response.react('👍', sentMsg);
await response.react('👍', messageId);

// Remove all reactions
await response.react(null);
```

> Reactions call `bot.setMessageReaction` with a properly JSON-stringified payload. They always silent-fail so they never break a command.

### Callback queries
```js
// Dismiss the loading spinner after onCallback (called automatically)
await response.answerCallback(callbackQuery);

// Show a toast
await response.answerCallback(callbackQuery, { text: 'Done!' });

// Show a popup alert
await response.answerCallback(callbackQuery, { text: 'Error!', show_alert: true });
```

### Building inline keyboards
```js
// Using the helper (recommended)
const keyboard = Response.buildInlineKeyboard([
  [
    { text: '✅ Yes', data: { command: 'example', args: ['yes'] } },
    { text: '❌ No',  data: { command: 'example', args: ['no']  } },
  ],
  [
    { text: '🌐 Open Link', url: 'https://example.com' },
  ],
]);
await response.reply('Choose:', { reply_markup: keyboard });

// Manually
const keyboard = {
  inline_keyboard: [[
    { text: 'Click', callback_data: JSON.stringify({ command: 'example', args: ['clicked'] }) }
  ]]
};
await response.reply('Press:', { reply_markup: keyboard });
```

---

## 📝 Handler Types

### `onStart` — command trigger
Runs when a user sends a prefixed command like `/help` or `#quiz`.
```js
export async function onStart({ args, response, chatId, senderID, usage, config, groq, bot }) {
  if (!args.length) return usage();
  // your logic here
}
```

### `onChat` — passive listener
Runs on every non-command message. Check `isUserCallCommand` to skip when a prefix command was already handled.
```js
export async function onChat({ body, response, chatId, isUserCallCommand }) {
  if (isUserCallCommand || !body) return;
  if (body.toLowerCase().includes('hello')) {
    await response.reply('Hi there!');
  }
}
```

### `onReply` — reply listener
Runs when a user replies to a bot message you registered. Receives 🔥 / 🤔 reactions automatically.
```js
// In onStart — save the listener:
const sent = await response.reply('Please reply with your name.');
global.Reze.onReply.set(sent.message_id, {
  commandName: 'example',
  senderID,
  // any extra data you want passed back
});

// Handle the reply:
export async function onReply({ Reply, event, response }) {
  const input = event.text || '';
  Reply.delete(); // removes the listener so it only fires once
  await response.reply(`Your name is: ${input}`);
}
```

### `onCallback` — inline button press
Runs when a user presses a button in an inline keyboard. `answerCallback` is called automatically after your handler returns.
```js
// In onStart — build the keyboard:
const keyboard = Response.buildInlineKeyboard([[
  { text: 'Confirm', data: { command: 'example', args: ['confirm'] } },
  { text: 'Cancel',  data: { command: 'example', args: ['cancel']  } },
]]);
await response.reply('Are you sure?', { reply_markup: keyboard });

// Handle the press:
export async function onCallback({ payload, response, callbackQuery }) {
  const action = payload.args?.[0]; // 'confirm' or 'cancel'
  await response.edit('text', callbackQuery.message, `You chose: ${action}`);
  await response.answerCallback(callbackQuery, { text: 'Got it!' });
}
```

### `onEvent` — Telegram service events
Runs on group membership changes (join, leave, title change, pinned message, etc.). Lives in `app/events/` or any command file.
```js
export async function onEvent({ event, response, config }) {
  const msg = event.message;
  if (!msg?.new_chat_members) return;
  for (const member of msg.new_chat_members) {
    if (member.is_bot) continue;
    await response.send(`👋 Welcome to the group, ${member.first_name}!`);
  }
}
```

### `onAnyEvent` — every update
Runs before all other handlers on every single Telegram update. Useful for logging or analytics.
```js
export async function onAnyEvent({ event, chatId, senderID }) {
  // runs on absolutely every update
}
```

### `onFirstChat` — once per chat
Fires the very first time a given `chatId` interacts with this module. Useful for one-time welcome messages.
```js
export async function onFirstChat({ chatId, response, config }) {
  await response.send(`Welcome! Type \`${config.prefix}help\` to get started.`);
}
```

### `onReaction` — emoji reaction listener
Runs when a user reacts to a bot message you registered.
```js
// Register:
global.Reze.onReaction.set(sentMsg.message_id, { commandName: 'example', senderID });

// Handle:
export async function onReaction({ Reaction, event, response }) {
  Reaction.delete();
  await response.reply('You reacted to my message!');
}
```

---

## 👤 User Roles

Three role levels are assigned automatically based on `config.devID` and `config.premium`:

| Role value | Name | Who |
|-----------|------|-----|
| `2` | developer | IDs listed in `config.devID` |
| `1` | premium | IDs listed in `config.premium` |
| `0` | anyone | Everyone else |

The `role` value is injected into every handler as a number. You can compare it directly:
```js
export async function onStart({ role, response }) {
  if (role < 1) return response.reply('🔒 Premium only.');
  if (role < 2) return response.reply('👑 Premium user!');
  await response.reply('🛠️ Developer!');
}
```

### Per-handler role overrides
You can set different minimum role requirements per handler instead of using a single `type`:
```js
export const meta = {
  name: 'example',
  type: 'anyone',
  role: {
    onStart:    0,  // anyone can trigger
    onReply:    1,  // only premium+ can use the reply handler
    onCallback: 0,  // anyone can press buttons
  },
};
```

### Cooldowns
Cooldowns apply to `anyone` (role `0`) only. `premium` and `developer` bypass them entirely.
```js
export const meta = {
  name: 'example',
  cooldown: 5,  // 5-second cooldown for regular users; bypassed for premium/developer
};
```

---

## 🏷️ Command Types

`meta.type` controls **who can run the command**, **where it can run**, and **whether it appears in `/help`**. Both `handlerEvent.js` (execution) and `help.js` (visibility) read this field and enforce the same rules.

| Type | Executable by | Visible in `/help` |
|------|--------------|-------------------|
| `anyone` | All users | Always |
| `premium` | Premium + Developer | Only to premium and developer |
| `developer` | Developer only | Only to developer |
| `administrator` | Group admins + Developer | In groups: admins and developer. In private: developer only |
| `group` | Anyone — but only in group chats | Only when used inside a group |
| `private` | Anyone — but only in private chat | Only when used in private chat |
| `hidden` | Anyone who knows the command name | **Never shown in `/help` or tree view** |

> `category` also controls visibility in the same way. Setting `category: 'developer'` or `category: 'hidden'` applies the same filter as the matching `type`.

### Type behaviour details

**`anyone`** — no restrictions. Runs everywhere, shown to everyone.
```js
export const meta = { name: 'joke', type: 'anyone' };
```

**`premium`** — blocked for regular users at execution time. Hidden from `/help` for non-premium users.
```js
export const meta = { name: 'exclusive', type: 'premium' };
```

**`developer`** — only users in `config.devID` can run it or even see it in `/help`.
```js
export const meta = { name: 'shell', type: 'developer' };
```

**`administrator`** — requires the user to be a Telegram group admin (or developer). In private chat, only developers can see and run it. The check is live via `bot.getChatMember`.
```js
export const meta = { name: 'ban', type: 'administrator' };
```

**`group`** — running it in private chat returns an error. It is hidden from `/help` when in private chat.
```js
export const meta = { name: 'poll', type: 'group' };
```

**`private`** — running it in a group returns an error. Hidden from `/help` in group chats.
```js
export const meta = { name: 'settings', type: 'private' };
```

**`hidden`** — the command works normally when called by name, but it **never appears** in `/help`, the tree view, or any paginated list — for any role. Use this for internal or easter-egg commands.
```js
export const meta = { name: 'secret', type: 'hidden' };
// OR hide via category:
export const meta = { name: 'internal', type: 'anyone', category: 'hidden' };
```

---

## 🔍 Command Filtering in `/help`

The `/help` command dynamically filters the command list for each user based on their role, the current chat context, and each command's `type` and `category`. Users only ever see commands they are actually allowed to use.

### Filter rules (applied in order)

1. **`hidden` type or `hidden` category** — always excluded, regardless of role.
2. **Context mismatch** — `type: 'group'` commands are hidden in private chat; `type: 'private'` commands are hidden in group chats. This applies to everyone including developers.
3. **`administrator` type** — shown in groups only to group admins and developers. In private chat, only developers see it.
4. **`developer` type or category** — only shown to role `2`.
5. **`premium` type or category** — only shown to role `1` and above.
6. Everything else passes through and is shown.

### `/help` usage

```
/help                  — paginated command list (8 per page), filtered for your role/context
/help 2                — jump to page 2
/help all              — tree view grouped by category, filtered for your role/context
/help <command>        — full details for a specific command (name or alias)
```

The paginated list has Prev / Next inline buttons. Sessions last 10 minutes and are locked to the user who opened them — other users pressing the buttons get a permission error.

### Tree view output example
```
📂 ROOT_SYSTEM
├── 📁 FUN
│   ├── /dice
│   ├── /joke
│   └── /quiz
│
├── 📁 SYSTEM
│   ├── /help
│   └── /up
│
└── 📁 UTILITY
    ├── /poll
    └── /remind

[ Total: 8 modules ]
```

### Command detail output example
```
🛠️ COMMAND INTERFACE

▫️ Name:     `quiz`
▫️ Version:  `v1.2.0`
▫️ Category: `RANDOM`
▫️ Type:     `ANYONE`
▫️ Cooldown: 5s
▫️ Aliases:  `trivia`, `question`, `test`

📝 Description:
Get a random trivia question.

🕹️ Usage:
`/quiz`
```

---

## 🌐 Global State — `global.Reze`

Accessible from any command or handler without importing:

| Property | Type | Description |
|----------|------|-------------|
| `global.Reze.commands` | `Map` | All loaded commands keyed by name |
| `global.Reze.aliases` | `Map` | Alias → command name |
| `global.Reze.onReply` | `Map` | Active reply listeners (`message_id → data`) |
| `global.Reze.onReaction` | `Map` | Active reaction listeners (`message_id → data`) |
| `global.Reze.cooldowns` | `Map` | Cooldown timestamps (`command:senderID → ms`) |
| `global.Reze.config` | `object` | Live config from `json/config.json` |
| `global.Reze.api` | `object` | API URLs from `json/api.json` |
| `global.Reze.bots` | `array` | All active bot instances `{ bot, username, index }` |
| `global.Reze.botUsername` | `string` | Username of the primary bot |
| `global.Reze.startTime` | `number` | Boot timestamp in ms |
| `global.Reze.log` | `object` | Logger: `.commands()`, `.events()`, `.error()`, `.warn()`, `.info()`, `.reze()` |
| `global.Reze.aiConversations` | `Map` | Per-user Groq conversation history |
| `global.Reze.userProfiles` | `Map` | Per-user profile data (name, facts, message count) |
| `global.Reze.upsertProfile` | `function` | Get or create a user profile by senderID |
| `global.Reze.getDisplayName` | `function` | Get preferred display name for a user |
| `global.Reze.askReze` | `function` | Direct Groq call used by the AI engine |

---

## 🧩 Full Command Example

A complete command using `onStart`, `onReply`, and `onCallback`:

```js
import axios from 'axios';

export const meta = {
  name: 'trivia',
  aliases: ['quiz'],
  version: '1.0.0',
  author: 'YourName',
  description: 'A trivia quiz with inline buttons.',
  guide: [],
  cooldown: 5,
  type: 'anyone',
  category: 'fun',
};

const cache = new Map();

export async function onStart({ response }) {
  const loading = await response.reply('🧠 Fetching question...');

  const { data } = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
  const q = data.results[0];
  const options = [q.correct_answer, ...q.incorrect_answers].sort(() => Math.random() - 0.5);
  const id = Math.random().toString(36).slice(2, 8);

  cache.set(id, { correct: q.correct_answer, options });

  const keyboard = Response.buildInlineKeyboard(
    options.map((opt, i) => [{ text: opt, data: { command: 'trivia', id, a: i } }])
  );

  await response.edit('text', loading, `❓ *${q.question}*\n\nChoose below:`, {
    reply_markup: keyboard,
  });
}

export async function onCallback({ payload, response, callbackQuery }) {
  const { id, a } = payload;
  const data = cache.get(id);
  if (!data) return response.answerCallback(callbackQuery, { text: 'Expired!', show_alert: true });

  const chosen    = data.options[a];
  const isCorrect = chosen === data.correct;

  await response.edit(
    'text',
    callbackQuery.message,
    isCorrect
      ? `✅ *Correct!* The answer was *${data.correct}*.`
      : `❌ *Wrong!* You chose _${chosen}_.\nCorrect answer: *${data.correct}*`
  );
  await response.answerCallback(callbackQuery, { text: isCorrect ? 'Correct! 🎉' : 'Wrong! 😢' });
  cache.delete(id);
}
```

---

## 📝 License

MIT — Made with ❤️ by AjiroDesu