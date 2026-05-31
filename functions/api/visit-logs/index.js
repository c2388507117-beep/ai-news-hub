// GET /api/visit-logs — list all visit logs (optionally joined with attractions)
// POST /api/visit-logs — create a visit log entry

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const { results } = await env.DB.prepare(
        `SELECT vl.*, a.name as attraction_name, a.city, a.category
         FROM visit_logs vl
         LEFT JOIN attractions a ON vl.attraction_id = a.id
         ORDER BY vl.visited_at DESC`
      ).all();
      return Response.json(results);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { attraction_id, visited, visited_at, note } = body;

      if (!attraction_id) {
        return Response.json({ error: 'Missing required field: attraction_id' }, { status: 400 });
      }

      const result = await env.DB.prepare(
        'INSERT INTO visit_logs (attraction_id, visited, visited_at, note) VALUES (?, ?, ?, ?)'
      ).bind(attraction_id, visited ?? 1, visited_at || null, note || '').run();

      return Response.json({ id: result.meta.last_row_id }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
