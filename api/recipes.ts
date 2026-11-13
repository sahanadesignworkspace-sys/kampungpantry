import {
  resolveMealDbConfig,
  type ServerlessRequest,
  type ServerlessResponse,
} from './health.ts';

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

const LOCAL_FALLBACK_RECIPES = [
  {
    id: 'REC-1',
    title: '10-Min Garlic Choy Sum & Egg Rice Bowl',
    description:
      'Light, comforting stir-fried leafy greens with a soft-cooked egg over steamed jasmine rice — ideal for seniors and busy weeknights.',
    prepMinutes: 5,
    cookMinutes: 10,
    servings: 2,
    dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Soft & Easy-to-Chew', 'Under 20 Mins'],
    ingredients: [
      'Fresh Choy Sum & Bok Choy',
      'Thai Jasmine Rice (Unopened)',
      'Fresh Kampung Eggs (Halal)',
    ],
    steps: [
      'Wash choy sum thoroughly under running water and cut into bite-sized 4cm lengths.',
      'Heat 1 tablespoon cooking oil with minced garlic in a pan over medium heat until fragrant.',
      'Add stems first for 1 minute, then leafy tops and 2 tablespoons water; cover for 90 seconds until tender.',
      'Crack eggs into the pan or fry separately until fully set, then serve warm over steamed jasmine rice.',
    ],
    imageUrl: 'asset:stirfry',
    wasteSavedNote: 'Uses leafy greens and eggs before their 48-hour use-by window.',
    source: 'Local Pantry',
  },
  {
    id: 'REC-2',
    title: 'Warm Banana & Rolled Oats Porridge',
    description: 'Naturally sweet, gentle-on-the-stomach breakfast porridge requiring zero added sugar.',
    prepMinutes: 5,
    cookMinutes: 8,
    servings: 2,
    dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Soft & Easy-to-Chew', 'Under 20 Mins'],
    ingredients: ['Ripe Papaya & Cavendish Bananas', 'Red Lentils & Rolled Oats'],
    steps: [
      'Combine 1 cup rolled oats with 2.5 cups water in a small pot and bring to a gentle simmer.',
      'Slice ripe bananas into coins and stir half into the simmering oats so they soften naturally.',
      'Cook 5–6 minutes while stirring until creamy.',
      'Top with remaining banana slices and chilled papaya cubes on the side.',
    ],
    imageUrl: 'asset:fruit',
    wasteSavedNote: 'Turns ripe spotted bananas into natural sweetness without waste.',
    source: 'Local Pantry',
  },
  {
    id: 'REC-3',
    title: 'Kampung Egg & Wholemeal Toast Soldiers',
    description: 'Quick protein-rich breakfast or tea-time meal that finishes bread loaves before expiry.',
    prepMinutes: 3,
    cookMinutes: 7,
    servings: 2,
    dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Under 20 Mins'],
    ingredients: ['Wholemeal Sandwich Loaf', 'Fresh Kampung Eggs (Halal)'],
    steps: [
      'Toast slices of wholemeal bread until crisp and golden, then cut into easy-to-hold strips.',
      'Scramble or soft-boil eggs until cooked safely according to preference.',
      'Season lightly with white pepper and a drop of soy sauce or sesame oil.',
    ],
    imageUrl: 'asset:pantry',
    wasteSavedNote: 'Rescues bakery loaves nearing their best-before date.',
    source: 'Local Pantry',
  },
  {
    id: 'REC-4',
    title: 'One-Pot Red Lentil, Carrot & Greens Comfort Dal',
    description: 'Hearty, high-fibre vegetarian stew pairing dried pantry lentils with fresh fridge greens and carrots.',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Soft & Easy-to-Chew'],
    ingredients: [
      'Red Lentils & Rolled Oats',
      'Fresh Choy Sum & Bok Choy',
      'Sweet Carrots & Vine Tomatoes',
      'Thai Jasmine Rice (Unopened)',
    ],
    steps: [
      'Rinse 1 cup red lentils thoroughly until water runs clear.',
      'Dice carrots and tomatoes, then simmer with lentils and 3 cups water for 15 minutes until soft.',
      'Chop choy sum finely and stir in during the final 3 minutes of cooking.',
      'Serve warm with wholemeal toast or steamed jasmine rice.',
    ],
    imageUrl: 'asset:choySum',
    wasteSavedNote: 'Combines long-life dried pantry staples with perishable fridge vegetables.',
    source: 'Local Pantry',
  },
];

function getQueryString(query: Record<string, unknown> | undefined, key: string): string {
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

function extractKeywords(names: string[]): string[] {
  const map: Array<[RegExp, string]> = [
    [/choy\s*sum|bok\s*choy|spinach|greens/i, 'spinach'],
    [/egg/i, 'eggs'],
    [/banana/i, 'banana'],
    [/rice/i, 'rice'],
    [/bread|loaf/i, 'bread'],
    [/lentil/i, 'lentils'],
    [/carrot/i, 'carrot'],
    [/tomato/i, 'tomato'],
    [/papaya/i, 'papaya'],
  ];
  const kws = new Set<string>();
  for (const name of names) {
    for (const [rx, kw] of map) {
      if (rx.test(name)) kws.add(kw);
    }
  }
  if (kws.size === 0) {
    kws.add('eggs');
    kws.add('rice');
  }
  return Array.from(kws).slice(0, 4);
}

function splitInstructions(instructions: string): string[] {
  const cleaned = instructions
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((s) => s.replace(/^step\s*\d+[:.)-]?\s*/i, '').trim())
    .filter((s) => s.length > 8);
  return cleaned.length >= 2 ? cleaned.slice(0, 8) : [instructions].filter(Boolean);
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const search = getQueryString(req.query, 'q');
  const ingredient = getQueryString(req.query, 'ingredient');
  const ingredientsRaw = getQueryString(req.query, 'ingredients');
  const category = getQueryString(req.query, 'category');
  const selectedNames = ingredientsRaw
    ? ingredientsRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const { baseEndpoint } = resolveMealDbConfig();

  const rawMeals: RawMeal[] = [];
  let queriedIngredients: string[] = [];

  if (search) {
    const data = await fetchJson<{ meals?: RawMeal[] | null }>(
      `${baseEndpoint}/search.php?s=${encodeURIComponent(search)}`
    );
    rawMeals.push(...(data?.meals || []));
  } else if (category) {
    const data = await fetchJson<{ meals?: Array<{ idMeal: string }> | null }>(
      `${baseEndpoint}/filter.php?c=${encodeURIComponent(category)}`
    );
    const ids = (data?.meals || []).slice(0, 6).map((m) => m.idMeal);
    const lookups = await Promise.all(
      ids.map((id) =>
        fetchJson<{ meals?: RawMeal[] | null }>(
          `${baseEndpoint}/lookup.php?i=${encodeURIComponent(id)}`
        )
      )
    );
    for (const l of lookups) {
      if (l?.meals?.[0]) rawMeals.push(l.meals[0]);
    }
  } else {
    queriedIngredients = ingredient
      ? [ingredient.toLowerCase()]
      : extractKeywords(selectedNames);
    const hitCounts = new Map<string, number>();
    const responses = await Promise.all(
      queriedIngredients.map((kw) =>
        fetchJson<{ meals?: Array<{ idMeal: string }> | null }>(
          `${baseEndpoint}/filter.php?i=${encodeURIComponent(kw)}`
        )
      )
    );
    for (const r of responses) {
      for (const m of (r?.meals || []).slice(0, 6)) {
        hitCounts.set(m.idMeal, (hitCounts.get(m.idMeal) || 0) + 1);
      }
    }
    const rankedIds = Array.from(hitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);
    const lookups = await Promise.all(
      rankedIds.map((id) =>
        fetchJson<{ meals?: RawMeal[] | null }>(
          `${baseEndpoint}/lookup.php?i=${encodeURIComponent(id)}`
        )
      )
    );
    for (const l of lookups) {
      if (l?.meals?.[0]) rawMeals.push(l.meals[0]);
    }
  }

  const safeMeals = rawMeals.filter(isHalalFriendly).slice(0, 8).map((meal) => {
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (meal[`strIngredient${i}`] || '').trim();
      const measure = (meal[`strMeasure${i}`] || '').trim();
      if (ing) ingredients.push(measure ? `${measure} ${ing}` : ing);
    }
    const steps = splitInstructions(meal.strInstructions || '');
    return {
      id: `MDB-${meal.idMeal}`,
      title: meal.strMeal,
      description: `${meal.strArea || 'International'} ${meal.strCategory || 'home-style'} dish sourced live from TheMealDB.`,
      prepMinutes: 10,
      cookMinutes: 15,
      servings: 2,
      dietaryTags: [
        'Halal-Friendly',
        ...(meal.strCategory === 'Vegetarian' || meal.strCategory === 'Vegan' ? ['Vegetarian'] : []),
      ],
      ingredients,
      steps,
      imageUrl: meal.strMealThumb || 'asset:stirfry',
      wasteSavedNote: 'Matched live from TheMealDB to your selected pantry ingredients.',
      matchedAvailable: selectedNames,
      source: 'TheMealDB',
      cuisine: meal.strArea,
      category: meal.strCategory,
      youtubeUrl: meal.strYoutube,
    };
  });

  res.status(200).json({
    recipes: safeMeals.length > 0 ? safeMeals : LOCAL_FALLBACK_RECIPES,
    source: safeMeals.length > 0 ? 'themealdb' : 'local-fallback',
    configured: true,
    queriedIngredients,
  });
}
