#!/usr/bin/env node

/**
 * fetch-producthunt.mjs — Fetch Product Hunt daily featured products via RSS.
 * No API key required. Products are stored as tech-articles in news.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');

const PH_RSS_URL = 'https://www.producthunt.com/feed?category=undefined';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'ph';
}

function parseRSS(xmlText) {
  const items = [];
  // Simple regex-based RSS parser (no dependency needed)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    const get = (tag) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`));
      if (m) return m[1];
      const m2 = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
      return m2 ? m2[1].trim() : '';
    };
    const title = get('title');
    const link = get('link');
    const description = get('description');
    const pubDate = get('pubDate');

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

function readExistingData(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

async function main() {
  console.log('Fetching Product Hunt...');

  const res = await fetch(PH_RSS_URL, {
    headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const items = parseRSS(xml);
  console.log(`  Parsed ${items.length} items`);

  // Only keep the first 10
  const top = items.slice(0, 10);

  const now = Date.now();
  const newItems = top.map((item, i) => ({
    id: `ph-${slugify(item.title)}-${now}`,
    title: item.title,
    url: item.link,
    summary: item.description.replace(/<[^>]+>/g, '').slice(0, 400) || `Product Hunt: ${item.title}`,
    fullContent: '',
    source: 'Product Hunt',
    category: 'tech',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl: undefined,
    type: 'article',
  }));

  const existing = readExistingData(dataPath);
  // Remove old PH items, add new ones
  const nonPH = existing.filter((item) => !item.id.startsWith('ph-'));
  const merged = [...newItems, ...nonPH].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${newItems.length} PH products, ${merged.length} total items`);
}

main().catch((err) => {
  console.error('Product Hunt fetch failed:', err.message);
  process.exit(1);
});
