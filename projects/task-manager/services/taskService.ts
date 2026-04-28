import { v4 as uuidv4 } from "uuid";
import { Task, Priority, AddOptions, EditOptions } from "../types";
import { loadTasks, saveTasks } from "../utils/storage";
import { parseDate } from "../utils/date";

// ── Helpers ───────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function normaliseTags(raw?: string | string[]): string[] {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .flatMap((t) => t.split(","))
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

const VALID_PRIORITIES: Priority[] = ["low", "medium", "high"];

function validatePriority(p?: string): Priority {
  if (!p) return "medium";
  if (!VALID_PRIORITIES.includes(p as Priority)) {
    throw new Error(`Invalid priority "${p}". Choose from: low, medium, high.`);
  }
  return p as Priority;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export function addTask(title: string, opts: AddOptions): Task {
  if (!title.trim()) throw new Error("Task title cannot be empty.");

  const dueDate = opts.due ? parseDate(opts.due) ?? undefined : undefined;
  if (opts.due && !dueDate) {
    throw new Error(`Invalid date "${opts.due}". Expected format: YYYY-MM-DD.`);
  }

  const task: Task = {
    id:        uuidv4(),
    title:     title.trim(),
    tags:      normaliseTags(opts.tag),
    priority:  validatePriority(opts.priority),
    dueDate,
    done:      false,
    createdAt: now(),
    updatedAt: now(),
  };

  const tasks = loadTasks();
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function editTask(id: string, opts: EditOptions): Task {
  const tasks = loadTasks();
  const task  = findTask(tasks, id);

  if (opts.title !== undefined) {
    if (!opts.title.trim()) throw new Error("Task title cannot be empty.");
    task.title = opts.title.trim();
  }

  if (opts.tag !== undefined) {
    task.tags = normaliseTags(opts.tag);
  }

  if (opts.priority !== undefined) {
    task.priority = validatePriority(opts.priority);
  }

  if (opts.due !== undefined) {
    if (opts.due === "") {
      task.dueDate = undefined;
    } else {
      const parsed = parseDate(opts.due);
      if (!parsed) throw new Error(`Invalid date "${opts.due}". Expected format: YYYY-MM-DD.`);
      task.dueDate = parsed;
    }
  }

  task.updatedAt = now();
  saveTasks(tasks);
  return task;
}

export function markDone(id: string): Task {
  const tasks = loadTasks();
  const task  = findTask(tasks, id);

  if (task.done) throw new Error(`Task "${task.title}" is already marked as done.`);

  task.done      = true;
  task.updatedAt = now();
  saveTasks(tasks);
  return task;
}

export function deleteTask(id: string): Task {
  const tasks   = loadTasks();
  const task    = findTask(tasks, id);
  const updated = tasks.filter((t) => t.id !== task.id);
  saveTasks(updated);
  return task;
}

// ── Internal ──────────────────────────────────────────────────────────────────

/**
 * Finds a task by full ID or an unambiguous prefix (min 4 chars).
 */
function findTask(tasks: Task[], id: string): Task {
  if (id.length < 4) {
    throw new Error("ID prefix must be at least 4 characters.");
  }

  const matches = tasks.filter((t) => t.id.startsWith(id));

  if (matches.length === 0) throw new Error(`No task found with ID starting with "${id}".`);
  if (matches.length > 1)   throw new Error(`Ambiguous ID prefix "${id}" matches ${matches.length} tasks. Use more characters.`);

  return matches[0];
}
