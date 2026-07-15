#!/usr/bin/env node

/**
 * fetch-game-deals.mjs — 游戏打折资讯
 * Steam: 通过 Steam API 获取折扣信息
 * PS/Switch: 通过 RSSHub 聚合
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'game-deals.json');

const MAX_ITEMS = 30;

// Steam 特惠
async function fetchSteamDeals() {
  const results = [];
  try {
    // Steam 全球特惠
    const urls = [
      'https://store.steampowered.com/api/featuredcategories',
      'https://store.steampowered.com/api/featuredcategories?cc=cn',
    ];
    for (const url of urls) {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = data?.specials?.items || [];
      for (const item of items) {
        if (!item.id) continue;
        results.push({
          id: `steam-${item.id}`,
          title: item.name || '',
          url: `https://store.steampowered.com/app/${item.id}`,
          discount: item.discount_percent || 0,
          originalPrice: item.original_price || 0,
          finalPrice: item.final_price || 0,
          imageUrl: item.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
          platform: 'Steam',
          source: 'Steam',
          publishedAt: new Date().toISOString(),
          summary: item.name ? `${item.name} -${item.discount_percent || 0}%` : '',
        });
      }
      if (results.length > 0) break;
    }
  } catch (err) {
    console.error('  ✗ Steam:', err.message);
  }
  return results;
}

// PS Store 折扣 (通过 RSSHub)
async function fetchPSDeals() {
  try {
    const res = await fetch('https://rsshub.app/ps/store/cn', {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const get = (tag) => {
        const m = match[1].match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`));
        if (m) return m[1];
        const m2 = match[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
        return m2 ? m2[1].trim() : '';
      };
      const title = get('title');
      const link = get('link');
      if (title) items.push({ title, link });
    }
    return items.slice(0, 10).map((item, i) => ({
      id: `ps-${Date.now()}-${i}`,
      title: item.title,
      url: item.link || 'https://store.playstation.com',
      discount: 0,
      originalPrice: 0,
      finalPrice: 0,
      imageUrl: '',
      platform: 'PlayStation',
      source: 'PS Store',
      publishedAt: new Date().toISOString(),
      summary: item.title,
    }));
  } catch (err) {
    console.error('  ✗ PS Store:', err.message);
    return [];
  }
}

// Nintendo Switch 折扣 (通过 RSSHub)
async function fetchSwitchDeals() {
  try {
    const res = await fetch('https://rsshub.app/nintendo/eshop/cn', {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const get = (tag) => {
        const m = match[1].match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`));
        if (m) return m[1];
        const m2 = match[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
        return m2 ? m2[1].trim() : '';
      };
      const title = get('title');
      const link = get('link');
      if (title) items.push({ title, link });
    }
    return items.slice(0, 10).map((item, i) => ({
      id: `switch-${Date.now()}-${i}`,
      title: item.title,
      url: item.link || 'https://www.nintendo.com',
      discount: 0,
      originalPrice: 0,
      finalPrice: 0,
      imageUrl: '',
      platform: 'Switch',
      source: 'Nintendo eShop',
      publishedAt: new Date().toISOString(),
      summary: item.title,
    }));
  } catch (err) {
    console.error('  ✗ Switch:', err.message);
    return [];
  }
}

async function main() {
  console.log('Fetching game deals...');

  const [steam, ps, sw] = await Promise.allSettled([
    fetchSteamDeals(),
    fetchPSDeals(),
    fetchSwitchDeals(),
  ]);

  let allDeals = [];
  if (steam.status === 'fulfilled') {
    allDeals = allDeals.concat(steam.value);
    console.log(`  ✓ Steam: ${steam.value.length} deals`);
  }
  if (ps.status === 'fulfilled') {
    allDeals = allDeals.concat(ps.value);
    console.log(`  ✓ PS Store: ${ps.value.length} deals`);
  }
  if (sw.status === 'fulfilled') {
    allDeals = allDeals.concat(sw.value);
    console.log(`  ✓ Switch: ${sw.value.length} deals`);
  }

  // Deduplicate by title
  const seen = new Set();
  const unique = allDeals.filter(d => {
    const key = d.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  const top = unique.slice(0, MAX_ITEMS);

  const output = {
    fetchedAt: new Date().toISOString(),
    items: top,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone: ${top.length} game deals total`);
}

main().catch(console.error);
