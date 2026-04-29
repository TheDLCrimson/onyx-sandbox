import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { readSnippets, writeSnippets } from "../store";
import { AddOptions } from "../types";

export function registerAdd(program: Command): void {
  program
    .command("add <title>")
    .description("Add a new code snippet")
    .requiredOption("-l, --language <lang>", "Programming language (e.g. typescript, bash)")
    .option("-t, --tag <tags>", "Comma-separated tags (e.g. utils,async)")
    .option("-c, --code <code>", "Inline code string")
    .option("-f, --file <path>", "Path to a file to read code from")
    .action((title: string, opts: AddOptions) => {
      let code = "";

      if (opts.file) {
        if (!fs.existsSync(opts.file)) {
          console.error(chalk.red(`✖  File not found: ${opts.file}`));
          process.exit(1);
        }
        code = fs.readFileSync(opts.file, "utf-8");
      } else if (opts.code) {
        code = opts.code;
      } else {
        console.error(chalk.red("✖  Provide code via --code <code> or --file <path>"));
        process.exit(1);
      }

      const rawTags = opts.tag;
      const tags = rawTags
        ? (Array.isArray(rawTags) ? rawTags.join(",") : rawTags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const now = new Date().toISOString();
      const snippet = {
        id: uuidv4(),
        title,
        language: opts.language,
        tags,
        code,
        createdAt: now,
        updatedAt: now,
      };

      const snippets = readSnippets();
      snippets.push(snippet);
      writeSnippets(snippets);

      console.log(chalk.green(`✔  Snippet saved!`));
      console.log(`   ${chalk.bold("ID:")}       ${chalk.cyan(snippet.id)}`);
      console.log(`   ${chalk.bold("Title:")}    ${snippet.title}`);
      console.log(`   ${chalk.bold("Language:")} ${snippet.language}`);
      console.log(`   ${chalk.bold("Tags:")}     ${tags.length ? tags.join(", ") : chalk.dim("none")}`);
    });
}
