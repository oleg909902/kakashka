import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import type { ClientToServer, ServerToClient, Welcome } from '../../../shared/protocol';

export type GameSocket = Socket<ServerToClient, ClientToServer>;

export type SessionState =
  | { status: 'connecting' }
  | { status: 'playing'; socket: GameSocket; welcome: Welcome };

/**
 * Opens the socket for the lifetime of the game screen. Each (re)connect gets a fresh
 * welcome (new id, spawn, food), so the game restarts from it.
 */
export function useGameSession(serverUrl: string): SessionState {
  const [state, setState] = useState<SessionState>({ status: 'connecting' });

  useEffect(() => {
    const socket: GameSocket = io(serverUrl, { transports: ['websocket'] });
    socket.on('welcome', (welcome) => setState({ status: 'playing', socket, welcome }));
    socket.on('disconnect', () => setState({ status: 'connecting' }));
    return () => {
      socket.close();
    };
  }, [serverUrl]);

  return state;
}
