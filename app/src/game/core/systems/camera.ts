import { clamp } from '../math';
import type { GameState, StepContext } from '../types';

function follow(target: number, view: number, size: number) {
  'worklet';
  // Keep the view inside the world; center it if the world is smaller than the screen
  if (view >= size) return size / 2;
  return clamp(target, view / 2, size - view / 2);
}

/** Centers the camera on the head. */
export function cameraSystem({ snake, camera }: GameState, { viewWidth, viewHeight, level }: StepContext) {
  'worklet';
  const head = snake.points[0];
  camera.x = follow(head.x, viewWidth, level.size);
  camera.y = follow(head.y, viewHeight, level.size);
}
