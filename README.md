# Onyx
Onyx - a Discord bot that writes, edits, and pushes code to GitHub so you don't have to.

## Repo Structure

```
projects/          ← one subfolder per project
  tictactoe/       ← Tic Tac Toe CLI game
scrap/             ← throwaway experiments and scratch files
```

## Adding a New Project

1. Create a new folder under `projects/` (e.g. `projects/myproject/`)
2. Add your TypeScript files inside it
3. TypeScript will pick them up automatically via `tsconfig.json`

## Running a Project

Update the `dev` script in `package.json` to point to the entry file of the project you want to run, then:

```bash
pnpm dev
```