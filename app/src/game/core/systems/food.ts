import { EAT_FX_DURATION, FOOD_RADIUS, GROWTH_PER_FOOD, HEAD_RADIUS } from '../config';
import type { GameState } from '../types';

/**
 * Eats food the head touches. The food is removed and the snake grows right away
 * (no waiting for the server); the server is told via the outbox and tells everyone else.
 */
export function foodSystem(state: GameState) {
  'worklet';
  const { snake, food, time } = state;
  const head = snake.points[0];
  // Mouth sits a bit ahead of the head point
  const mx = head.x + Math.cos(snake.angle) * HEAD_RADIUS * 0.6;
  const my = head.y + Math.sin(snake.angle) * HEAD_RADIUS * 0.6;
  const reach = HEAD_RADIUS + FOOD_RADIUS;

  for (let i = food.length - 1; i >= 0; i--) {
    const f = food[i];
    const dx = f.x - mx;
    const dy = f.y - my;
    if (dx * dx + dy * dy > reach * reach) continue;

    food.splice(i, 1);
    state.eaten.push({ x: f.x, y: f.y, kind: f.kind, at: time });
    state.outbox.push({ type: 'eat', foodId: f.id });
    state.score += 1;
    state.length += GROWTH_PER_FOOD;
  }

  while (state.eaten.length > 0 && time - state.eaten[0].at > EAT_FX_DURATION) {
    state.eaten.shift();
  }
}
