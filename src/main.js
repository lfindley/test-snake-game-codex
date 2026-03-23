import {
  DEFAULT_TICK_MS,
  GRID_SIZE,
  createInitialState,
  restartGame,
  setDirection,
  stepGame,
  togglePause
} from "./gameLogic.js";

const board = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState();

function buildBoard() {
  board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
  board.style.backgroundSize = `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.appendChild(cell);
  }

  board.appendChild(fragment);
}

function getStatusText() {
  if (state.isGameOver) {
    return "Game Over";
  }

  if (!state.hasStarted) {
    return "Ready";
  }

  return state.isPaused ? "Paused" : "Running";
}

function render() {
  const cells = board.children;
  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    const foodIndex = state.food.y * GRID_SIZE + state.food.x;
    cells[foodIndex].classList.add("food");
  }

  state.snake.forEach((segment, index) => {
    const segmentIndex = segment.y * GRID_SIZE + segment.x;
    cells[segmentIndex].classList.add("snake");
    if (index === 0) {
      cells[segmentIndex].classList.add("head");
    }
  });

  scoreElement.textContent = String(state.score);
  statusElement.textContent = getStatusText();
  pauseButton.textContent = state.isPaused && state.hasStarted && !state.isGameOver ? "Resume" : "Pause";
}

function move(direction) {
  state = setDirection(state, direction);
  if (!state.hasStarted) {
    state = togglePause(state);
  }
  render();
}

function reset() {
  state = restartGame();
  render();
}

function tick() {
  state = stepGame(state);
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const keyDirectionMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = keyDirectionMap[key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  move(direction);
});

startButton.addEventListener("click", () => {
  if (!state.isGameOver && state.isPaused) {
    state = togglePause(state);
    render();
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", () => {
  reset();
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    move(button.dataset.direction);
  });
});

buildBoard();
render();
setInterval(tick, DEFAULT_TICK_MS);
