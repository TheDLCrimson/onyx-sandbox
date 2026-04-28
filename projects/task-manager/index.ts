import { Command } from "commander";
import chalk from "chalk";
import { registerAdd }    from "./commands/add";
import { registerList }   from "./commands/list";
import { registerDone }   from "./commands/done";
import { registerEdit }   from "./commands/edit";
import { registerDelete } from "./commands/delete";

const program = new Command();

program
  .name("task-manager")
  .description(chalk.bold("📋  CLI Task Manager — tags, priorities, due dates & filters"))
  .version("1.0.0");

registerAdd(program);
registerList(program);
registerDone(program);
registerEdit(program);
registerDelete(program);

program.parse(process.argv);
