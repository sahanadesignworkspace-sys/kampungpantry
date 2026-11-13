import type {
  ActivityRecord,
  Announcement,
  CommunityStats,
  FoodItem,
  Recipe,
} from '../types/pantry';

function isoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function isoTimeOffsetHours(hoursOffset: number): string {
  return new Date(Date.now() + hoursOffset * 3600 * 1000).toISOString();
}

export function getMockFoodItems(): FoodItem[] {
  return [
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
      id: 'KP-2026-0109',
      name: 'Sweet Carrots & Vine Tomatoes',
      category: 'Vegetables',
      quantity: 3,
      remainingQty: 3,
      unit: 'packs',
      estimatedKgPerUnit: 0.4,
      dateDonated: isoDateOffset(0),
      expiryDate: isoDateOffset(3),
      storageZone: 'Crisper Drawer',
      storageInstructions: 'Keep in crisper drawer. Wash before slicing or simmering.',
      allergens: 'None declared',
      halalFriendly: true,
      donorName: 'Uncle Bala',
      donorBlock: 'Blk 414',
      imageUrl: 'asset:choySum',
      status: 'available',
      qrPayload: 'KAMPUNG-PANTRY:KP-2026-0109',
      inspectedBy: 'Volunteer Siti (09:15)',
      createdAt: isoTimeOffsetHours(-1),
    },
  ];
}

export function getMockRecipes(): Recipe[] {
  return [
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
      matchedAvailable: [
        'Fresh Choy Sum & Bok Choy',
        'Thai Jasmine Rice (Unopened)',
        'Fresh Kampung Eggs (Halal)',
      ],
      matchedExpiringSoon: ['Fresh Choy Sum & Bok Choy'],
      matchScore: 5,
      source: 'Local Pantry',
    },
    {
      id: 'REC-2',
      title: 'Warm Banana & Rolled Oats Porridge',
      description:
        'Naturally sweet, gentle-on-the-stomach breakfast porridge requiring zero added sugar.',
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
      matchedAvailable: ['Ripe Papaya & Cavendish Bananas', 'Red Lentils & Rolled Oats'],
      matchedExpiringSoon: ['Ripe Papaya & Cavendish Bananas'],
      matchScore: 4,
      source: 'Local Pantry',
    },
    {
      id: 'REC-3',
      title: 'Kampung Egg & Wholemeal Toast Soldiers',
      description:
        'Quick protein-rich breakfast or tea-time meal that finishes bread loaves before expiry.',
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
      matchedAvailable: ['Wholemeal Sandwich Loaf', 'Fresh Kampung Eggs (Halal)'],
      matchedExpiringSoon: ['Wholemeal Sandwich Loaf'],
      matchScore: 4,
      source: 'Local Pantry',
    },
    {
      id: 'REC-4',
      title: 'One-Pot Red Lentil, Carrot & Greens Comfort Dal',
      description:
        'Hearty, high-fibre vegetarian stew pairing dried pantry lentils with fresh fridge greens and carrots.',
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
      matchedAvailable: [
        'Red Lentils & Rolled Oats',
        'Fresh Choy Sum & Bok Choy',
        'Sweet Carrots & Vine Tomatoes',
      ],
      matchedExpiringSoon: ['Fresh Choy Sum & Bok Choy'],
      matchScore: 5,
      source: 'Local Pantry',
    },
  ];
}

export function getMockAnnouncements(): Announcement[] {
  return [
    {
      id: 'ANN-1',
      title: "Today's Fresh Finds: Wet Market Greens & Bakery Loaves",
      body: 'Fresh choy sum, bok choy, carrots, tomatoes, ripe papaya, bananas, and 2 loaves of wholemeal bread arrived this morning at Blk 412 Void Deck. Please take only what your household needs today.',
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
}

export function getMockActivities(): ActivityRecord[] {
  return [
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
}

export function getMockStats(items: FoodItem[]): CommunityStats {
  const available = items.filter((i) => i.status === 'available' && i.remainingQty > 0);
  const expiringSoon = available.filter((i) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(i.expiryDate + 'T00:00:00');
    return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) <= 2;
  });

  const topLines = available
    .slice(0, 4)
    .map((i) => `- ${i.name}: ${i.remainingQty} ${i.unit}`)
    .join('\n');

  return {
    availableItemsCount: available.length,
    expiringSoonCount: expiringSoon.length,
    totalDonatedKg: 154.6,
    totalCollectedKg: 141.2,
    wastePreventedKg: 129.9,
    mealsSupported: 339,
    activeContributorsCount: 35,
    latestTempC: 3.2,
    lastCleanedAt: isoTimeOffsetHours(-2),
    monthlyTrend: [
      { month: 'Jul', donatedKg: 28.4, collectedKg: 26.8 },
      { month: 'Aug', donatedKg: 34.0, collectedKg: 32.5 },
      { month: 'Sep', donatedKg: 39.2, collectedKg: 37.9 },
      { month: 'Oct', donatedKg: 41.9, collectedKg: 39.8 },
      { month: 'Nov', donatedKg: 26.1, collectedKg: 24.4 },
    ],
    topContributors: [
      { name: 'Razak & Family', block: 'Blk 415', donationsCount: 3, kgShared: 3.0 },
      { name: 'Mr Tan K.H.', block: 'Blk 408', donationsCount: 2, kgShared: 2.3 },
      { name: 'Mdm Lim', block: 'Blk 406', donationsCount: 2, kgShared: 2.0 },
      { name: 'Auntie Mei Ling', block: 'Blk 412', donationsCount: 2, kgShared: 1.4 },
    ],
    smsDigestText: `[Kampung Pantry Blk 412]\nToday's Free Fridge Items (${available.length} listings):\n${topLines}\nTake what you need. No app required at the fridge.`,
  };
}
