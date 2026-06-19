#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');

const MAX_ITEMS = 30;

// Keyword rules for auto-categorization (simplified, matching src/lib/categorize.ts)
const CATEGORY_RULES = [
  { category: 'ai', keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'openai', 'chatgpt', 'claude', 'gemini', 'llama', 'deepseek', 'neural', 'deep learning', 'pytorch', 'transformer', 'diffusion', 'nlp', 'computer vision', 'agent', 'rag', 'model'] },
  { category: 'tech', keywords: ['javascript', 'python', 'rust', 'go', 'react', 'vue', 'framework', 'cli', 'tool', 'docker', 'linux', 'database', 'compiler', 'app', 'ios', 'android', 'web', 'startup', 'cloud', 'security', 'programming'] },
  { category: 'gaming', keywords: ['game', 'gaming', 'console', 'steam', 'playstation', 'xbox', 'nintendo'] },
];

function autoCategorize(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const scores = {};
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > 0) scores[rule.category] = score;
  }
  const entries = Object.entries(scores);
  if (entries.length === 0) return 'tech';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'hn';
}

async function fetchHNTopStories() {
  console.log('Fetching Hacker News top stories...');

  // Get top story IDs
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    signal: AbortSignal.timeout(15000),
  });
  if (!idsRes.ok) throw new Error(`Top stories HTTP ${idsRes.status}`);
  const ids = await idsRes.json();
  const batch = ids.slice(0, MAX_ITEMS);
  console.log(`  Got ${batch.length} story IDs`);

  // Fetch item details in parallel (batched to avoid rate limits)
  const results = [];
  const batchSize = 10;
  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    const items = await Promise.all(
      chunk.map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      })
    );
    // Only keep stories (type === 'story') that have a URL
    for (const item of items) {
      if (item && item.type === 'story' && item.url && item.title) {
        results.push(item);
      }
    }
    if (i + batchSize < batch.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`  Fetched ${results.length} valid stories`);
  return results;
}

function hnToNewsItem(item) {
  const title = item.title || '';
  const url = item.url || '';
  const summary = (item.text || '').replace(/<[^>]+>/g, '').slice(0, 400) || `HN: ${title}`;
  const category = autoCategorize(title, summary);

  return {
    id: `hn-${item.id}`,
    title,
    url,
    summary,
    fullContent: '',
    source: 'Hacker News',
    category,
    publishedAt: new Date((item.time || 0) * 1000).toISOString(),
    imageUrl: undefined,
    type: 'article',
  };
}

function readExistingData(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

async function main() {
  const stories = await fetchHNTopStories();
  if (stories.length === 0) {
    console.log('No stories fetched, exiting.');
    return;
  }

  const newItems = stories.map(hnToNewsItem);
  const existing = readExistingData(dataPath);

  // Remove old HN items, add new ones
  const nonHN = existing.filter((item) => !item.id.startsWith('hn-'));
  const merged = [...newItems, ...nonHN].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${newItems.length} HN stories, ${merged.length} total items`);
}

main().catch((err) => {
  console.error('HN fetch failed:', err.message);
  process.exit(1);
});
