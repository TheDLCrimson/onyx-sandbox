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

// ─── Stdin helper ─────────────────────────────────────────────────────────────

/**
 * Switch stdin back to line mode and drain any buffered raw-mode keypresses
 * (arrow keys, etc.) so they don't bleed into the readline prompt.
 */
function flushAndLineMode(): Promise<void> {
  process.stdin.setRawMode(false);
  process.stdin.resume();
  // Small pause lets Node flush the internal read buffer before readline takes over
  return new Promise((resolve) => setTimeout(resolve, 50));
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  hideCursor();

  try {
    renderWelcome();

    // Ensure clean line mode before the first prompt
    await flushAndLineMode();
    await ask("  Press ENTER to start...");

    while (true) {
      clearScreen();
      const state = createGame(20, 20);
      await runGameLoop(state);

      // Drain buffered raw keypresses, then switch to line mode for the prompt
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
