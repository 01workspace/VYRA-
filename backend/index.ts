import { db, json, error, router, requireAuth, requireRole } from '@appdeploy/sdk';

type OrderItem = { name: string; colour: string; size: string };
type OrderRecord = {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: OrderItem[];
  status: 'new' | 'contacted' | 'confirmed' | 'closed';
  createdAt: string;
};

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export const handler = router({
  'POST /api/orders': [async (ctx) => {
    const body = (ctx.body || {}) as Record<string, unknown>;
    const requestId = clean(body.requestId, 80);
    const name = clean(body.name, 80);
    const phone = clean(body.phone, 24);
    const city = clean(body.city, 80);
    const address = clean(body.address, 500);
    const notes = clean(body.notes, 500);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.slice(0, 12).map((value) => {
      const item = (value || {}) as Record<string, unknown>;
      return { name: clean(item.name, 60), colour: clean(item.colour, 40), size: clean(item.size, 8) };
    }).filter(item => item.name && item.colour && ['XS','S','M','L','XL','XXL'].includes(item.size));
    if (!/^[a-zA-Z0-9-]{12,80}$/.test(requestId) || name.length < 2 || phone.length < 7 || !city || !address || items.length === 0) {
      return error('Please provide valid contact and delivery details and at least one look.', 400);
    }
    const order: OrderRecord = { id: requestId, name, phone, city, address, notes, items, status: 'new', createdAt: new Date().toISOString() };
    const [existing] = await db.get<OrderRecord>('orders', [requestId], { consistent: true });
    if (existing) {
      const sameRequest = existing.name === name && existing.phone === phone && existing.city === city && existing.address === address && JSON.stringify(existing.items) === JSON.stringify(items);
      if (!sameRequest) return error('This request reference is already in use.', 409);
      return json({ orderId: requestId, status: existing.status, duplicate: true });
    }
    const [savedId] = await db.tx.add('orders', [order]);
    if (!savedId) return error('Your request is being processed. Please retry in a moment.', 409);
    return json({ orderId: savedId, status: 'new' }, 201);
  }],
  'GET /api/admin/orders': [requireAuth(), requireRole('owner'), async () => {
    const page = await db.list<OrderRecord>('orders', { limit: 100, appdeploy_system_id: true });
    const orders = page.items.map(item => ({
      ...item,
      id: item.__appdeploy_ddb_id
    })).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    return json({ orders, nextToken: page.nextToken || null });
  }],
  'PUT /api/admin/orders/:id': [requireAuth(), requireRole('owner'), async (ctx) => {
    const status = clean((ctx.body as { status?: unknown })?.status, 20);
    if (!['new','contacted','confirmed','closed'].includes(status)) return error('Invalid order status.', 400);
    const [updated] = await db.tx.update('orders', [{ id: ctx.params.id, record: { status } }], { patch: true });
    if (!updated) return error('Order not found.', 404);
    return json({ ok: true });
  }]
});
