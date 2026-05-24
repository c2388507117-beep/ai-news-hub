#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bing daily wallpaper archive (Chinese endpoint — accessible from China)
// idx=0 today, idx=1 yesterday ... up to idx=7 last 8 days
// n=8 fetches 8 at once
const BING_API = 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN';

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
  if (newWallpapers.length === 0) {
    console.log('No wallpapers fetched, keeping existing data.');
    return;
  }

  // Merge: keep existing URLs, add new ones, deduplicate by URL
  const existingUrls = new Set(existing.urls.map((u) => (typeof u === 'string' ? u : u.url)));
  const allUrls = [...(existing.urls || [])];

  for (const wp of newWallpapers) {
    if (!existingUrls.has(wp.url)) {
      allUrls.push(wp);
      existingUrls.add(wp.url);
    }
  }

  // Keep max 30 wallpapers to avoid bloat
  const trimmed = allUrls.slice(-30);

  const output = {
    fetchedAt: new Date().toISOString(),
    urls: trimmed,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ ${newWallpapers.length} new, ${trimmed.length} total wallpapers`);
}

main().catch(console.error);
