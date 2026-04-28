import chalk from "chalk";

export type Cell = "X" | "O" | null;
export type Board = Cell[][];

export function createBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

export function resetBoard(board: Board): void {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      board[r][c] = null;
    }
  }
}

export function updateBoard(board: Board, position: number, player: "X" | "O"): void {
  const row = Math.floor((position - 1) / 3);
  const col = (position - 1) % 3;
  board[row][col] = player;
}

function renderCell(cell: Cell): string {
  if (cell === "X") return chalk.bold.blue(" X ");
  if (cell === "O") return chalk.bold.red(" O ");
  return chalk.dim(" · ");
}

export function renderBoard(board: Board): void {
  console.log();
  console.log(chalk.gray("  1 │ 2 │ 3"));
  console.log(chalk.gray(" ───┼───┼───"));
  console.log(chalk.gray("  4 │ 5 │ 6  ") + chalk.italic.gray("← position guide"));
  console.log(chalk.gray(" ───┼───┼───"));
  console.log(chalk.gray("  7 │ 8 │ 9"));
  console.log();
  for (let r = 0; r < 3; r++) {
    const row = board[r].map(renderCell).join(chalk.gray("│"));
    console.log(" " + row);
    if (r < 2) console.log(chalk.gray(" ───┼───┼───"));
  }
  console.log();
}
