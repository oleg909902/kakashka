import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import type { GameState } from '../../core/types';
import { fill, stroke } from '../paint';
import { COLORS } from '../theme';
import type { Decor, RenderContext } from '../types';
import { isVisible } from '../view';

/** Lighter grass patches, about one per 180×180 px. */
export function createDecor(worldSize: number): Decor {
  const count = Math.round((worldSize * worldSize) / (180 * 180));
  return Array.from({ length: count }, () => ({
    x: Math.random() * worldSize,
    y: Math.random() * worldSize,
    r: 6 + Math.random() * 14,
  }));
}

export function backgroundLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  const world = Skia.XYWHRect(0, 0, ctx.worldSize, ctx.worldSize);
  canvas.drawRect(world, fill(COLORS.ground));

  const grass = fill(COLORS.groundDecor);
  for (const d of ctx.decor) {
    if (isVisible(d.x, d.y, d.r, state, ctx)) canvas.drawCircle(d.x, d.y, d.r, grass);
  }

  canvas.drawRect(world, stroke(COLORS.border, 10));
}
