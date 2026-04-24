/** Discord command kinds the bot understands. */
export type CommandKind = "create" | "edit" | "ask";

/** A successfully parsed Discord message command. */
export interface ParsedCommand {
  kind: CommandKind;
  /** Repo-relative path, e.g. "src/util/log.ts". */
  path: string;
  /** Natural-language instruction or question that follows the path. */
  body: string;
}

/** A file fetched from the configured GitHub repo. */
export interface RepoFile {
  path: string;
  content: string;
  /** Blob SHA — required when updating an existing file via the GitHub API. */
  sha: string;
}
