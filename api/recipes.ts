import type { ServerlessRequest, ServerlessResponse } from './health.ts';

const DEFAULT_BASE_URL = 'https://www.themealdb.com/api/json/v1';
const NON_HALAL_PATTERN =
  /\b(pork|bacon|ham|prosciutto|pancetta|lard|chorizo|gammon|wine|beer|rum|brandy|whisky|whiskey|vodka|sherry|mirin|sake|bourbon|gin)\b/i;

interface RawMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

function getQueryString(
  query: Record<string, unknown> | undefined,
  key: string
): string {
  const val = query?.[key];
  if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0].trim() : '';
  return typeof val === 'string' ? val.trim() : '';
}

function isHalalFriendly(meal: RawMeal): boolean {
  if (meal.strCategory && /pork/i.test(meal.strCategory)) return false;
  if (NON_HALAL_PATTERN.test(meal.strMeal || '')) return false;
  if (NON_HALAL_PATTERN.test(meal.strInstructions || '')) return false;
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && NON_HALAL_PATTERN.test(ing)) return false;
  }
  return true;
}

/**
 * Serverless endpoint for querying TheMealDB recipes by search (`q`),
 * ingredient (`i`), or category (`c`) without hardcoding any API key.
 */
export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const apiKey = process.env.THEMEALDB_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error:
        'THEMEALDB_API_KEY is not configured. Add your key in environment variables to fetch live recipes.',
      meals: [],
      configured: false,
    });
    return;
  }

  const baseUrl = (process.env.THEMEALDB_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const search = getQueryString(req.query, 'q');
  const ingredient = getQueryString(req.query, 'ingredient');
  const category = getQueryString(req.query, 'category');

  let pathSegment = 'categories.php';
  if (search) {
    pathSegment = `search.php?s=${encodeURIComponent(search)}`;
  } else if (ingredient) {
    pathSegment = `filter.php?i=${encodeURIComponent(ingredient)}`;
  } else if (category) {
    pathSegment = `filter.php?c=${encodeURIComponent(category)}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const endpoint = `${baseUrl}/${encodeURIComponent(apiKey)}/${pathSegment}`;
    const response = await fetch(endpoint, { signal: controller.signal });
    if (!response.ok) {
      res.status(502).json({
        error: `TheMealDB responded with status ${response.status}.`,
        meals: [],
      });
      return;
    }

    const data = (await response.json()) as { meals?: RawMeal[] | null; categories?: unknown[] };
    if (pathSegment === 'categories.php') {
      res.status(200).json({ categories: data.categories || [], source: 'themealdb' });
      return;
    }

    const safeMeals = (data.meals || []).filter(isHalalFriendly);
    res.status(200).json({ meals: safeMeals, source: 'themealdb' });
  } catch {
    res.status(504).json({ error: 'Unable to reach TheMealDB API.', meals: [] });
  } finally {
    clearTimeout(timeout);
  }
}
