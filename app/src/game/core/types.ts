import type { Vec } from './math';

export type Stain = { x: number; y: number; born: number; r: number; seed: number };

export type Snake = {
  angle: number;
  points: Vec[]; // points[0] is the head
};

/** Another player's snake: drawn at `points`, which glide toward the last snapshot. */
export type RemoteSnake = Snake & { target: Vec[]; targetAngle: number; score: number };

export type Trail = {
  stains: Stain[]; // oldest first
  lastDrop: Vec;
};

export type Food = { id: number; x: number; y: number; kind: number; born: number };

/** A just-eaten food item, kept briefly for the gulp animation. */
export type EatFx = { id: number; x: number; y: number; kind: number; at: number };

/** A flying toilet roll. owner is null for your own rolls (only those can hit). */
export type Roll = { x: number; y: number; angle: number; born: number; owner: string | null };

/** Paper burst where a roll landed. */
export type HitFx = { x: number; y: number; at: number };

/** Messages the simulation wants sent to the server. Drained every frame. */
export type OutMessage =
  | { type: 'eat'; foodId: number }
  | { type: 'shoot'; x: number; y: number; angle: number }
  | { type: 'hit'; targetId: string };

export type GameState = {
  time: number;
  /** alive → dying (too short: vanishing animation plays) → dead (game over). */
  phase: 'alive' | 'dying' | 'dead';
  diedAt: number; // state.time when dying started
  length: number; // target length in segments; fractional while shrinking
  score: number; // food eaten
  snake: Snake;
  trail: Trail;
  food: Food[];
  eaten: EatFx[];
  others: Record<string, RemoteSnake>;
  rolls: Roll[];
  hitFx: HitFx[];
  lastShotAt: number;
  lastFireSeq: number; // last Input.fireSeq handled
  hitAt: number; // when your snake was last hit, for the blink; -Infinity if never
  outbox: OutMessage[];
  camera: Vec; // world point at the center of the screen
};

/** Static map data the simulation needs. Never changes during a game. */
export type Level = {
  size: number; // square world, px
  solids: { x: number; y: number; r: number }[]; // obstacles that block the snake
};

/** Finger position in screen coordinates; fireSeq goes up by one on each double tap. */
export type Input = { touching: boolean; x: number; y: number; fireSeq: number };

/** Everything a system needs besides the state it mutates. */
export type StepContext = {
  dt: number;
  input: Input;
  level: Level;
  viewWidth: number;
  viewHeight: number;
};

/** A system mutates the state for one tick. Systems run in a fixed order. */
export type System = (state: GameState, ctx: StepContext) => void;
