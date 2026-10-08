import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import { EAT_FX_DURATION, FOOD_RADIUS, HEAD_RADIUS } from '../../core/config';
import type { GameState } from '../../core/types';
import { fill } from '../paint';
import { FOOD_SPRITES } from '../sprites';
import { COLORS } from '../theme';
import type { RenderContext } from '../types';
import { isVisible } from '../view';

const SIZE = FOOD_RADIUS * 2.4;
const POP_IN = 350; // ms

function easeOutBack(t: number) {
  'worklet';
  const c = 1.7;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}

/**
 * Sprite for a food item. Chosen from its id, not the server's kind, so every client shows the
 * same dropping and the server can keep sending the kinds older app versions understand.
 */
function spriteFor(id: number) {
  'worklet';
  return FOOD_SPRITES[(id * 7919) % FOOD_SPRITES.length];
}

function drawSprite(canvas: SkCanvas, atlas: NonNullable<RenderContext['foodAtlas']>, id: number, x: number, y: number, scale: number) {
  'worklet';
  const src = spriteFor(id);
  // Fit the sprite into SIZE keeping its aspect ratio
  const k = (SIZE * scale) / Math.max(src.width, src.height);
  const w = src.width * k;
  const h = src.height * k;
  canvas.drawImageRect(atlas, src, Skia.XYWHRect(x - w / 2, y - h / 2, w, h), fill('#FFFFFF'));
}

export function foodLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  const atlas = ctx.foodAtlas;
  if (!atlas) return;
  const { food, eaten, time, snake } = state;
  const shadow = fill(COLORS.shadow, 0.18);

  for (const f of food) {
    if (!isVisible(f.x, f.y, SIZE, state, ctx)) continue;
    const age = time - f.born;
    const pop = age < POP_IN ? easeOutBack(age / POP_IN) : 1;
    const bob = Math.sin(time * 0.004 + f.x * 0.05);
    const scale = pop * (1 + 0.05 * bob);
    canvas.drawOval(Skia.XYWHRect(f.x - SIZE * 0.35, f.y + SIZE * 0.3, SIZE * 0.7, SIZE * 0.22), shadow);
    drawSprite(canvas, atlas, f.id, f.x, f.y - 3 - bob * 2, scale);
  }

  // Gulp: eaten food flies into the mouth and shrinks
  const head = snake.points[0];
  const mx = head.x + Math.cos(snake.angle) * HEAD_RADIUS;
  const my = head.y + Math.sin(snake.angle) * HEAD_RADIUS;
  for (const e of eaten) {
    const t = Math.min(1, (time - e.at) / EAT_FX_DURATION);
    drawSprite(canvas, atlas, e.id, e.x + (mx - e.x) * t, e.y + (my - e.y) * t, 1 - t);
  }
}
