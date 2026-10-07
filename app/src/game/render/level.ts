import type { MapData } from '../../../../shared/protocol';
import type { Level } from '../core/types';
import type { SpriteItem } from './types';

/** Splits the server map into the simulation's Level and the renderer's sprite lists. */
export function prepareLevel(map: MapData) {
  const level: Level = {
    size: map.size,
    solids: map.obstacles.filter((o) => o.radius > 0).map((o) => ({ x: o.x, y: o.y, r: o.radius })),
  };

  const flat: SpriteItem[] = [];
  const solid: SpriteItem[] = [];
  for (const o of map.obstacles) {
    const sprite = map.sprites[o.sprite];
    const w = sprite.size * o.scale;
    const h = (w * sprite.rect.height) / sprite.rect.width;
    (o.radius > 0 ? solid : flat).push({ x: o.x, y: o.y, w, h, src: sprite.rect });
  }
  // Lower objects overlap higher ones
  solid.sort((a, b) => a.y - b.y);

  return { level, flatObstacles: flat, solidObstacles: solid };
}
