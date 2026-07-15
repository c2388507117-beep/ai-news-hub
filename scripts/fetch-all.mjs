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
  { name: 'Game Deals', file: 'fetch-game-deals.mjs', required: false },
  { name: 'Wallpapers', file: 'fetch-wallpapers.mjs', required: true },
  { name: 'Daily Knowledge', file: 'fetch-knowledge.mjs', required: true },
  { name: 'Daily Digest', file: 'fetch-digest.mjs', required: true },
  { name: 'Today History', file: 'fetch-today-history.mjs', required: false },
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
