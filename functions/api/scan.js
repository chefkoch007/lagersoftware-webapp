export async function onRequest(context) {
  const { request, env } = context;

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const record = JSON.stringify({ ...body, ts: body.ts ?? Date.now() });
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
