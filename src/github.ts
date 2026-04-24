import { Octokit } from "@octokit/rest";
import type { RepoFile } from "./types";

const owner = process.env.GITHUB_OWNER ?? "";
const repo = process.env.GITHUB_REPO ?? "";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/** Fetch a file from the configured repo. Returns null if the path does not exist. */
export async function readFile(path: string): Promise<RepoFile | null> {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    if (Array.isArray(res.data) || res.data.type !== "file") {
      throw new Error(`\`${path}\` is not a file.`);
    }
    const content = Buffer.from(res.data.content, "base64").toString("utf8");
    return { path, content, sha: res.data.sha };
  } catch (err: unknown) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/**
 * Create a new file or update an existing one. Pass `sha` (from a prior
 * readFile call) to update; omit it to create.
 */
export async function writeFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<void> {
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    sha,
  });
}

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status: unknown }).status === 404
  );
}
