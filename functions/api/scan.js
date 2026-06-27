export async function onRequest(context) {
  const { request, env } = context;

  // no-store everywhere so the desktop never polls a cached scan record
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      // Stamp ts on the server so every record shares ONE clock (the edge),
      // independent of the scanning device's possibly-skewed local clock.
      const record = JSON.stringify({ ...body, ts: Date.now() });
      await env.SCAN_KV.put('latest', record, { expirationTtl: 3600 });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'bad request' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  }

  // GET — return latest scan event
  const val = await env.SCAN_KV.get('latest').catch(() => null);
  return new Response(val ?? 'null', {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
