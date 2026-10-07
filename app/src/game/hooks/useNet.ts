import { useCallback, useEffect, useState } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';

import type { GameSocket } from '../../net/useGameSession';
import {
  applyFoodAdded,
  applyFoodRemoved,
  applyHit,
  applyPlayerLeft,
  applyPlayers,
  applyShot,
} from '../core/net';
import type { GameState, OutMessage } from '../core/types';
import type { OwnState } from './useGameLoop';

/** Forwards what the simulation produced (eats, own position) to the server. */
export function useNetSender(socket: GameSocket) {
  return useCallback(
    (messages: OutMessage[], own: OwnState | null) => {
      for (const m of messages) {
        if (m.type === 'eat') socket.emit('eat', m.foodId);
        else if (m.type === 'shoot') socket.emit('shoot', { x: m.x, y: m.y, angle: m.angle });
        else if (m.type === 'hit') socket.emit('hit', m.targetId);
      }
      if (own) socket.volatile.emit('state', own);
    },
    [socket],
  );
}

/** Applies server events (players, food) to the simulation state on the UI thread. */
export function useNetReceiver(socket: GameSocket, state: SharedValue<GameState>) {
  const [online, setOnline] = useState(1);

  useEffect(() => {
    const update = (fn: (s: GameState) => void) =>
      scheduleOnUI(() => {
        'worklet';
        state.modify((s) => {
          'worklet';
          fn(s);
          return s;
        }, true);
      });

    socket.on('players', (players) => {
      setOnline(players.length + 1);
      update((s) => {
        'worklet';
        applyPlayers(s, players);
      });
    });
    socket.on('playerLeft', (id) =>
      update((s) => {
        'worklet';
        applyPlayerLeft(s, id);
      }),
    );
    socket.on('foodRemoved', (ids) =>
      update((s) => {
        'worklet';
        applyFoodRemoved(s, ids);
      }),
    );
    socket.on('foodAdded', (food) =>
      update((s) => {
        'worklet';
        applyFoodAdded(s, food);
      }),
    );
    socket.on('shot', (shot) =>
      update((s) => {
        'worklet';
        applyShot(s, shot);
      }),
    );
    socket.on('hit', () =>
      update((s) => {
        'worklet';
        applyHit(s);
      }),
    );
    return () => {
      socket.off('shot');
      socket.off('hit');
      socket.off('players');
      socket.off('playerLeft');
      socket.off('foodRemoved');
      socket.off('foodAdded');
    };
  }, [socket, state]);

  return { online };
}
