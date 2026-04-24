import OpenAI from "openai";

const MODEL = process.env.CLAUDE_MODEL?.trim() || "anthropic/claude-sonnet-4.6";
const MAX_TOKENS = 4096;

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    // Optional attribution headers for the OpenRouter rankings page.
    "HTTP-Referer": "https://github.com/discord-programming-buddy",
    "X-Title": "Discord Programming Buddy",
  },
});

/** Send one prompt to Claude via OpenRouter and return the assistant's text. */
async function ask(system: string, user: string): Promise<string> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("OpenRouter returned no text content.");
  return text;
}

/** Stream one prompt's response as text deltas as they arrive. */
async function* askStream(
  system: string,
  user: string,
): AsyncGenerator<string, void, void> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  for await (const part of stream) {
    const delta = part.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

/** Strip a single surrounding ```lang … ``` fence if present. */
function stripFences(raw: string): string {
  const match = raw.trim().match(/^```[\w-]*\n([\s\S]*?)\n```$/);
  return match ? match[1] : raw;
}

/**
 * Generate the contents of a new file from a natural-language description.
 * Returns raw file content with no markdown fences.
 */
export async function generateFile(
  path: string,
  description: string,
): Promise<string> {
  const system =
    "You write production-quality source files. Reply with ONLY the file contents — " +
    "no prose, no explanation, no markdown fences. Your first character is the first " +
    "character of the file written to disk.";
  return stripFences(
    await ask(system, `Create a file at \`${path}\`.\n\n${description}`),
  );
}

/** Apply an instruction to an existing file and return the full updated body. */
export async function editFile(
  path: string,
  current: string,
  instruction: string,
): Promise<string> {
  const system =
    "You edit source files. Reply with ONLY the complete updated file contents — " +
    "no prose, no diff, no markdown fences. Preserve unrelated code exactly.";
  const user =
    `File: \`${path}\`\n\nCurrent contents:\n\`\`\`\n${current}\n\`\`\`\n\n` +
    `Instruction:\n${instruction}`;
  return stripFences(await ask(system, user));
}

/** Answer a free-form question about a single file's contents. */
export async function answerQuestion(
  path: string,
  content: string,
  question: string,
): Promise<string> {
  const system =
    "You are a concise programming buddy. Answer questions about the supplied " +
    "code directly. Use markdown when helpful.";
  return ask(
    system,
    `File: \`${path}\`\n\n\`\`\`\n${content}\n\`\`\`\n\nQuestion: ${question}`,
  );
}

/** Streaming variant of answerQuestion — yields text deltas as they arrive. */
export function answerQuestionStream(
  path: string,
  content: string,
  question: string,
): AsyncGenerator<string, void, void> {
  const system =
    "You are a concise programming buddy. Answer questions about the supplied " +
    "code directly. Use markdown when helpful.";
  const user = `File: \`${path}\`\n\n\`\`\`\n${content}\n\`\`\`\n\nQuestion: ${question}`;
  return askStream(system, user);
}
