import { Command } from "commander";
import chalk from "chalk";
import { readSnippets } from "../store";

export function registerGet(program: Command): void {
  program
    .command("get <id>")
    .description("Retrieve and display a snippet by its ID (or ID prefix)")
    .action((id: string) => {
      const snippets = readSnippets();
      const snippet = snippets.find((s) => s.id.startsWith(id));

      if (!snippet) {
        console.error(chalk.red(`✖  No snippet found with ID starting with "${id}"`));
        process.exit(1);
      }

      console.log();
      console.log(`  ${chalk.bold("Title:")}    ${snippet.title}`);
      console.log(`  ${chalk.bold("ID:")}       ${chalk.cyan(snippet.id)}`);
      console.log(`  ${chalk.bold("Language:")} ${chalk.magenta(snippet.language)}`);
      console.log(`  ${chalk.bold("Tags:")}     ${snippet.tags.length ? snippet.tags.join(", ") : chalk.dim("none")}`);
      console.log(`  ${chalk.bold("Created:")}  ${new Date(snippet.createdAt).toLocaleString()}`);
      console.log();
      console.log(chalk.bold("── Code ──────────────────────────────────────"));
      console.log(chalk.green(snippet.code));
      console.log(chalk.bold("──────────────────────────────────────────────"));
      console.log();
    });
}
