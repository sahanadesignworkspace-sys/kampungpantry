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
  apiKey: string;
  baseUrl: string;
  keySource: string | null;
}

/**
 * Resolves TheMealDB API configuration strictly from environment variables
 * (never hardcoded). Supports standard key env names as well as full URLs
 * placed in THEMEALDB_URL / THEMEALDB_BASE_URL.
 */
export function resolveMealDbConfig(): MealDbResolvedConfig {
  let baseUrl = DEFAULT_MEALDB_BASE_URL;
  let apiKey = '';
  let keySource: string | null = null;

  for (const envName of KEY_ENV_CANDIDATES) {
    const val = cleanEnvValue(process.env[envName]);
    if (val) {
      apiKey = val;
      keySource = envName;
      break;
    }
  }

  for (const urlEnv of URL_ENV_CANDIDATES) {
    const rawUrl = cleanEnvValue(process.env[urlEnv]);
    if (!rawUrl) continue;

    // Match URLs like https://www.themealdb.com/api/json/v1/<key>(/categories.php)?
    const match = rawUrl.match(/^(https?:\/\/[^/]+\/api\/json\/v\d+)\/([^/?#]+)/i);
    if (match) {
      baseUrl = match[1].replace(/\/+$/, '');
      if (!apiKey && match[2]) {
        apiKey = match[2];
        keySource = urlEnv;
      }
      break;
    }

    if (urlEnv === 'THEMEALDB_BASE_URL') {
      baseUrl = rawUrl.replace(/\/+$/, '');
    }
  }

  return { apiKey, baseUrl, keySource };
}

/**
 * Serverless health check endpoint for Kampung Pantry API.
 * Reports service status and whether TheMealDB credentials are configured
 * via environment variables without exposing any secret key values.
 */
export default function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): void {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  res.setHeader?.('Cache-Control', 'no-store, max-age=0');

  const { apiKey, keySource } = resolveMealDbConfig();
  const configured = Boolean(apiKey);

  res.status(200).json({
    ok: true,
    status: 'ok',
    service: 'Kampung Pantry API',
    timestamp: new Date().toISOString(),
    themealdbConfigured: configured,
    ...(keySource ? { themealdbKeySource: keySource } : {}),
    ...(!configured
      ? {
          configHint:
            'Set THEMEALDB_API_KEY in your Vercel Environment Variables (or local .env) and redeploy to enable live TheMealDB queries.',
        }
      : {}),
  });
}
