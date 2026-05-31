// PUT /api/duty/:id — update duty entry
// DELETE /api/duty/:id — delete duty entry

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
      const { date, person, note } = body;

      const existing = await env.DB.prepare('SELECT id FROM duty_roster WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare(
        'UPDATE duty_roster SET date = COALESCE(?, date), person = COALESCE(?, person), note = COALESCE(?, note) WHERE id = ?'
      ).bind(
        date || null,
        person || null,
        note !== undefined ? note : null,
        Number(id)
      ).run();

      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (request.method === 'DELETE') {
    try {
      const existing = await env.DB.prepare('SELECT id FROM duty_roster WHERE id = ?').bind(Number(id)).first();
      if (!existing) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      await env.DB.prepare('DELETE FROM duty_roster WHERE id = ?').bind(Number(id)).run();
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
