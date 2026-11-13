import type { ServerlessRequest, ServerlessResponse } from './health';

interface RequestWithBody extends ServerlessRequest {
  body?: Record<string, unknown>;
}

export default function handler(req: RequestWithBody, res: ServerlessResponse): void {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
  const category = typeof body.category === 'string' ? body.category.trim() : 'Vegetables';
  const quantity = Number(body.quantity || 1);
  const unit = typeof body.unit === 'string' && body.unit.trim() ? body.unit.trim() : 'packs';
  const expiryDate =
    typeof body.expiryDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.expiryDate)
      ? body.expiryDate
      : new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  if (!name || name.length < 2) {
    res.status(400).json({ error: 'Please enter a valid food name.' });
    return;
  }

  const id = `KP-2026-${String(Math.floor(1000 + Math.random() * 8999))}`;
  const item = {
    id,
    name,
    category,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    remainingQty: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    unit,
    estimatedKgPerUnit: 0.4,
    dateDonated: new Date().toISOString().slice(0, 10),
    expiryDate,
    storageZone:
      typeof body.storageZone === 'string' ? body.storageZone : 'Chiller Fridge (2°C–4°C)',
    storageInstructions:
      typeof body.storageInstructions === 'string' && body.storageInstructions.trim()
        ? body.storageInstructions.trim()
        : 'Label with Donation ID and place neatly in fridge.',
    allergens:
      typeof body.allergens === 'string' && body.allergens.trim()
        ? body.allergens.trim()
        : 'None declared',
    halalFriendly: true,
    donorName:
      typeof body.donorName === 'string' && body.donorName.trim()
        ? body.donorName.trim()
        : 'Kind Neighbour',
    donorBlock:
      typeof body.donorBlock === 'string' && body.donorBlock.trim()
        ? body.donorBlock.trim()
        : 'HDB Estate',
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : '',
    status: 'available',
    qrPayload: `KAMPUNG-PANTRY:${id}`,
    inspectedBy: 'Self-registered (demo mode)',
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({ item, pointsEarned: 15 });
}
