# Веселые какашки (Funny Poops)

Мультиплеерная змейка-какашка на Expo + Skia с Node-сервером.

```
app/     Expo-приложение (React Native, Skia, Reanimated)
server/  игровой сервер (Express + Socket.IO): карта, еда, игроки
shared/  типы протокола, общие для app и server
```

## Запуск

```bash
# сервер, порт 3000
cd server && npm install && npm run dev

# приложение (телефон с Expo Go в той же сети)
cd app && npm install && npx expo start
```

Приложение само находит сервер на том же IP, что и Expo dev server (порт 3000).
Другой адрес задаётся через `EXPO_PUBLIC_SERVER_URL`.

## Сервер

- `npm run sprites` — нарезать `public/obstacles.png` на спрайты → `data/sprites.json`
- `npm run map:new [seed]` — сгенерировать новую карту → `data/map.json`

Архитектура приложения описана в [app/AGENTS.md](app/AGENTS.md).
