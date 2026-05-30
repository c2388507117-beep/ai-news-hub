#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'bilibili.json');

const UID = 38795510;
const MEDIA_ID = 3716645510; // "游戏与视频" collection

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://space.bilibili.com/38795510/favlist',
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a GET request to the Bilibili API.
 */
async function apiGet(rawUrl, params = {}) {
  const queryString = Object.keys(params).length
    ? '?' + Object.keys(params).map((k) => `${k}=${encodeURIComponent(params[k])}`).join('&')
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
 * Step 1: Fetch favorited videos from v3 resource list API.
 * This API works without WBI signing for public collections.
 * Returns { info, medias[], count }.
 */
async function fetchFavoriteVideos() {
  const allMedias = [];
  let pn = 1;
  let total = 0;
  const ps = 20;
  let folderTitle = '游戏与视频';

  do {
    const data = await apiGet('https://api.bilibili.com/x/v3/fav/resource/list', {
      media_id: MEDIA_ID,
      pn,
      ps,
    });

    if (data.code !== 0) throw new Error(`Fav list API error: ${data.code} ${data.message}`);

    const info = data?.data?.info || {};
    const medias = data?.data?.medias || [];
    const pageCount = data?.data?.count || medias.length;

    folderTitle = info.title || folderTitle;
    if (pn === 1) total = pageCount;

    allMedias.push(...medias);
    console.log(`  Page ${pn}: ${medias.length} videos (total ${total})`);

    pn++;
    if (medias.length < ps) break;
    await delay(300);
  } while (allMedias.length < total);

  console.log(`  ✓ ${allMedias.length} videos fetched from "${folderTitle}"`);
  return { medias: allMedias, folderTitle };
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

  /* ---- Step 1: Fetch videos from the collection ---- */
  let medias;
  let folderTitle = '游戏与视频';
  try {
    const result = await fetchFavoriteVideos();
    medias = result.medias;
    folderTitle = result.folderTitle;
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

  if (!medias || medias.length === 0) {
    console.log('  No favorited videos found.');
    return;
  }

  /* Filter out invalid videos */
  const validMedias = medias.filter((m) => m.id && m.title && m.title !== '已失效视频');
  console.log(`  Valid videos: ${validMedias.length}/${medias.length}`);

  /* ---- Step 2: Transform to our video format ---- */
  const videos = validMedias.map((m) => {
    const duration = m.duration || 0;
    return {
      aid: m.id,
      bvid: m.bvid || '',
      title: m.title || '',
      cover: m.cover ? m.cover.replace(/^http:/, 'https:') : '',
      link: `https://www.bilibili.com/video/${m.bvid || ''}`,
      author: m.upper?.name || '',
      duration,
      // Progress not available without auth
      progress: 0,
      remaining: duration,
      isWatched: false,
    };
  });

  /* Limit to max 50 videos */
  const finalVideos = videos.slice(0, 50);

  /* ---- Step 3: Write output ---- */
  const output = {
    fetchedAt: new Date().toISOString(),
    folders: [{ id: MEDIA_ID, title: folderTitle, mediaCount: finalVideos.length }],
    videos: finalVideos,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Written ${finalVideos.length} videos to bilibili.json`);
}

main().catch(console.error);
