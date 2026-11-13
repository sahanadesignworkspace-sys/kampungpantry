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
  const rawCode = typeof body.codeOrId === 'string' ? body.codeOrId.trim() : '';
  const cleanedId = rawCode.replace(/^KAMPUNG-PANTRY:/i, '').toUpperCase();
  const quantity = Number(body.quantity ?? 1);

  if (!cleanedId) {
    res.status(400).json({ error: 'Please scan a QR code or enter an Item ID.' });
    return;
  }

  res.status(200).json({
    message: `Collected ${Number.isFinite(quantity) && quantity > 0 ? quantity : 1} unit(s) for ${cleanedId}. Enjoy and share kindly!`,
    itemId: cleanedId,
  });
}
