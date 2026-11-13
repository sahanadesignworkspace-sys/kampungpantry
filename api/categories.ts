import {
  resolveMealDbConfig,
  type ServerlessRequest,
  type ServerlessResponse,
} from './health.ts';

export interface MealCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

const CACHE_TTL_MS = 15 * 60 * 1000;

let cachedCategories: { expiresAt: number; items: MealCategory[] } | null = null;

/**
 * Serverless endpoint that pulls live recipe categories from TheMealDB
 * (`categories.php`) using the keyless public v1 endpoint (or optional env override).
 * Excludes non-Halal categories (e.g. Pork) per community fridge guidelines.
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const { baseEndpoint } = resolveMealDbConfig();

  if (cachedCategories && cachedCategories.expiresAt > Date.now()) {
    res.status(200).json({
      categories: cachedCategories.items,
      source: 'themealdb',
      configured: true,
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const endpoint = `${baseEndpoint}/categories.php`;
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) {
      res.status(502).json({
        error: `TheMealDB responded with status ${response.status}.`,
        categories: [],
        configured: true,
      });
      return;
    }

    const payload = (await response.json()) as { categories?: MealCategory[] };
    const safeCategories = (payload.categories || []).filter(
      (cat) => cat.strCategory && !/pork/i.test(cat.strCategory)
    );

    cachedCategories = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      items: safeCategories,
    };

    res.status(200).json({
      categories: safeCategories,
      source: 'themealdb',
      configured: true,
    });
  } catch {
    res.status(504).json({
      error: 'Unable to reach TheMealDB categories endpoint right now.',
      categories: [],
      configured: true,
    });
  } finally {
    clearTimeout(timeout);
  }
}
