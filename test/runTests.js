import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  setDirection,
  stepGame
} from "../src/gameLogic.js";

function stubRandom(value) {
  return () => value;
}

const tests = [
  {
    name: "snake moves one cell in its current direction",
    run() {
      const runningState = {
        ...createInitialState(stubRandom(0)),
        isPaused: false,
        hasStarted: true
      };

      const nextState = stepGame(runningState, stubRandom(0));

      assert.deepEqual(nextState.snake[0], {
        x: runningState.snake[0].x + 1,
        y: runningState.snake[0].y
      });
      assert.equal(nextState.score, 0);
    }
  },
  {
    name: "snake grows and increments score when eating food",
    run() {
      const baseState = createInitialState(stubRandom(0));
      const runningState = {
        ...baseState,
        isPaused: false,
        hasStarted: true,
        food: {
          x: baseState.snake[0].x + 1,
          y: baseState.snake[0].y
        }
      };

      const nextState = stepGame(runningState, stubRandom(0));

      assert.equal(nextState.snake.length, runningState.snake.length + 1);
      assert.equal(nextState.score, 1);
      assert.notDeepEqual(nextState.food, runningState.food);
    }
  },
  {
    name: "reversing direction into the body is ignored",
    run() {
      const state = createInitialState(stubRandom(0));
      const nextState = setDirection(state, "left");

      assert.equal(nextState.pendingDirection, "right");
    }
  },
  {
    name: "wall collision ends the game",
    run() {
      const state = {
        ...createInitialState(stubRandom(0)),
        isPaused: false,
        hasStarted: true,
        snake: [
          { x: 15, y: 8 },
          { x: 14, y: 8 },
          { x: 13, y: 8 }
        ],
        direction: "right",
        pendingDirection: "right"
      };

      const nextState = stepGame(state, stubRandom(0));

      assert.equal(nextState.isGameOver, true);
      assert.equal(nextState.isPaused, true);
    }
  },
  {
    name: "food placement skips occupied snake cells",
    run() {
      const snake = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 }
      ];

      const food = placeFood(snake, stubRandom(0), 4);

      assert.deepEqual(food, { x: 3, y: 0 });
    }
  }
];

let passed = 0;

for (const test of tests) {
  try {
    test.run();
    passed += 1;
    console.log(`PASS ${test.name}`);
  } catch (error) {
    console.error(`FAIL ${test.name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (!process.exitCode) {
  console.log(`${passed}/${tests.length} tests passed`);
}
