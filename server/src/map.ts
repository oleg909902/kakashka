import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { MapData, Obstacle, SpriteDef } from '../../shared/protocol.ts';
import {
  BORDER_STEP,
  FLAT_OBSTACLES,
  SOLID_OBSTACLES,
  SPAWN_CLEAR_RADIUS,
  WORLD_SIZE,
} from './config.ts';
import { createRng } from './rng.ts';

const SPRITES_FILE = 'data/sprites.json';
const MAP_FILE = 'data/map.json';
const BORDER_SPRITES = ['pine', 'palm', 'flower-bush', 'pink-bush'];

export function loadSprites(): SpriteDef[] {
  if (!existsSync(SPRITES_FILE)) throw new Error(`${SPRITES_FILE} missing, run: npm run sprites`);
  return JSON.parse(readFileSync(SPRITES_FILE, 'utf8'));
}

/** Footprint radius used for spacing and collision. */
function radiusOf(sprite: SpriteDef, scale: number) {
  return sprite.size * scale * 0.38;
}

export function generateMap(sprites: SpriteDef[], seed = Date.now()): MapData {
  const rng = createRng(seed);
  const obstacles: Obstacle[] = [];
  const add = (sprite: SpriteDef, x: number, y: number, scale: number) => {
    obstacles.push({
      id: obstacles.length,
      sprite: sprite.id,
      x: Math.round(x),
      y: Math.round(y),
      scale: Number(scale.toFixed(2)),
      radius: sprite.solid ? Math.round(radiusOf(sprite, scale)) : 0,
    });
  };

  // A hedge of trees along the edge so the end of the map is visible
  const border = sprites.filter((s) => BORDER_SPRITES.includes(s.name));
  for (let t = 0; t < WORLD_SIZE; t += BORDER_STEP) {
    for (const [x, y] of [[t, 0], [t, WORLD_SIZE], [0, t], [WORLD_SIZE, t]]) {
      add(rng.pick(border), x + rng.range(-15, 15), y + rng.range(-15, 15), rng.range(0.9, 1.2));
    }
  }

  // Scatter the rest with rejection sampling so nothing overlaps
  const center = WORLD_SIZE / 2;
  const scatter = (pool: SpriteDef[], count: number) => {
    for (let placed = 0, tries = 0; placed < count && tries < count * 50; tries++) {
      const sprite = rng.pick(pool);
      const scale = rng.range(0.85, 1.25);
      const r = radiusOf(sprite, scale);
      const x = rng.range(150, WORLD_SIZE - 150);
      const y = rng.range(150, WORLD_SIZE - 150);
      if (Math.hypot(x - center, y - center) < SPAWN_CLEAR_RADIUS) continue;
      const free = obstacles.every((o) => {
        const other = radiusOf(sprites[o.sprite], o.scale);
        return Math.hypot(o.x - x, o.y - y) > r + other + 40;
      });
      if (!free) continue;
      add(sprite, x, y, scale);
      placed++;
    }
  };
  scatter(sprites.filter((s) => s.solid), SOLID_OBSTACLES);
  scatter(sprites.filter((s) => !s.solid), FLAT_OBSTACLES);

  return { version: seed, size: WORLD_SIZE, atlasUrl: '/obstacles.png', sprites, obstacles };
}

export function saveMap(map: MapData) {
  writeFileSync(MAP_FILE, JSON.stringify(map));
}

/** Loads the stored map, generating and saving one on first run. */
export function loadOrCreateMap(): MapData {
  const sprites = loadSprites();
  if (existsSync(MAP_FILE)) {
    const map: MapData = JSON.parse(readFileSync(MAP_FILE, 'utf8'));
    // Sprite metadata may have been re-cut; keep it current
    return { ...map, sprites };
  }
  const map = generateMap(sprites);
  saveMap(map);
  return map;
}
