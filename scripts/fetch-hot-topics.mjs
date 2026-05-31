#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'hot-topics.json');

const MAX_TOPICS = 5;
const CACHE_DAYS = 5;

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function readExisting() {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}

// Source 1: Douyin (抖音) hot search list
async function fetchDouyinHot() {
  const urls = [
    // Method 1: Official Douyin API (may need cookies)
    {
      url: 'https://www.douyin.com/aweme/v1/web/hot/search/list/',
      parse: (json) => {
        if (!json?.data?.word_list) return null;
        return json.data.word_list.map((item) => ({
          title: item.word || '',
          url: `https://www.douyin.com/search/${encodeURIComponent(item.word || '')}`,
          hot: (item.hot_value || 0) > 1000000,
        })).filter((t) => t.title);
      }
    },
    // Method 2: Third-party aggregation API
    {
      url: 'https://tenapi.cn/v2/hotlist?source=douyin',
      parse: (json) => {
        if (!json?.data?.list) return null;
        return json.data.list.map((item) => ({
          title: item.name || item.title || '',
          url: item.url || `https://www.douyin.com/search/${encodeURIComponent(item.name || '')}`,
          hot: (item.hot || 0) > 1000000,
        })).filter((t) => t.title);
      }
    },
  ];

  for (const source of urls) {
    try {
      const res = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Referer': 'https://www.douyin.com/',
          'Accept': 'application/json, text/plain, */*',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const topics = source.parse(json);
      if (topics && topics.length > 0) {
        console.log(`  ✓ Douyin: ${topics.length} topics`);
        return topics;
      }
    } catch (err) {
      console.error(`  Douyin API error (${source.url}):`, err.message);
    }
  }
  return null;
}

// Source 2: BackUp - keep existing data if available
function keepExisting(existing) {
  const fresh = existing.filter((t) => {
    const age = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
    return age < CACHE_DAYS;
  });
  return fresh.length > 0 ? fresh : null;
}

function toTopicEntry(item, source, existing) {
  const existingTopic = existing.find((t) => t.title === item.title);
  return {
    title: item.title,
    url: item.url,
    brief: existingTopic?.brief || item.title,
    date: formatDate(new Date()),
    source,
    hot: item.hot || false,
  };
}

async function main() {
  console.log('Fetching hot topics from Douyin...');

  const existing = readExisting();

  // Try Douyin first
  let topics;
  let source;

  console.log('  Trying Douyin hot search...');
  const douyinData = await fetchDouyinHot();
  if (douyinData) {
    topics = douyinData.slice(0, MAX_TOPICS).map((t) => toTopicEntry(t, '抖音', existing));
    source = '抖音';
    console.log(`  ✓ Douyin: ${topics.length} topics`);
  } else {
    const cached = keepExisting(existing);
    if (cached) {
      topics = cached;
      source = '缓存';
      console.log(`  ✓ Using cached data: ${topics.length} topics`);
    } else {
      console.log('  No data available, keeping empty.');
      return;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(topics, null, 2), 'utf-8');
  console.log(`\nDone: ${topics.length} hot topics from ${source}`);
}

main().catch(console.error);
