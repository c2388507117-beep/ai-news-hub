// GET /api/duty — list duty entries (optional ?month=2026-05)
// POST /api/duty — create duty entry

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const month = url.searchParams.get('month');
      let sql = 'SELECT * FROM duty_roster';
      const params = [];

      if (month && /^\d{4}-\d{2}$/.test(month)) {
        sql += ' WHERE date LIKE ?';
        params.push(month + '%');
      }

      sql += ' ORDER BY date ASC';

      const { results } = await env.DB.prepare(sql).bind(...params).all();
      return Response.json(results);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { date, person, note } = body;

      if (!date || !person) {
        return Response.json({ error: 'Missing required fields: date, person' }, { status: 400 });
      }

      const result = await env.DB.prepare(
        'INSERT INTO duty_roster (date, person, note) VALUES (?, ?, ?)'
      ).bind(date, person, note || '').run();

      return Response.json({ id: result.meta.last_row_id }, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
