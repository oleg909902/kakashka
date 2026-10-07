import { Skia, type SkImage } from '@shopify/react-native-skia';
import { useCallback, useEffect, useState } from 'react';

import type { MapData } from '../../../shared/protocol';

export type GameData = { serverUrl: string; map: MapData; obstacleAtlas: SkImage };

export type GameDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | ({ status: 'ready' } & GameData);

async function loadGameData(serverUrl: string): Promise<GameData> {
  const res = await fetch(`${serverUrl}/map`);
  if (!res.ok) throw new Error(`GET /map: ${res.status}`);
  const map: MapData = await res.json();

  const data = await Skia.Data.fromURI(`${serverUrl}${map.atlasUrl}`);
  const obstacleAtlas = Skia.Image.MakeImageFromEncoded(data);
  if (!obstacleAtlas) throw new Error('Could not decode the obstacle atlas');

  return { serverUrl, map, obstacleAtlas };
}

/** Downloads the map and the obstacle atlas from the server once, at app start. */
export function useGameData(serverUrl: string) {
  const [state, setState] = useState<GameDataState>({ status: 'loading' });

  const load = useCallback(() => {
    setState({ status: 'loading' });
    loadGameData(serverUrl)
      .then((data) => setState({ status: 'ready', ...data }))
      .catch((e: Error) => setState({ status: 'error', message: e.message }));
  }, [serverUrl]);

  useEffect(load, [load]);

  return { state, retry: load };
}
