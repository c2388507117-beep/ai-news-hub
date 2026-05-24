#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  { name: 'text', displayName: '文本对话' },
  { name: 'code', displayName: '代码生成' },
  { name: 'vision', displayName: '多模态' },
];

const API_URL = (name) =>
  `https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=${name}`;

const GITHUB_RAW_URL = (name) =>
  `https://raw.githubusercontent.com/oolong-tea-2026/arena-ai-leaderboards/main/data/latest/${name}.json`;

async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCategory(name) {
  // Try API first
  try {
    const data = await fetchWithTimeout(API_URL(name));
    if (data && data.models) return data;
  } catch {
    // fall through to GitHub raw
  }

  // Fall back to GitHub raw JSON
  try {
    const data = await fetchWithTimeout(GITHUB_RAW_URL(name));
    if (data && data.models) return data;
  } catch {
    // both failed
  }

  return null;
}

function readExisting(dataPath) {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return { fetchedAt: null, categories: {} };
  }
}

async function main() {
  console.log('Fetching AI model leaderboard data...');

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'leaderboard.json');
  const existing = readExisting(dataPath);

  const results = {};
  let anySuccess = false;

  for (const cat of CATEGORIES) {
    const data = await fetchCategory(cat.name);
    if (data) {
      results[cat.name] = data;
      console.log(`  ✓ ${cat.displayName}: ${data.models.length} models`);
      anySuccess = true;
    } else {
      // Keep existing data for this category if available
      if (existing.categories[cat.name]) {
        results[cat.name] = existing.categories[cat.name];
        console.log(`  ~ ${cat.displayName}: using cached data`);
      } else {
        results[cat.name] = { meta: null, models: [] };
        console.log(`  ✗ ${cat.displayName}: no data`);
      }
    }
  }

  if (!anySuccess) {
    console.log('No leaderboard data fetched, existing data kept.');
    return;
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    categories: results,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone: leaderboard data saved to src/data/leaderboard.json`);
}

main().catch(console.error);
