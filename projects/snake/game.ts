export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface Point {
  x: number;
  y: number;
}

export interface GameState {
  snake: Point[];
  apple: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  speed: number; // level, starts at 1
  alive: boolean;
  tick: number;  // increments every game tick (used for food animation)
  width: number;
  height: number;
}

export function createGame(width = 20, height = 20): GameState {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  const snake: Point[] = [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];

  return {
    snake,
    apple: spawnFood(snake, width, height),
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    speed: 1,
    alive: true,
    tick: 0,
    width,
    height,
  };
}

export function spawnFood(snake: Point[], width: number, height: number): Point {
  let pos: Point;
  do {
    pos = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

/** Returns true if the game state changed meaningfully (i.e. not dead already). */
export function stepGame(state: GameState): void {
  if (!state.alive) return;

  // Commit queued direction (prevent 180° reversal)
  const { direction, nextDirection } = state;
  const opposite: Record<Direction, Direction> = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT",
  };
  if (nextDirection !== opposite[direction]) {
    state.direction = nextDirection;
  }

  // Compute new head
  const head = state.snake[0];
  const newHead: Point = { x: head.x, y: head.y };
  if (state.direction === "UP") newHead.y -= 1;
  if (state.direction === "DOWN") newHead.y += 1;
  if (state.direction === "LEFT") newHead.x -= 1;
  if (state.direction === "RIGHT") newHead.x += 1;

  // Wall wrap-through (teleport to opposite side)
  newHead.x = ((newHead.x % state.width) + state.width) % state.width;
  newHead.y = ((newHead.y % state.height) + state.height) % state.height;

  // Self collision
  if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    state.alive = false;
    return;
  }

  // Move snake
  state.snake.unshift(newHead);

  // Eat food?
  if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
    state.score += 1;
    state.speed = 1 + Math.floor(state.score / 5);
    state.apple = spawnFood(state.snake, state.width, state.height);
  } else {
    state.snake.pop();
  }

  state.tick += 1;
}

export function tickInterval(speed: number): number {
  // 120ms at speed 1, floors at 50ms
  return Math.max(50, 120 - (speed - 1) * 10);
}
