/** Generates a fresh map and overwrites data/map.json. Run: npm run map:new [seed] */
import { generateMap, loadSprites, saveMap } from '../src/map.ts';

const seed = process.argv[2] ? Number(process.argv[2]) : Date.now();
const map = generateMap(loadSprites(), seed);
saveMap(map);
console.log(`Map ${map.size}×${map.size}, seed ${seed}, ${map.obstacles.length} obstacles`);
