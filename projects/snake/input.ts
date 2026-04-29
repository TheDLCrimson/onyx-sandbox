import { Direction } from "./game";

export type InputEvent = { type: "direction"; dir: Direction } | { type: "quit" };

export function setupInput(handler: (event: InputEvent) => void): () => void {
  const { stdin } = process;
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  function onData(key: string): void {
    // Arrow keys send escape sequences
    if (key === "\u001b[A" || key === "w" || key === "W") {
      handler({ type: "direction", dir: "UP" });
    } else if (key === "\u001b[B" || key === "s" || key === "S") {
      handler({ type: "direction", dir: "DOWN" });
    } else if (key === "\u001b[D" || key === "a" || key === "A") {
      handler({ type: "direction", dir: "LEFT" });
    } else if (key === "\u001b[C" || key === "d" || key === "D") {
      handler({ type: "direction", dir: "RIGHT" });
    } else if (key === "q" || key === "Q" || key === "\u0003" /* Ctrl+C */) {
      handler({ type: "quit" });
    }
  }

  stdin.on("data", onData);

  // Return a cleanup function
  return () => {
    stdin.off("data", onData);
    stdin.setRawMode(false);
    stdin.pause();
  };
}
