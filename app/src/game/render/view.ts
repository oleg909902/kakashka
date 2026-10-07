import type { GameState } from '../core/types';
import type { RenderContext } from './types';

/** True if a world point (with a margin) is on screen. Used to skip off-screen drawing. */
export function isVisible(x: number, y: number, margin: number, { camera }: GameState, ctx: RenderContext) {
  'worklet';
  return (
    Math.abs(x - camera.x) < ctx.viewWidth / 2 + margin &&
    Math.abs(y - camera.y) < ctx.viewHeight / 2 + margin
  );
}
