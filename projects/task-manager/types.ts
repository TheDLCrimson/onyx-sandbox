export type Priority = "low" | "medium" | "high";

export type SortOption = "due" | "priority" | "created";

export interface Task {
  id: string;
  title: string;
  tags: string[];
  priority: Priority;
  dueDate?: string; // "YYYY-MM-DD"
  done: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface FilterOptions {
  tag?: string;
  done?: boolean;
  priority?: Priority;
  sort?: SortOption;
}

export interface AddOptions {
  tag?: string | string[];
  priority?: Priority;
  due?: string;
}

export interface EditOptions {
  title?: string;
  tag?: string | string[];
  priority?: Priority;
  due?: string;
}
