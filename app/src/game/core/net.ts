import type { Food as NetFood, PackedPoints, PlayerSnapshot, Shot } from '../../../../shared/protocol';
import { HIT_DAMAGE } from './config';
import type { Vec } from './math';
import type { GameState, RemoteSnake } from './types';

/**
 * Converting between the wire protocol and the simulation state.
 * The apply* functions run on the UI thread and mutate the state in place.
 */

export function packPoints(points: Vec[]): PackedPoints {
  'worklet';
  const out: number[] = [];
  for (const p of points) out.push(Math.round(p.x), Math.round(p.y));
  return out;
}

export function unpackPoints(packed: PackedPoints): Vec[] {
  'worklet';
  const out: Vec[] = [];
  for (let i = 0; i + 1 < packed.length; i += 2) out.push({ x: packed[i], y: packed[i + 1] });
  return out;
}

export function toRemoteSnake(p: PlayerSnapshot): RemoteSnake {
  'worklet';
  const target = unpackPoints(p.points);
  return {
    angle: p.angle,
    targetAngle: p.angle,
    score: p.score,
    target,
    points: target.map((v) => ({ x: v.x, y: v.y })),
  };
}

export function applyPlayers(state: GameState, players: PlayerSnapshot[]) {
  'worklet';
  for (const p of players) {
    const o = state.others[p.id];
    if (!o) {
      state.others[p.id] = toRemoteSnake(p);
      continue;
    }
    o.target = unpackPoints(p.points);
    o.targetAngle = p.angle;
    o.score = p.score;
  }
}

export function applyPlayerLeft(state: GameState, id: string) {
  'worklet';
  delete state.others[id];
}

export function applyFoodRemoved(state: GameState, ids: number[]) {
  'worklet';
  state.food = state.food.filter((f) => !ids.includes(f.id));
}

export function applyFoodAdded(state: GameState, food: NetFood[]) {
  'worklet';
  for (const f of food) state.food.push({ ...f, born: state.time });
}

/** Someone else's roll: shown flying, but only the shooter decides hits. */
export function applyShot(state: GameState, shot: Shot & { by: string }) {
  'worklet';
  state.rolls.push({ x: shot.x, y: shot.y, angle: shot.angle, born: state.time, owner: shot.by });
}

/** Your snake got hit by a roll: it loses length (lengthSystem handles death at 0). */
export function applyHit(state: GameState) {
  'worklet';
  if (state.phase !== 'alive') return;
  state.length -= HIT_DAMAGE;
  state.hitAt = state.time;
}
