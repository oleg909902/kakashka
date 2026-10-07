import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getServerUrl } from './src/net/serverUrl';
import { useGameData } from './src/net/useGameData';
import { GameScreen } from './src/screens/game/GameScreen';
import { GameOverScreen } from './src/screens/gameover/GameOverScreen';
import { MainMenuScreen } from './src/screens/menu/MainMenuScreen';

type Screen = 'menu' | 'game' | 'gameover';

const SERVER_URL = getServerUrl();

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  // Map and obstacle atlas start downloading as soon as the app opens
  const { state: data, retry } = useGameData(SERVER_URL);

  return (
    <GestureHandlerRootView style={styles.root}>
      {screen === 'game' && data.status === 'ready' ? (
        // Leaving the game screen closes the socket, so others stop seeing this snake
        <GameScreen data={data} onGameOver={() => setScreen('gameover')} />
      ) : screen === 'gameover' ? (
        <GameOverScreen onDone={() => setScreen('menu')} />
      ) : (
        <MainMenuScreen data={data} onPlay={() => setScreen('game')} onRetry={retry} />
      )}
      <StatusBar style="light" hidden />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
