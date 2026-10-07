import { HEAD_RADIUS, SPEED } from '../config';
import { clamp, normalizeAngle } from '../math';
import type { GameState, StepContext } from '../types';

/** Moves the head forward and bounces it off the world edges. */
export function movementSystem({ snake }: GameState, { dt, level }: StepContext) {
  'worklet';
  const head = snake.points[0];
  head.x += Math.cos(snake.angle) * SPEED * dt;
  head.y += Math.sin(snake.angle) * SPEED * dt;

  const min = HEAD_RADIUS;
  const max = level.size - HEAD_RADIUS;
  if (head.x < min || head.x > max) {
    snake.angle = normalizeAngle(Math.PI - snake.angle);
    head.x = clamp(head.x, min, max);
  }
  if (head.y < min || head.y > max) {
    snake.angle = normalizeAngle(-snake.angle);
    head.y = clamp(head.y, min, max);
  }
}
