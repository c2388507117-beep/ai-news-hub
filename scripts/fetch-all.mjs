#!/usr/bin/env node

/**
 * fetch-all.mjs — Run all data fetching scripts sequentially.
 * Usage: node scripts/fetch-all.mjs
 *
 * Skips scripts that require API keys if env vars are missing.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS = [
  { name: 'RSS News', file: 'fetch-news.mjs', required: true },
  { name: 'Wallpapers', file: 'fetch-wallpapers.mjs', required: true },
  { name: 'Daily Knowledge', file: 'fetch-knowledge.mjs', required: true },
  { name: 'Daily Digest', file: 'fetch-digest.mjs', required: true },
  { name: 'Hot Topics', file: 'fetch-hot-topics.mjs', required: false },
  { name: 'Football', file: 'fetch-football.mjs', required: false },
  { name: 'Steam Charts', file: 'fetch-steam.mjs', required: false },
  { name: 'Bilibili', file: 'fetch-bilibili.mjs', required: false },
  { name: 'GitHub Trending', file: 'fetch-trending.mjs', required: false },
  { name: 'AI Leaderboard', file: 'fetch-leaderboard.mjs', required: false },
  { name: 'Generate Icons', file: 'generate-icons.mjs', required: false },
];

let failures = 0;
let skipped = 0;

console.log(`=== AI News Hub: Fetch All ===\n`);

for (const { name, file, required } of SCRIPTS) {
  const scriptPath = path.join(__dirname, file);
  try {
    console.log(`▶ ${name} (${file})`);
    execSync(`node "${scriptPath}"`, { stdio: 'inherit', timeout: 120000 });
    console.log(`✔ ${name} — OK\n`);
  } catch (err) {
    if (required) {
      console.error(`✘ ${name} — FAILED (required): ${err.message}\n`);
      failures++;
    } else {
      console.warn(`⚠ ${name} — SKIPPED (optional): ${err.message}\n`);
      skipped++;
    }
  }
}

console.log(`=== Done: ${SCRIPTS.length - failures - skipped} OK, ${skipped} skipped, ${failures} failed ===`);
process.exit(failures > 0 ? 1 : 0);
