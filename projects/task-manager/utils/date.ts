const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates and normalises a date string to "YYYY-MM-DD".
 * Returns null if the input is not a valid date.
 */
export function parseDate(input: string): string | null {
  if (!DATE_REGEX.test(input)) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return input;
}

/**
 * Formats a "YYYY-MM-DD" string into a human-readable label,
 * e.g. "Aug 1, 2025". Appends "(overdue)" when past today.
 */
export function formatDue(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const label = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return isOverdue(dateStr) ? `${label} (overdue)` : label;
}

/**
 * Returns true when the due date is strictly before today.
 */
export function isOverdue(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + "T00:00:00");
  return due < today;
}

/**
 * Returns today's date as "YYYY-MM-DD".
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
