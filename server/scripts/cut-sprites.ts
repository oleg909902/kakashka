/**
 * Cuts public/obstacles.png (4 rows × 10 objects) into sprites,
 * then writes data/sprites.json. Run: npm run sprites
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

import type { Rect, SpriteDef } from '../../shared/protocol.ts';

const ATLAS = 'public/obstacles.png';
const OUT = 'data/sprites.json';
const ALPHA = 100; // pixel counts as opaque above this
const PAD = 4;
const MIN_PIECE = 80; // px area; smaller pieces are specks
const HUG = 12; // px; pieces this close to the object belong to it

// Atlas layout: 4 rows × 10, left to right. [name, size in world px, solid]
const META: [string, number, boolean][] = [
  ['rock', 90, true], ['flower-bush', 100, true], ['stump', 90, true], ['pine', 120, true], ['log', 120, true],
  ['mud', 110, false], ['slime', 100, false], ['pond', 150, false], ['grass', 70, false], ['flowers', 60, false],
  ['amanita', 70, true], ['rocks', 80, true], ['fence', 100, true], ['hydrant', 55, true], ['trash-can', 65, true],
  ['crate', 75, true], ['tires', 70, true], ['pink-bush', 100, true], ['bench', 120, true], ['lamp', 45, true],
  ['manhole', 70, false], ['cone', 50, true], ['barrier', 90, true], ['pipe', 90, true], ['box', 70, true],
  ['banana', 55, false], ['fish-bone', 65, false], ['watermelon', 60, false], ['apple-core', 40, false], ['egg', 50, false],
  ['potted-plant', 60, true], ['drain', 70, false], ['donut', 50, false], ['bone', 55, false], ['poop', 55, false],
  ['paper', 55, false], ['can', 50, false], ['drumstick', 55, false], ['palm', 120, true], ['cinder-block', 70, true],
];

const png = PNG.sync.read(readFileSync(ATLAS));
const { width: W, height: H, data } = png;
const opaque = (x: number, y: number) => data[(y * W + x) * 4 + 3] > ALPHA;

// Objects touch each other (grass tufts, shadows), so connected regions don't work.
// Instead: split into rows at the emptiest horizontal lines, split each row into
// columns at the emptiest vertical lines, then trim each cell to its opaque pixels.

/**
 * Picks `count` split positions with the lowest density, at least `minGap` apart,
 * only between the first and last non-empty position (empty margins are not gaps).
 */
function pickSplits(profile: number[], count: number, minGap: number): number[] {
  const first = profile.findIndex((v) => v > 0);
  const last = profile.length - 1 - [...profile].reverse().findIndex((v) => v > 0);
  const order = profile
    .map((_, i) => i)
    .filter((i) => i > first + minGap / 2 && i < last - minGap / 2)
    .sort((a, b) => profile[a] - profile[b]);
  const picked: number[] = [];
  for (const i of order) {
    if (picked.every((p) => Math.abs(p - i) >= minGap)) picked.push(i);
    if (picked.length === count) break;
  }
  return picked.sort((a, b) => a - b);
}

function smooth(profile: number[], r: number) {
  return profile.map((_, i) => {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += profile[Math.min(profile.length - 1, Math.max(0, i + k))];
    return sum;
  });
}

const ROWS = 4;
const COLS = 10;

const rowProfile = Array.from({ length: H }, (_, y) => {
  let n = 0;
  for (let x = 0; x < W; x++) if (opaque(x, y)) n++;
  return n;
});
const rowEdges = [0, ...pickSplits(smooth(rowProfile, 3), ROWS - 1, H / ROWS / 2), H];

const ordered: Rect[] = [];
for (let r = 0; r < ROWS; r++) {
  const top = rowEdges[r], bottom = rowEdges[r + 1];
  const colProfile = Array.from({ length: W }, (_, x) => {
    let n = 0;
    for (let y = top; y < bottom; y++) if (opaque(x, y)) n++;
    return n;
  });
  const colEdges = [0, ...pickSplits(smooth(colProfile, 3), COLS - 1, W / COLS / 2), W];
  for (let c = 0; c < COLS; c++) {
    ordered.push(trimCell({ x: colEdges[c], y: top, width: colEdges[c + 1] - colEdges[c], height: bottom - top }));
  }
}

/**
 * Bounding box of the object in a cell: the biggest opaque region plus the pieces
 * hugging it (grass tufts). Slivers of neighbours cut by the cell edge and specks are dropped.
 */
function trimCell(cell: Rect): Rect {
  const regions: (Rect & { area: number; touchesSide: boolean })[] = [];
  const seen = new Uint8Array(cell.width * cell.height);
  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      if (seen[y * cell.width + x] || !opaque(cell.x + x, cell.y + y)) continue;
      let x0 = x, x1 = x, y0 = y, y1 = y, area = 0;
      const stack = [y * cell.width + x];
      seen[y * cell.width + x] = 1;
      while (stack.length) {
        const i = stack.pop()!;
        const cx = i % cell.width, cy = (i / cell.width) | 0;
        area++;
        x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); y0 = Math.min(y0, cy); y1 = Math.max(y1, cy);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx, ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= cell.width || ny >= cell.height) continue;
            const ni = ny * cell.width + nx;
            if (!seen[ni] && opaque(cell.x + nx, cell.y + ny)) { seen[ni] = 1; stack.push(ni); }
          }
        }
      }
      regions.push({
        x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, area,
        touchesSide: x0 === 0 || x1 === cell.width - 1,
      });
    }
  }
  regions.sort((a, b) => b.area - a.area);
  const box = { ...regions[0] };
  for (const r of regions.slice(1)) {
    if (r.area < MIN_PIECE || r.touchesSide) continue;
    const hugs =
      r.x <= box.x + box.width + HUG && box.x <= r.x + r.width + HUG &&
      r.y <= box.y + box.height + HUG && box.y <= r.y + r.height + HUG;
    if (!hugs) continue;
    const x = Math.min(box.x, r.x), y = Math.min(box.y, r.y);
    box.width = Math.max(box.x + box.width, r.x + r.width) - x;
    box.height = Math.max(box.y + box.height, r.y + r.height) - y;
    box.x = x; box.y = y;
  }
  return { x: cell.x + box.x, y: cell.y + box.y, width: box.width, height: box.height };
}

if (ordered.length !== META.length) {
  console.error(`Found ${ordered.length} sprites, expected ${META.length}`);
  process.exit(1);
}

const sprites: SpriteDef[] = ordered.map((b, id) => {
  const [name, size, solid] = META[id];
  const x = Math.max(0, b.x - PAD), y = Math.max(0, b.y - PAD);
  return {
    id, name, size, solid,
    rect: {
      x, y,
      width: Math.min(W, b.x + b.width + PAD) - x,
      height: Math.min(H, b.y + b.height + PAD) - y,
    },
  };
});

writeFileSync(OUT, JSON.stringify(sprites, null, 2));
console.log(`Wrote ${sprites.length} sprites to ${OUT}`);
