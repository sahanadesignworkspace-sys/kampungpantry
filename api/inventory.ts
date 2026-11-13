import type { ServerlessRequest, ServerlessResponse } from './health';

function isoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function isoTimeOffsetHours(hoursOffset: number): string {
  return new Date(Date.now() + hoursOffset * 3600 * 1000).toISOString();
}

function getQueryString(query: Record<string, unknown> | undefined, key: string): string {
  const val = query?.[key];
  if (Array.isArray(val)) return typeof val[0] === 'string' ? val[0].trim() : '';
  return typeof val === 'string' ? val.trim() : '';
}

function daysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  return Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getSeedInventory() {
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

export default function handler(req: ServerlessRequest, res: ServerlessResponse): void {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const category = getQueryString(req.query, 'category');
  const search = getQueryString(req.query, 'search').toLowerCase();
  const expiringSoon = getQueryString(req.query, 'expiringSoon') === 'true';

  let results = getSeedInventory();
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

  results.sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate));
  res.status(200).json({ items: results, source: 'mock-serverless' });
}
