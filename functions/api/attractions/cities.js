// GET /api/attractions/cities — list distinct cities with attractions

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT city, COUNT(*) as count FROM attractions GROUP BY city ORDER BY city'
    ).all();
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
