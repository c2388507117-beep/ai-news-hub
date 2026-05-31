// GET /api/collections — list collections (optional ?type= filter)
// POST /api/collections — create new collection entry

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const type = url.searchParams.get('type');
      let sql = 'SELECT * FROM collections';
      const params = [];

      if (type && ['book', 'music', 'movie', 'tv'].includes(type)) {
        sql += ' WHERE type = ?';
        params.push(type);
      }

      sql += ' ORDER BY created_at DESC';

      const { results } = await env.DB.prepare(sql).bind(...params).all();
      return Response.json(results);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { type, title, creator, cover_url, rating, review, status } = body;

      if (!type || !title) {
        return Response.json({ error: 'Missing required fields: type, title' }, { status: 400 });
      }

      if (!['book', 'music', 'movie', 'tv'].includes(type)) {
        return Response.json({ error: 'Invalid type' }, { status: 400 });
      }

      const result = await env.DB.prepare(
        'INSERT INTO collections (type, title, creator, cover_url, rating, review, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        type,
        title,
        creator || '',
        cover_url || '',
        rating || null,
        review || '',
        status || 'done'
      ).run();

      return Response.json({ id: result.meta.last_row_id }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
