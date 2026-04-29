import { Command } from "commander";
import chalk from "chalk";
import { readSnippets } from "../store";

export function registerSearch(program: Command): void {
  program
    .command("search <query>")
    .description("Search snippets by title, tag, or code content")
    .action((query: string) => {
      const lower = query.toLowerCase();
      const snippets = readSnippets().filter(
        (s) =>
          s.title.toLowerCase().includes(lower) ||
          s.code.toLowerCase().includes(lower) ||
          s.tags.some((t) => t.toLowerCase().includes(lower)) ||
          s.language.toLowerCase().includes(lower)
      );

      if (snippets.length === 0) {
        console.log(chalk.yellow(`\nNo snippets matched "${query}".\n`));
        return;
      }

      console.log(chalk.bold(`\n🔍  Results for "${query}" (${snippets.length})\n`));

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
