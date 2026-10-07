import type { Server, Socket } from 'socket.io';

import type {
  ClientToServer,
  MapData,
  PackedPoints,
  PlayerSnapshot,
  ServerToClient,
} from '../../shared/protocol.ts';
import {
  EAT_REACH,
  HIT_MAX_DISTANCE,
  HIT_WINDOW,
  MAX_POINTS,
  SHOT_COOLDOWN,
  SPAWN_CLEAR_RADIUS,
  TICK_HZ,
} from './config.ts';
import { FoodField } from './food.ts';

type GameServer = Server<ClientToServer, ServerToClient>;
type GameSocket = Socket<ClientToServer, ServerToClient>;

/** Snapshot plus shooting bookkeeping that never goes on the wire. */
type Player = PlayerSnapshot & { lastShotAt: number; shotTimes: number[] };

const snapshot = ({ id, angle, points, score }: Player): PlayerSnapshot => ({ id, angle, points, score });

function isValidPoints(points: unknown): points is PackedPoints {
  return (
    Array.isArray(points) &&
    points.length >= 2 &&
    points.length <= MAX_POINTS * 2 &&
    points.length % 2 === 0 &&
    points.every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}

/** Players, food and the network loop. Clients move their own snakes; the server owns food. */
export function startGame(io: GameServer, map: MapData) {
  const players = new Map<string, Player>();
  const food = new FoodField(map);

  const randomSpawn = () => {
    const c = map.size / 2;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * SPAWN_CLEAR_RADIUS * 0.6;
    return { x: Math.round(c + Math.cos(a) * r), y: Math.round(c + Math.sin(a) * r) };
  };

  io.on('connection', (socket: GameSocket) => {
    const spawn = randomSpawn();
    players.set(socket.id, {
      id: socket.id,
      angle: 0,
      points: [spawn.x, spawn.y],
      score: 0,
      lastShotAt: 0,
      shotTimes: [],
    });
    console.log(`+ ${socket.id} (${players.size} online)`);

    socket.emit('welcome', {
      selfId: socket.id,
      mapVersion: map.version,
      spawn,
      food: food.all(),
      players: [...players.values()].filter((p) => p.id !== socket.id).map(snapshot),
    });

    socket.on('state', (s) => {
      const p = players.get(socket.id);
      if (!p || !s || !isValidPoints(s.points) || !Number.isFinite(s.angle)) return;
      p.angle = s.angle;
      p.points = s.points;
      p.score = Number.isFinite(s.score) ? s.score : p.score;
    });

    // First valid request wins; everyone (including the eater) learns it is gone
    socket.on('eat', (foodId) => {
      const p = players.get(socket.id);
      const f = food.get(foodId);
      if (!p || !f) return;
      if (Math.hypot(p.points[0] - f.x, p.points[1] - f.y) > EAT_REACH) return;
      food.remove(foodId);
      io.emit('foodRemoved', [foodId], socket.id);
      io.emit('foodAdded', [food.spawn()]);
    });

    socket.on('shoot', (shot) => {
      const p = players.get(socket.id);
      const now = Date.now();
      if (!p || !shot || ![shot.x, shot.y, shot.angle].every(Number.isFinite)) return;
      if (now - p.lastShotAt < SHOT_COOLDOWN) return;
      p.lastShotAt = now;
      p.shotTimes.push(now);
      socket.broadcast.emit('shot', { x: shot.x, y: shot.y, angle: shot.angle, by: socket.id });
    });

    // Trust the shooter's hit test, but each hit must spend one recent shot and be in range
    socket.on('hit', (targetId) => {
      const p = players.get(socket.id);
      const target = players.get(targetId);
      if (!p || !target || targetId === socket.id) return;
      const now = Date.now();
      p.shotTimes = p.shotTimes.filter((t) => now - t < HIT_WINDOW);
      if (p.shotTimes.length === 0) return;
      const d = Math.hypot(p.points[0] - target.points[0], p.points[1] - target.points[1]);
      if (d > HIT_MAX_DISTANCE) return;
      p.shotTimes.shift();
      io.to(targetId).emit('hit', socket.id);
    });

    socket.on('disconnect', () => {
      players.delete(socket.id);
      io.emit('playerLeft', socket.id);
      console.log(`- ${socket.id} (${players.size} online)`);
    });
  });

  setInterval(() => {
    const all = [...players.values()];
    for (const [id, socket] of io.of('/').sockets) {
      socket.volatile.emit('players', all.filter((p) => p.id !== id).map(snapshot));
    }
  }, 1000 / TICK_HZ);
}
