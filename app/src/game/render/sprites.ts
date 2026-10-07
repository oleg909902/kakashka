import { Skia } from '@shopify/react-native-skia';

const PAD = 6;

function rect(x: number, y: number, w: number, h: number) {
  return Skia.XYWHRect(x - PAD, y - PAD, w + PAD * 2, h + PAD * 2);
}

/**
 * Sprite rects inside assets/food-atlas.png (2048×768, 6×2 grid, transparent background).
 * Bounds were measured from the alpha channel; index = Food.kind.
 */
export const FOOD_SPRITES = [
  rect(50, 52, 302, 327), // corn
  rect(381, 51, 325, 325), // broccoli
  rect(713, 54, 293, 305), // chili pepper (left edge inset: broccoli ends at x=706)
  rect(1051, 62, 287, 311), // onion
  rect(1379, 72, 295, 302), // garlic
  rect(1706, 46, 320, 337), // beet
  rect(20, 406, 332, 298), // peas
  rect(379, 401, 311, 312), // spinach
  rect(710, 404, 287, 287), // mushroom
  rect(1035, 403, 312, 303), // ginger
  rect(1378, 411, 297, 288), // lemon
  rect(1700, 400, 315, 313), // cabbage
];
