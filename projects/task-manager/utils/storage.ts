import * as fs from "fs";
import * as path from "path";
import { Task } from "../types";

const STORAGE_PATH = path.resolve(__dirname, "../tasks.json");

export function loadTasks(): Task[] {
  if (!fs.existsSync(STORAGE_PATH)) {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify([], null, 2), "utf-8");
    return [];
  }

  try {
    const raw = fs.readFileSync(STORAGE_PATH, "utf-8");
    return JSON.parse(raw) as Task[];
  } catch {
    console.error("⚠  Could not parse tasks.json. Starting fresh.");
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}
