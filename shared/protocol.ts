/**
 * Wire protocol between the game server (server/) and the app (app/).
 * Types only: both sides import it with `import type`, so nothing here is bundled.
 */

export type Rect = { x: number; y: number; width: number; height: number };

/** One sprite cut from the obstacle atlas. */
export type SpriteDef = {
  id: number;
  name: string;
  rect: Rect; // inside the atlas image
  size: number; // drawn width in world px (height keeps the aspect ratio)
  solid: boolean; // blocks the snake; flat things (puddles, litter) don't
};

export type Obstacle = {
  id: number;
  sprite: number; // SpriteDef.id
  x: number;
  y: number;
  scale: number;
  radius: number; // collision radius in world px, 0 for non-solid
};

/** GET /map */
export type MapData = {
  version: number;
  size: number; // square world, px
  atlasUrl: string; // relative to the server origin
  sprites: SpriteDef[];
  obstacles: Obstacle[];
};

export type Food = { id: number; x: number; y: number; kind: number };

/** Spine points flattened as [x0, y0, x1, y1, ...], rounded to ints. points[0] is the head. */
export type PackedPoints = number[];

export type PlayerSnapshot = {
  id: string;
  angle: number;
  points: PackedPoints;
  score: number;
};

export type Welcome = {
  selfId: string;
  mapVersion: number;
  spawn: { x: number; y: number };
  food: Food[];
  players: PlayerSnapshot[];
};

/** A thrown toilet roll: starts at x, y and flies along angle. */
export type Shot = { x: number; y: number; angle: number };

export type ServerToClient = {
  welcome: (w: Welcome) => void;
  players: (players: PlayerSnapshot[]) => void; // ~15 Hz, everyone except you
  playerLeft: (id: string) => void;
  foodRemoved: (ids: number[], eatenBy: string) => void;
  foodAdded: (food: Food[]) => void;
  shot: (shot: Shot & { by: string }) => void; // someone else threw a roll (visual only)
  hit: (by: string) => void; // sent to the player who got hit
};

export type ClientToServer = {
  state: (s: { angle: number; points: PackedPoints; score: number }) => void;
  eat: (foodId: number) => void;
  shoot: (shot: Shot) => void;
  /** The shooter's client saw its roll hit targetId's snake. */
  hit: (targetId: string) => void;
};
