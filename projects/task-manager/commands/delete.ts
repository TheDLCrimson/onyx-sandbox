import { Command } from "commander";
import { deleteTask } from "../services/taskService";
import { printSuccess, printError } from "../utils/display";

export function registerDelete(program: Command): void {
  program
    .command("delete <id>")
    .alias("rm")
    .description("Permanently delete a task (use the first 4+ chars of its ID)")
    .action((id: string) => {
      try {
        const task = deleteTask(id);
        printSuccess(`Task "${task.title}" deleted.`);
      } catch (err: unknown) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
