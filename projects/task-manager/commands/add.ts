import { Command } from "commander";
import { addTask } from "../services/taskService";
import { printTask, printSuccess, printError } from "../utils/display";
import { Priority } from "../types";

export function registerAdd(program: Command): void {
  program
    .command("add <title>")
    .description("Add a new task")
    .option("-t, --tag <tags>", "Comma-separated tags  (e.g. work,urgent)")
    .option("-p, --priority <level>", "Priority: low | medium | high  (default: medium)")
    .option("-d, --due <date>", "Due date in YYYY-MM-DD format")
    .action((title: string, opts: { tag?: string; priority?: string; due?: string }) => {
      try {
        const task = addTask(title, {
          tag:      opts.tag,
          priority: opts.priority as Priority | undefined,
          due:      opts.due,
        });
        printSuccess(`Task added!`);
        printTask(task);
      } catch (err: unknown) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
