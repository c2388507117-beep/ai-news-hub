#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'hot-topics.json');

const MAX_TOPICS = 3;
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

// Source 1: Weibo hot search (mobile API)
async function fetchWeiboHot() {
  const url = 'https://m.weibo.cn/api/container/getIndex?containerid=106003&type=wb';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36',
        Referer: 'https://m.weibo.cn/',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data?.cards) return null;

    const topics = [];
    for (const card of data.data.cards) {
      if (card.card_group) {
        for (const group of card.card_group) {
          if (group.desc && group.scheme) {
            topics.push({
              title: group.desc,
              url: group.scheme.startsWith('http') ? group.scheme : 'https://m.weibo.cn' + group.scheme,
              hot: (parseInt(group.desc_extr) || 0) > 1000000,
            });
          }
        }
      }
    }
    return topics.length > 0 ? topics : null;
  } catch (err) {
    console.error('  Weibo API error:', err.message);
    return null;
  }
}

// Source 2: Zhihu hot list
async function fetchZhihuHot() {
  const url = 'https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=20';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.data) return null;

    return data.data.map((item) => ({
      title: item.target?.title || item.target?.question?.name || '',
      url: item.target?.url || `https://www.zhihu.com/question/${item.target?.id}`,
      hot: (item.detail_text || '').includes('万') || (item.detail_text || '').includes('亿'),
    })).filter((t) => t.title);
  } catch (err) {
    console.error('  Zhihu API error:', err.message);
    return null;
  }
}

// Source 3: BackUp - keep existing data if available
function keepExisting(existing) {
  const fresh = existing.filter((t) => {
    const age = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
    return age < CACHE_DAYS;
  });
  return fresh.length > 0 ? fresh : null;
}

function toTopicEntry(item, source, existing) {
  // Generate a brief from existing data if available, or use title as brief
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
  console.log('Fetching hot topics...');

  const existing = readExisting();

  // Try Weibo first, then Zhihu, then keep existing
  let topics;
  let source;

  console.log('  Trying Weibo hot search...');
  const weiboData = await fetchWeiboHot();
  if (weiboData) {
    topics = weiboData.slice(0, MAX_TOPICS).map((t) => toTopicEntry(t, '微博', existing));
    source = '微博';
    console.log(`  ✓ Weibo: ${topics.length} topics`);
  } else {
    console.log('  Trying Zhihu hot list...');
    const zhihuData = await fetchZhihuHot();
    if (zhihuData) {
      topics = zhihuData.slice(0, MAX_TOPICS).map((t) => toTopicEntry(t, '知乎', existing));
      source = '知乎';
      console.log(`  ✓ Zhihu: ${topics.length} topics`);
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
  }

  fs.writeFileSync(dataPath, JSON.stringify(topics, null, 2), 'utf-8');
  console.log(`\nDone: ${topics.length} hot topics from ${source}`);
}

main().catch(console.error);
