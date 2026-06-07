// GET /api/stock/search?q=term
// Proxies Yahoo Finance search — returns matching stocks by name or symbol

const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    if (!q || q.trim().length === 0) {
      return Response.json({ quotes: [] });
    }

    const res = await fetch(
      `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(q.trim())}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CloudflarePages/1.0)',
          'Accept': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return Response.json({ quotes: [], error: `Yahoo search returned ${res.status}` });
    }

    const json = await res.json();
    const quotes = (json.quotes || []).slice(0, 8).map((q) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      exchange: q.exchange || '',
      quoteType: q.quoteType || '',
      typeDisp: q.typeDisp || '',
    }));

    return Response.json({ quotes });
  } catch (err) {
    return Response.json({ quotes: [], error: err.message });
  }
}
