import type { Food, MapData } from '../../shared/protocol.ts';
import { FOOD_COUNT, FOOD_KINDS, FOOD_MARGIN } from './config.ts';

/** The single shared set of food on the map. Ids are never reused. */
export class FoodField {
  private items = new Map<number, Food>();
  private nextId = 1;

  constructor(private map: MapData) {
    for (let i = 0; i < FOOD_COUNT; i++) this.spawn();
  }

  all(): Food[] {
    return [...this.items.values()];
  }

  get(id: number) {
    return this.items.get(id);
  }

  remove(id: number) {
    return this.items.delete(id);
  }

  /** Places one food item away from solid obstacles. */
  spawn(): Food {
    const span = this.map.size - FOOD_MARGIN * 2;
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 30; tries++) {
      x = Math.round(FOOD_MARGIN + Math.random() * span);
      y = Math.round(FOOD_MARGIN + Math.random() * span);
      const blocked = this.map.obstacles.some(
        (o) => o.radius > 0 && Math.hypot(o.x - x, o.y - y) < o.radius + 30,
      );
      if (!blocked) break;
    }
    const food = { id: this.nextId++, x, y, kind: Math.floor(Math.random() * FOOD_KINDS) };
    this.items.set(food.id, food);
    return food;
  }
}
