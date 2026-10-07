import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import type { GameState } from '../core/types';
import { backgroundLayer } from './layers/background';
import { deathLayer } from './layers/death';
import { foodLayer } from './layers/food';
import { flatObstaclesLayer, solidObstaclesLayer } from './layers/obstacles';
import { rollsLayer } from './layers/rolls';
import { snakeLayer } from './layers/snake';
import { trailLayer } from './layers/trail';
import { COLORS } from './theme';
import type { RenderContext } from './types';

/** Draws all layers back to front in world space, shifted by the camera. */
export function drawScene(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  canvas.drawColor(Skia.Color(COLORS.outside));

  canvas.save();
  canvas.translate(ctx.viewWidth / 2 - state.camera.x, ctx.viewHeight / 2 - state.camera.y);
  backgroundLayer(canvas, state, ctx);
  flatObstaclesLayer(canvas, state, ctx);
  trailLayer(canvas, state, ctx);
  foodLayer(canvas, state, ctx);
  solidObstaclesLayer(canvas, state, ctx);
  snakeLayer(canvas, state, ctx);
  deathLayer(canvas, state);
  rollsLayer(canvas, state, ctx);
  canvas.restore();
}
