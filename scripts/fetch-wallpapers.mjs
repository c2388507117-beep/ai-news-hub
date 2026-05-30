#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_WALLPAPERS = 80;

// Bing daily wallpaper archive (Chinese endpoint — accessible from China)
// idx=0 today, idx=1 yesterday ... up to idx=7 last 8 days
// n=8 fetches 8 at once
const BING_API = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN';

// Picsum (Unsplash) — diverse photos including people, architecture, cityscapes
// No API key required. Fetches random photos from Unsplash via picsum.photos
const PICSUM_PAGES = 3;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPicsumWallpapers() {
  const results = [];
  for (let page = 1; page <= PICSUM_PAGES; page++) {
    const url = `https://picsum.photos/v2/list?page=${page}&limit=30`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AI-News-Hub/1.0' },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const images = await res.json();
      for (const img of images) {
        results.push({
          url: `https://picsum.photos/id/${img.id}/1920/1080`,
          title: img.author ? `Photo by ${img.author}` : '',
          copyright: 'picsum.photos / Unsplash',
          source: 'picsum',
        });
      }
      console.log(`  ✓ Picsum page ${page}: ${images.length} images`);
    } catch (err) {
      console.error(`  ✗ Picsum page ${page}: ${err.message}`);
    }
  }
  return results;
}

async function fetchBingWallpapers() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(BING_API, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return (data.images || []).map((img) => ({
      url: 'https://cn.bing.com' + img.url,
      title: img.title || '',
      copyright: img.copyright || '',
      date: img.enddate || '',
    }));
  } catch (err) {
    console.error(`  ✗ Bing wallpaper: ${err.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGirldir() {
  const totalPages = 6; // Fetch 6 pages × 20 items = up to 120 images
  const seen = new Set();
  const results = [];

  for (let page = 1; page <= totalPages; page++) {
    try {
      const url = `https://www.girldir.com/en/?ajax=1&page=${page}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: 'https://www.girldir.com/en/',
        },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items = json?.msg?.list || [];
      if (items.length === 0) break;

      for (const item of items) {
        let imgUrl = item.imgUrl || '';
        if (!imgUrl) continue;
        // Deduplicate by URL
        if (seen.has(imgUrl)) continue;
        seen.add(imgUrl);
        results.push({
          url: imgUrl,
          title: item.imgTitle || item.bookName || '',
          copyright: 'girldir.com',
          source: 'girldir',
        });
      }
      console.log(`  ✓ Girldir page ${page}: ${items.length} items`);
      if (page < totalPages) {
        await delay(500);
      }
    } catch (err) {
      console.error(`  ✗ Girldir page ${page}: ${err.message}`);
    }
  }

  console.log(`  ✓ Girldir total: ${results.length} images`);
  return results;
}

function mergeWallpapers(existing, newWallpapers, maxCount) {
  const existingUrls = new Set(existing.urls.map((u) => (typeof u === 'string' ? u : u.url)));
  let allUrls = [...(existing.urls || [])];

  for (const wp of newWallpapers) {
    if (!existingUrls.has(wp.url)) {
      allUrls.push(wp);
      existingUrls.add(wp.url);
    }
  }

  if (allUrls.length > maxCount) {
    allUrls = allUrls.slice(-maxCount);
  }

  return {
    fetchedAt: new Date().toISOString(),
    urls: allUrls,
  };
}

async function main() {
  console.log('Fetching wallpapers...');

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'wallpapers.json');
  const girlDataPath = path.join(__dirname, '..', 'src', 'data', 'wallpapers-girl.json');

  // Read existing data files
  let existing = { fetchedAt: null, urls: [] };
  let existingGirl = { fetchedAt: null, urls: [] };
  try { existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8')); } catch {}
  try { existingGirl = JSON.parse(fs.readFileSync(girlDataPath, 'utf-8')); } catch {}

  // Fetch all sources
  const bingWallpapers = await fetchBingWallpapers();
  const picsumWallpapers = await fetchPicsumWallpapers();
  const girldirWallpapers = await fetchGirldir();

  // Normal wallpapers: Bing + Picsum (nature, scenery, diverse)
  const normalWallpapers = [...bingWallpapers, ...picsumWallpapers];
  if (normalWallpapers.length > 0) {
    const output = mergeWallpapers(existing, normalWallpapers, MAX_WALLPAPERS);
    fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`  ✓ Normal wallpapers: ${bingWallpapers.length} Bing + ${picsumWallpapers.length} Picsum = ${output.urls.length} total`);
  } else {
    console.log('  No normal wallpapers fetched, keeping existing.');
  }

  // Girl wallpapers: Girldir only
  if (girldirWallpapers.length > 0) {
    const girlOutput = mergeWallpapers(existingGirl, girldirWallpapers, MAX_WALLPAPERS);
    fs.writeFileSync(girlDataPath, JSON.stringify(girlOutput, null, 2), 'utf-8');
    console.log(`  ✓ Girl wallpapers: ${girldirWallpapers.length} Girldir = ${girlOutput.urls.length} total`);
  } else {
    console.log('  No girl wallpapers fetched, keeping existing.');
  }
}

main().catch(console.error);
