import { SlashCommandBuilder } from "discord.js";

/** Slash command definitions, exported as JSON payloads for REST registration. */
export const commands = [
  new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a new file from a natural-language description")
    .addStringOption((o) =>
      o
        .setName("path")
        .setDescription("Repo-relative path (e.g. src/util/log.ts)")
        .setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("description")
        .setDescription("What the file should do")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit an existing file with a natural-language instruction")
    .addStringOption((o) =>
      o
        .setName("path")
        .setDescription("Repo-relative path")
        .setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("instruction")
        .setDescription("What change to make")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask a question about an existing file")
    .addStringOption((o) =>
      o
        .setName("path")
        .setDescription("Repo-relative path")
        .setRequired(true),
    )
    .addStringOption((o) =>
      o
        .setName("question")
        .setDescription("Your question about the file")
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show Onyx command usage"),
].map((c) => c.toJSON());
