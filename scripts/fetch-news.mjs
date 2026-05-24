#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'AI-News-Hub/1.0' },
});

const SOURCES = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'industry' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'industry' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'research' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'opensource' },
  { name: 'Google AI', url: 'https://blog.research.google/atom.xml', category: 'research' },
  { name: 'Meta AI', url: 'https://ai.meta.com/blog/feed.xml', category: 'research' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', category: 'research' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml', category: 'industry' },
  // Chinese AI sources
  { name: '36氪', url: 'https://36kr.com/feed', category: 'industry' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed', category: 'industry' },
];

function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return slug || 'untitled';
}

function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;
  const mediaContent = item['media:content']?.$.url;
  if (mediaContent) return mediaContent;
  const content = item['content:encoded'] || item.content || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match ? match[1] : undefined;
}

function parseDate(item) {
  const raw = item.isoDate || item.pubDate;
  if (raw) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

async function fetchSource(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, 15).map((item) => ({
      id: slugify(item.title || '') + '-' + Date.now(),
      title: item.title || 'Untitled',
      url: item.link || '',
      summary: (item.contentSnippet || item.content || '').slice(0, 500),
      source: source.name,
      category: source.category,
      publishedAt: parseDate(item),
      imageUrl: extractImage(item),
      type: 'article',
    }));
    console.log(`  ✓ ${source.name}: ${items.length} items`);
    return items;
  } catch (err) {
    console.error(`  ✗ ${source.name}: ${err.message}`);
    return [];
  }
}

function mergeNews(existing, incoming) {
  const map = new Map();
  for (const item of existing) map.set(item.url, item);
  for (const item of incoming) map.set(item.url, item);
  return [...map.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

function readExistingData(dataPath) {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return [];
  }
}

async function main() {
  console.log('Fetching RSS feeds...');

  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const allItems = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));

  const seen = new Set();
  const deduped = allItems.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const final = deduped.slice(0, 100);

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
  const existing = readExistingData(dataPath);
  const merged = mergeNews(existing, final).slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${final.length} new items, ${merged.length} total in database`);
}

main().catch(console.error);
