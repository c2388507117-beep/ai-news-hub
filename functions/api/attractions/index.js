// GET /api/attractions — list attractions (optional ?city= filter)

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');
    let sql = 'SELECT * FROM attractions';
    const params = [];

    if (city) {
      sql += ' WHERE city = ?';
      params.push(city);
    }

    sql += ' ORDER BY city, id';

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
