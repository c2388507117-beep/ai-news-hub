#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'steam.json');

const FEATURED_URL = 'https://store.steampowered.com/api/featuredcategories';
const CHARTS_URL = 'https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/';

async function fetchTopSellers() {
  const res = await fetch(FEATURED_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Top sellers HTTP ${res.status}`);
  const data = await res.json();

  const items = data?.top_sellers?.items || [];
  const seen = new Set();
  const results = [];

  for (const item of items) {
    const appid = item.id;
    if (!appid || seen.has(appid)) continue;
    seen.add(appid);

    results.push({
      name: item.name || '',
      appid,
      price: item.original_price ?? 0,
      finalPrice: item.final_price ?? 0,
      discount: item.discount_percent ?? 0,
      imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`,
    });

    if (results.length >= 30) break;
  }

  return results;
}

async function fetchMostPlayed() {
  const res = await fetch(CHARTS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Most played HTTP ${res.status}`);
  const data = await res.json();

  const ranks = data?.response?.ranks || [];
  const topRanks = ranks.slice(0, 30);
  if (topRanks.length === 0) return [];

  const appids = topRanks.map((r) => r.appid);
  const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appids.join(',')}`;

  const detailsRes = await fetch(detailsUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!detailsRes.ok) throw new Error(`App details HTTP ${detailsRes.status}`);
  const detailsData = await detailsRes.json();

  return topRanks.map((r, i) => {
    const detail = detailsData[String(r.appid)];
    const name =
      detail?.success && detail?.data?.name
        ? detail.data.name
        : r.name || `Game #${r.appid}`;

    return {
      rank: i + 1,
      appid: r.appid,
      name,
      concurrentPlayers: r.concurrent_in_game ?? 0,
    };
  });
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fetching Steam data...');

  const existing = readExisting();

  let topSellers;
  let mostPlayed;

  try {
    topSellers = await fetchTopSellers();
    console.log(`  ✓ ${topSellers.length} top sellers`);
  } catch (err) {
    console.error('  ✗ Top sellers fetch failed:', err.message);
    topSellers = existing?.topSellers || [];
    if (topSellers.length > 0) {
      console.log(`  Using ${topSellers.length} cached top sellers.`);
    }
  }

  try {
    mostPlayed = await fetchMostPlayed();
    console.log(`  ✓ ${mostPlayed.length} most played games`);
  } catch (err) {
    console.error('  ✗ Most played fetch failed:', err.message);
    mostPlayed = existing?.mostPlayed || [];
    if (mostPlayed.length > 0) {
      console.log(`  Using ${mostPlayed.length} cached most played games.`);
    }
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    topSellers,
    mostPlayed,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone: ${topSellers.length} top sellers, ${mostPlayed.length} most played`);
}

main().catch(console.error);
