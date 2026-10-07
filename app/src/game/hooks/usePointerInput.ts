import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import type { Input } from '../core/types';

/**
 * Tracks where the finger is (steering) and counts double taps (throwing a roll).
 * Returns the input shared value and a gesture to attach.
 */
export function usePointerInput() {
  const input = useSharedValue<Input>({ touching: false, x: 0, y: 0, fireSeq: 0 });

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      input.value = { ...input.value, touching: true, x: e.x, y: e.y };
    })
    .onUpdate((e) => {
      input.value = { ...input.value, touching: true, x: e.x, y: e.y };
    })
    .onFinalize(() => {
      input.value = { ...input.value, touching: false };
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      input.value = { ...input.value, fireSeq: input.value.fireSeq + 1 };
    });

  // Steering keeps working while taps are being recognized
  const gesture = Gesture.Simultaneous(pan, doubleTap);

  return { input, gesture };
}
