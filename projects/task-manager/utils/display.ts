import chalk from "chalk";
import { Task, Priority } from "../types";
import { formatDue, isOverdue } from "./date";

// ── Colour helpers ────────────────────────────────────────────────────────────

const PRIORITY_COLOUR: Record<Priority, chalk.Chalk> = {
  high:   chalk.bold.red,
  medium: chalk.bold.yellow,
  low:    chalk.bold.green,
};

const PRIORITY_ICON: Record<Priority, string> = {
  high:   "🔴",
  medium: "🟡",
  low:    "🟢",
};

function priorityLabel(p: Priority): string {
  return PRIORITY_COLOUR[p](`${PRIORITY_ICON[p]} ${p}`);
}

function statusLabel(done: boolean): string {
  return done ? chalk.green("✔ done") : chalk.gray("○ open");
}

function dueLabel(dateStr?: string): string {
  if (!dateStr) return chalk.gray("—");
  const formatted = formatDue(dateStr);
  return isOverdue(dateStr) ? chalk.red(formatted) : chalk.cyan(formatted);
}

function tagsLabel(tags: string[]): string {
  if (tags.length === 0) return chalk.gray("—");
  return tags.map((t) => chalk.magenta(`#${t}`)).join(" ");
}

function shortId(id: string): string {
  return chalk.gray(id.slice(0, 8));
}

// ── Public renderers ──────────────────────────────────────────────────────────

export function printTask(task: Task): void {
  const dim = chalk.dim("│");
  console.log(
    `\n  ${shortId(task.id)}  ${task.done ? chalk.strikethrough.gray(task.title) : chalk.white.bold(task.title)}`
  );
  console.log(`  ${dim} Status  : ${statusLabel(task.done)}`);
  console.log(`  ${dim} Priority: ${priorityLabel(task.priority)}`);
  console.log(`  ${dim} Due     : ${dueLabel(task.dueDate)}`);
  console.log(`  ${dim} Tags    : ${tagsLabel(task.tags)}`);
}

export function printTaskList(tasks: Task[]): void {
  if (tasks.length === 0) {
    console.log(chalk.yellow("\n  No tasks found.\n"));
    return;
  }

  console.log(
    chalk.dim(`\n  ${"ID".padEnd(10)}${"TITLE".padEnd(36)}${"STATUS".padEnd(10)}${"PRIORITY".padEnd(10)}${"DUE".padEnd(18)}TAGS`)
  );
  console.log(chalk.dim("  " + "─".repeat(90)));

  for (const task of tasks) {
    const id       = task.id.slice(0, 8).padEnd(10);
    const title    = truncate(task.done ? chalk.strikethrough.gray(task.title) : chalk.white(task.title), 34).padEnd(34);
    const status   = (task.done ? chalk.green("✔ done") : chalk.gray("○ open")).padEnd(10);
    const priority = `${PRIORITY_ICON[task.priority]} ${task.priority}`.padEnd(10);
    const due      = task.dueDate
      ? (isOverdue(task.dueDate) ? chalk.red(task.dueDate) : chalk.cyan(task.dueDate)).padEnd(18)
      : chalk.gray("—").padEnd(18);
    const tags     = task.tags.length ? task.tags.map((t) => chalk.magenta(`#${t}`)).join(" ") : chalk.gray("—");

    console.log(`  ${chalk.gray(id)}${title}  ${status}${priority}  ${due}${tags}`);
  }

  console.log(chalk.dim("  " + "─".repeat(90)));
  console.log(chalk.dim(`  ${tasks.length} task${tasks.length === 1 ? "" : "s"}\n`));
}

export function printSuccess(msg: string): void {
  console.log(chalk.green(`\n  ✔  ${msg}\n`));
}

export function printError(msg: string): void {
  console.log(chalk.red(`\n  ✖  ${msg}\n`));
}

export function printInfo(msg: string): void {
  console.log(chalk.cyan(`\n  ℹ  ${msg}\n`));
}

// ── Internal ──────────────────────────────────────────────────────────────────

function truncate(str: string, len: number): string {
  // chalk codes inflate raw length, so strip ANSI for measurement
  const plain = str.replace(/\x1b\[[0-9;]*m/g, "");
  if (plain.length <= len) return str;
  // Trim visible chars, keep ANSI codes intact as much as possible
  return str.slice(0, len - 1) + "…";
}
