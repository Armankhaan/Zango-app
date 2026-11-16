// Persist only a payload fingerprint and UUID, never the customer payload.
export async function pendingZangoKey(storage, payload) {
  const text = JSON.stringify(payload);
  let a = 2166136261, b = 5381;
  for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ text.charCodeAt(i); }
  const signature = `${text.length}-${a >>> 0}-${b >>> 0}`;
  let pending;
  try { pending = JSON.parse(await storage.getItem('zango_pending_order')); } catch {}
  if (pending?.signature === signature && pending?.key) return pending.key;
  const key = globalThis.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.floor(Math.random() * 16); return (c === 'x' ? r : (r & 3) | 8).toString(16); });
  await storage.setItem('zango_pending_order', JSON.stringify({ signature, key }));
  return key;
}
