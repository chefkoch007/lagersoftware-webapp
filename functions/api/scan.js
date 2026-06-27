// Shared, persistent scan log stored in Cloudflare KV (binding: SCAN_KV).
// Both the iPad/phone and the desktop read and write the SAME list, so a scan
// shows up on every device and survives reloads. The list only goes away when
// it is explicitly cleared (DELETE) — there is no expiry.
//
//   GET    /api/scan   → full list (newest first), JSON array
//   POST   /api/scan   → append one scan record, returns { ok, list }
//   DELETE /api/scan   → clear the whole list, returns { ok }

const KEY = 'scanlog';
const MAX = 500;

export async function onRequest(context) {
  const { request, env } = context;

  // no-store everywhere so devices never poll a cached copy of the list
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // If the KV namespace isn't bound, fail clearly instead of throwing a 1101.
  // GET still returns a valid empty array so the client poller keeps working.
  if (!env || !env.SCAN_KV) {
    if (request.method === 'GET') {
      return new Response('[]', { headers });
    }
    return new Response(
      JSON.stringify({ ok: false, error: 'KV binding "SCAN_KV" fehlt — im Cloudflare Pages Dashboard unter Settings → Functions → KV namespace bindings (Production) anlegen und neu deployen.' }),
      { status: 503, headers }
    );
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const raw = await env.SCAN_KV.get(KEY);
      const list = raw ? JSON.parse(raw) : [];

      // Preserve the client-generated id/ts so optimistic local entries and the
      // server copy stay the same row. Dedup by id in case a POST is retried.
      const entry = {
        ...body,
        id: body.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
        ts: body.ts || Date.now(),
      };
      if (!list.some(e => e.id === entry.id)) {
        list.unshift(entry); // newest first
      }
      const trimmed = list.slice(0, MAX);
      await env.SCAN_KV.put(KEY, JSON.stringify(trimmed)); // no expirationTtl → persists

      return new Response(JSON.stringify({ ok: true, list: trimmed }), { headers });
    } catch {
      return new Response(JSON.stringify({ error: 'bad request' }), { status: 400, headers });
    }
  }

  if (request.method === 'DELETE') {
    await env.SCAN_KV.delete(KEY).catch(() => {});
    return new Response(JSON.stringify({ ok: true }), { headers });
  }

  // GET — full scan log (empty array if nothing stored yet)
  const raw = await env.SCAN_KV.get(KEY).catch(() => null);
  return new Response(raw ?? '[]', { headers });
}
