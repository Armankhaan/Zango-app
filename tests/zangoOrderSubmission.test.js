import test from 'node:test';
import assert from 'node:assert/strict';
import { pendingZangoKey } from '../src/utils/zangoOrderSubmission.js';
test('failed submission reuses its UUID; edited and completed orders get fresh keys', async () => {
  const items = new Map();
  const storage = { getItem: key => items.get(key), setItem: (key, value) => items.set(key, value), removeItem: key => items.delete(key) };
  const payload = { branch_id: 10, order_info: { source: 'zango-site', customerInfo: { phone: '03000000000' } } };
  const first = await pendingZangoKey(storage, payload);
  assert.match(first, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.equal(await pendingZangoKey(storage, payload), first);
  assert.equal(JSON.stringify([...items.values()]).includes('03000000000'), false);
  assert.notEqual(await pendingZangoKey(storage, { ...payload, branch_id: 11 }), first);
  storage.removeItem('zango_pending_order');
  assert.notEqual(await pendingZangoKey(storage, payload), first);
});
