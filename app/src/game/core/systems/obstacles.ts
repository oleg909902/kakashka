import { HEAD_RADIUS } from '../config';
import { normalizeAngle } from '../math';
import type { GameState, StepContext } from '../types';

/** Pushes the head out of solid obstacles and bounces it off their surface. */
export function obstaclesSystem({ snake }: GameState, { level }: StepContext) {
  'worklet';
  const head = snake.points[0];
  for (const o of level.solids) {
    const dx = head.x - o.x;
    const dy = head.y - o.y;
    const minDist = o.r + HEAD_RADIUS * 0.8;
    if (Math.abs(dx) > minDist || Math.abs(dy) > minDist) continue;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist >= minDist) continue;

    const nx = dx / dist;
    const ny = dy / dist;
    head.x = o.x + nx * minDist;
    head.y = o.y + ny * minDist;

    // Reflect the heading if it points into the obstacle
    const vx = Math.cos(snake.angle);
    const vy = Math.sin(snake.angle);
    const dot = vx * nx + vy * ny;
    if (dot < 0) snake.angle = normalizeAngle(Math.atan2(vy - 2 * dot * ny, vx - 2 * dot * nx));
  }
}
