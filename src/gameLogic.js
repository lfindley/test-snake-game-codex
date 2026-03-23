export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const DEFAULT_TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function createInitialSnake() {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid }
  ];
}

export function getAvailableCells(snake, gridSize = GRID_SIZE) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const cells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        cells.push({ x, y });
      }
    }
  }

  return cells;
}

export function placeFood(snake, random = Math.random, gridSize = GRID_SIZE) {
  const cells = getAvailableCells(snake, gridSize);
  if (cells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * cells.length);
  return cells[index];
}

export function createInitialState(random = Math.random) {
  const snake = createInitialSnake();
  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, random),
    score: 0,
    isGameOver: false,
    isPaused: true,
    hasStarted: false
  };
}

export function setDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  const blockedDirection = OPPOSITES[state.direction];
  if (nextDirection === blockedDirection && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    hasStarted: true,
    isPaused: !state.isPaused
  };
}

export function restartGame(random = Math.random) {
  return createInitialState(random);
}

export function stepGame(state, random = Math.random) {
  if (state.isPaused || state.isGameOver) {
    return state;
  }

  const direction = state.pendingDirection;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y
  };

  const hitsWall =
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize;

  if (hitsWall) {
    return {
      ...state,
      direction,
      isGameOver: true,
      isPaused: true
    };
  }

  const grows = state.food && positionsEqual(nextHead, state.food);
  const nextBody = grows ? state.snake : state.snake.slice(0, -1);
  const hitsSelf = nextBody.some((segment) => positionsEqual(segment, nextHead));

  if (hitsSelf) {
    return {
      ...state,
      direction,
      isGameOver: true,
      isPaused: true
    };
  }

  const nextSnake = [nextHead, ...nextBody];
  const nextFood = grows ? placeFood(nextSnake, random, state.gridSize) : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: nextFood,
    score: grows ? state.score + 1 : state.score,
    hasStarted: true
  };
}
