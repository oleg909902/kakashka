import { Canvas, Picture } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';

import type { Welcome } from '../../../../shared/protocol';
import { useGameLoop } from '../../game/hooks/useGameLoop';
import { useNetReceiver, useNetSender } from '../../game/hooks/useNet';
import { usePointerInput } from '../../game/hooks/usePointerInput';
import { useFoodAtlas, useRollImage, useSnakeSkin } from '../../game/render/assets';
import { createDecor } from '../../game/render/layers/background';
import { prepareLevel } from '../../game/render/level';
import type { RenderContext } from '../../game/render/types';
import type { GameData } from '../../net/useGameData';
import { useGameSession, type GameSocket } from '../../net/useGameSession';

type Props = { data: GameData; onGameOver: () => void };

export function GameScreen({ data, onGameOver }: Props) {
  const session = useGameSession(data.serverUrl);

  if (session.status === 'connecting') {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color="#FFC928" />
        <Text style={styles.status}>Подключение…</Text>
      </View>
    );
  }
  // A new welcome (reconnect) means a fresh game
  return (
    <GameView
      key={session.welcome.selfId}
      data={data}
      socket={session.socket}
      welcome={session.welcome}
      onGameOver={onGameOver}
    />
  );
}

type ViewProps = { data: GameData; socket: GameSocket; welcome: Welcome; onGameOver: () => void };

function GameView({ data, socket, welcome, onGameOver }: ViewProps) {
  const { width, height } = useWindowDimensions();
  const { level, flatObstacles, solidObstacles } = useMemo(() => prepareLevel(data.map), [data.map]);
  const decor = useMemo(() => createDecor(data.map.size), [data.map.size]);
  const snakeSkin = useSnakeSkin();
  const foodAtlas = useFoodAtlas();
  const rollImage = useRollImage();
  const renderContext = useMemo<RenderContext>(
    () => ({
      viewWidth: width,
      viewHeight: height,
      worldSize: data.map.size,
      decor,
      snakeSkin,
      foodAtlas,
      rollImage,
      obstacleAtlas: data.obstacleAtlas,
      flatObstacles,
      solidObstacles,
    }),
    [width, height, data, decor, snakeSkin, foodAtlas, rollImage, flatObstacles, solidObstacles],
  );

  const { input, gesture } = usePointerInput();
  const onSend = useNetSender(socket);
  const { picture, lengthCm, state } = useGameLoop({
    input,
    level,
    welcome,
    renderContext,
    onSend,
    onGameOver,
  });
  const { online } = useNetReceiver(socket, state);

  return (
    <View style={styles.root}>
      <GestureDetector gesture={gesture}>
        <Canvas style={styles.root}>
          <Picture picture={picture} />
        </Canvas>
      </GestureDetector>
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>💩 {lengthCm.toFixed(1)} см</Text>
        <Text style={styles.hudText}>👥 {online}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E6B23',
    gap: 16,
  },
  status: { fontSize: 22, fontWeight: '800', color: '#FFC928' },
  hud: {
    position: 'absolute',
    top: 48,
    left: 16,
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 58, 30, 0.85)',
    borderWidth: 3,
    borderColor: '#FFC928',
  },
  hudText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFC928',
  },
});
