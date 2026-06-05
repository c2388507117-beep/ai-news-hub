#!/usr/bin/env node

/**
 * Fetch AI-generated news summaries using Claude API.
 * Reads the latest news items and generates concise Chinese summaries.
 *
 * Usage: ANTHROPIC_API_KEY=sk-xxx node scripts/fetch-ai-summaries.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'src', 'data');
const newsPath = path.join(dataDir, 'news.json');
const outputPath = path.join(dataDir, 'ai-summaries.json');

const MAX_ITEMS = 50;  // Summarize the latest N items
const BATCH_SIZE = 5;  // Items per API call

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('✗ ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function callClaude(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `你是 AI 新闻摘要助手。你会收到一组 AI/科技新闻，请为每条新闻生成：
1. 一句话精华摘要（20字以内）
2. 关键洞察（1-2点，每点15字以内）

用 JSON 格式返回，格式为：
{
  "summaries": [
    {
      "id": "新闻id",
      "oneLiner": "一句话精华摘要",
      "insights": ["洞察1", "洞察2"]
    }
  ]
}

注意：用中文，简洁有力，不要套话。`,
      messages: [{ role: 'user', content: JSON.stringify(messages) }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content = json.content?.[0]?.text;
  if (!content) throw new Error('Empty response');

  // Extract JSON from response
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');

  return JSON.parse(match[0]);
}

async function main() {
  console.log('Fetching AI summaries...');

  const allNews = readJson(newsPath);
  if (!allNews || !Array.isArray(allNews) || allNews.length === 0) {
    console.log('  No news data found, skipping.');
    return;
  }

  // Sort by publishedAt descending, take latest items
  const sorted = [...allNews]
    .filter((n) => n.title && n.category)
    .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

  const items = sorted.slice(0, MAX_ITEMS);
  console.log(`  Processing ${items.length} items in batches of ${BATCH_SIZE}...`);

  const existing = readJson(outputPath) || {};
  const summaries = existing.summaries || [];
  const seenIds = new Set(summaries.map((s) => s.id));

  let newCount = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchIds = batch.map((n) => n.id);
    const needsUpdate = batchIds.some((id) => !seenIds.has(id));

    if (!needsUpdate) {
      console.log(`  Batch ${i / BATCH_SIZE + 1}: already up-to-date, skipping`);
      continue;
    }

    const input = batch.map((n) => ({
      id: n.id,
      title: n.title,
      summary: (n.summary || '').slice(0, 200),
      category: n.category,
    }));

    try {
      console.log(`  Batch ${i / BATCH_SIZE + 1}: ${batch.length} items...`);
      const result = await callClaude(input);

      if (result.summaries && Array.isArray(result.summaries)) {
        for (const s of result.summaries) {
          if (s.id && !seenIds.has(s.id)) {
            // Trim insights
            summaries.push({
              id: s.id,
              oneLiner: (s.oneLiner || '').trim(),
              insights: (s.insights || []).slice(0, 3),
            });
            seenIds.add(s.id);
            newCount++;
          }
        }
        // Add 200ms delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`  ✗ Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
    }

    // Progress
    const totalDone = Math.min(i + BATCH_SIZE, items.length);
    console.log(`  Progress: ${totalDone}/${items.length}`);
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    totalItems: items.length,
    summaries,
  };

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone: ${newCount} new summaries generated, ${summaries.length} total cached`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
