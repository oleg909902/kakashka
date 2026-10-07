import { TRAIL_LIFE, TRAIL_STEP } from '../config';
import type { GameState } from '../types';

/** Drops stains behind the tail and removes expired ones. */
export function trailSystem({ snake, trail, time }: GameState) {
  'worklet';
  const tail = snake.points[snake.points.length - 1];
  if (Math.hypot(tail.x - trail.lastDrop.x, tail.y - trail.lastDrop.y) > TRAIL_STEP) {
    trail.stains.push({
      x: tail.x,
      y: tail.y,
      born: time,
      r: 5 + Math.random() * 4,
      seed: Math.random() * Math.PI * 2,
    });
    trail.lastDrop = { x: tail.x, y: tail.y };
  }
  while (trail.stains.length > 0 && time - trail.stains[0].born > TRAIL_LIFE) {
    trail.stains.shift();
  }
}
