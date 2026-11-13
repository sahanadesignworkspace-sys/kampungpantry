export interface ServerlessRequest {
  method?: string;
  query?: Record<string, unknown>;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
}

const DEFAULT_MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1';
const DEFAULT_PUBLIC_KEYLESS_SEGMENT = '1';

const KEY_ENV_CANDIDATES = [
  'THEMEALDB_API_KEY',
  'VITE_THEMEALDB_API_KEY',
  'NEXT_PUBLIC_THEMEALDB_API_KEY',
  'THE_MEAL_DB_API_KEY',
  'MEALDB_API_KEY',
  'THEMEALDB_KEY',
  'MEALDB_KEY',
] as const;

const URL_ENV_CANDIDATES = [
  'THEMEALDB_API_URL',
  'THEMEALDB_ENDPOINT',
  'THEMEALDB_URL',
  'THEMEALDB_BASE_URL',
] as const;

function cleanEnvValue(raw: string | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim().replace(/^['"]+|['"]+$/g, '').trim();
  if (!trimmed || /^MY_|^YOUR_/i.test(trimmed)) return '';
  return trimmed;
}

export interface MealDbResolvedConfig {
  baseEndpoint: string;
  mode: 'keyless-public' | 'custom-key';
  keySource: string | null;
}

/**
 * Resolves TheMealDB API endpoint.
 * TheMealDB's v1 API is keyless/public by default (`/api/json/v1/1`),
 * while optionally supporting a custom Patreon key or base URL override via env vars.
 */
export function resolveMealDbConfig(): MealDbResolvedConfig {
  let baseUrl = DEFAULT_MEALDB_BASE_URL;
  let customSegment = '';
  let keySource: string | null = null;

  for (const envName of KEY_ENV_CANDIDATES) {
    const val = cleanEnvValue(process.env[envName]);
    if (val) {
      customSegment = val;
      keySource = envName;
      break;
    }
  }

  for (const urlEnv of URL_ENV_CANDIDATES) {
    const rawUrl = cleanEnvValue(process.env[urlEnv]);
    if (!rawUrl) continue;

    const match = rawUrl.match(/^(https?:\/\/[^/]+\/api\/json\/v\d+)\/([^/?#]+)/i);
    if (match) {
      baseUrl = match[1].replace(/\/+$/, '');
      if (!customSegment && match[2]) {
        customSegment = match[2];
        keySource = urlEnv;
      }
      break;
    }

    if (urlEnv === 'THEMEALDB_BASE_URL') {
      baseUrl = rawUrl.replace(/\/+$/, '');
    }
  }

  const segment = customSegment || DEFAULT_PUBLIC_KEYLESS_SEGMENT;
  const baseEndpoint = `${baseUrl}/${encodeURIComponent(segment)}`;

  return {
    baseEndpoint,
    mode: customSegment && customSegment !== DEFAULT_PUBLIC_KEYLESS_SEGMENT ? 'custom-key' : 'keyless-public',
    keySource,
  };
}

/**
 * Serverless health check endpoint for Kampung Pantry API.
 * Verifies API service health and live reachability of TheMealDB's keyless v1 endpoint.
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  res.setHeader?.('Cache-Control', 'no-store, max-age=0');

  const { baseEndpoint, mode } = resolveMealDbConfig();
  let themealdbReachable = false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const upstream = await fetch(`${baseEndpoint}/categories.php`, {
      signal: controller.signal,
    });
    themealdbReachable = upstream.ok;
  } catch {
    themealdbReachable = false;
  } finally {
    clearTimeout(timeout);
  }

  res.status(200).json({
    ok: true,
    status: 'ok',
    service: 'Kampung Pantry API',
    timestamp: new Date().toISOString(),
    themealdbConfigured: true,
    themealdbMode: mode,
    themealdbReachable,
  });
}
