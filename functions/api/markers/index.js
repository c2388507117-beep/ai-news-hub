// GET /api/markers — list all custom map markers
// POST /api/markers — create new marker

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare('SELECT * FROM map_markers ORDER BY created_at DESC').all();
      return Response.json(results);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { name, lat, lng, description, category } = body;

      if (!name || lat == null || lng == null) {
        return Response.json({ error: 'Missing required fields: name, lat, lng' }, { status: 400 });
      }

      const result = await env.DB.prepare(
        'INSERT INTO map_markers (name, lat, lng, description, category) VALUES (?, ?, ?, ?, ?)'
      ).bind(name, lat, lng, description || '', category || 'default').run();

      return Response.json({ id: result.meta.last_row_id }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
