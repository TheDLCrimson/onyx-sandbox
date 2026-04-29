import fs from "fs";
import path from "path";
import { Snippet } from "./types";

const DATA_PATH = path.resolve(__dirname, "../data/snippets.json");

export function readSnippets(): Snippet[] {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, "[]", "utf-8");
  }
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as Snippet[];
}

export function writeSnippets(snippets: Snippet[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(snippets, null, 2), "utf-8");
  console.log(`Data saved to: ${DATA_PATH}`);
}

export function findById(id: string): Snippet | undefined {
  return readSnippets().find((s) => s.id === id);
}