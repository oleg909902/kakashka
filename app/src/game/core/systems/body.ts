import { SEGMENT_SPACING } from '../config';
import type { GameState } from '../types';

/** Each segment follows the previous one at a fixed distance. */
export function bodySystem({ snake }: GameState) {
  'worklet';
  const pts = snake.points;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const p = pts[i];
    const dx = prev.x - p.x;
    const dy = prev.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist > SEGMENT_SPACING) {
      const k = (dist - SEGMENT_SPACING) / dist;
      p.x += dx * k;
      p.y += dy * k;
    }
  }
}
