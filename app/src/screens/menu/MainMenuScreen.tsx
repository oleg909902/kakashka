import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import type { GameDataState } from '../../net/useGameData';
import { GameButton } from '../../ui/GameButton';

type Props = {
  data: GameDataState;
  onPlay: () => void;
  onRetry: () => void;
};

export function MainMenuScreen({ data, onPlay, onRetry }: Props) {
  return (
    <ImageBackground
      source={require('../../../assets/main-screen.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.bottom}>
        {data.status === 'ready' && <GameButton title="Играть" onPress={onPlay} />}
        {data.status === 'loading' && <GameButton title="Загрузка…" disabled />}
        {data.status === 'error' && (
          <>
            <Text style={styles.error}>Нет связи с сервером</Text>
            <GameButton title="Повторить" onPress={onRetry} />
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 64,
    gap: 12,
  },
  error: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    backgroundColor: 'rgba(107, 58, 30, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
});
