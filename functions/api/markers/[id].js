// PUT /api/markers/:id — update marker
// DELETE /api/markers/:id — delete marker

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
      const { name, lat, lng, description, category } = body;

      const existing = await env.DB.prepare('SELECT id FROM map_markers WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare(
        `UPDATE map_markers SET
          name = COALESCE(?, name),
          lat = COALESCE(?, lat),
          lng = COALESCE(?, lng),
          description = COALESCE(?, description),
          category = COALESCE(?, category)
        WHERE id = ?`
      ).bind(name || null, lat ?? null, lng ?? null, description !== undefined ? description : null, category || null, Number(id)).run();

      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      const existing = await env.DB.prepare('SELECT id FROM map_markers WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare('DELETE FROM map_markers WHERE id = ?').bind(Number(id)).run();
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
