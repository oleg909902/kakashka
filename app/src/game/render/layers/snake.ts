import {
  BlendMode,
  BlurStyle,
  Skia,
  VertexMode,
  type SkCanvas,
  type SkPoint,
  type SkShader,
} from '@shopify/react-native-skia';

import { DEATH_DURATION, SEGMENT_SPACING, SEGMENTS } from '../../core/config';
import type { Vec } from '../../core/math';
import type { GameState, Snake } from '../../core/types';
import type { RenderContext } from '../types';
import { isVisible } from '../view';

/**
 * Where the body sits inside assets/poop-snake.png (image pixels).
 * The head points right, so u goes from head (right) to tail (left).
 */
export const SNAKE_SPRITE = {
  uHead: 1705,
  uTail: 92,
  vTop: 292,
  vBottom: 637,
};

const HEAD_EXTENSION = 20; // px the sprite's head sticks out in front of points[0]
const WAVE_AMPLITUDE = 3.5;
const MAX_FATNESS = 1.6;
const HIT_BLINK = 600; // ms

/** Average of the spine points: where the snake shrinks to when it vanishes. */
export function snakeCenter(snake: Snake): Vec {
  'worklet';
  let x = 0;
  let y = 0;
  for (const p of snake.points) {
    x += p.x;
    y += p.y;
  }
  const n = snake.points.length || 1;
  return { x: x / n, y: y / n };
}

/**
 * Bends the sprite along the snake spine using a textured triangle strip.
 * Must stay above snakeLayer: worklets capture helpers when defined, so there is no hoisting.
 */
function drawSnake(
  canvas: SkCanvas,
  snake: Snake,
  time: number,
  snakeSkin: SkShader,
  widthScale = 1,
  opacity = 1,
) {
  'worklet';
  const src = snake.points;
  const n = src.length;

  // Spine: an extra point ahead of the head, then the body points with a crawling wave
  const spine: Vec[] = [
    {
      x: src[0].x + Math.cos(snake.angle) * HEAD_EXTENSION,
      y: src[0].y + Math.sin(snake.angle) * HEAD_EXTENSION,
    },
  ];
  for (let i = 0; i < n; i++) {
    const o = src[Math.max(i - 1, 0)];
    const q = src[Math.min(i + 1, n - 1)];
    const dx = o.x - q.x;
    const dy = o.y - q.y;
    const len = Math.hypot(dx, dy) || 1;
    const wave = Math.sin(time * 0.012 - i * 0.55) * WAVE_AMPLITUDE * (i / (n - 1));
    spine.push({ x: src[i].x - (dy / len) * wave, y: src[i].y + (dx / len) * wave });
  }

  // Cumulative length along the spine maps to the texture's u axis
  const dist: number[] = [0];
  for (let i = 1; i < spine.length; i++) {
    dist.push(dist[i - 1] + Math.hypot(spine[i].x - spine[i - 1].x, spine[i].y - spine[i - 1].y));
  }
  const total = dist[dist.length - 1] || 1;

  // Sprite proportions at the starting length; as the snake grows it gets
  // longer and only slightly fatter (capped)
  const { uHead, uTail, vTop, vBottom } = SNAKE_SPRITE;
  const baseLength = (SEGMENTS - 1) * SEGMENT_SPACING + HEAD_EXTENSION;
  const baseHalfWidth = ((vBottom - vTop) / 2) * (baseLength / (uHead - uTail));
  const halfWidth = baseHalfWidth * Math.min(MAX_FATNESS, Math.pow(n / SEGMENTS, 0.3)) * widthScale;

  const positions: SkPoint[] = [];
  const texCoords: SkPoint[] = [];
  for (let i = 0; i < spine.length; i++) {
    const a = spine[Math.max(i - 1, 0)];
    const b = spine[Math.min(i + 1, spine.length - 1)];
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const len = Math.hypot(dx, dy) || 1;
    // Normal pointing to the snake's left (image top)
    const nx = -dy / len;
    const ny = dx / len;
    const pulse = 1 + 0.06 * Math.sin(time * 0.01 - i * 0.5);
    const w = halfWidth * pulse;
    const p = spine[i];
    positions.push(Skia.Point(p.x - nx * w, p.y - ny * w), Skia.Point(p.x + nx * w, p.y + ny * w));
    const u = uHead - (dist[i] / total) * (uHead - uTail);
    texCoords.push(Skia.Point(u, vTop), Skia.Point(u, vBottom));
  }

  const vertices = Skia.MakeVertices(VertexMode.TriangleStrip, positions, texCoords);

  // Soft shadow: the same shape tinted black, blurred and offset
  const shadow = Skia.Paint();
  shadow.setShader(snakeSkin);
  shadow.setColorFilter(Skia.ColorFilter.MakeBlend(Skia.Color('black'), BlendMode.SrcIn));
  shadow.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Normal, 4, true));
  shadow.setAlphaf(0.3 * opacity);
  canvas.save();
  canvas.translate(3, 6);
  canvas.drawVertices(vertices, BlendMode.Modulate, shadow);
  canvas.restore();

  const skin = Skia.Paint();
  skin.setAntiAlias(true);
  skin.setShader(snakeSkin);
  skin.setAlphaf(opacity);
  canvas.drawVertices(vertices, BlendMode.Modulate, skin);
}

/** Draws other players' snakes, then yours on top. */
export function snakeLayer(canvas: SkCanvas, state: GameState, ctx: RenderContext) {
  'worklet';
  const skin = ctx.snakeSkin;
  if (!skin) return;
  for (const id in state.others) {
    const o = state.others[id];
    if (o.points.length < 2) continue;
    // Cull by bounding box of head and tail; good enough for snakes shorter than a screen
    const head = o.points[0];
    const tail = o.points[o.points.length - 1];
    const reach = Math.hypot(head.x - tail.x, head.y - tail.y) + 60;
    if (!isVisible(head.x, head.y, reach, state, ctx)) continue;
    drawSnake(canvas, o, state.time, skin);
  }

  if (state.phase === 'alive') {
    // Blink for a moment after being hit by a roll
    const sinceHit = state.time - state.hitAt;
    const blink = sinceHit < HIT_BLINK && Math.floor(sinceHit / 80) % 2 === 0;
    drawSnake(canvas, state.snake, state.time, skin, 1, blink ? 0.35 : 1);
  } else if (state.phase === 'dying') {
    // Swell a little, then shrink toward the middle and fade out
    const p = Math.min(1, (state.time - state.diedAt) / DEATH_DURATION);
    const scale = p < 0.2 ? 1 + 1.25 * p : 1.25 * Math.pow(1 - (p - 0.2) / 0.8, 2);
    const opacity = 1 - Math.max(0, (p - 0.5) / 0.5);
    const c = snakeCenter(state.snake);
    const shrunk: Snake = {
      angle: state.snake.angle,
      points: state.snake.points.map((q) => ({ x: c.x + (q.x - c.x) * scale, y: c.y + (q.y - c.y) * scale })),
    };
    drawSnake(canvas, shrunk, state.time, skin, scale, opacity);
  }
}
