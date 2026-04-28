import { Task, FilterOptions, Priority } from "../types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  high:   3,
  medium: 2,
  low:    1,
};

export function filterTasks(tasks: Task[], opts: FilterOptions): Task[] {
  let result = [...tasks];

  // ── Filters ────────────────────────────────────────────────────────────────

  if (opts.tag !== undefined) {
    const tag = opts.tag.toLowerCase();
    result = result.filter((t) => t.tags.includes(tag));
  }

  if (opts.done !== undefined) {
    result = result.filter((t) => t.done === opts.done);
  }

  if (opts.priority !== undefined) {
    result = result.filter((t) => t.priority === opts.priority);
  }

  // ── Sorting ────────────────────────────────────────────────────────────────

  switch (opts.sort) {
    case "due":
      result.sort((a, b) => {
        // Tasks without a due date sink to the bottom
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;

    case "priority":
      result.sort(
        (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
      );
      break;

    case "created":
    default:
      result.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
  }

  return result;
}
