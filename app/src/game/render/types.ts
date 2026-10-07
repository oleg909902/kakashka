import type { SkCanvas, SkImage, SkRect, SkShader } from '@shopify/react-native-skia';

import type { GameState } from '../core/types';

export type Decor = { x: number; y: number; r: number }[];

/** A sprite placed in the world: drawn from `src` in an atlas into a box centered at x, y. */
export type SpriteItem = { x: number; y: number; w: number; h: number; src: SkRect };

/** Static, render-only data that is not part of the simulation. */
export type RenderContext = {
  viewWidth: number;
  viewHeight: number;
  worldSize: number;
  decor: Decor; // world coordinates
  snakeSkin: SkShader | null; // image shader of assets/poop-snake.png
  foodAtlas: SkImage | null; // assets/food-atlas.png
  rollImage: SkImage | null; // assets/toilet-roll.png
  obstacleAtlas: SkImage; // downloaded from the server
  flatObstacles: SpriteItem[]; // drawn under everything (puddles, litter)
  solidObstacles: SpriteItem[]; // drawn over food, sorted top to bottom
};

/** A layer draws one part of the scene. Layers are drawn back to front. */
export type Layer = (canvas: SkCanvas, state: GameState, ctx: RenderContext) => void;
