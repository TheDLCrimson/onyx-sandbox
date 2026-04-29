import { Command } from "commander";
import chalk from "chalk";
import readline from "readline";
import { readSnippets, writeSnippets } from "../store";

export function registerDelete(program: Command): void {
  program
    .command("delete <id>")
    .description("Delete a snippet by its ID (or ID prefix)")
    .action((id: string) => {
      const snippets = readSnippets();
      const index = snippets.findIndex((s) => s.id.startsWith(id));

      if (index === -1) {
        console.error(chalk.red(`✖  No snippet found with ID starting with "${id}"`));
        process.exit(1);
      }

      const snippet = snippets[index];
      console.log(
        `\n  ${chalk.bold(snippet.title)}  ${chalk.cyan(snippet.id)}  ${chalk.magenta(`[${snippet.language}]`)}\n`
      );

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(chalk.yellow("  Are you sure you want to delete this snippet? (y/N) "), (answer) => {
        rl.close();
        if (answer.trim().toLowerCase() === "y") {
          snippets.splice(index, 1);
          writeSnippets(snippets);
          console.log(chalk.green("\n  ✔  Snippet deleted.\n"));
        } else {
          console.log(chalk.dim("\n  Aborted.\n"));
        }
      });
    });
}
