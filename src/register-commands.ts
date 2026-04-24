import "dotenv/config";
import { REST, Routes } from "discord.js";
import { commands } from "./commands";

const token = (process.env.DISCORD_TOKEN || "").trim();
const clientId = (process.env.DISCORD_CLIENT_ID || "").trim();
const guildId = (process.env.DISCORD_GUILD_ID || "").trim();

if (!token || !clientId) {
  console.error(
    "Missing DISCORD_TOKEN or DISCORD_CLIENT_ID — see .env.example.",
  );
  process.exit(1);
}

/**
 * Register Onyx slash commands with Discord.
 * Guild-scoped (instant) if DISCORD_GUILD_ID is set, global otherwise.
 */
async function main(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(token);
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);
  const data = (await rest.put(route, { body: commands })) as unknown[];
  const scope = guildId
    ? `guild ${guildId}`
    : "global (may take up to 1 hour to propagate)";
  console.log(`Registered ${data.length} command(s) — scope: ${scope}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
