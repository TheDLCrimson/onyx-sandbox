import chalk from "chalk";

// ── Types ─────────────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LoggerOptions {
  /** Minimum level to emit. Messages below this are silenced. Default: "info" */
  level?: LogLevel;
  /** Prepend an ISO timestamp to every line. Default: false */
  timestamps?: boolean;
  /** Module name shown in brackets, e.g. "[task-manager]". Default: none */
  name?: string;
}

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  /** Return a child logger that inherits config but carries its own name. */
  child(name: string): Logger;
  /** Reconfigure this logger at runtime. */
  configure(opts: Partial<LoggerOptions>): void;
}

// ── Level ordering ─────────────────────────────────────────────────────────────

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ── Presentation ──────────────────────────────────────────────────────────────

const LEVEL_FORMAT: Record<
  LogLevel,
  { icon: string; label: (s: string) => string; output: typeof console.log }
> = {
  debug: {
    icon: "●",
    label: (s) => chalk.gray(s),
    output: console.debug,
  },
  info: {
    icon: "ℹ",
    label: (s) => chalk.cyan(s),
    output: console.log,
  },
  warn: {
    icon: "⚠",
    label: (s) => chalk.yellow(s),
    output: console.warn,
  },
  error: {
    icon: "✖",
    label: (s) => chalk.bold.red(s),
    output: console.error,
  },
};

// ── Factory ───────────────────────────────────────────────────────────────────

export function createLogger(nameOrOpts?: string | LoggerOptions): Logger {
  // Normalise overloaded argument
  const initOpts: LoggerOptions =
    typeof nameOrOpts === "string"
      ? { name: nameOrOpts }
      : nameOrOpts ?? {};

  let config: Required<LoggerOptions> = {
    level: initOpts.level ?? "info",
    timestamps: initOpts.timestamps ?? false,
    name: initOpts.name ?? "",
  };

  function emit(level: LogLevel, message: string, args: unknown[]): void {
    if (LEVEL_RANK[level] < LEVEL_RANK[config.level]) return;

    const fmt = LEVEL_FORMAT[level];

    const parts: string[] = [];

    if (config.timestamps) {
      parts.push(chalk.dim(new Date().toISOString()));
    }

    parts.push(fmt.label(`${fmt.icon}  ${level.toUpperCase().padEnd(5)}`));

    if (config.name) {
      parts.push(chalk.magenta(`[${config.name}]`));
    }

    parts.push(message);

    const line = parts.join(" ");

    if (args.length > 0) {
      fmt.output(line, ...args);
    } else {
      fmt.output(line);
    }
  }

  const logger: Logger = {
    debug(message, ...args) {
      emit("debug", message, args);
    },
    info(message, ...args) {
      emit("info", message, args);
    },
    warn(message, ...args) {
      emit("warn", message, args);
    },
    error(message, ...args) {
      emit("error", message, args);
    },
    child(name: string): Logger {
      return createLogger({ ...config, name });
    },
    configure(opts: Partial<LoggerOptions>): void {
      config = { ...config, ...opts };
    },
  };

  return logger;
}

// ── Default singleton ─────────────────────────────────────────────────────────

/** Drop-in logger with sensible defaults (level=info, no timestamps, no name). */
export const logger = createLogger();
