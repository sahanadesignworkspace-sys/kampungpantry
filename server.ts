import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ActivityRecord,
  Announcement,
  ApprovedCategory,
  CommunityStats,
  FoodItem,
  FridgeLog,
  LanguageCode,
  Recipe,
  SmsSubscriber,
  StorageZone,
} from './src/types/pantry.ts';
import healthHandler, { resolveMealDbConfig } from './api/health.ts';
import categoriesHandler from './api/categories.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PIN = process.env.ADMIN_VOLUNTEER_PIN || '2026';
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'pantry-db.json');

const ALLOWED_CATEGORIES: ApprovedCategory[] = [
  'Vegetables',
  'Fruits',
  'Dried Goods',
  'Bakery & Bread',
  'Dairy & Eggs',
  'Condiments & Spices',
];

const ALLOWED_ZONES: StorageZone[] = [
  'Chiller Fridge (2°C–4°C)',
  'Crisper Drawer',
  'Dry Pantry Shelf',
];

interface PantryDatabase {
  items: FoodItem[];
  activities: ActivityRecord[];
  fridgeLogs: FridgeLog[];
  announcements: Announcement[];
  smsSubscribers: SmsSubscriber[];
  recipes: Recipe[];
  nextSeq: number;
}

function isoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function isoTimeOffsetHours(hoursOffset: number): string {
  const d = new Date(Date.now() + hoursOffset * 3600 * 1000);
  return d.toISOString();
}

function sanitizeText(input: unknown, maxLen = 120): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

function createSeedDatabase(): PantryDatabase {
  const items: FoodItem[] = [
    {
      id: 'KP-2026-0101',
      name: 'Fresh Choy Sum & Bok Choy',
      category: 'Vegetables',
      quantity: 4,
      remainingQty: 3,
      unit: 'bunches',
      estimatedKgPerUnit: 0.35,
      dateDonated: isoDateOffset(0),
      expiryDate: isoDateOffset(1),
      storageZone: 'Crisper Drawer',
      storageInstructions: 'Keep in breathable produce bag inside crisper drawer. Rinse before cooking.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Auntie Mei Ling',
      donorBlock: 'Blk 412',
      imageUrl: 'asset:choySum',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0101',
      inspectedBy: 'Volunteer Siti (08:30)',
      notes: 'Bought extra from wet market this morning.',
      createdAt: isoTimeOffsetHours(-3),
    },
    {
      id: 'KP-2026-0102',
      name: 'Ripe Papaya & Cavendish Bananas',
      category: 'Fruits',
      quantity: 5,
      remainingQty: 4,
      unit: 'portions',
      estimatedKgPerUnit: 0.45,
      dateDonated: isoDateOffset(0),
      expiryDate: isoDateOffset(2),
      storageZone: 'Chiller Fridge (2°C–4°C)',
      storageInstructions: 'Papaya halves wrapped cleanly; bananas on upper shelf.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Mr Tan K.H.',
      donorBlock: 'Blk 408',
      imageUrl: 'asset:fruit',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0102',
      inspectedBy: 'Volunteer Siti (08:30)',
      notes: 'Sweet and ready to eat today or tomorrow.',
      createdAt: isoTimeOffsetHours(-2),
    },
    {
      id: 'KP-2026-0103',
      name: 'Thai Jasmine Rice (Unopened)',
      category: 'Dried Goods',
      quantity: 3,
      remainingQty: 3,
      unit: '1kg packs',
      estimatedKgPerUnit: 1.0,
      dateDonated: isoDateOffset(-1),
      expiryDate: isoDateOffset(180),
      storageZone: 'Dry Pantry Shelf',
      storageInstructions: 'Store sealed on dry middle shelf away from moisture.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Razak & Family',
      donorBlock: 'Blk 415',
      imageUrl: 'asset:pantry',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0103',
      inspectedBy: 'Volunteer Kumar (18:00)',
      notes: 'Halal-certified sealed packets.',
      createdAt: isoTimeOffsetHours(-18),
    },
    {
      id: 'KP-2026-0104',
      name: 'Wholemeal Sandwich Loaf',
      category: 'Bakery & Bread',
      quantity: 2,
      remainingQty: 2,
      unit: 'loaves',
      estimatedKgPerUnit: 0.4,
      dateDonated: isoDateOffset(0),
      expiryDate: isoDateOffset(1),
      storageZone: 'Dry Pantry Shelf',
      storageInstructions: 'Keep clip tightly sealed. Best toasted or used by tomorrow.',
      allergens: 'Contains Wheat / Gluten',
      halalFriendly: true,
      donorName: 'Heartland Bakery Partner',
      donorBlock: 'Blk 401',
      imageUrl: 'asset:pantry',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0104',
      inspectedBy: 'Volunteer Siti (09:00)',
      notes: 'Fresh surplus from neighbourhood bakery.',
      createdAt: isoTimeOffsetHours(-1),
    },
    {
      id: 'KP-2026-0105',
      name: 'Fresh Kampung Eggs (Halal)',
      category: 'Dairy & Eggs',
      quantity: 3,
      remainingQty: 2,
      unit: 'half-trays (6s)',
      estimatedKgPerUnit: 0.35,
      dateDonated: isoDateOffset(-1),
      expiryDate: isoDateOffset(7),
      storageZone: 'Chiller Fridge (2°C–4°C)',
      storageInstructions: 'Keep on middle chiller shelf. Cook thoroughly before eating.',
      allergens: 'Contains Egg',
      halalFriendly: true,
      donorName: 'Priya S.',
      donorBlock: 'Blk 410',
      imageUrl: 'asset:pantry',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0105',
      inspectedBy: 'Volunteer Kumar (18:00)',
      notes: 'Clean shell, intact carton.',
      createdAt: isoTimeOffsetHours(-14),
    },
    {
      id: 'KP-2026-0106',
      name: 'Red Lentils & Rolled Oats',
      category: 'Dried Goods',
      quantity: 4,
      remainingQty: 4,
      unit: 'sealed jars',
      estimatedKgPerUnit: 0.5,
      dateDonated: isoDateOffset(-2),
      expiryDate: isoDateOffset(90),
      storageZone: 'Dry Pantry Shelf',
      storageInstructions: 'Dry shelf, keep lid closed tightly.',
      allergens: 'Oats (may contain traces of gluten)',
      halalFriendly: true,
      donorName: 'Mdm Lim',
      donorBlock: 'Blk 406',
      imageUrl: 'asset:pantry',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0106',
      inspectedBy: 'Volunteer Siti (08:30)',
      createdAt: isoTimeOffsetHours(-30),
    },
    {
      id: 'KP-2026-0107',
      name: 'Kang Kong (Water Spinach)',
      category: 'Vegetables',
      quantity: 3,
      remainingQty: 0,
      unit: 'bunches',
      estimatedKgPerUnit: 0.3,
      dateDonated: isoDateOffset(-2),
      expiryDate: isoDateOffset(0),
      storageZone: 'Crisper Drawer',
      storageInstructions: 'Crisper drawer.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Uncle Muthu',
      donorBlock: 'Blk 409',
      imageUrl: 'asset:choySum',
      status: 'collected',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0107',
      inspectedBy: 'Volunteer Siti (08:30)',
      createdAt: isoTimeOffsetHours(-40),
    },
    {
      id: 'KP-2026-0108',
      name: 'Baby Spinach Pack (Past Use-By)',
      category: 'Vegetables',
      quantity: 1,
      remainingQty: 1,
      unit: 'pack',
      estimatedKgPerUnit: 0.25,
      dateDonated: isoDateOffset(-4),
      expiryDate: isoDateOffset(-1),
      storageZone: 'Crisper Drawer',
      storageInstructions: 'Requires volunteer disposal check.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Neighbour Blk 411',
      donorBlock: 'Blk 411',
      imageUrl: 'asset:choySum',
      status: 'expired',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0108',
      inspectedBy: 'Pending Volunteer Removal',
      createdAt: isoTimeOffsetHours(-96),
    },
  ];

  const activities: ActivityRecord[] = [
    {
      id: 'ACT-1',
      type: 'donation',
      itemId: 'KP-2026-0104',
      itemName: 'Wholemeal Sandwich Loaf',
      quantityText: '2 loaves',
      residentName: 'Heartland Bakery Partner',
      block: 'Blk 401',
      timestamp: isoTimeOffsetHours(-1),
      method: 'QR Scan',
    },
    {
      id: 'ACT-2',
      type: 'collection',
      itemId: 'KP-2026-0101',
      itemName: 'Fresh Choy Sum & Bok Choy',
      quantityText: '1 bunch',
      residentName: 'Mdm Faridah',
      block: 'Blk 412',
      timestamp: isoTimeOffsetHours(-1.5),
      method: 'Manual Entry',
    },
    {
      id: 'ACT-3',
      type: 'donation',
      itemId: 'KP-2026-0102',
      itemName: 'Ripe Papaya & Cavendish Bananas',
      quantityText: '5 portions',
      residentName: 'Mr Tan K.H.',
      block: 'Blk 408',
      timestamp: isoTimeOffsetHours(-2),
      method: 'QR Scan',
    },
    {
      id: 'ACT-4',
      type: 'collection',
      itemId: 'KP-2026-0105',
      itemName: 'Fresh Kampung Eggs (Halal)',
      quantityText: '1 half-tray',
      residentName: 'Uncle Ah Hock',
      block: 'Blk 405',
      timestamp: isoTimeOffsetHours(-4),
      method: 'Manual Entry',
    },
  ];

  const fridgeLogs: FridgeLog[] = [
    {
      id: 'LOG-1',
      recordedAt: isoTimeOffsetHours(-2),
      temperatureC: 3.2,
      cleanedBy: 'Volunteer Siti',
      sanitisedChecklist: true,
      notes: 'Morning check complete. Wiped chiller shelves, verified NO PORK / Halal-friendly labels.',
    },
    {
      id: 'LOG-2',
      recordedAt: isoTimeOffsetHours(-14),
      temperatureC: 3.5,
      cleanedBy: 'Volunteer Kumar',
      sanitisedChecklist: true,
      notes: 'Evening sanitisation and crisper drawer check.',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'ANN-1',
      title: "Today's Fresh Finds: Wet Market Greens & Bakery Loaves",
      body: 'Fresh choy sum, bok choy, ripe papaya, bananas, and 2 loaves of wholemeal bread arrived this morning at Blk 412 Void Deck. Please take only what your household needs today.',
      date: isoDateOffset(0),
      category: "Today's Fresh Finds",
    },
    {
      id: 'ANN-2',
      title: 'Halal-Friendly & Food Safety Reminder',
      body: 'Strictly NO pork, raw meat, alcohol, or unlabelled home-cooked leftovers inside the shared fridge. Volunteers inspect all shelves twice daily.',
      date: isoDateOffset(0),
      category: 'Estate Notice',
    },
    {
      id: 'ANN-3',
      title: 'Elderly Resident Collection Support',
      body: 'No smartphone needed! Neighbours without the app can collect directly at the fridge and ask a volunteer or use the manual clipboard / kiosk button.',
      date: isoDateOffset(-1),
      category: 'Volunteer Update',
    },
  ];

  const smsSubscribers: SmsSubscriber[] = [
    {
      id: 'SMS-1',
      name: 'Uncle Ah Hock',
      phoneLast4: '4821',
      block: 'Blk 405',
      preferredLang: 'zh',
      subscribedAt: isoTimeOffsetHours(-120),
    },
    {
      id: 'SMS-2',
      name: 'Mdm Faridah',
      phoneLast4: '7710',
      block: 'Blk 412',
      preferredLang: 'ms',
      subscribedAt: isoTimeOffsetHours(-72),
    },
  ];

  const recipes: Recipe[] = [
    {
      id: 'REC-1',
      title: '10-Min Garlic Choy Sum & Egg Rice Bowl',
      description: 'Light, comforting stir-fried leafy greens with a soft-cooked egg over steamed jasmine rice — ideal for seniors and busy weeknights.',
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
      wasteSavedNote: 'Uses leafy greens and bread/eggs before their 48-hour use-by window.',
    },
    {
      id: 'REC-2',
      title: 'Warm Banana & Rolled Oats Porridge',
      description: 'Naturally sweet, gentle-on-the-stomach breakfast porridge requiring zero added sugar.',
      prepMinutes: 5,
      cookMinutes: 8,
      servings: 2,
      dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Soft & Easy-to-Chew', 'Under 20 Mins'],
      ingredients: [
        'Ripe Papaya & Cavendish Bananas',
        'Red Lentils & Rolled Oats',
      ],
      steps: [
        'Combine 1 cup rolled oats with 2.5 cups water in a small pot and bring to a gentle simmer.',
        'Slice ripe bananas into coins and stir half into the simmering oats so they soften naturally.',
        'Cook 5–6 minutes while stirring until creamy.',
        'Top with remaining banana slices and chilled papaya cubes on the side.',
      ],
      imageUrl: 'asset:fruit',
      wasteSavedNote: 'Turns ripe spotted bananas into natural sweetness without waste.',
    },
    {
      id: 'REC-3',
      title: 'Kampung Egg & Wholemeal Toast Soldiers',
      description: 'Quick protein-rich breakfast or tea-time meal that finishes bread loaves before expiry.',
      prepMinutes: 3,
      cookMinutes: 7,
      servings: 2,
      dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Under 20 Mins'],
      ingredients: [
        'Wholemeal Sandwich Loaf',
        'Fresh Kampung Eggs (Halal)',
      ],
      steps: [
        'Toast slices of wholemeal bread until crisp and golden, then cut into easy-to-hold strips.',
        'Scramble or soft-boil eggs until cooked safely according to preference.',
        'Season lightly with white pepper and a drop of soy sauce or sesame oil.',
      ],
      imageUrl: 'asset:pantry',
      wasteSavedNote: 'Rescues bakery loaves nearing their best-before date.',
    },
    {
      id: 'REC-4',
      title: 'One-Pot Red Lentil & Greens Comfort Dal',
      description: 'Hearty, high-fibre vegetarian stew pairing dried pantry lentils with fresh fridge greens.',
      prepMinutes: 10,
      cookMinutes: 20,
      servings: 4,
      dietaryTags: ['Halal-Friendly', 'Vegetarian', 'Soft & Easy-to-Chew'],
      ingredients: [
        'Red Lentils & Rolled Oats',
        'Fresh Choy Sum & Bok Choy',
        'Thai Jasmine Rice (Unopened)',
      ],
      steps: [
        'Rinse 1 cup red lentils thoroughly until water runs clear.',
        'Simmer lentils with 3 cups water and a pinch of turmeric for 15 minutes until soft.',
        'Chop choy sum finely and stir in during the final 3 minutes of cooking.',
        'Serve warm with wholemeal toast or steamed jasmine rice.',
      ],
      imageUrl: 'asset:choySum',
      wasteSavedNote: 'Combines long-life dried pantry staples with perishable fridge greens.',
    },
  ];

  return {
    items,
    activities,
    fridgeLogs,
    announcements,
    smsSubscribers,
    recipes,
    nextSeq: 109,
  };
}

function loadDb(): PantryDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seeded = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as PantryDatabase;
    return parsed;
  } catch {
    const seeded = createSeedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

function saveDb(db: PantryDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  const diffMs = exp.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function syncExpiredItems(db: PantryDatabase): boolean {
  let changed = false;
  for (const item of db.items) {
    if (item.status === 'available' || item.status === 'reserved') {
      if (daysUntilExpiry(item.expiryDate) < 0) {
        item.status = 'expired';
        changed = true;
      } else if (item.remainingQty <= 0) {
        item.status = 'collected';
        changed = true;
      }
    }
  }
  if (changed) saveDb(db);
  return changed;
}

function buildSmsDigest(items: FoodItem[]): string {
  const available = items.filter((i) => i.status === 'available' && i.remainingQty > 0);
  if (available.length === 0) {
    return '[Kampung Pantry Blk 412] Fridge is currently awaiting today’s fresh donations. Check back soon!';
  }
  const topLines = available
    .slice(0, 4)
    .map((i) => {
      const days = daysUntilExpiry(i.expiryDate);
      const tag = days <= 1 ? ' (Use Today!)' : '';
      return `- ${i.name}: ${i.remainingQty} ${i.unit}${tag}`;
    })
    .join('\n');
  return `[Kampung Pantry Blk 412]\nToday's Free Fridge Items (${available.length} listings):\n${topLines}\nTake what you need. No app required at the fridge.`;
}

function requireAdminPin(req: Request, res: Response, next: NextFunction): void {
  const providedPin = req.header('x-admin-pin') || '';
  if (providedPin !== ADMIN_PIN) {
    res.status(401).json({
      error: 'Unauthorised. Please enter the valid Community Volunteer PIN.',
    });
    return;
  }
  next();
}

const NON_HALAL_PATTERN =
  /\b(pork|bacon|ham|prosciutto|pancetta|lard|chorizo|gammon|wine|beer|rum|brandy|whisky|whiskey|vodka|sherry|mirin|sake|bourbon|gin)\b/i;

interface MealDbRawMeal {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strMealThumb?: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

const mealDbCache = new Map<string, { expiresAt: number; data: unknown }>();

async function fetchMealDbJson<T>(endpointPath: string): Promise<T | null> {
  const { apiKey, baseUrl } = resolveMealDbConfig();
  if (!apiKey) {
    return null;
  }

  const now = Date.now();
  const cached = mealDbCache.get(endpointPath);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(`${baseUrl}/${encodeURIComponent(apiKey)}${endpointPath}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as T;
    mealDbCache.set(endpointPath, { expiresAt: now + 15 * 60 * 1000, data: json });
    return json;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function extractFridgeKeywords(items: FoodItem[]): string[] {
  const keywordMap: Array<[RegExp, string]> = [
    [/choy\s*sum|bok\s*choy|pak\s*choi|kang\s*kong|spinach|greens|kale/i, 'spinach'],
    [/egg/i, 'eggs'],
    [/banana/i, 'banana'],
    [/rice/i, 'rice'],
    [/bread|loaf|toast/i, 'bread'],
    [/lentil|dal/i, 'lentils'],
    [/oat/i, 'oats'],
    [/tomato/i, 'tomato'],
    [/potato/i, 'potato'],
    [/carrot/i, 'carrot'],
    [/tofu/i, 'tofu'],
    [/milk/i, 'milk'],
    [/apple/i, 'apple'],
    [/papaya/i, 'papaya'],
  ];

  // Prioritise items expiring soonest first
  const sorted = [...items].sort(
    (a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate)
  );
  const found = new Set<string>();
  for (const item of sorted) {
    for (const [pattern, kw] of keywordMap) {
      if (pattern.test(item.name)) {
        found.add(kw);
      }
    }
    if (found.size >= 4) break;
  }
  if (found.size === 0) {
    found.add('eggs');
    found.add('rice');
  }
  return Array.from(found);
}

function isMealHalalFriendly(meal: MealDbRawMeal): boolean {
  if (meal.strCategory && /pork/i.test(meal.strCategory)) return false;
  if (NON_HALAL_PATTERN.test(meal.strMeal || '')) return false;
  if (NON_HALAL_PATTERN.test(meal.strInstructions || '')) return false;
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    if (ing && NON_HALAL_PATTERN.test(ing)) return false;
  }
  return true;
}

function extractMealIngredients(meal: MealDbRawMeal): Array<{ raw: string; display: string }> {
  const list: Array<{ raw: string; display: string }> = [];
  for (let i = 1; i <= 20; i++) {
    const ing = (meal[`strIngredient${i}`] || '').trim();
    const measure = (meal[`strMeasure${i}`] || '').trim();
    if (ing) {
      list.push({
        raw: ing,
        display: measure ? `${measure} ${ing}` : ing,
      });
    }
  }
  return list;
}

function splitInstructions(instructions: string): string[] {
  const cleaned = instructions
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((s) => s.replace(/^step\s*\d+[:.)-]?\s*/i, '').trim())
    .filter((s) => s.length > 8);
  if (cleaned.length >= 2) return cleaned.slice(0, 8);
  return instructions
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .slice(0, 8);
}

function matchFridgeItemsForIngredients(
  ingredientNames: string[],
  availableItems: FoodItem[]
): { matchedAvailable: string[]; matchedExpiringSoon: string[]; matchScore: number } {
  const matchedAvailable = new Set<string>();
  const matchedExpiringSoon = new Set<string>();
  let score = 0;

  const synonymGroups: RegExp[] = [
    /choy|spinach|greens|kale|cabbage|lettuce/i,
    /egg/i,
    /rice/i,
    /bread|toast|loaf/i,
    /banana/i,
    /papaya/i,
    /lentil|dal/i,
    /oat/i,
    /garlic/i,
    /onion/i,
    /tomato/i,
    /carrot/i,
    /potato/i,
  ];

  for (const item of availableItems) {
    const itemLower = item.name.toLowerCase();
    const matched = ingredientNames.some((ing) => {
      const ingLower = ing.toLowerCase();
      if (itemLower.includes(ingLower) || ingLower.includes(itemLower)) return true;
      return synonymGroups.some((rx) => rx.test(itemLower) && rx.test(ingLower));
    });

    if (matched) {
      matchedAvailable.add(item.name);
      if (daysUntilExpiry(item.expiryDate) <= 2) {
        matchedExpiringSoon.add(item.name);
        score += 3;
      } else {
        score += 1;
      }
    }
  }

  return {
    matchedAvailable: Array.from(matchedAvailable),
    matchedExpiringSoon: Array.from(matchedExpiringSoon),
    matchScore: score,
  };
}

function mapMealDbToRecipe(meal: MealDbRawMeal, availableItems: FoodItem[]): Recipe {
  const ingEntries = extractMealIngredients(meal);
  const steps = splitInstructions(meal.strInstructions || '');
  const { matchedAvailable, matchedExpiringSoon, matchScore } = matchFridgeItemsForIngredients(
    ingEntries.map((e) => e.raw),
    availableItems
  );

  const dietaryTags = ['Halal-Friendly'];
  if (meal.strCategory === 'Vegetarian' || meal.strCategory === 'Vegan') {
    dietaryTags.push('Vegetarian');
  }
  if (steps.length <= 4) {
    dietaryTags.push('Under 20 Mins');
  }
  if (
    /porridge|soup|stew|egg|omelette|rice|dal|lentil|banana/i.test(
      `${meal.strMeal} ${meal.strCategory || ''}`
    )
  ) {
    dietaryTags.push('Soft & Easy-to-Chew');
  }

  const prepMinutes = Math.max(5, Math.min(15, ingEntries.length + 2));
  const cookMinutes = steps.length <= 4 ? 12 : 22;

  return {
    id: `MDB-${meal.idMeal}`,
    title: meal.strMeal,
    description: `${meal.strArea || 'International'} ${meal.strCategory || 'home-style'} dish sourced live from TheMealDB and screened for community guidelines.`,
    prepMinutes,
    cookMinutes,
    servings: 2,
    dietaryTags,
    ingredients: ingEntries.map((e) => e.display),
    steps: steps.length > 0 ? steps : ['Prepare ingredients cleanly and cook until heated through.'],
    imageUrl: meal.strMealThumb || 'asset:stirfry',
    wasteSavedNote:
      matchedExpiringSoon.length > 0
        ? `Prioritises use-soon fridge items: ${matchedExpiringSoon.join(', ')}.`
        : matchedAvailable.length > 0
          ? `Uses ${matchedAvailable.length} ingredient(s) currently in the fridge.`
          : 'Great match for community pantry staples.',
    matchedAvailable,
    matchedExpiringSoon,
    matchScore,
    source: 'TheMealDB',
    cuisine: meal.strArea || undefined,
    category: meal.strCategory || undefined,
    youtubeUrl: meal.strYoutube && meal.strYoutube.startsWith('https://') ? meal.strYoutube : undefined,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '3mb' }));

  app.get('/api/health', (req: Request, res: Response) => {
    healthHandler(req, res);
  });

  app.get('/api/categories', async (req: Request, res: Response) => {
    await categoriesHandler(req, res);
  });

  app.get('/api/inventory', (req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);

    const category = sanitizeText(req.query.category, 40);
    const search = sanitizeText(req.query.search, 60).toLowerCase();
    const statusParam = sanitizeText(req.query.status, 20);
    const expiringSoon = req.query.expiringSoon === 'true';

    // Never allow expired items to appear in public available inventory
    let results = db.items.filter((item) => {
      if (statusParam === 'all_public') {
        return item.status === 'available' || item.status === 'reserved' || item.status === 'collected';
      }
      if (statusParam && statusParam !== 'expired' && statusParam !== 'removed') {
        return item.status === statusParam;
      }
      return item.status === 'available' || item.status === 'reserved';
    });

    if (category && category !== 'All') {
      results = results.filter((i) => i.category === category);
    }

    if (search) {
      results = results.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.category.toLowerCase().includes(search) ||
          i.id.toLowerCase().includes(search) ||
          i.donorBlock.toLowerCase().includes(search)
      );
    }

    if (expiringSoon) {
      results = results.filter((i) => daysUntilExpiry(i.expiryDate) <= 2);
    }

    // Sort expiring soonest first for waste prevention, then newest
    results.sort((a, b) => {
      const da = daysUntilExpiry(a.expiryDate);
      const dbDays = daysUntilExpiry(b.expiryDate);
      if (da !== dbDays) return da - dbDays;
      return b.createdAt.localeCompare(a.createdAt);
    });

    res.json({ items: results });
  });

  app.post('/api/donations', (req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);

    const name = sanitizeText(req.body?.name, 80);
    const category = sanitizeText(req.body?.category, 40) as ApprovedCategory;
    const quantity = Number(req.body?.quantity);
    const unit = sanitizeText(req.body?.unit, 24) || 'packs';
    const expiryDate = sanitizeText(req.body?.expiryDate, 12);
    const storageZone = sanitizeText(req.body?.storageZone, 40) as StorageZone;
    const storageInstructions = sanitizeText(req.body?.storageInstructions, 200);
    const allergens = sanitizeText(req.body?.allergens, 100) || 'None declared';
    const donorName = sanitizeText(req.body?.donorName, 50) || 'Kind Neighbour';
    const donorBlock = sanitizeText(req.body?.donorBlock, 20) || 'HDB Estate';
    const notes = sanitizeText(req.body?.notes, 180);
    const rawImage = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl : '';

    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Please enter a valid food name.' });
      return;
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      res.status(400).json({
        error: 'Food category is not approved for the community fridge. Only approved halal-friendly categories are accepted.',
      });
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
      res.status(400).json({ error: 'Quantity must be between 1 and 50.' });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      res.status(400).json({ error: 'Please select a valid use-by date.' });
      return;
    }

    if (daysUntilExpiry(expiryDate) < 0) {
      res.status(400).json({ error: 'Cannot donate items that have already passed their use-by date.' });
      return;
    }

    const safeZone = ALLOWED_ZONES.includes(storageZone)
      ? storageZone
      : 'Chiller Fridge (2°C–4°C)';

    // Allow either known asset keys or safe data:image base64 uploads (< 2MB)
    let safeImage = 'asset:pantry';
    if (
      rawImage.startsWith('asset:') ||
      /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(rawImage)
    ) {
      safeImage = rawImage;
    } else if (category === 'Vegetables') {
      safeImage = 'asset:choySum';
    } else if (category === 'Fruits') {
      safeImage = 'asset:fruit';
    }

    const seq = db.nextSeq++;
    const id = `KP-2026-${String(seq).padStart(4, '0')}`;
    const today = isoDateOffset(0);

    const newItem: FoodItem = {
      id,
      name,
      category,
      quantity,
      remainingQty: quantity,
      unit,
      estimatedKgPerUnit: category === 'Dried Goods' ? 0.8 : 0.4,
      dateDonated: today,
      expiryDate,
      storageZone: safeZone,
      storageInstructions:
        storageInstructions ||
        `Place clearly labelled inside ${safeZone}. Volunteers inspect daily.`,
      allergens,
      halalFriendly: true,
      donorName,
      donorBlock,
      imageUrl: safeImage,
      status: 'available',
      qrPayload: `KAMPUNG-PANTRY:${id}`,
      inspectedBy: 'Self-registered (awaiting volunteer check)',
      notes,
      createdAt: new Date().toISOString(),
    };

    db.items.unshift(newItem);
    db.activities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'donation',
      itemId: newItem.id,
      itemName: newItem.name,
      quantityText: `${quantity} ${unit}`,
      residentName: donorName,
      block: donorBlock,
      timestamp: new Date().toISOString(),
      method: 'QR Scan',
    });

    saveDb(db);
    res.status(201).json({ item: newItem, pointsEarned: 15 });
  });

  app.post('/api/collect', (req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);

    const rawCode = sanitizeText(req.body?.codeOrId, 80);
    const cleanedId = rawCode.replace(/^KAMPUNG-PANTRY:/i, '').toUpperCase();
    const qtyRequested = Number(req.body?.quantity ?? 1);
    const residentName = sanitizeText(req.body?.residentName, 50) || 'Neighbour';
    const block = sanitizeText(req.body?.block, 20) || 'Estate Resident';
    const method =
      req.body?.method === 'Manual Entry'
        ? 'Manual Entry'
        : req.body?.method === 'Self-Collect'
          ? 'Self-Collect'
          : 'QR Scan';

    if (!cleanedId) {
      res.status(400).json({ error: 'Please scan a QR code or enter an Item ID.' });
      return;
    }

    const item = db.items.find((i) => i.id.toUpperCase() === cleanedId);
    if (!item) {
      res.status(404).json({ error: `No pantry item found matching ID "${cleanedId}".` });
      return;
    }

    if (item.status === 'expired' || daysUntilExpiry(item.expiryDate) < 0) {
      item.status = 'expired';
      saveDb(db);
      res.status(409).json({
        error: 'This item has passed its use-by date and cannot be collected for safety reasons.',
      });
      return;
    }

    if (item.status === 'removed') {
      res.status(409).json({
        error: 'This item was removed by a community volunteer during food safety inspection.',
      });
      return;
    }

    if (item.status === 'collected' || item.remainingQty <= 0) {
      res.status(409).json({
        error: 'This listing has already been fully collected (duplicate collection prevented).',
      });
      return;
    }

    if (!Number.isFinite(qtyRequested) || qtyRequested < 1 || qtyRequested > item.remainingQty) {
      res.status(400).json({
        error: `Only ${item.remainingQty} ${item.unit} remaining available to collect.`,
      });
      return;
    }

    item.remainingQty -= qtyRequested;
    if (item.remainingQty <= 0) {
      item.remainingQty = 0;
      item.status = 'collected';
    }

    const activity: ActivityRecord = {
      id: `ACT-${Date.now()}`,
      type: 'collection',
      itemId: item.id,
      itemName: item.name,
      quantityText: `${qtyRequested} ${item.unit}`,
      residentName,
      block,
      timestamp: new Date().toISOString(),
      method,
    };
    db.activities.unshift(activity);
    saveDb(db);

    res.json({
      message: `Collected ${qtyRequested} ${item.unit} of ${item.name}. Enjoy and share kindly!`,
      item,
      activity,
    });
  });

  app.get('/api/recipes', async (req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);

    const dietaryFilter = sanitizeText(req.query.dietary, 40);
    const searchQuery = sanitizeText(req.query.q, 60);
    const ingredientQuery = sanitizeText(req.query.ingredient, 40);
    const ingredientsListRaw = sanitizeText(req.query.ingredients, 240);
    const categoryQuery = sanitizeText(req.query.category, 40);
    const availableItems = db.items.filter((i) => i.status === 'available' && i.remainingQty > 0);

    const selectedNames = ingredientsListRaw
      ? ingredientsListRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const matchingScopeItems =
      selectedNames.length > 0
        ? availableItems.filter((item) =>
            selectedNames.some(
              (sel) =>
                item.id.toLowerCase() === sel.toLowerCase() ||
                item.name.toLowerCase().includes(sel.toLowerCase()) ||
                sel.toLowerCase().includes(item.name.toLowerCase())
            )
          )
        : availableItems;

    const mealIds = new Set<string>();
    const mealHitCounts = new Map<string, number>();
    const rawMeals: MealDbRawMeal[] = [];
    let queriedIngredients: string[] = [];

    if (searchQuery) {
      const searchRes = await fetchMealDbJson<{ meals: MealDbRawMeal[] | null }>(
        `/search.php?s=${encodeURIComponent(searchQuery)}`
      );
      for (const m of searchRes?.meals || []) {
        if (!mealIds.has(m.idMeal)) {
          mealIds.add(m.idMeal);
          rawMeals.push(m);
        }
      }
    } else if (categoryQuery) {
      const catRes = await fetchMealDbJson<{ meals: Array<{ idMeal: string }> | null }>(
        `/filter.php?c=${encodeURIComponent(categoryQuery)}`
      );
      for (const item of (catRes?.meals || []).slice(0, 6)) {
        mealIds.add(item.idMeal);
      }
      const lookups = await Promise.all(
        Array.from(mealIds).map((id) =>
          fetchMealDbJson<{ meals: MealDbRawMeal[] | null }>(
            `/lookup.php?i=${encodeURIComponent(id)}`
          )
        )
      );
      for (const resLookup of lookups) {
        const meal = resLookup?.meals?.[0];
        if (meal) rawMeals.push(meal);
      }
    } else {
      queriedIngredients = ingredientQuery
        ? [ingredientQuery.toLowerCase()]
        : extractFridgeKeywords(matchingScopeItems.length > 0 ? matchingScopeItems : availableItems);

      const filterResponses = await Promise.all(
        queriedIngredients.map((kw) =>
          fetchMealDbJson<{ meals: Array<{ idMeal: string }> | null }>(
            `/filter.php?i=${encodeURIComponent(kw)}`
          )
        )
      );

      for (const resp of filterResponses) {
        for (const item of (resp?.meals || []).slice(0, 6)) {
          mealHitCounts.set(item.idMeal, (mealHitCounts.get(item.idMeal) || 0) + 1);
        }
      }

      // Prioritise meals matching multiple checked ingredients
      const rankedIds = Array.from(mealHitCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => id);

      for (const id of rankedIds) mealIds.add(id);

      const lookups = await Promise.all(
        Array.from(mealIds).map((id) =>
          fetchMealDbJson<{ meals: MealDbRawMeal[] | null }>(
            `/lookup.php?i=${encodeURIComponent(id)}`
          )
        )
      );
      for (const resLookup of lookups) {
        const meal = resLookup?.meals?.[0];
        if (meal) rawMeals.push(meal);
      }
    }

    const scopeForScoring = matchingScopeItems.length > 0 ? matchingScopeItems : availableItems;

    const mealDbRecipes = rawMeals
      .filter(isMealHalalFriendly)
      .slice(0, 8)
      .map((meal) => mapMealDbToRecipe(meal, scopeForScoring));

    const localRecipes = db.recipes.map((recipe) => {
      const { matchedAvailable, matchedExpiringSoon, matchScore } = matchFridgeItemsForIngredients(
        recipe.ingredients,
        scopeForScoring
      );
      return {
        ...recipe,
        matchedAvailable,
        matchedExpiringSoon,
        matchScore,
        source: 'Local Pantry' as const,
      };
    });

    const usingLiveMealDb = mealDbRecipes.length > 0;
    const combined = usingLiveMealDb
      ? searchQuery || ingredientQuery || categoryQuery || selectedNames.length > 0
        ? mealDbRecipes
        : [...mealDbRecipes, ...localRecipes.slice(0, 2)]
      : selectedNames.length > 0
        ? localRecipes.filter((r) => (r.matchedAvailable?.length || 0) > 0)
        : localRecipes;

    const filtered =
      dietaryFilter && dietaryFilter !== 'All'
        ? combined.filter((r) => r.dietaryTags.includes(dietaryFilter))
        : combined;

    filtered.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

    res.json({
      recipes: filtered,
      source: usingLiveMealDb ? 'themealdb' : 'local-fallback',
      configured: Boolean(resolveMealDbConfig().apiKey),
      queriedIngredients,
    });
  });

  app.get('/api/stats', (_req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);

    const available = db.items.filter((i) => i.status === 'available' && i.remainingQty > 0);
    const expiringSoon = available.filter((i) => daysUntilExpiry(i.expiryDate) <= 2);

    const liveDonatedKg = db.items.reduce(
      (acc, i) => acc + i.quantity * i.estimatedKgPerUnit,
      0
    );
    const liveCollectedKg = db.items.reduce(
      (acc, i) => acc + (i.quantity - i.remainingQty) * i.estimatedKgPerUnit,
      0
    );

    const baseHistoricalDonatedKg = 142.5;
    const baseHistoricalCollectedKg = 136.0;
    const totalDonatedKg = Number((baseHistoricalDonatedKg + liveDonatedKg).toFixed(1));
    const totalCollectedKg = Number((baseHistoricalCollectedKg + liveCollectedKg).toFixed(1));
    const wastePreventedKg = Number((totalCollectedKg * 0.92).toFixed(1));
    const mealsSupported = Math.round(totalCollectedKg * 2.4);

    const contributorMap = new Map<string, { name: string; block: string; donationsCount: number; kgShared: number }>();
    for (const item of db.items) {
      const key = `${item.donorName}|${item.donorBlock}`;
      const existing = contributorMap.get(key) || {
        name: item.donorName,
        block: item.donorBlock,
        donationsCount: 0,
        kgShared: 0,
      };
      existing.donationsCount += 1;
      existing.kgShared = Number((existing.kgShared + item.quantity * item.estimatedKgPerUnit).toFixed(1));
      contributorMap.set(key, existing);
    }

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.kgShared - a.kgShared)
      .slice(0, 4);

    const latestLog = db.fridgeLogs[0];

    const stats: CommunityStats = {
      availableItemsCount: available.length,
      expiringSoonCount: expiringSoon.length,
      totalDonatedKg,
      totalCollectedKg,
      wastePreventedKg,
      mealsSupported,
      activeContributorsCount: contributorMap.size + 28,
      latestTempC: latestLog ? latestLog.temperatureC : 3.4,
      lastCleanedAt: latestLog ? latestLog.recordedAt : new Date().toISOString(),
      monthlyTrend: [
        { month: 'Jul', donatedKg: 28.4, collectedKg: 26.8 },
        { month: 'Aug', donatedKg: 34.0, collectedKg: 32.5 },
        { month: 'Sep', donatedKg: 39.2, collectedKg: 37.9 },
        { month: 'Oct', donatedKg: 41.9, collectedKg: 39.8 },
        { month: 'Nov', donatedKg: Number((liveDonatedKg + 14).toFixed(1)), collectedKg: Number((liveCollectedKg + 12.5).toFixed(1)) },
      ],
      topContributors,
      smsDigestText: buildSmsDigest(db.items),
    };

    res.json({
      stats,
      announcements: db.announcements,
      recentActivities: db.activities.slice(0, 12),
    });
  });

  app.post('/api/sms-subscribe', (req: Request, res: Response) => {
    const db = loadDb();
    const name = sanitizeText(req.body?.name, 50);
    const phoneDigits = String(req.body?.phone || '').replace(/\D/g, '');
    const block = sanitizeText(req.body?.block, 20) || 'HDB Estate';
    const langRaw = sanitizeText(req.body?.preferredLang, 5);
    const preferredLang: LanguageCode =
      langRaw === 'zh' || langRaw === 'ms' || langRaw === 'ta' ? langRaw : 'en';

    if (!name || phoneDigits.length < 8) {
      res.status(400).json({ error: 'Please provide a name and valid 8-digit Singapore mobile number.' });
      return;
    }

    const subscriber: SmsSubscriber = {
      id: `SMS-${Date.now()}`,
      name,
      phoneLast4: phoneDigits.slice(-4),
      block,
      preferredLang,
      subscribedAt: new Date().toISOString(),
    };

    db.smsSubscribers.unshift(subscriber);
    saveDb(db);

    res.status(201).json({
      message: `SMS daily digest enabled for ${name} (ending in ${subscriber.phoneLast4}).`,
      subscriber,
      sampleSms: buildSmsDigest(db.items),
    });
  });

  // Protected Community Volunteer / Admin Routes
  app.get('/api/admin/overview', requireAdminPin, (_req: Request, res: Response) => {
    const db = loadDb();
    syncExpiredItems(db);
    res.json({
      items: db.items,
      fridgeLogs: db.fridgeLogs,
      activities: db.activities.slice(0, 30),
      smsSubscribersCount: db.smsSubscribers.length,
    });
  });

  app.post('/api/admin/fridge-log', requireAdminPin, (req: Request, res: Response) => {
    const db = loadDb();
    const temperatureC = Number(req.body?.temperatureC);
    const cleanedBy = sanitizeText(req.body?.cleanedBy, 50);
    const sanitisedChecklist = Boolean(req.body?.sanitisedChecklist);
    const notes = sanitizeText(req.body?.notes, 200);

    if (!Number.isFinite(temperatureC) || temperatureC < -5 || temperatureC > 20) {
      res.status(400).json({ error: 'Please enter a valid fridge temperature in °C (-5 to 20).' });
      return;
    }
    if (!cleanedBy) {
      res.status(400).json({ error: 'Please enter volunteer name.' });
      return;
    }

    const log: FridgeLog = {
      id: `LOG-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      temperatureC: Number(temperatureC.toFixed(1)),
      cleanedBy,
      sanitisedChecklist,
      notes: notes || 'Routine temperature & cleanliness check completed.',
    };

    db.fridgeLogs.unshift(log);
    saveDb(db);
    res.status(201).json({ log });
  });

  app.patch('/api/admin/items/:id', requireAdminPin, (req: Request, res: Response) => {
    const db = loadDb();
    const item = db.items.find((i) => i.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Food listing not found.' });
      return;
    }

    const action = sanitizeText(req.body?.action, 30);
    const volunteerName = sanitizeText(req.body?.volunteerName, 40) || 'Community Volunteer';

    if (action === 'mark_removed') {
      item.status = 'removed';
      item.remainingQty = 0;
      item.inspectedBy = `Removed by ${volunteerName}`;
      db.activities.unshift({
        id: `ACT-${Date.now()}`,
        type: 'admin_removal',
        itemId: item.id,
        itemName: item.name,
        quantityText: 'Safety removal',
        residentName: volunteerName,
        block: 'Volunteer Team',
        timestamp: new Date().toISOString(),
        method: 'Volunteer Inspection',
      });
    } else if (action === 'mark_inspected') {
      item.inspectedBy = `Verified by ${volunteerName}`;
      if (item.status === 'reserved') item.status = 'available';
    } else if (action === 'update_expiry' && /^\d{4}-\d{2}-\d{2}$/.test(String(req.body?.expiryDate || ''))) {
      item.expiryDate = String(req.body.expiryDate);
      item.inspectedBy = `Updated by ${volunteerName}`;
      if (daysUntilExpiry(item.expiryDate) >= 0 && item.remainingQty > 0 && item.status === 'expired') {
        item.status = 'available';
      }
    } else {
      res.status(400).json({ error: 'Invalid admin update action.' });
      return;
    }

    saveDb(db);
    res.json({ item });
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kampung Pantry server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Kampung Pantry server:', err);
  process.exit(1);
});
