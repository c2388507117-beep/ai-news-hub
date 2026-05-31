// POST /api/collections/search
// Multi-source cover image search
// 1) Douban suggest API (best for Chinese content)
// 2) iTunes Search API (fallback — no API key required)

const DOUBAN_API = {
  book: 'https://book.douban.com/j/subject_suggest',
  music: 'https://music.douban.com/j/subject_suggest',
  movie: 'https://movie.douban.com/j/subject_suggest',
  tv: 'https://movie.douban.com/j/subject_suggest',
};

const ITUNES_MEDIA = {
  book: { media: 'ebook', entity: 'ebook' },
  music: { media: 'music', entity: 'album' },
  movie: { media: 'movie', entity: 'movie' },
  tv: { media: 'tvShow', entity: 'tvSeason' },
};

const DOUBAN_IMG_BASE = 'https://img1.doubanio.com';

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

    // --- Try Douban suggest API first ---
    let results = [];
    const doubanUrl = DOUBAN_API[type];
    if (doubanUrl) {
      try {
        const resp = await fetch(`${doubanUrl}?q=${encodeURIComponent(q)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.douban.com/',
          },
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            results = data.map(normalizeDoubanItem);
          }
        }
      } catch (_) { /* Douban failed, fall through */ }
    }

    // --- If Douban returned nothing, try iTunes fallback ---
    if (results.length === 0) {
      const itunesConfig = ITUNES_MEDIA[type];
      if (itunesConfig) {
        try {
          const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=${itunesConfig.media}&entity=${itunesConfig.entity}&limit=5`;
          const resp = await fetch(itunesUrl, {
            headers: { 'Accept': 'application/json' },
          });

          if (resp.ok) {
            const data = await resp.json();
            const items = data?.results || [];
            if (items.length > 0) {
              results = items.map(normalizeItunesItem);
            }
          }
        } catch (_) { /* iTunes failed, return empty */ }
      }
    }

    return Response.json({ results });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function normalizeDoubanItem(item) {
  let coverUrl = item.img || item.cover_url || '';
  // Some Douban cover URLs are relative — prepend base domain
  if (coverUrl && coverUrl.startsWith('/')) {
    coverUrl = DOUBAN_IMG_BASE + coverUrl;
  }

  return {
    title: item.title || '',
    cover_url: coverUrl,
    creator: item.author || item.creator || item.artist || '',
    douban_id: item.id || '',
    year: item.year || '',
    sub_title: item.sub_title || '',
  };
}

function normalizeItunesItem(item) {
  // iTunes artworkUrl100 — bump to 300 for larger image
  let coverUrl = item.artworkUrl100 || '';
  if (coverUrl) {
    coverUrl = coverUrl.replace('100x100bb', '300x300bb');
  }

  // iTunes has trackName/collectionName; prefer collectionName for albums/books
  const title = item.collectionName || item.trackName || item.trackCensoredName || '';
  const creator = item.artistName || '';

  return {
    title,
    cover_url: coverUrl,
    creator,
    douban_id: item.collectionId || item.trackId || '',
    year: item.releaseDate ? item.releaseDate.slice(0, 4) : '',
    sub_title: '',
  };
}
