import { Command } from "commander";
import { markDone } from "../services/taskService";
import { printTask, printSuccess, printError } from "../utils/display";

export function registerDone(program: Command): void {
  program
    .command("done <id>")
    .description("Mark a task as done (use the first 4+ chars of its ID)")
    .action((id: string) => {
      try {
        const task = markDone(id);
        printSuccess(`"${task.title}" marked as done!`);
        printTask(task);
      } catch (err: unknown) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
