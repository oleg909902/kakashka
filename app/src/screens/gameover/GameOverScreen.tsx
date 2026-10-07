import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';

/** assets/game-over.mp4 */
const VIDEO = {
  width: 1280,
  height: 720,
  // The "GAME OVER" text sits in this many px around the horizontal center; it must stay on screen
  safeWidth: 480,
};

type Props = { onDone: () => void };

/** Plays the game-over video once, then returns. Tap to skip. */
export function GameOverScreen({ onDone }: Props) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const player = useVideoPlayer(require('../../../assets/game-over.mp4'), (p) => {
    p.loop = false;
    p.play();
  });
  useEventListener(player, 'playToEnd', onDone);

  // Fill the screen (cover), but never zoom in so far that the safe center gets cropped
  const cover = Math.max(screenW / VIDEO.width, screenH / VIDEO.height);
  const scale = Math.min(cover, screenW / VIDEO.safeWidth);
  const w = VIDEO.width * scale;
  const h = VIDEO.height * scale;

  return (
    <Pressable style={styles.root} onPress={onDone}>
      <VideoView
        player={player}
        style={{
          position: 'absolute',
          width: w,
          height: h,
          left: (screenW - w) / 2,
          top: (screenH - h) / 2,
        }}
        contentFit="fill"
        nativeControls={false}
      />
      <Text style={styles.hint}>Нажми, чтобы пропустить</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
