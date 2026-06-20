#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');
const dataPath = path.join(dataDir, 'today-history.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

async function main() {
  console.log('Fetching today in history...');
  const res = await fetch('https://api.bykaii.com/today-history/', {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const items = (json.data || []).slice(0, 5).map(item => ({
    year: item.year || '',
    title: item.title || '',
    desc: item.desc || '',
  }));

  const output = { fetchedAt: new Date().toISOString(), items };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ ${items.length} events`);
}

main().catch(err => {
  console.error('  ✗ Today history fetch failed:', err.message);
  process.exit(1);
});
