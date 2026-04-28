import { Board } from "./board";

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

export function isValidMove(board: Board, input: string): ValidationResult {
  const position = Number(input);

  if (isNaN(position) || !Number.isInteger(position)) {
    return { valid: false, reason: "Input must be a whole number between 1 and 9." };
  }

  if (position < 1 || position > 9) {
    return { valid: false, reason: "Position out of range. Choose a number between 1 and 9." };
  }

  const row = Math.floor((position - 1) / 3);
  const col = (position - 1) % 3;

  if (board[row][col] !== null) {
    return { valid: false, reason: `Position ${position} is already taken. Pick another.` };
  }

  return { valid: true };
}
