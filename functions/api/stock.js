// GET /api/stock?symbols=000001.SS,399001.SZ,^HSI,^N225,^IXIC,^DJI,^GSPC
// Server-side proxy for Yahoo Finance — no CORS issues
// Returns JSON array of { symbol, name, price, change, changePct, currency }

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// Symbol display names
const SYMBOL_NAMES = {
  '000001.SS': '上证指数',
  '399001.SZ': '深证成指',
  '^HSI': '恒生指数',
  '^N225': '日经225',
  '^IXIC': '纳斯达克',
  '^DJI': '道琼斯',
  '^GSPC': '标普500',
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache in D1

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const symbolsParam = url.searchParams.get('symbols');
    if (!symbolsParam) {
      return Response.json({ error: 'Missing symbols param' }, { status: 400 });
    }

    const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

    // Ensure cache table exists
    if (env.DB) {
      try {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS stock_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbols TEXT NOT NULL,
            data TEXT NOT NULL,
            fetched_at TEXT DEFAULT (datetime('now'))
          )`
        ).run();
      } catch (_) { /* table creation is optional */ }
    }

    // Try cache first
    if (env.DB) {
      try {
        const cached = await env.DB.prepare(
          'SELECT data, fetched_at FROM stock_cache WHERE symbols = ? ORDER BY fetched_at DESC LIMIT 1'
        ).bind(symbolsParam).first();
        if (cached) {
          const age = Date.now() - new Date(cached.fetched_at + 'Z').getTime();
          if (age < CACHE_TTL_MS) {
            return new Response(cached.data, {
              headers: { 'Content-Type': 'application/json', 'X-Cache': 'hit' },
            });
          }
        }
      } catch (_) { /* cache read is optional */ }
    }

    // Fetch all symbols in parallel
    const results = await Promise.allSettled(symbols.map(symbol => fetchSingle(symbol)));

    const data = results.map((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        return r.value;
      }
      return {
        symbol: symbols[i],
        name: SYMBOL_NAMES[symbols[i]] || symbols[i],
        error: r.reason?.message || 'Fetch failed',
      };
    });

    const jsonStr = JSON.stringify(data);

    // Cache result in D1
    if (env.DB) {
      try {
        await env.DB.prepare(
          'INSERT INTO stock_cache (symbols, data) VALUES (?, ?)'
        ).bind(symbolsParam, jsonStr).run();
      } catch (_) { /* cache write is optional */ }
    }

    return new Response(jsonStr, {
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'miss' },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function fetchSingle(symbol) {
  const encodedSymbol = encodeURIComponent(symbol);
  const url = `${YAHOO_URL}${encodedSymbol}?interval=1d&range=5d`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CloudflarePages/1.0)',
      'Accept': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol}`);

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result?.meta) throw new Error(`No data for ${symbol}`);

  const meta = result.meta;
  const currentPrice = meta.regularMarketPrice;
  const currency = meta.currency || '';

  // Try multiple fallback strategies for previousClose
  let prevClose = meta.previousClose ?? meta.chartPreviousClose ?? null;

  // Fall back to indicators quote close array
  if (prevClose == null) {
    const closes = result?.indicators?.quote?.[0]?.close;
    if (closes && closes.length >= 2) {
      for (let i = closes.length - 1; i >= 0; i--) {
        if (closes[i] != null) {
          if (prevClose == null) {
            prevClose = 0; // sentinel — found current, need previous
          } else {
            prevClose = closes[i];
            break;
          }
        }
      }
      if (prevClose === 0 || prevClose == null) prevClose = null;
    }
  }

  if (currentPrice == null || prevClose == null) {
    throw new Error(`Incomplete data for ${symbol}: price=${currentPrice}, prevClose=${prevClose}`);
  }

  const change = currentPrice - prevClose;
  const changePct = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    name: SYMBOL_NAMES[symbol] || symbol,
    currentPrice,
    change,
    changePct,
    currency,
    marketTime: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null,
  };
}
