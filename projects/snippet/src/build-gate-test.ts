// INTENTIONAL TYPE ERROR — verifies the build gate rejects bad types.
// Remove this file once the gate is confirmed working.
import { Snippet } from "./types";

const bad: Snippet = {
  id: 42,          // ❌ number is not assignable to string
  title: "test",
  language: "ts",
  tags: [],
  code: "console.log(1)",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};
