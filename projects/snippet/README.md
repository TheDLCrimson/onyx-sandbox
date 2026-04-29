# 🗂️ Snippet — CLI Code Snippet Manager

A simple CLI tool to **store and retrieve code snippets** from a local JSON file.

Built with TypeScript, [Commander](https://github.com/tj/commander.js), and [Chalk](https://github.com/chalk/chalk).

---

## Getting Started

Run any command via:

```bash
pnpm snippet <command> [options]
```

---

## Commands

### `add` — Save a new snippet

```bash
pnpm snippet add <title> -l <language> [options]
```

| Option | Description |
|---|---|
| `-l, --language <lang>` | **(Required)** Language, e.g. `typescript`, `bash` |
| `-c, --code <code>` | Inline code string |
| `-f, --file <path>` | Read code from a file |
| `-t, --tag <tags>` | Comma-separated tags, e.g. `utils,async` |

**Examples:**
```bash
pnpm snippet add "Debounce function" -l typescript -c "const debounce = ..." -t utils,async
pnpm snippet add "Docker cleanup" -l bash -f ./cleanup.sh -t docker,ops
```

---

### `list` — List all snippets

```bash
pnpm snippet list [options]
```

| Option | Description |
|---|---|
| `-l, --language <lang>` | Filter by language |
| `-t, --tag <tag>` | Filter by tag |

**Examples:**
```bash
pnpm snippet list
pnpm snippet list -l typescript
pnpm snippet list -t utils
```

---

### `get` — View a snippet's code

```bash
pnpm snippet get <id>
```

You can use a short ID prefix (first 8 characters) instead of the full UUID.

**Example:**
```bash
pnpm snippet get a1b2c3d4
```

---

### `search` — Search snippets

```bash
pnpm snippet search <query>
```

Searches across **title**, **tags**, **language**, and **code content**.

**Example:**
```bash
pnpm snippet search debounce
```

---

### `delete` — Delete a snippet

```bash
pnpm snippet delete <id>
```

Prompts for confirmation before deleting. Accepts a full ID or short prefix.

**Example:**
```bash
pnpm snippet delete a1b2c3d4
```

---

## Data Storage

Snippets are stored in [`data/snippets.json`](./data/snippets.json). The file is created automatically on first use.

---

## Snippet Shape

```ts
interface Snippet {
  id: string;        // UUID
  title: string;
  language: string;
  tags: string[];
  code: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```
