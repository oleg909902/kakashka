import {
  FilterMode,
  MipmapMode,
  TileMode,
  useImage,
  type SkImage,
  type SkShader,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';

/** Loads assets/poop-snake.png as a shader for texturing the snake. Null while loading. */
export function useSnakeSkin(): SkShader | null {
  const image = useImage(require('../../../assets/poop-snake.png'));
  return useMemo(
    () =>
      image?.makeShaderOptions(TileMode.Clamp, TileMode.Clamp, FilterMode.Linear, MipmapMode.Linear) ??
      null,
    [image],
  );
}

/** Loads assets/toilet-roll.png, the thrown roll. Null while loading. */
export function useRollImage(): SkImage | null {
  return useImage(require('../../../assets/toilet-roll.png'));
}

/** Loads assets/food-atlas.png. Sprite rects are in ./sprites.ts. Null while loading. */
export function useFoodAtlas(): SkImage | null {
  return useImage(require('../../../assets/food-atlas.png'));
}
