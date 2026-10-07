import type { Welcome } from '../../../../shared/protocol';
import { DEATH_DURATION, SEGMENT_SPACING, SEGMENTS } from './config';
import type { Vec } from './math';
import { toRemoteSnake } from './net';
import { bodySystem } from './systems/body';
import { cameraSystem } from './systems/camera';
import { foodSystem } from './systems/food';
import { lengthSystem } from './systems/length';
import { movementSystem } from './systems/movement';
import { obstaclesSystem } from './systems/obstacles';
import { remoteSystem } from './systems/remote';
import { steeringSystem } from './systems/steering';
import { trailSystem } from './systems/trail';
import { weaponSystem } from './systems/weapon';
import type { GameState, RemoteSnake, StepContext } from './types';

/** Builds the starting state from the server's welcome message. */
export function createWorld(welcome: Welcome): GameState {
  'worklet';
  const { x, y } = welcome.spawn;
  const points: Vec[] = [];
  for (let i = 0; i < SEGMENTS; i++) points.push({ x: x - i * SEGMENT_SPACING, y });
  const tail = points[points.length - 1];

  const others: Record<string, RemoteSnake> = {};
  for (const p of welcome.players) others[p.id] = toRemoteSnake(p);

  return {
    time: 0,
    phase: 'alive',
    diedAt: 0,
    length: SEGMENTS,
    score: 0,
    snake: { angle: 0, points },
    trail: { stains: [], lastDrop: { x: tail.x, y: tail.y } },
    food: welcome.food.map((f) => ({ ...f, born: 0 })),
    eaten: [],
    others,
    rolls: [],
    hitFx: [],
    lastShotAt: -Infinity,
    lastFireSeq: 0,
    hitAt: -Infinity,
    outbox: [],
    camera: { x, y },
  };
}

/** Advances the world by one tick. Order matters: input → motion → collisions → body → interactions → camera. */
export function stepWorld(state: GameState, ctx: StepContext) {
  'worklet';
  if (state.phase === 'dead') return;
  state.time += ctx.dt;
  if (state.phase === 'dying') {
    // Own snake is frozen while it vanishes; the rest of the world keeps going
    if (state.time - state.diedAt >= DEATH_DURATION) state.phase = 'dead';
    trailSystem(state);
    weaponSystem(state, ctx);
    remoteSystem(state, ctx);
    return;
  }
  steeringSystem(state, ctx);
  movementSystem(state, ctx);
  obstaclesSystem(state, ctx);
  bodySystem(state);
  foodSystem(state);
  lengthSystem(state, ctx);
  trailSystem(state);
  weaponSystem(state, ctx);
  remoteSystem(state, ctx);
  cameraSystem(state, ctx);
}
