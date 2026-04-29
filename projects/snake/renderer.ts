import chalk from "chalk";
import { GameState, Direction } from "./game";

// ─── ANSI helpers ────────────────────────────────────────────────────────────

const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
const CLEAR_SCREEN = "\x1b[2J\x1b[H";
const HOME = "\x1b[H";

export function hideCursor(): void {
  process.stdout.write(HIDE_CURSOR);
}

export function showCursor(): void {
  process.stdout.write(SHOW_CURSOR);
}

export function clearScreen(): void {
  process.stdout.write(CLEAR_SCREEN);
}

// ─── Glyph maps ──────────────────────────────────────────────────────────────

const HEAD_GLYPH: Record<Direction, string> = {
  RIGHT: "▶",
  LEFT:  "◀",
  UP:    "▲",
  DOWN:  "▼",
};

const BODY_GLYPH = "●";
const EMPTY_GLYPH = " ";

// ─── Gradient helper ─────────────────────────────────────────────────────────
// Interpolates from bright lime (head) to dark green (tail) across the body.

function snakeColor(index: number, total: number, dead: boolean): chalk.Chalk {
  if (dead) return chalk.rgb(220, 30, 30);

  // index 0 = head (bright), index total-1 = tail (dark)
  const t = total <= 1 ? 0 : index / (total - 1);
  const r = Math.round(50  + (1 - t) * 150);  // 200 → 50
  const g = Math.round(180 + (1 - t) * 75);   // 255 → 180
  const b = Math.round(0   + (1 - t) * 0);    // stays 0
  return chalk.rgb(r, g, b).bold;
}

// ─── Border ──────────────────────────────────────────────────────────────────

function borderColor(s: string): string {
  return chalk.cyan.bold(s);
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

export function renderHUD(score: number, speed: number, width: number): string {
  const sep = chalk.dim.cyan("  ║  ");
  const scoreStr = chalk.bold.white("● SCORE: ") + chalk.bold.yellow(String(score).padStart(4, " "));
  const speedStr = chalk.bold.white("◈ SPEED: ") + chalk.bold.magenta(String(speed));
  const hint     = chalk.dim.gray("  [WASD / ↑↓←→]  Q to quit");

  // Total inner board width: each cell is 2 chars wide + borders
  const innerWidth = width * 2 + 1;
  const hudContent = ` ${scoreStr}${sep}${speedStr}${hint}`;
  return hudContent;
}

// ─── Food animation ──────────────────────────────────────────────────────────

function foodGlyph(tick: number): string {
  const pulse = tick % 2 === 0;
  const glyph = pulse ? "◆" : "◇";
  const color = pulse ? chalk.rgb(255, 80, 80).bold : chalk.rgb(255, 200, 50).bold;
  return color(glyph);
}

// ─── Main render ─────────────────────────────────────────────────────────────

export function renderFrame(state: GameState, dead = false): void {
  const { snake, food, direction, score, speed, tick, width, height } = state;

  const snakeSet = new Map<string, number>();
  snake.forEach((p, i) => snakeSet.set(`${p.x},${p.y}`, i));

  const lines: string[] = [];

  // HUD
  lines.push(renderHUD(score, speed, width));

  // Top border
  lines.push(borderColor("╔" + "══".repeat(width) + "╗"));

  // Rows
  for (let y = 0; y < height; y++) {
    let row = borderColor("║");
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      const snakeIdx = snakeSet.get(key);

      if (snakeIdx !== undefined) {
        const color = snakeColor(snakeIdx, snake.length, dead);
        const glyph = snakeIdx === 0 ? HEAD_GLYPH[direction] : BODY_GLYPH;
        row += color(glyph) + color(" ");
      } else if (food.x === x && food.y === y) {
        row += foodGlyph(tick) + " ";
      } else {
        row += chalk.dim.gray(EMPTY_GLYPH) + " ";
      }
    }
    row += borderColor("║");
    lines.push(row);
  }

  // Bottom border
  lines.push(borderColor("╚" + "══".repeat(width) + "╝"));

  // Move cursor to home and write all at once (flicker-free)
  process.stdout.write(HOME + lines.join("\n") + "\n");
}

// ─── Death screen ─────────────────────────────────────────────────────────────

export function renderDeathFlash(state: GameState): void {
  renderFrame(state, true);
}

// ─── Game over message ────────────────────────────────────────────────────────

export function renderGameOver(score: number): void {
  console.log();
  console.log(chalk.bold.red("  ☠  GAME OVER!") + "  " + chalk.dim("Your snake hit a wall or itself."));
  console.log(chalk.bold.yellow(`  Final score: ${score}`));
  console.log();
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

export function renderWelcome(): void {
  clearScreen();
  console.log();
  console.log(chalk.bold.greenBright("  ╔═══════════════════════════╗"));
  console.log(chalk.bold.greenBright("  ║   🐍  SNAKE  TERMINAL     ║"));
  console.log(chalk.bold.greenBright("  ╚═══════════════════════════╝"));
  console.log();
  console.log(chalk.white("  Use ") + chalk.bold.cyan("WASD") + chalk.white(" or ") + chalk.bold.cyan("Arrow keys") + chalk.white(" to move"));
  console.log(chalk.white("  Press ") + chalk.bold.red("Q") + chalk.white(" to quit at any time"));
  console.log(chalk.white("  Eat ") + chalk.rgb(255, 80, 80).bold("◆") + chalk.white(" to grow and score points"));
  console.log(chalk.white("  Speed increases every ") + chalk.bold.magenta("5 points"));
  console.log();
}
