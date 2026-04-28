import { Command } from "commander";
import { loadTasks } from "../utils/storage";
import { filterTasks } from "../services/filterService";
import { printTaskList, printError } from "../utils/display";
import { Priority, SortOption } from "../types";

export function registerList(program: Command): void {
  program
    .command("list")
    .description("List tasks with optional filters")
    .option("-t, --tag <tag>", "Filter by tag")
    .option("--done <boolean>", "Filter by status: true | false")
    .option("-p, --priority <level>", "Filter by priority: low | medium | high")
    .option("-s, --sort <field>", "Sort by: due | priority | created  (default: created)")
    .action((opts: { tag?: string; done?: string; priority?: string; sort?: string }) => {
      try {
        const tasks = loadTasks();

        // Parse --done flag as a real boolean
        let doneFilter: boolean | undefined;
        if (opts.done !== undefined) {
          if (opts.done === "true")       doneFilter = true;
          else if (opts.done === "false") doneFilter = false;
          else throw new Error(`Invalid value for --done: "${opts.done}". Use true or false.`);
        }

        const filtered = filterTasks(tasks, {
          tag:      opts.tag,
          done:     doneFilter,
          priority: opts.priority as Priority | undefined,
          sort:     (opts.sort as SortOption | undefined) ?? "created",
        });

        printTaskList(filtered);
      } catch (err: unknown) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
