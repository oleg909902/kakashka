import Constants from 'expo-constants';

const PORT = 3000;

/**
 * Game server origin. EXPO_PUBLIC_SERVER_URL wins; otherwise in development the server
 * is assumed to run on the same machine as the Expo dev server (same LAN IP, port 3000).
 */
export function getServerUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_SERVER_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devHost ?? 'localhost'}:${PORT}`;
}
