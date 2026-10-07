export const SPEED = 0.16; // px per ms
export const TURN_RATE = 0.006; // rad per ms
export const SEGMENTS = 28;
export const SEGMENT_SPACING = 7;
export const HEAD_RADIUS = 18;

export const TRAIL_STEP = 12; // px between stains
export const TRAIL_LIFE = 4000; // ms

export const START_LENGTH_CM = 20; // shown in the HUD; SEGMENTS long = this many cm
export const SHRINK_RATE = 0.6 / 1000; // segments per ms the snake loses all the time
export const MIN_LENGTH_RATIO = 0; // game over below this share of the start length (0 = at 0 cm)
export const DEATH_DURATION = 1300; // ms of the vanishing animation before game over

export const FOOD_RADIUS = 17;
export const GROWTH_PER_FOOD = 2; // segments
export const EAT_FX_DURATION = 250; // ms

export const ROLL_SPEED = 0.45; // px per ms, ~3× the snake
export const ROLL_LIFE = 1600; // ms of flight (~720 px)
export const ROLL_RADIUS = 16; // hit radius
export const SHOOT_COOLDOWN = 800; // ms between your throws
export const BODY_HIT_RADIUS = 14; // how thick a snake is for roll hits
export const HIT_DAMAGE = 3; // segments lost when a roll hits you (~2 cm)
export const HIT_FX_DURATION = 400; // ms

export const NET_SEND_INTERVAL = 66; // ms, ~15 Hz own-state updates
export const REMOTE_SMOOTHING = 80; // ms, how fast remote snakes catch up to snapshots

export const MAX_FRAME_DT = 50; // ms, avoids jumps after a hitch
