# shared/logger

A lightweight, zero-dependency\* logging utility for all projects in this repo.

> \*Uses `chalk` (already a repo dependency) for terminal colours.

---

## Quick start

```ts
import { logger } from "../shared/logger";

logger.info("Hello world");
logger.warn("Something looks off");
logger.error("Boom", new Error("details"));
logger.debug("x =", 42); // silent unless level is set to "debug"
```

## Named loggers

Tag every line with a module name by passing a string to `createLogger`:

```ts
import { createLogger } from "../shared/logger";

const log = createLogger("task-manager");

log.info("Loaded tasks");   // ℹ  INFO  [task-manager] Loaded tasks
log.error("Save failed");   // ✖  ERROR [task-manager] Save failed
```

## Log levels

Levels in ascending order of severity:

| Level   | Icon | Colour | `console` method |
|---------|------|--------|-----------------|
| `debug` | ●    | gray   | `console.debug` |
| `info`  | ℹ    | cyan   | `console.log`   |
| `warn`  | ⚠    | yellow | `console.warn`  |
| `error` | ✖    | red    | `console.error` |

The default minimum level is **`info`** — `debug` messages are suppressed unless
you explicitly lower the threshold.

## Configuration

### At creation time

```ts
const log = createLogger({
  name: "snippet",
  level: "debug",      // emit everything
  timestamps: true,    // prepend ISO timestamp to each line
});
```

### At runtime via `.configure()`

```ts
log.configure({ level: "warn" }); // silence debug + info from here on
log.configure({ timestamps: true });
```

### Child loggers

Inherit all config from a parent but override the name:

```ts
const root = createLogger({ level: "debug", timestamps: true });
const child = root.child("storage");

child.info("File written"); // inherits debug level + timestamps, name="storage"
```

## API reference

```ts
// Create a named logger
createLogger(name: string): Logger
// Create a logger with full options
createLogger(opts: LoggerOptions): Logger

interface LoggerOptions {
  level?:      "debug" | "info" | "warn" | "error"; // default: "info"
  timestamps?: boolean;                              // default: false
  name?:       string;                               // default: ""
}

interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info (message: string, ...args: unknown[]): void;
  warn (message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  child(name: string): Logger;
  configure(opts: Partial<LoggerOptions>): void;
}

// Default singleton (level=info, no timestamps, no name)
export const logger: Logger;
```
