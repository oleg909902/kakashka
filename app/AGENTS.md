This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Game architecture: Systems + Layers

```
src/
  screens/          React screens (menu, game). Thin: wire hooks to a <Canvas>.
  ui/               Shared RN UI components (GameButton).
  game/
    core/           Pure simulation. No React, RN or Skia imports — will be shared with the server.
      types.ts      GameState, Input, StepContext, System
      world.ts      createWorld() + stepWorld(): runs systems in a fixed order
      systems/      One file per System: (state, ctx) => void, mutates state for one tick
    render/         Skia drawing only. Reads state, never mutates it.
      scene.ts      drawScene(): runs layers back to front
      layers/       One file per Layer: (canvas, state, renderCtx) => void
      assets.ts     Loads images/shaders for RenderContext
      sprites.ts    Sprite rects inside atlas images (measured from the alpha channel)
      view.ts       Camera culling helper: skip drawing what is off screen
    hooks/          Glue: useGameLoop (UI-thread loop → picture + outbox), usePointerInput,
                    useNet (socket events → state on the UI thread; outbox → socket)
  net/              Transport only: server URL, map/atlas download (useGameData), socket (useGameSession)
```

Multiplayer (server lives in `../server`, wire types in `../shared/protocol.ts`, imported with `import type` only):
- The server owns the map (obstacles, generated once and stored in `server/data/map.json`) and the food.
- Each client simulates its own snake and sends its spine ~15 Hz; other snakes come back as snapshots
  and are smoothed by `remoteSystem`.
- Eating is optimistic: the client removes the food and grows at once, sends `eat`; the server accepts
  the first valid request and broadcasts `foodRemoved` + `foodAdded` to everyone.
- Shooting: a double tap bumps `Input.fireSeq`; `weaponSystem` throws a roll. Only the shooter's client
  tests hits (its own rolls vs. remote snakes) and sends `hit`; the server accepts at most one hit per
  recent shot and forwards it to the target, whose client applies the damage. Other players get `shot`
  just to draw the roll.
- Static map data is `Level` (in StepContext) for the simulation and sprite lists in RenderContext;
  only dynamic things live in `GameState`.

Rules:
- Dependencies point one way: `screens → net, game/hooks → game/render → game/core`. `core` imports nothing outside itself except types from `shared/protocol`.
- All `core` and `render` functions are worklets (`'worklet'` directive) and run on the UI thread.
- Declare a worklet helper above the worklet that calls it. The worklets plugin turns them into consts,
  so there is no hoisting: calling a helper defined lower in the file is `undefined is not a function` at runtime.
- New gameplay rule → new system in `core/systems/`, registered in `stepWorld`. New visual → new layer in `render/layers/`, registered in `drawScene`.
- Tunable numbers live in `core/config.ts` (gameplay) and `render/theme.ts` (colors).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
