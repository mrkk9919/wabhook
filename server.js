import express from 'express';
import crypto from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 3000);
const secret = process.env.GITHUB_WEBHOOK_SECRET;

if (!secret) {
  throw new Error('Set GITHUB_WEBHOOK_SECRET before starting the server.');
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/webhook', express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
  const signature = req.header('x-hub-signature-256') || '';
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(req.body).digest('hex')}`;

  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const event = req.header('x-github-event') || 'unknown';
  const delivery = req.header('x-github-delivery') || 'unknown';
  console.log(JSON.stringify({ receivedAt: new Date().toISOString(), event, delivery, action: payload.action ?? null }));

  return res.status(202).json({ received: true, event, delivery });
});

app.listen(port, () => {
  console.log(`GitHub webhook receiver listening on port ${port}`);
});
