import type { SkCanvas } from '@shopify/react-native-skia';

import { TRAIL_LIFE } from '../../core/config';
import type { GameState } from '../../core/types';
import { fill } from '../paint';
import { COLORS } from '../theme';
import type { RenderContext } from '../types';
import { isVisible } from '../view';

export function trailLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  const { trail, time } = state;
  for (const st of trail.stains) {
    if (!isVisible(st.x, st.y, 30, state, ctx)) continue;
    const life = 1 - (time - st.born) / TRAIL_LIFE;
    const paint = fill(COLORS.trail, 0.55 * life);
    canvas.drawCircle(st.x, st.y, st.r * (0.6 + 0.4 * life), paint);
    // Small splashes around each stain
    for (let k = 0; k < 2; k++) {
      const a = st.seed + k * 2.4;
      const d = st.r + 4 + k * 3;
      canvas.drawCircle(st.x + Math.cos(a) * d, st.y + Math.sin(a) * d, 1.8 + k * 0.6, paint);
    }
  }
}
