export type Player = "X" | "O";

export interface PlayerState {
  current: Player;
}

export function createPlayerState(): PlayerState {
  return { current: "X" };
}

export function switchPlayer(state: PlayerState): void {
  state.current = state.current === "X" ? "O" : "X";
}
