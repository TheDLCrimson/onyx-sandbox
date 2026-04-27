import * as readline from "readline";
import chalk from "chalk";
import { createBoard, renderBoard, updateBoard, resetBoard } from "./board";
import { createPlayerState, switchPlayer } from "./player";
import { isValidMove } from "./validator";
import { checkWinner, checkDraw } from "./winner";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

function playerLabel(p: "X" | "O"): string {
  return p === "X" ? chalk.bold.blue("X") : chalk.bold.red("O");
}

async function runGame(): Promise<void> {
  const board = createBoard();
  const state = createPlayerState();

  renderBoard(board);

  while (true) {
    const input = await ask(`  Player ${playerLabel(state.current)} — enter a position (1-9): `);

    const result = isValidMove(board, input);
    if (!result.valid) {
      console.log(chalk.yellow(`  ⚠  ${result.reason}\n`));
      continue;
    }

    updateBoard(board, Number(input), state.current);
    renderBoard(board);

    const winner = checkWinner(board);
    if (winner) {
      console.log(chalk.green(`  🎉  Player ${playerLabel(winner)} wins!\n`));
      return;
    }

    if (checkDraw(board)) {
      console.log(chalk.magenta("  🤝  It's a draw!\n"));
      return;
    }

    switchPlayer(state);
  }
}

async function main(): Promise<void> {
  console.log(chalk.bold("\n  🎮  Welcome to Tic Tac Toe!\n"));

  while (true) {
    await runGame();

    const again = await ask("  Play again? (y/n): ");
    console.log();

    if (again.trim().toLowerCase() !== "y") {
      console.log(chalk.gray("  Thanks for playing! Goodbye. 👋\n"));
      break;
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  rl.close();
});
