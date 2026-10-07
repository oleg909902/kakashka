import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';

import express from 'express';
import { Server } from 'socket.io';

import type { ClientToServer, ServerToClient } from '../../shared/protocol.ts';
import { PORT } from './config.ts';
import { startGame } from './game.ts';
import { loadOrCreateMap } from './map.ts';

const map = loadOrCreateMap();

const app = express();
app.get('/map', (_req, res) => {
  res.json(map);
});
app.use(express.static('public', { maxAge: '1h' }));

const http = createServer(app);
const io = new Server<ClientToServer, ServerToClient>(http, { cors: { origin: '*' } });
startGame(io, map);

http.listen(PORT, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces())
    .flat()
    .find((i) => i?.family === 'IPv4' && !i.internal)?.address;
  console.log(`Веселые какашки server on http://${lan ?? 'localhost'}:${PORT}`);
  console.log(`Map ${map.size}×${map.size}, ${map.obstacles.length} obstacles`);
});
