import { Board, Cell } from "./board";
import { Player } from "./player";

const WIN_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

function flatBoard(board: Board): Cell[] {
  return board.flat();
}

export function checkWinner(board: Board): Player | null {
  const flat = flatBoard(board);

  for (const [a, b, c] of WIN_LINES) {
    if (flat[a] && flat[a] === flat[b] && flat[a] === flat[c]) {
      return flat[a] as Player;
    }
  }

  return null;
}

export function checkDraw(board: Board): boolean {
  return flatBoard(board).every((cell) => cell !== null);
}
