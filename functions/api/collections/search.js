// POST /api/collections/search
// Proxy Douban suggest API to fetch cover candidates
// Avoids CORS by making request server-side

const DOUBAN_API = {
  book: 'https://book.douban.com/j/subject_suggest',
  music: 'https://music.douban.com/j/subject_suggest',
  movie: 'https://movie.douban.com/j/subject_suggest',
  tv: 'https://movie.douban.com/j/subject_suggest',
};

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { type, q } = body;

    if (!type || !q) {
      return Response.json({ error: 'Missing required fields: type, q' }, { status: 400 });
    }

    const apiUrl = DOUBAN_API[type];
    if (!apiUrl) {
      return Response.json({ error: `Unsupported type: ${type}` }, { status: 400 });
    }

    const url = `${apiUrl}?q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.douban.com/',
      },
    });

    if (!resp.ok) {
      return Response.json({ error: `Douban API returned ${resp.status}` }, { status: 502 });
    }

    const data = await resp.json();

    // Normalize response to consistent format
    const results = (data || []).map((item) => ({
      title: item.title || '',
      cover_url: item.img || item.cover_url || '',
      creator: item.author || item.creator || item.artist || '',
      douban_id: item.id || '',
      year: item.year || '',
      sub_title: item.sub_title || '',
    }));

    return Response.json({ results });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
