import { Command } from "commander";
import { editTask } from "../services/taskService";
import { printTask, printSuccess, printError } from "../utils/display";
import { Priority } from "../types";

export function registerEdit(program: Command): void {
  program
    .command("edit <id>")
    .description("Edit a task's fields (use the first 4+ chars of its ID)")
    .option("-T, --title <title>", "New title")
    .option("-t, --tag <tags>", "Replace tags (comma-separated). Pass '' to clear.")
    .option("-p, --priority <level>", "New priority: low | medium | high")
    .option("-d, --due <date>", "New due date (YYYY-MM-DD). Pass '' to clear.")
    .action(
      (
        id: string,
        opts: { title?: string; tag?: string; priority?: string; due?: string }
      ) => {
        try {
          if (!opts.title && !opts.tag && !opts.priority && opts.due === undefined) {
            throw new Error("Provide at least one option to edit (--title, --tag, --priority, --due).");
          }

          const task = editTask(id, {
            title:    opts.title,
            tag:      opts.tag,
            priority: opts.priority as Priority | undefined,
            due:      opts.due,
          });

          printSuccess(`Task updated!`);
          printTask(task);
        } catch (err: unknown) {
          printError((err as Error).message);
          process.exit(1);
        }
      }
    );
}
