import { Skia } from '@shopify/react-native-skia';

function rect(x: number, y: number, w: number, h: number) {
  return Skia.XYWHRect(x, y, w, h);
}

/**
 * Food sprites inside assets/food-atlas.png: 28 droppings repacked into a 7×4 grid of 128 px cells
 * from assets/food-atlas-src.png (cut by their alpha channel). Which one a food item shows is
 * picked from its id, see foodLayer.
 */
export const FOOD_SPRITES = [
  rect(4, 5, 120, 117),
  rect(138, 4, 108, 120),
  rect(260, 20, 120, 87),
  rect(388, 22, 120, 83),
  rect(516, 23, 120, 82),
  rect(644, 13, 120, 102),
  rect(772, 8, 120, 112),
  rect(4, 145, 120, 94),
  rect(132, 144, 120, 95),
  rect(260, 142, 120, 99),
  rect(388, 150, 120, 84),
  rect(516, 138, 120, 107),
  rect(644, 143, 120, 98),
  rect(772, 145, 120, 93),
  rect(4, 273, 120, 93),
  rect(132, 276, 120, 88),
  rect(260, 272, 120, 95),
  rect(388, 276, 120, 87),
  rect(516, 281, 120, 77),
  rect(644, 262, 120, 115),
  rect(772, 270, 120, 100),
  rect(4, 401, 120, 94),
  rect(132, 389, 120, 117),
  rect(260, 407, 120, 82),
  rect(388, 409, 120, 78),
  rect(516, 391, 120, 114),
  rect(644, 394, 120, 107),
  rect(772, 404, 120, 87),
];
