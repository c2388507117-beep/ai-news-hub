// GET /api/map-data — combined endpoint: attractions + visitLogs + markers + cities
// One request replaces three, reducing latency significantly

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const [attractionsRes, logsRes, markersRes, citiesRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM attractions ORDER BY country, city, id').all(),
      env.DB.prepare(
        `SELECT vl.*, a.name as attraction_name, a.city, a.category
         FROM visit_logs vl
         LEFT JOIN attractions a ON vl.attraction_id = a.id
         ORDER BY vl.visited_at DESC`
      ).all(),
      env.DB.prepare('SELECT * FROM map_markers ORDER BY created_at DESC').all(),
      env.DB.prepare('SELECT city, country, COUNT(*) as count FROM attractions GROUP BY city, country ORDER BY country, city').all(),
    ]);

    return Response.json({
      attractions: attractionsRes.results,
      visitLogs: logsRes.results,
      markers: markersRes.results,
      cities: citiesRes.results,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
