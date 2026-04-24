# Onyx — Discord Programming Buddy

## What this project is
A Discord bot that acts as an AI programming buddy. I describe what I want in
natural language in Discord, and the bot writes code and pushes it to GitHub.

## Tech Stack
- Runtime: Node.js 18+
- Language: TypeScript (strict mode)
- Discord: discord.js v14
- AI: OpenRouter (OpenAI-compatible SDK), defaulting to anthropic/claude-sonnet-4.6
- GitHub: @octokit/rest
- Config: dotenv
- Build: ts-node for dev, tsc for prod

## Status: MVP complete ✅
Working end-to-end as of this session:
1. ✅ Create a new file in the repo from a natural-language prompt
2. ✅ Edit an existing file based on an instruction
3. ✅ Answer questions about existing code (single file)

One repo, one channel, prefix commands (`!create` / `!edit` / `!ask` / `!help`),
commits straight to the default branch.

## Project Structure
src/
├── index.ts         → Discord bot entry, message listener, command parser
├── claude.ts        → OpenRouter wrapper (generate/edit/answer)
├── github.ts        → GitHub operations (read/write/commit files)
└── types.ts         → Shared TypeScript interfaces

## Environment Variables (always remind me if I'm missing one)
DISCORD_TOKEN=
OPENROUTER_API_KEY=
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
CLAUDE_MODEL=         # optional, defaults to anthropic/claude-sonnet-4.6

## Known weaknesses to keep in mind
- **Brittle command parsing.** Prefix grammar `!<kind> <path> <body>` silently
  mis-parses when the user forgets the path (e.g. `!ask Who are you?` treats
  "Who" as a path). Slash commands will fix this categorically.
- **No conversation memory.** Every request is one-shot; follow-ups like
  "now refactor it" have no referent.
- **Single-file context only.** `!ask` can't reason across the codebase.
- **Commits straight to main.** No review step, no undo.
- **No usage visibility.** OpenRouter returns `usage.cost` per call but we
  don't log it.

## Coding Preferences (unchanged)
- Always explain what you're building before writing code
- Keep each file small and focused — one responsibility per file
- Use async/await, never raw promises or callbacks
- Always type everything explicitly — no `any`
- Add a brief JSDoc comment on every exported function
- When editing existing code, show only the changed section unless I ask for the full file
- Use `||` with `.trim()` (not `??`) when falling back on env vars — empty
  strings in `.env` are a real failure mode, learned the hard way

## How to respond to my feature requests
1. Briefly explain the approach (2-3 sentences)
2. List which files will be created or changed
3. Write the code
4. Tell me what command to run to test it

## Next session: Streaming + Slash Commands
Goal: make the bot feel alive and eliminate the parsing footguns in one pass.

**Streaming responses**
- Use OpenRouter SSE (`stream: true`) in `claude.ts`
- For long ops (edit/ask), post an initial Discord message then edit it as
  tokens arrive; throttle edits to ~once/second to respect Discord rate limits
- Keep the non-streaming path available for short operations where it's not
  worth the overhead

**Slash commands**
- Register `/create`, `/edit`, `/ask`, `/help` via discord.js `REST` + routes
- Separate arguments (path, body) — no more ambiguous parsing
- Add a one-time registration script (`npm run register-commands`)
- Keep prefix commands working for now as a fallback; remove once slash is solid

Files that'll change: `src/index.ts`, `src/claude.ts`, new `src/commands.ts`
for slash definitions, new `scripts/register-commands.ts`.

## Roadmap (ordered by value per hour)
Tier 1 — do soon:
- ✅ **Streaming responses + slash commands** (next session)
- **Branch management + PR creation** — session after next. Biggest safety
  upgrade: bot stops committing to main, opens PRs you review instead.

Tier 2 — pick based on how the bot is being used:
- **Conversation context** — remember last N messages per channel, pass as
  prior turns. Makes follow-ups work. Dies on restart (fine for now).
- **Multi-file awareness / tool use** — give Claude `read_file`,
  `list_directory`, `write_file` as tools and let it decide what to read.
  Bigger lift, much higher ceiling. This is the Claude-Code-style direction.
- **Multi-repo support** — channel-to-repo mapping in a config file.

Tier 3 — nice to have, not urgent:
- Folder scaffolding (rare use case vs. single-file flow)
- Cost & usage logging (cheap to add, low daily value)

Tier 4 — big projects, defer:
- Sandbox code execution (Docker, resource limits, network isolation)

## Decisions log
- **2026-04-25** — Switched from Anthropic SDK to OpenRouter (OpenAI-compatible
  SDK pointed at `https://openrouter.ai/api/v1`). Lets us swap models via env
  var without code changes.
- **2026-04-25** — MVP shipped. Next focus is UX (streaming + slash) before
  capability expansion (branches, tool use).