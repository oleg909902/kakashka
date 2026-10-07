import { HEAD_RADIUS, TURN_RATE } from '../config';
import { clamp, normalizeAngle } from '../math';
import type { GameState, StepContext } from '../types';

/** Turns the head toward the finger with a limited turn rate. */
export function steeringSystem({ snake, camera }: GameState, { input, dt, viewWidth, viewHeight }: StepContext) {
  'worklet';
  if (!input.touching) return;
  // Finger is in screen space; the camera maps it into the world
  const targetX = input.x - viewWidth / 2 + camera.x;
  const targetY = input.y - viewHeight / 2 + camera.y;
  const head = snake.points[0];
  const dx = targetX - head.x;
  const dy = targetY - head.y;
  if (dx * dx + dy * dy <= HEAD_RADIUS * HEAD_RADIUS) return;

  const diff = normalizeAngle(Math.atan2(dy, dx) - snake.angle);
  const maxTurn = TURN_RATE * dt;
  snake.angle = normalizeAngle(snake.angle + clamp(diff, -maxTurn, maxTurn));
}
