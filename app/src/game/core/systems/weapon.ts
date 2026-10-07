import {
  BODY_HIT_RADIUS,
  HEAD_RADIUS,
  HIT_FX_DURATION,
  ROLL_LIFE,
  ROLL_RADIUS,
  ROLL_SPEED,
  SHOOT_COOLDOWN,
} from '../config';
import type { GameState, Roll, StepContext } from '../types';

/** Returns the id of the remote snake the roll touches, or null. */
function hitSnake(state: GameState, roll: Roll): string | null {
  'worklet';
  const reach = ROLL_RADIUS + BODY_HIT_RADIUS;
  for (const id in state.others) {
    for (const p of state.others[id].points) {
      const dx = p.x - roll.x;
      const dy = p.y - roll.y;
      if (dx * dx + dy * dy < reach * reach) return id;
    }
  }
  return null;
}

/**
 * Double tap throws a toilet roll along the head's direction. Rolls fly straight,
 * stop at obstacles and the map edge; your rolls that touch another snake report a hit.
 */
export function weaponSystem(state: GameState, { dt, input, level }: StepContext) {
  'worklet';
  const { snake, time } = state;

  if (input.fireSeq !== state.lastFireSeq) {
    state.lastFireSeq = input.fireSeq;
    if (state.phase === 'alive' && time - state.lastShotAt >= SHOOT_COOLDOWN) {
      state.lastShotAt = time;
      const head = snake.points[0];
      const x = head.x + Math.cos(snake.angle) * HEAD_RADIUS * 1.5;
      const y = head.y + Math.sin(snake.angle) * HEAD_RADIUS * 1.5;
      state.rolls.push({ x, y, angle: snake.angle, born: time, owner: null });
      state.outbox.push({ type: 'shoot', x: Math.round(x), y: Math.round(y), angle: snake.angle });
    }
  }

  const kept: Roll[] = [];
  for (const r of state.rolls) {
    r.x += Math.cos(r.angle) * ROLL_SPEED * dt;
    r.y += Math.sin(r.angle) * ROLL_SPEED * dt;

    let done = time - r.born > ROLL_LIFE || r.x < 0 || r.y < 0 || r.x > level.size || r.y > level.size;
    for (const o of level.solids) {
      if (done) break;
      const dx = o.x - r.x;
      const dy = o.y - r.y;
      const reach = o.r + ROLL_RADIUS;
      if (dx * dx + dy * dy < reach * reach) done = true;
    }
    if (!done && r.owner === null) {
      const target = hitSnake(state, r);
      if (target !== null) {
        state.outbox.push({ type: 'hit', targetId: target });
        done = true;
      }
    }

    if (done) state.hitFx.push({ x: r.x, y: r.y, at: time });
    else kept.push(r);
  }
  state.rolls = kept;

  while (state.hitFx.length > 0 && time - state.hitFx[0].at > HIT_FX_DURATION) state.hitFx.shift();
}
