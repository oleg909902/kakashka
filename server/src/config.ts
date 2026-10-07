export const PORT = Number(process.env.PORT ?? 3000);

export const WORLD_SIZE = 4800; // ~30 s for the snake to cross
export const SPAWN_CLEAR_RADIUS = 300; // no obstacles around the map center

export const BORDER_STEP = 110; // px between trees on the map edge
export const SOLID_OBSTACLES = 220;
export const FLAT_OBSTACLES = 200;

export const FOOD_COUNT = 210; // 150 + 40%
export const FOOD_KINDS = 12; // sprites in the app's food atlas
export const FOOD_MARGIN = 60;

export const TICK_HZ = 15; // player snapshots per second
export const EAT_REACH = 90; // px; max head-to-food distance the server accepts
export const MAX_POINTS = 2000; // sanity cap on a client's spine length

export const SHOT_COOLDOWN = 600; // ms; a bit below the client's so honest clients never hit it
export const HIT_WINDOW = 3000; // ms; a hit must follow one of the shooter's own shots
export const HIT_MAX_DISTANCE = 1500; // px between shooter and target heads
