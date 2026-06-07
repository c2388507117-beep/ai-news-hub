// GET /api/stock?symbols=000001.SS,399001.SZ,^HSI,^N225,^IXIC,^DJI,^GSPC
//   Returns JSON array of { symbol, name, price, change, changePct, currency }
// GET /api/stock?search=Apple
//   Returns JSON search results from Yahoo Finance

const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search';

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

// Chinese stock name → symbol mapping (for queries Yahoo search can't handle)
const CN_STOCK_NAMES = {
  // A股 蓝筹
  '贵州茅台': '600519.SS', '茅台': '600519.SS',
  '中国平安': '601318.SS', '平安': '601318.SS',
  '工商银行': '601398.SS', '工行': '601398.SS',
  '建设银行': '601939.SS', '建行': '601939.SS',
  '招商银行': '600036.SS', '招行': '600036.SS',
  '农业银行': '601288.SS', '农行': '601288.SS',
  '中国银行': '601988.SS', '中行': '601988.SS',
  '中国人寿': '601628.SS', '人寿': '601628.SS',
  '中国石油': '601857.SS', '中石油': '601857.SS',
  '中国石化': '600028.SS', '中石化': '600028.SS',
  '中国移动': '600941.SS', '移动': '600941.SS',
  '中国海油': '600938.SS', '海油': '600938.SS',
  '宁德时代': '300750.SZ', '宁德': '300750.SZ',
  '比亚迪': '002594.SZ',
  '美的集团': '000333.SZ', '美的': '000333.SZ',
  '五粮液': '000858.SZ',
  '格力电器': '000651.SZ', '格力': '000651.SZ',
  '立讯精密': '002475.SZ',
  '迈瑞医疗': '300760.SZ', '迈瑞': '300760.SZ',
  '恒瑞医药': '600276.SS', '恒瑞': '600276.SS',
  '伊利股份': '600887.SS', '伊利': '600887.SS',
  '中信证券': '600030.SS', '中信': '600030.SS',
  '海康威视': '002415.SZ', '海康': '002415.SZ',
  '万华化学': '600309.SS',
  '药明康德': '603259.SS', '药明': '603259.SS',
  '海尔智家': '600690.SS', '海尔': '600690.SS',
  '三一重工': '600031.SS', '三一': '600031.SS',
  '泸州老窖': '000568.SZ',
  '山西汾酒': '600809.SS', '汾酒': '600809.SS',
  '洋河股份': '002304.SZ', '洋河': '002304.SZ',
  '片仔癀': '600436.SS',
  '金山办公': '688111.SS', '金山': '688111.SS',
  '中芯国际': '688981.SS', '中芯': '688981.SS',
  '紫金矿业': '601899.SS', '紫金': '601899.SS',
  '长城汽车': '601633.SS', '长城': '601633.SS',
  '上汽集团': '600104.SS', '上汽': '600104.SS',
  '中信建投': '601066.SS',
  // 深圳
  '东方财富': '300059.SZ', '东财': '300059.SZ',
  '牧原股份': '002714.SZ', '牧原': '002714.SZ',
  '温氏股份': '300498.SZ', '温氏': '300498.SZ',
  '阳光电源': '300274.SZ', '阳光': '300274.SZ',
  '亿纬锂能': '300014.SZ', '亿纬': '300014.SZ',
  // 港股
  '腾讯控股': '0700.HK', '腾讯': '0700.HK',
  '美团': '3690.HK', '美团点评': '3690.HK',
  '小米集团': '1810.HK', '小米': '1810.HK',
  '香港交易所': '0388.HK', '港交所': '0388.HK',
  '汇丰控股': '0005.HK', '汇丰': '0005.HK',
  '友邦保险': '1299.HK', '友邦': '1299.HK',
  '比亚迪股份': '1211.HK',
  '联想集团': '0992.HK', '联想': '0992.HK',
  '京东': 'JD',
  '拼多多': 'PDD',
  '网易': 'NTES',
  '百度': 'BIDU',
  '中概互联': 'KWEB',
  // 美股
  '特斯拉': 'TSLA',
  '苹果': 'AAPL',
  '微软': 'MSFT',
  '谷歌': 'GOOGL',
  '亚马逊': 'AMZN',
  '英伟达': 'NVDA',
  'Meta': 'META',
  '台积电': 'TSM',
  '英特尔': 'INTC',
  '可口可乐': 'KO',
  '伯克希尔': 'BRK.B',
  '奈飞': 'NFLX', 'Netflix': 'NFLX',
  'AMD': 'AMD',
  '高通': 'QCOM',
  '博通': 'AVGO',
  '超微电脑': 'SMCI',
  '戴尔': 'DELL',
  '优步': 'UBER', 'Uber': 'UBER',
  'Salesforce': 'CRM',
  'Adobe': 'ADBE',
  '迪士尼': 'DIS',
  '耐克': 'NKE',
  'Costco': 'COST',
  '沃尔玛': 'WMT',
  '强生': 'JNJ',
  '辉瑞': 'PFE',
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache in D1

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(request.url);

    // --- Search mode ---
    const searchQuery = url.searchParams.get('search');
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.trim();
      const queryLower = query.toLowerCase();

      // 1) Search local Chinese name mapping
      const seen = new Set();
      const localResults = [];

      for (const [name, symbol] of Object.entries(CN_STOCK_NAMES)) {
        if (name.includes(query) || query.includes(name) || symbol.toLowerCase().includes(queryLower)) {
          if (!seen.has(symbol)) {
            seen.add(symbol);
            localResults.push({
              symbol,
              name: SYMBOL_NAMES[symbol] || name,
              exchange: symbol.endsWith('.SS') ? 'SSH' : symbol.endsWith('.SZ') ? 'SHE' : symbol.endsWith('.HK') ? 'HKG' : '',
              quoteType: symbol.endsWith('.SS') || symbol.endsWith('.SZ') ? 'EQUITY' : 'EQUITY',
            });
          }
        }
      }

      // 2) Try Yahoo search as well (without region params that trigger China block)
      try {
        const yahooUrl = `${YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}&lang=zh-CN&quotesCount=8`;
        const res = await fetch(yahooUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CloudflarePages/1.0)',
            'Accept': 'application/json',
          },
        });
        if (res.ok) {
          const text = await res.text();
          // Yahoo returns HTML when blocked — only parse JSON
          if (text.trim().startsWith('{')) {
            const json = JSON.parse(text);
            if (json.quotes) {
              for (const q of json.quotes) {
                if (!seen.has(q.symbol)) {
                  seen.add(q.symbol);
                  localResults.push({
                    symbol: q.symbol,
                    name: q.shortname || q.longname || q.symbol,
                    exchange: q.exchange || '',
                    quoteType: q.quoteType || '',
                  });
                }
              }
            }
          }
        }
      } catch (_) { /* Yahoo search is best-effort */ }

      // Limit to top 8
      const quotes = localResults.slice(0, 8);

      return Response.json({ quotes });
    }

    // --- Quote mode ---
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
