import { REMOTE_SMOOTHING } from '../config';
import { normalizeAngle } from '../math';
import type { GameState, StepContext } from '../types';

/** Glides other players' snakes toward their latest snapshot so 15 Hz updates look smooth. */
export function remoteSystem({ others }: GameState, { dt }: StepContext) {
  'worklet';
  const k = 1 - Math.exp(-dt / REMOTE_SMOOTHING);
  for (const id in others) {
    const o = others[id];
    // Match length first: new segments start where the snapshot says
    while (o.points.length < o.target.length) {
      const t = o.target[o.points.length];
      o.points.push({ x: t.x, y: t.y });
    }
    if (o.points.length > o.target.length) o.points.length = o.target.length;

    for (let i = 0; i < o.points.length; i++) {
      o.points[i].x += (o.target[i].x - o.points[i].x) * k;
      o.points[i].y += (o.target[i].y - o.points[i].y) * k;
    }
    o.angle = normalizeAngle(o.angle + normalizeAngle(o.targetAngle - o.angle) * k);
  }
}
