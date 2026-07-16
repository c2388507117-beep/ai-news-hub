#!/usr/bin/env node

/**
 * fetch-game-deals.mjs — Steam 游戏打折资讯（国区）
 * Steam 官方 API 返回中文名+人民币价格，cc=cn 指定国区
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'game-deals.json');

const MAX_ITEMS = 30;

async function fetchJson(url, timeout = 12000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log('Fetching Steam game deals (CN region)...');

  // 从多个端点合并去重，取折扣最大的
  const seen = new Set();
  const results = [];

  const endpoints = [
    // 国区特惠
    { url: 'https://store.steampowered.com/api/featuredcategories?cc=cn&l=schinese', key: 'specials' },
    // 全球（但用中文）
    { url: 'https://store.steampowered.com/api/featuredcategories?l=schinese', key: 'specials' },
  ];

  for (const { url, key } of endpoints) {
    try {
      const data = await fetchJson(url);
      const items = data?.[key]?.items || [];
      for (const item of items) {
        if (!item.id || !item.name) continue;
        const id = `steam-${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const discount = item.discount_percent || 0;
        if (discount <= 0) continue;
        results.push({
          id,
          title: item.name,
          url: `https://store.steampowered.com/app/${item.id}?l=schinese`,
          discount,
          originalPrice: (item.original_price || 0) / 100,
          finalPrice: (item.final_price || 0) / 100,
          currency: '¥',
          region: '国区',
          imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
          platform: 'Steam',
          publishedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error(`  ✗ Endpoint ${url.slice(0, 60)}: ${e.message}`);
    }
  }

  // 按折扣从大到小排序
  results.sort((a, b) => b.discount - a.discount);
  const top = results.slice(0, MAX_ITEMS);

  const output = { fetchedAt: new Date().toISOString(), items: top };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Steam: ${top.length} deals (CN region, ¥ prices)`);
}

main().catch((err) => {
  console.error('  ✗ Game deals failed:', err.message);
  // 保留旧数据
});
