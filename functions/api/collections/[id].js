// PUT /api/collections/:id — update a collection entry
// DELETE /api/collections/:id — delete a collection entry

export async function onRequest(context) {
  const { request, env } = context;

  // Parse :id from the URL path
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!id || isNaN(Number(id))) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const { title, creator, cover_url, rating, review, status } = body;

      const existing = await env.DB.prepare('SELECT id FROM collections WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare(
        `UPDATE collections SET
          title = COALESCE(?, title),
          creator = COALESCE(?, creator),
          cover_url = COALESCE(?, cover_url),
          rating = COALESCE(?, rating),
          review = COALESCE(?, review),
          status = COALESCE(?, status),
          updated_at = datetime('now')
        WHERE id = ?`
      ).bind(
        title || null,
        creator !== undefined ? creator : null,
        cover_url !== undefined ? cover_url : null,
        rating !== undefined ? rating : null,
        review !== undefined ? review : null,
        status || null,
        Number(id)
      ).run();

      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      const existing = await env.DB.prepare('SELECT id FROM collections WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare('DELETE FROM collections WHERE id = ?').bind(Number(id)).run();
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
