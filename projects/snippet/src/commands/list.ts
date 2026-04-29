import { Command } from "commander";
import chalk from "chalk";
import { readSnippets } from "../store";
import { ListOptions } from "../types";

export function registerList(program: Command): void {
  program
    .command("list")
    .description("List all saved snippets")
    .option("-l, --language <lang>", "Filter by language")
    .option("-t, --tag <tag>", "Filter by tag")
    .action((opts: ListOptions) => {
      let snippets = readSnippets();

      if (opts.language) {
        snippets = snippets.filter(
          (s) => s.language.toLowerCase() === opts.language!.toLowerCase()
        );
      }

      if (opts.tag) {
        snippets = snippets.filter((s) =>
          s.tags.map((t) => t.toLowerCase()).includes(opts.tag!.toLowerCase())
        );
      }

      if (snippets.length === 0) {
        console.log(chalk.yellow("No snippets found."));
        return;
      }

      console.log(chalk.bold(`\n📋  Snippets (${snippets.length})\n`));

      for (const s of snippets) {
        console.log(
          `  ${chalk.cyan(s.id.slice(0, 8))}  ${chalk.bold(s.title)}  ${chalk.magenta(`[${s.language}]`)}  ${
            s.tags.length ? chalk.dim(s.tags.join(", ")) : chalk.dim("no tags")
          }`
        );
      }

      console.log();
    });
}
