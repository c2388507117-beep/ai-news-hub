#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'bilibili.json');

const UID = 38795510;

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': `https://space.bilibili.com/${UID}`,
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract the WBI key from a Bilibili image URL.
 * e.g. "https://i0.hdslb.com/bfs/wbi/7cd084941338484aae1ad9425b84077c.png"
 * returns "7cd084941338484aae1ad9425b84077c"
 */
function extractKeyFromUrl(url) {
  const pathname = url.split('?')[0];
  const filename = pathname.split('/').pop() || '';
  return filename.replace(/\.\w+$/, '');
}

/**
 * WBI signing algorithm for Bilibili API requests.
 * Alternates characters from imgKey and subKey, adds wts timestamp,
 * sorts params alphabetically, builds query string (no encoding),
 * and computes MD5(query + mixedKey) as w_rid.
 */
function encryptWbi(params, imgKey, subKey) {
  // Mix keys: alternate characters from imgKey and subKey
  let mixed = '';
  const maxLen = Math.max(imgKey.length, subKey.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < imgKey.length) mixed += imgKey[i];
    if (i < subKey.length) mixed += subKey[i];
  }

  // Add wts = current timestamp (seconds)
  params.wts = Math.floor(Date.now() / 1000);

  // Sort params by key
  const keys = Object.keys(params).sort();

  // Build query string (no encoding)
  const query = keys.map((k) => `${k}=${params[k]}`).join('&');

  // Sign: md5(query + mixed)
  const wRid = createHash('md5').update(query + mixed).digest('hex');
  params.w_rid = wRid;

  return params;
}

/**
 * Execute a signed or unsigned GET request to the Bilibili API.
 * When `signed` is true, `keys` must contain `imgKey` and `subKey`.
 */
async function apiGet(rawUrl, params = {}, signed = false, keys = null) {
  if (signed && keys) {
    params = encryptWbi({ ...params }, keys.imgKey, keys.subKey);
  }

  const queryString = Object.keys(params).length
    ? '?' + Object.keys(params).map((k) => `${k}=${params[k]}`).join('&')
    : '';
  const url = rawUrl + queryString;

  const res = await fetch(url, {
    headers: BASE_HEADERS,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${rawUrl}`);
  return res.json();
}

/**
 * Step 1: Fetch WBI keys from the nav endpoint.
 */
async function fetchWbiKeys() {
  const data = await apiGet('https://api.bilibili.com/x/web-interface/nav');
  if (data.code !== 0) throw new Error(`Nav API error: ${data.code} ${data.message}`);

  const imgUrl = data?.data?.wbi_img?.img_url;
  const subUrl = data?.data?.wbi_img?.sub_url;
  if (!imgUrl || !subUrl) throw new Error('Could not extract WBI image URLs from nav response');

  const imgKey = extractKeyFromUrl(imgUrl);
  const subKey = extractKeyFromUrl(subUrl);
  if (!imgKey || !subKey) throw new Error('Extracted empty WBI key(s)');

  return { imgKey, subKey };
}

/**
 * Step 2: Fetch the list of created favorite folders for the UID.
 * Returns [{ id, title, mediaCount }]
 */
async function fetchFolders(keys) {
  const data = await apiGet(
    'https://api.bilibili.com/x/v3/fav/folder/created/list',
    { up_mid: UID, type: 0 },
    true,
    keys,
  );
  if (data.code !== 0) throw new Error(`Folder list API error: ${data.code} ${data.message}`);

  const list = data?.data?.list || [];
  return list.map((f) => ({
    id: f.id,
    title: f.title,
    mediaCount: f.media_count || 0,
  }));
}

/**
 * Step 3: Fetch the resource list for a given folder (media_id).
 * Returns [{ bvid, title, cover, uri, author, progress }]
 */
async function fetchResourceList(mediaId, keys) {
  const data = await apiGet(
    'https://api.bilibili.com/x/v3/fav/resource/list',
    { media_id: mediaId, pn: 1, ps: 20, platform: 'web' },
    true,
    keys,
  );
  if (data.code !== 0) throw new Error(`Resource list API error: ${data.code} ${data.message}`);

  const medias = data?.data?.medias || [];
  return medias.map((m) => ({
    bvid: m.bvid || '',
    title: m.title || '',
    cover: m.cover || '',
    uri: m.uri || '',
    author: m.author?.name || '',
    progress: m.progress ?? 0,
  }));
}

/**
 * Step 4: Fetch video detail (duration, etc.) from the view endpoint.
 * This endpoint may NOT require WBI signing.
 */
async function fetchVideoDetail(bvid) {
  const data = await apiGet(
    'https://api.bilibili.com/x/web-interface/view',
    { bvid },
    false,
    null,
  );
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
  console.log('Fetching Bilibili data...');

  /* ---- Step 1: Get WBI keys ---- */
  let keys;
  try {
    keys = await fetchWbiKeys();
    console.log('  ✓ WBI keys obtained');
  } catch (err) {
    console.error('  ✗ Failed to fetch WBI keys:', err.message);
    const existing = readExistingData();
    if (existing) {
      console.log('  Keeping existing Bilibili data.');
      return;
    }
    console.log('  No existing data to fall back to. Exiting.');
    return;
  }

  /* ---- Step 2: Fetch folders ---- */
  let folders;
  try {
    folders = await fetchFolders(keys);
    console.log(`  ✓ ${folders.length} folders found`);
  } catch (err) {
    console.error('  ✗ Failed to fetch folders:', err.message);
    const existing = readExistingData();
    if (existing) {
      console.log('  Keeping existing Bilibili data.');
      return;
    }
    console.log('  No existing data to fall back to. Exiting.');
    return;
  }

  /* ---- Step 3: Fetch resources for each folder ---- */
  const rawVideos = [];
  for (const folder of folders) {
    await delay(200);
    console.log(`  Fetching folder "${folder.title}" (${folder.mediaCount} videos)...`);
    try {
      const videos = await fetchResourceList(folder.id, keys);
      rawVideos.push(...videos);
      console.log(`    ✓ ${videos.length} videos`);
    } catch (err) {
      console.error(`    ✗ Failed to fetch resources for folder "${folder.title}": ${err.message}`);
    }
  }

  console.log(`  Raw videos collected (before dedup): ${rawVideos.length}`);

  /* Deduplicate by bvid */
  const seen = new Set();
  const uniqueVideos = rawVideos.filter((v) => {
    if (!v.bvid || seen.has(v.bvid)) return false;
    seen.add(v.bvid);
    return true;
  });
  console.log(`  Unique videos to process: ${uniqueVideos.length}`);

  /* ---- Step 4: Fetch video details ---- */
  const enrichedVideos = [];
  for (const video of uniqueVideos) {
    await delay(200);
    try {
      const detail = await fetchVideoDetail(video.bvid);
      if (!detail) {
        console.error(`    ✗ No detail data for ${video.bvid}, skipping`);
        continue;
      }
      const duration = detail.duration || 0;
      const progress = video.progress || 0;
      const remaining = Math.max(0, duration - progress);
      const isWatched = duration > 0 && progress / duration > 0.9;

      enrichedVideos.push({
        bvid: video.bvid,
        title: video.title,
        cover: video.cover,
        link: video.uri,
        author: video.author,
        duration,
        progress,
        remaining,
        isWatched,
      });
    } catch (err) {
      console.error(`    ✗ Failed to fetch detail for ${video.bvid}: ${err.message}, skipping`);
    }
  }

  /* ---- Step 5: Write output ---- */
  const output = {
    fetchedAt: new Date().toISOString(),
    folders: folders.map((f) => ({
      id: f.id,
      title: f.title,
      mediaCount: f.mediaCount,
    })),
    videos: enrichedVideos,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(
    `  ✓ Written ${enrichedVideos.length} videos across ${folders.length} folders to bilibili.json`,
  );
}

main().catch(console.error);
