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

/**
 * Serverless health check endpoint for Kampung Pantry API.
 * Reports service status and whether THEMEALDB_API_KEY is configured
 * without exposing any secret key values.
 */
export default function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): void {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  res.status(200).json({
    status: 'ok',
    service: 'Kampung Pantry API',
    timestamp: new Date().toISOString(),
    themealdbConfigured: Boolean(process.env.THEMEALDB_API_KEY?.trim()),
  });
}
