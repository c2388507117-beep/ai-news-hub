// PUT /api/visit-logs/:id — update visit log (check-in / edit note)

export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id || isNaN(Number(id))) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const { visited, visited_at, note } = body;

      const existing = await env.DB.prepare('SELECT id FROM visit_logs WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        // If no log exists and we're toggling visited, create one
        if (body.attraction_id) {
          const result = await env.DB.prepare(
            'INSERT INTO visit_logs (attraction_id, visited, visited_at, note) VALUES (?, ?, ?, ?)'
          ).bind(body.attraction_id, visited ?? 1, visited_at || null, note || '').run();
          return Response.json({ id: result.meta.last_row_id, created: true }, { status: 201 });
        }
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare(
        'UPDATE visit_logs SET visited = COALESCE(?, visited), visited_at = COALESCE(?, visited_at), note = COALESCE(?, note) WHERE id = ?'
      ).bind(visited !== undefined ? (visited ? 1 : 0) : null, visited_at || null, note !== undefined ? note : null, Number(id)).run();

      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
