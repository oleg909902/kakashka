import { MIN_LENGTH_RATIO, SEGMENTS, SHRINK_RATE, START_LENGTH_CM } from '../config';
import type { GameState, StepContext } from '../types';

export function lengthInCm(length: number) {
  'worklet';
  return (length / SEGMENTS) * START_LENGTH_CM;
}

/**
 * The snake keeps shrinking; food (see foodSystem) makes it longer.
 * Fits the body to the target length and ends the game when it gets too short.
 */
export function lengthSystem(state: GameState, { dt }: StepContext) {
  'worklet';
  state.length -= SHRINK_RATE * dt;
  if (state.length < SEGMENTS * MIN_LENGTH_RATIO) {
    state.phase = 'dying';
    state.diedAt = state.time;
    return;
  }

  const pts = state.snake.points;
  const target = Math.max(2, Math.ceil(state.length));
  // New segments start at the tail and get pulled into place by bodySystem
  while (pts.length < target) {
    const tail = pts[pts.length - 1];
    pts.push({ x: tail.x, y: tail.y });
  }
  if (pts.length > target) pts.length = target;
}
