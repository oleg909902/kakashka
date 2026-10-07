import { createPicture } from '@shopify/react-native-skia';
import { useState } from 'react';
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import type { PackedPoints, Welcome } from '../../../../shared/protocol';
import { MAX_FRAME_DT, NET_SEND_INTERVAL } from '../core/config';
import { packPoints } from '../core/net';
import { lengthInCm } from '../core/systems/length';
import type { Input, Level, OutMessage } from '../core/types';
import { createWorld, stepWorld } from '../core/world';
import { drawScene } from '../render/scene';
import type { RenderContext } from '../render/types';

export type OwnState = { angle: number; points: PackedPoints; score: number };

type Options = {
  input: SharedValue<Input>;
  level: Level;
  welcome: Welcome;
  renderContext: RenderContext;
  /** Called on the JS thread with messages to send to the server. */
  onSend: (messages: OutMessage[], own: OwnState | null) => void;
  /** Called once on the JS thread after the snake has shrunk too much and vanished. */
  onGameOver: () => void;
};

/** Length for the HUD, rounded to 0.1 cm so React only re-renders when the text changes. */
function displayCm(length: number) {
  'worklet';
  return Math.round(lengthInCm(length) * 10) / 10;
}

/** Runs the simulation on the UI thread every frame and returns the rendered picture. */
export function useGameLoop({ input, level, welcome, renderContext, onSend, onGameOver }: Options) {
  const state = useSharedValue(createWorld(welcome));
  const frame = useSharedValue(0);
  const lastSent = useSharedValue(0);
  const [lengthCm, setLengthCm] = useState(() => displayCm(state.value.length));
  const { viewWidth, viewHeight } = renderContext;

  useFrameCallback(({ timeSincePreviousFrame }) => {
    const dt = Math.min(timeSincePreviousFrame ?? 16, MAX_FRAME_DT);
    const phaseBefore = state.value.phase;
    const cmBefore = displayCm(state.value.length);
    let outbox: OutMessage[] = [];
    let own: OwnState | null = null;

    state.modify((s) => {
      'worklet';
      stepWorld(s, { dt, input: input.value, level, viewWidth, viewHeight });
      outbox = s.outbox;
      s.outbox = [];
      if (s.time - lastSent.value >= NET_SEND_INTERVAL) {
        lastSent.value = s.time;
        own = { angle: s.snake.angle, points: packPoints(s.snake.points), score: s.score };
      }
      return s;
    }, true);
    frame.value += 1;

    // Only cross to the JS thread when there is something to do
    if (outbox.length > 0 || own) scheduleOnRN(onSend, outbox, own);
    const cmAfter = displayCm(state.value.length);
    if (cmAfter !== cmBefore) scheduleOnRN(setLengthCm, cmAfter);
    if (phaseBefore !== 'dead' && state.value.phase === 'dead') scheduleOnRN(onGameOver);
  });

  const picture = useDerivedValue(() => {
    frame.value;
    return createPicture((canvas) => drawScene(canvas, state.value, renderContext));
  });

  return { picture, lengthCm, state };
}
