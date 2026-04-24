import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type ChatInputCommandInteraction,
  type Interaction,
  type Message,
} from "discord.js";
import "dotenv/config";
import {
  answerQuestion,
  answerQuestionStream,
  editFile,
  generateFile,
} from "./claude";
import { readFile, writeFile } from "./github";
import type { CommandKind, ParsedCommand } from "./types";

const REQUIRED_ENV = [
  "DISCORD_TOKEN",
  "OPENROUTER_API_KEY",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
] as const;
assertEnv();

const DISCORD_MSG_LIMIT = 1900;
const STREAM_EDIT_INTERVAL_MS = 1000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, (msg) => {
  void handleMessage(msg);
});

client.on(Events.InteractionCreate, (interaction) => {
  void handleInteraction(interaction);
});

void client.login(process.env.DISCORD_TOKEN);

/** Verify all required env vars are present, exit with an actionable error otherwise. */
function assertEnv(): void {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing env var(s): ${missing.join(", ")}`);
    process.exit(1);
  }
}

// ---------- Slash commands ----------

/** Route an incoming interaction to the matching slash-command handler. */
async function handleInteraction(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  try {
    switch (interaction.commandName) {
      case "create":
        return await handleCreate(interaction);
      case "edit":
        return await handleEdit(interaction);
      case "ask":
        return await handleAsk(interaction);
      case "help":
        return await handleHelp(interaction);
    }
  } catch (err) {
    const text = `❌ ${errText(err)}`;
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(text);
    } else {
      await interaction.reply({ content: text, flags: MessageFlags.Ephemeral });
    }
  }
}

async function handleCreate(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const path = i.options.getString("path", true);
  const description = i.options.getString("description", true);
  const existing = await readFile(path);
  if (existing) {
    await i.editReply(`❌ \`${path}\` already exists. Use /edit instead.`);
    return;
  }
  await i.editReply(`⏳ Creating \`${path}\`…`);
  const content = await generateFile(path, description);
  await writeFile(path, content, `Create ${path} via Discord buddy`);
  await i.editReply(`✅ Created \`${path}\` (${content.length} bytes).`);
}

async function handleEdit(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const path = i.options.getString("path", true);
  const instruction = i.options.getString("instruction", true);
  const existing = await readFile(path);
  if (!existing) {
    await i.editReply(`❌ \`${path}\` not found. Use /create first.`);
    return;
  }
  await i.editReply(`⏳ Editing \`${path}\`…`);
  const updated = await editFile(path, existing.content, instruction);
  await writeFile(
    path,
    updated,
    `Edit ${path} via Discord buddy`,
    existing.sha,
  );
  await i.editReply(`✅ Edited \`${path}\`.`);
}

async function handleAsk(i: ChatInputCommandInteraction): Promise<void> {
  await i.deferReply();
  const path = i.options.getString("path", true);
  const question = i.options.getString("question", true);
  const existing = await readFile(path);
  if (!existing) {
    await i.editReply(`❌ \`${path}\` not found.`);
    return;
  }
  await streamToInteraction(
    i,
    answerQuestionStream(path, existing.content, question),
  );
}

async function handleHelp(i: ChatInputCommandInteraction): Promise<void> {
  await i.reply({
    content: [
      "**Onyx — Discord programming buddy**",
      "`/create <path> <description>` — create a new file",
      "`/edit <path> <instruction>` — edit an existing file",
      "`/ask <path> <question>` — ask about a file",
      "`/help` — show this",
    ].join("\n"),
    flags: MessageFlags.Ephemeral,
  });
}

/**
 * Pipe an async text stream into a deferred interaction, editing the reply
 * at most once per STREAM_EDIT_INTERVAL_MS to respect Discord rate limits.
 */
async function streamToInteraction(
  i: ChatInputCommandInteraction,
  stream: AsyncGenerator<string, void, void>,
): Promise<void> {
  let buffer = "";
  let lastEdit = 0;
  for await (const chunk of stream) {
    buffer += chunk;
    const now = Date.now();
    if (now - lastEdit >= STREAM_EDIT_INTERVAL_MS) {
      await i.editReply(truncate(buffer));
      lastEdit = now;
    }
  }
  await i.editReply(buffer.trim() ? truncate(buffer) : "(no response)");
}

// ---------- Prefix commands (legacy fallback) ----------

/**
 * Parse a Discord message into a prefix command, or return null if not addressed to the bot.
 * Grammar:  !<kind> <path> <body...>
 */
function parse(raw: string): ParsedCommand | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("!")) return null;

  const [head, path, ...rest] = trimmed.slice(1).split(/\s+/);
  const kind = head as CommandKind;
  if (kind !== "create" && kind !== "edit" && kind !== "ask") return null;
  if (!path || rest.length === 0) return null;

  return { kind, path, body: rest.join(" ") };
}

/** Top-level message handler — routes to per-command implementations. */
async function handleMessage(msg: Message): Promise<void> {
  if (msg.author.bot) return;
  const cmd = parse(msg.content);
  if (!cmd) return;

  if ("sendTyping" in msg.channel) await msg.channel.sendTyping();
  try {
    const reply = await dispatch(cmd);
    await msg.reply(truncate(reply));
  } catch (err) {
    await msg.reply(`❌ ${errText(err)}`);
  }
}

/** Run the right Claude + GitHub flow for the parsed prefix command. */
async function dispatch(cmd: ParsedCommand): Promise<string> {
  switch (cmd.kind) {
    case "create": {
      const existing = await readFile(cmd.path);
      if (existing)
        throw new Error(`\`${cmd.path}\` already exists. Use !edit instead.`);
      const content = await generateFile(cmd.path, cmd.body);
      await writeFile(
        cmd.path,
        content,
        `Create ${cmd.path} via Discord buddy`,
      );
      return `✅ Created \`${cmd.path}\` (${content.length} bytes).`;
    }
    case "edit": {
      const existing = await readFile(cmd.path);
      if (!existing)
        throw new Error(`\`${cmd.path}\` not found. Use !create first.`);
      const updated = await editFile(cmd.path, existing.content, cmd.body);
      await writeFile(
        cmd.path,
        updated,
        `Edit ${cmd.path} via Discord buddy`,
        existing.sha,
      );
      return `✅ Edited \`${cmd.path}\`.`;
    }
    case "ask": {
      const existing = await readFile(cmd.path);
      if (!existing) throw new Error(`\`${cmd.path}\` not found.`);
      return answerQuestion(cmd.path, existing.content, cmd.body);
    }
  }
}

// ---------- Shared helpers ----------

/** Discord caps message length at 2000; truncate gracefully. */
function truncate(text: string): string {
  return text.length <= DISCORD_MSG_LIMIT
    ? text
    : `${text.slice(0, DISCORD_MSG_LIMIT)}\n…(truncated)`;
}

function errText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
