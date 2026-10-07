import type { SkCanvas } from '@shopify/react-native-skia';

import { DEATH_DURATION } from '../../core/config';
import type { GameState } from '../../core/types';
import { fill } from '../paint';
import { COLORS } from '../theme';
import { snakeCenter } from './snake';

const DROPS = 14;

function easeOut(t: number) {
  'worklet';
  return 1 - Math.pow(1 - t, 3);
}

/** While the snake vanishes: a puddle spreads where it was and drops splash outward. */
export function deathLayer(canvas: SkCanvas, state: GameState) {
  'worklet';
  if (state.phase !== 'dying') return;
  const p = Math.min(1, (state.time - state.diedAt) / DEATH_DURATION);
  const c = snakeCenter(state.snake);

  canvas.drawCircle(c.x, c.y, 34 * easeOut(Math.min(1, p * 1.5)), fill(COLORS.trail, 0.5));

  // Splash starts once the swell is over
  const t = Math.max(0, (p - 0.15) / 0.85);
  if (t <= 0) return;
  const drop = fill(COLORS.trail, 1 - t);
  for (let k = 0; k < DROPS; k++) {
    const a = (k / DROPS) * Math.PI * 2 + (k % 2) * 0.2;
    const d = (40 + (k % 3) * 18) * easeOut(t);
    canvas.drawCircle(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d, (4 + (k % 3)) * (1 - t * 0.7), drop);
  }
}
