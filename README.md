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

По умолчанию приложение ходит на боевой сервер `https://kakashka.94-183-236-219.sslip.io`.
Для локального сервера: `EXPO_PUBLIC_SERVER_URL=local npx expo start`
(тот же IP, что у Expo dev server, порт 3000), либо любой адрес в `EXPO_PUBLIC_SERVER_URL`.

## Деплой

Сервер крутится в Docker на `94.183.236.219` за общим Caddy (`/opt/mcp`, сеть `mcp_default`):

На хосте нет git, поэтому код заливается архивом текущего коммита:

```bash
git archive --format=tar HEAD | ssh root@94.183.236.219 \
  'tar -x -C /opt/kakashka && cd /opt/kakashka/server && docker compose up -d --build'
```

Поддомен `kakashka.{$DOMAIN}` прописан в `/opt/mcp/Caddyfile`. Bind-mount Caddyfile в контейнере
указывает на старую копию файла, поэтому после правок Caddyfile перезагружать так:
`docker exec -i mcp-caddy-1 caddy reload --adapter caddyfile --config /dev/stdin < /opt/mcp/Caddyfile`

## Сервер

- `npm run sprites` — нарезать `public/obstacles.png` на спрайты → `data/sprites.json`
- `npm run map:new [seed]` — сгенерировать новую карту → `data/map.json`

Архитектура приложения описана в [app/AGENTS.md](app/AGENTS.md).
