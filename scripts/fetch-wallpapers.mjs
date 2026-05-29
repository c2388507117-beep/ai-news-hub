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
  try {
    const res = await fetch('https://www.girldir.com/en/', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const regex = /src="(https:\/\/img\.girldir\.com\/upload\/[^"]+)"/g;
    const matches = new Set();
    let match;
    while ((match = regex.exec(html)) !== null) {
      matches.add(match[1]);
    }
    const urls = Array.from(matches).slice(0, 30).map((url) => ({
      url,
      source: 'girldir',
      title: 'girldir.com',
      copyright: 'girldir.com',
    }));
    console.log(`  ✓ Girldir: ${urls.length} images`);
    return urls;
  } catch (err) {
    console.error(`  ✗ Girldir: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('Fetching wallpapers from Bing...');

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'wallpapers.json');

  // Read existing wallpapers
  let existing = { fetchedAt: null, urls: [] };
  try {
    existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    // file doesn't exist yet
  }

  const newWallpapers = await fetchBingWallpapers();
  const picsumWallpapers = await fetchPicsumWallpapers();
  const girldirWallpapers = await fetchGirldir();
  const allNewWallpapers = [...newWallpapers, ...picsumWallpapers, ...girldirWallpapers];
  if (allNewWallpapers.length === 0) {
    console.log('No wallpapers fetched, keeping existing data.');
    return;
  }

  // Merge: keep existing URLs, add new ones, deduplicate by URL
  const existingUrls = new Set(existing.urls.map((u) => (typeof u === 'string' ? u : u.url)));
  let allUrls = [...(existing.urls || [])];

  for (const wp of allNewWallpapers) {
    if (!existingUrls.has(wp.url)) {
      allUrls.push(wp);
      existingUrls.add(wp.url);
    }
  }

  // Keep max wallpapers — preserve at least some from each source
  if (allUrls.length > MAX_WALLPAPERS) {
    // Keep non-picsum sources (Bing, Girldir, etc.) and fill remaining with picsum
    const bingUrls = allUrls.filter((u) => (u.source || '').toLowerCase() !== 'picsum');
    const picsumUrls = allUrls.filter((u) => (u.source || '').toLowerCase() === 'picsum');
    const remaining = MAX_WALLPAPERS - bingUrls.length;
    if (remaining > 0) {
      allUrls = [...bingUrls, ...picsumUrls.slice(-remaining)];
    } else {
      allUrls = bingUrls.slice(-MAX_WALLPAPERS);
    }
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    urls: allUrls,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ ${newWallpapers.length} Bing + ${picsumWallpapers.length} Picsum + ${girldirWallpapers.length} Girldir new, ${allUrls.length} total wallpapers`);
}

main().catch(console.error);
