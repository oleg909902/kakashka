import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import type { GameState } from '../../core/types';
import { fill } from '../paint';
import type { RenderContext, SpriteItem } from '../types';
import { isVisible } from '../view';

function drawItems(canvas: SkCanvas, items: SpriteItem[], state: GameState, ctx: RenderContext) {
  'worklet';
  const paint = fill('#FFFFFF');
  for (const it of items) {
    if (!isVisible(it.x, it.y, Math.max(it.w, it.h), state, ctx)) continue;
    canvas.drawImageRect(
      ctx.obstacleAtlas,
      it.src,
      Skia.XYWHRect(it.x - it.w / 2, it.y - it.h / 2, it.w, it.h),
      paint,
    );
  }
}

/** Puddles, manholes, litter: things the snake crawls over. */
export function flatObstaclesLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  drawItems(canvas, ctx.flatObstacles, state, ctx);
}

/** Rocks, trees, crates: things the snake bumps into. */
export function solidObstaclesLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  drawItems(canvas, ctx.solidObstacles, state, ctx);
}
