import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import { HIT_FX_DURATION } from '../../core/config';
import type { GameState } from '../../core/types';
import { fill } from '../paint';
import type { RenderContext } from '../types';
import { isVisible } from '../view';

const ROLL_WIDTH = 46; // px on screen; the sprite faces right
const PAPER_BITS = 10;

/** Flying toilet rolls, plus a paper burst where each one landed. */
export function rollsLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  const image = ctx.rollImage;
  if (image) {
    const w = ROLL_WIDTH;
    const h = (w * image.height()) / image.width();
    const src = Skia.XYWHRect(0, 0, image.width(), image.height());
    const paint = fill('#FFFFFF');
    for (const r of state.rolls) {
      if (!isVisible(r.x, r.y, w, state, ctx)) continue;
      const hop = Math.abs(Math.sin((state.time - r.born) * 0.03)) * 4; // running bounce
      canvas.save();
      canvas.translate(r.x, r.y);
      canvas.rotate((r.angle * 180) / Math.PI, 0, 0);
      // Flying left would draw it upside down; mirror so it stays upright
      if (Math.cos(r.angle) < 0) canvas.scale(1, -1);
      canvas.drawImageRect(image, src, Skia.XYWHRect(-w / 2, -h / 2 - hop, w, h), paint);
      canvas.restore();
    }
  }

  for (const fx of state.hitFx) {
    const t = Math.min(1, (state.time - fx.at) / HIT_FX_DURATION);
    const paper = fill('#FFF8EC', 1 - t);
    for (let k = 0; k < PAPER_BITS; k++) {
      const a = (k / PAPER_BITS) * Math.PI * 2 + k;
      const d = 8 + 36 * (1 - Math.pow(1 - t, 2)) * (0.6 + (k % 3) * 0.2);
      const s = 5 - k % 2;
      canvas.drawRect(Skia.XYWHRect(fx.x + Math.cos(a) * d - s / 2, fx.y + Math.sin(a) * d - s / 2, s, s * 1.4), paper);
    }
  }
}
