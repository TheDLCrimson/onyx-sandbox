import { Command } from "commander";
import chalk from "chalk";
import { registerAdd }    from "./commands/add";
import { registerList }   from "./commands/list";
import { registerGet }    from "./commands/get";
import { registerDelete } from "./commands/delete";
import { registerSearch } from "./commands/search";

const program = new Command();

program
  .name("snippet")
  .description(chalk.bold("🗂️  CLI Snippet Manager — store & retrieve code snippets"))
  .version("1.0.0");

registerAdd(program);
registerList(program);
registerGet(program);
registerDelete(program);
registerSearch(program);

program.parse(process.argv);
