#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'bilibili.json');

const UID = 38795510;

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': `https://space.bilibili.com/${UID}/favlist`,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a GET request to the Bilibili API.
 */
async function apiGet(rawUrl, params = {}) {
  const queryString = Object.keys(params).length
    ? '?' + Object.keys(params).map((k) => `${k}=${params[k]}`).join('&')
    : '';
  const url = rawUrl + queryString;

  const res = await fetch(url, {
    headers: BASE_HEADERS,
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${rawUrl}`);
  return res.json();
}

/**
 * Step 1: Fetch favorited videos from the public v2 endpoint (no WBI auth needed).
 * Returns archives array.
 */
async function fetchFavoriteVideos() {
  const allArchives = [];
  let pn = 1;
  let total = 0;
  const ps = 30;

  do {
    const data = await apiGet('https://api.bilibili.com/x/v2/fav/video', {
      vmid: UID,
      pn,
      ps,
    });

    if (data.code !== 0) throw new Error(`Fav video API error: ${data.code} ${data.message}`);

    const archives = data?.data?.archives || [];
    total = data?.data?.total || 0;
    allArchives.push(...archives);
    console.log(`  Page ${pn}: ${archives.length} videos (total ${total})`);

    pn++;
    if (pn > (data?.data?.pagecount || 1)) break;
    await delay(300);
  } while (allArchives.length < total);

  console.log(`  ✓ ${allArchives.length} favorited videos fetched`);
  return allArchives;
}

/**
 * Step 2: Fetch video detail (duration) from the view endpoint.
 */
async function fetchVideoDetail(aid) {
  const data = await apiGet('https://api.bilibili.com/x/web-interface/view', { aid });
  if (data.code !== 0) throw new Error(`View API error: ${data.code} ${data.message}`);
  return data?.data || null;
}

/**
 * Read existing data file, return null if it does not exist or is corrupt.
 */
function readExistingData() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fetching Bilibili favorites...');

  /* ---- Step 1: Fetch favorited videos ---- */
  let archives;
  try {
    archives = await fetchFavoriteVideos();
  } catch (err) {
    console.error('  ✗ Failed to fetch favorites:', err.message);
    const existing = readExistingData();
    if (existing) {
      console.log('  Keeping existing Bilibili data.');
      return;
    }
    console.log('  No existing data to fall back to. Exiting.');
    return;
  }

  if (!archives || archives.length === 0) {
    console.log('  No favorited videos found.');
    return;
  }

  /* Filter out invalid videos */
  const validVideos = archives.filter((a) => a.aid && a.title && a.title !== '已失效视频');
  console.log(`  Valid videos: ${validVideos.length}/${archives.length}`);

  /* ---- Step 2: Fetch video details for duration ---- */
  const videos = [];
  for (const archive of validVideos) {
    await delay(200);
    try {
      const detail = await fetchVideoDetail(archive.aid);
      if (!detail) {
        console.error(`    ✗ No detail for aid=${archive.aid}, using archive data`);
        videos.push({
          aid: archive.aid,
          bvid: archive.bvid || '',
          title: archive.title || '',
          cover: archive.pic ? archive.pic.replace(/^http:/, 'https:') : '',
          link: `https://www.bilibili.com/video/${archive.bvid || ''}`,
          author: archive.owner?.name || '',
          duration: archive.duration || 0,
          // Progress not available without auth
          progress: 0,
          remaining: archive.duration || 0,
          isWatched: false,
        });
        continue;
      }
      const duration = detail.duration || archive.duration || 0;
      videos.push({
        aid: archive.aid,
        bvid: archive.bvid || detail.bvid || '',
        title: archive.title || '',
        cover: archive.pic ? archive.pic.replace(/^http:/, 'https:') : '',
        link: `https://www.bilibili.com/video/${archive.bvid || detail.bvid || ''}`,
        author: archive.owner?.name || '',
        duration,
        // Progress unavailable without login; show as unwatched
        progress: 0,
        remaining: duration,
        isWatched: false,
      });
    } catch (err) {
      // On error, use archive data as-is
      console.error(`    ✗ Failed to fetch detail for aid=${archive.aid}: ${err.message}`);
      videos.push({
        aid: archive.aid,
        bvid: archive.bvid || '',
        title: archive.title || '',
        cover: archive.pic ? archive.pic.replace(/^http:/, 'https:') : '',
        link: `https://www.bilibili.com/video/${archive.bvid || ''}`,
        author: archive.owner?.name || '',
        duration: archive.duration || 0,
        progress: 0,
        remaining: archive.duration || 0,
        isWatched: false,
      });
    }
  }

  /* Limit to max 50 videos */
  const finalVideos = videos.slice(0, 50);

  /* ---- Step 3: Write output ---- */
  const output = {
    fetchedAt: new Date().toISOString(),
    folders: [{ id: 0, title: '默认收藏夹', mediaCount: finalVideos.length }],
    videos: finalVideos,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Written ${finalVideos.length} videos to bilibili.json`);
}

main().catch(console.error);
