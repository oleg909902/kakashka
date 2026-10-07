import Constants from 'expo-constants';

/** Production game server (Docker behind Caddy, see server/docker-compose.yml). */
const PRODUCTION_URL = 'https://kakashka.94-183-236-219.sslip.io';
const LOCAL_PORT = 3000;

/**
 * Game server origin. Defaults to production.
 * EXPO_PUBLIC_SERVER_URL overrides it; set it to "local" to use a server running on the
 * same machine as the Expo dev server (same LAN IP, port 3000).
 */
export function getServerUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_SERVER_URL;
  if (fromEnv === 'local') {
    const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
    return `http://${devHost ?? 'localhost'}:${LOCAL_PORT}`;
  }
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return PRODUCTION_URL;
}
