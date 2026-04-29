projects/snake/index.ts
import * as readline from "readline";
import {
  createGame,
  stepGame,
  tickInterval,
  GameState,
} from "./game";
import { setupInput } from "./input";
import {
  clearScreen,
  hideCursor,
  showCursor,
  renderFrame,
  renderDeathFlash,
  renderGameOver,
  renderWelcome,
} from "./renderer";

// ─── Readline helper (for play-again prompt) ──────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ─── Game loop ────────────────────────────────────────────────────────────────

function runGameLoop(state: GameState): Promise<void> {
  return new Promise((resolve) => {
    let intervalId: ReturnType<typeof setInterval>;
    let quit = false;

    const cleanup = setupInput((event) => {
      if (event.type === "direction") {
        state.nextDirection = event.dir;
      } else if (event.type === "quit") {
        quit = true;
        state.alive = false;
      }
    });

    function tick(): void {
      stepGame(state);

      if (!state.alive) {
        clearInterval(intervalId);
        cleanup();

        if (!quit) {
          renderDeathFlash(state);
          // Brief pause so the red flash is visible
          setTimeout(() => {
            renderGameOver(state.score);
            resolve();
          }, 350);
        } else {
          resolve();
        }
        return;
      }

      renderFrame(state);

      // Re-schedule at the (possibly updated) speed
      const newInterval = tickInterval(state.speed);
      // We use a self-rescheduling pattern to allow dynamic speed changes
      clearInterval(intervalId);
      intervalId = setInterval(tick, newInterval);
    }

    // Initial render
    renderFrame(state);
    intervalId = setInterval(tick, tickInterval(state.speed));
  });
}

// ─── Stdin helper ─────────────────────────────────────────────────────────────

/** Switch stdin back to line mode and drain any buffered raw-mode keypresses. */
function flushAndLineMode(): Promise<void> {
  process.stdin.setRawMode(false);
  process.stdin.resume();
  // Drain buffered data (arrow keys etc.) that arrived during raw mode
  return new Promise((resolve) => setTimeout(resolve, 50));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  hideCursor();

  try {
    renderWelcome();

    // Re-enable line mode temporarily for the first prompt
    await flushAndLineMode();
    await ask("  Press ENTER to start...");

    while (true) {
      clearScreen();
      const state = createGame(20, 20);
      await runGameLoop(state);

      await flushAndLineMode();
      const answer = await ask("  Play again? (y/n): ");
      console.log();

      if (answer.trim().toLowerCase() !== "y") {
        console.log("  Thanks for playing! 🐍 Goodbye.\n");
        break;
      }
    }
  } finally {
    showCursor();
    rl.close();
  }
}

main().catch((err) => {
  showCursor();
  console.error(err);
  rl.close();
  process.exit(1);
});