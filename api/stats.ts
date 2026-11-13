import type { ServerlessRequest, ServerlessResponse } from './health';

function isoDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

function isoTimeOffsetHours(hoursOffset: number): string {
  return new Date(Date.now() + hoursOffset * 3600 * 1000).toISOString();
}

export default function handler(req: ServerlessRequest, res: ServerlessResponse): void {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  const smsDigestText = [
    '[Kampung Pantry Blk 412]',
    "Today's Free Fridge Items (7 listings):",
    '- Fresh Choy Sum & Bok Choy: 3 bunches (Use Tomorrow)',
    '- Wholemeal Sandwich Loaf: 2 loaves (Use Tomorrow)',
    '- Ripe Papaya & Cavendish Bananas: 4 portions',
    '- Sweet Carrots & Vine Tomatoes: 3 packs',
    'Take what you need. No app required at the fridge.',
  ].join('\n');

  res.status(200).json({
    stats: {
      availableItemsCount: 7,
      expiringSoonCount: 3,
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
      smsDigestText,
    },
    announcements: [
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
    ],
    recentActivities: [
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
    ],
  });
}
