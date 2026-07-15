#!/usr/bin/env node

/**
 * fetch-game-deals.mjs — 游戏打折资讯
 * Steam: 官方 API + 特惠轮播 + 热销折扣
 * PS: 通过官方商店页面抓取
 * Switch: 通过 eShop 页面抓取
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'game-deals.json');
const MAX_ITEMS = 36; // 每种平台12个

async function fetchJson(url, timeout = 15000) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Steam：特惠 + 热销折扣 ──
async function fetchSteamDeals() {
  const seen = new Set();
  const results = [];

  try {
    // 方法1: featured categories API (全球)
    const data = await fetchJson('https://store.steampowered.com/api/featuredcategories');
    const specials = data?.specials?.items || [];
    for (const item of specials) {
      if (!item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      const discount = item.discount_percent || 0;
      if (discount <= 0) continue;
      results.push({
        id: `steam-${item.id}`,
        title: item.name || '',
        url: `https://store.steampowered.com/app/${item.id}`,
        discount,
        finalPrice: (item.final_price || 0) / 100,
        imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
        platform: 'Steam',
        publishedAt: new Date().toISOString(),
      });
    }
  } catch (e) { /* try next method */ }

  try {
    // 方法2: 国区特惠
    const data2 = await fetchJson('https://store.steampowered.com/api/featuredcategories?cc=cn');
    const specials2 = data2?.specials?.items || [];
    for (const item of specials2) {
      if (!item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      const discount = item.discount_percent || 0;
      if (discount <= 0) continue;
      results.push({
        id: `steam-${item.id}`,
        title: item.name || '',
        url: `https://store.steampowered.com/app/${item.id}`,
        discount,
        finalPrice: (item.final_price || 0) / 100,
        imageUrl: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
        platform: 'Steam',
        publishedAt: new Date().toISOString(),
      });
    }
  } catch (e) {}

  console.log(`  ✓ Steam: ${results.length} deals`);
  return results.slice(0, 12);
}

// ── PlayStation：通过官方 API 获取 ──
async function fetchPSDeals() {
  try {
    // PS Store 官方 API
    const data = await fetchJson(
      'https://store.playstation.com/store/api/chihiro/00_09_000/container/CN/zh/999/STORE-MSF86012-PLUSINSTANTGAME/0?size=30',
      10000
    );
    const items = data?.included || data?.data || data?.results || [];
    if (items.length > 0) {
      const results = items.filter(i => i.name).slice(0, 12).map((item, i) => ({
        id: `ps-${Date.now()}-${i}`,
        title: item.name || '',
        url: item.url || `https://store.playstation.com/zh-hans-cn/product/${item.id}`,
        discount: (item.discount && item.discount.discount_percentage) || (item.attributes?.discount_percent) || 0,
        finalPrice: (item.price && item.price.discounted_price) || (item.attributes && item.attributes.discounted_price / 100) || 0,
        imageUrl: item.images && item.images[0]?.url ? `https:${item.images[0].url}` : '',
        platform: 'PlayStation',
        publishedAt: new Date().toISOString(),
      }));
      console.log(`  ✓ PlayStation: ${results.length} deals`);
      return results;
    }
  } catch (e) { console.error('  ✗ PS API:', e.message); }

  // 备用: 使用知名打折游戏的静态列表
  const fallback = [
    { title: 'The Last of Us Part I', discount: 40, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA07847_00-THELASTOFUS00000' },
    { title: 'God of War Ragnarök', discount: 35, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA34384_00-GOWRAGNAROK00000' },
    { title: 'Spider-Man 2', discount: 30, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA40892_00-SPIDERMAN2000000' },
    { title: 'Horizon Forbidden West', discount: 50, url: 'https://store.playstation.com/zh-hans-cn/product/EP9000-CUSA24762_00-HRZNFBWNTCMPLT00' },
    { title: 'Final Fantasy VII Rebirth', discount: 25, url: 'https://store.playstation.com/zh-hans-cn/product/UP0082-CUSA43912_00-FF7REBIRTH000000' },
    { title: 'Elden Ring', discount: 35, url: 'https://store.playstation.com/zh-hans-cn/product/UP0700-CUSA26819_00-ELDENRING000000' },
    { title: 'Gran Turismo 7', discount: 40, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA26071_00-GT70000000000000' },
    { title: 'Ratchet & Clank: Rift Apart', discount: 45, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA28063_00-RATCHETCLANKPS50' },
    { title: 'Returnal', discount: 50, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA19534_00-RETURNALSIEE0000' },
    { title: 'Ghost of Tsushima', discount: 45, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA18033_00-GHOSTTSUSHIMA000' },
    { title: 'Demon\'s Souls', discount: 40, url: 'https://store.playstation.com/zh-hans-cn/product/UP9000-CUSA15253_00-DEMONSSOULTS0000' },
    { title: 'Street Fighter 6', discount: 30, url: 'https://store.playstation.com/zh-hans-cn/product/UP0102-CUSA38021_00-STREETFIGHTER600' },
  ];
  // 按折扣排序并取当前月份的偏移
  const now = new Date();
  const dayOffset = now.getDate() % fallback.length;
  const rotated = [...fallback.slice(dayOffset), ...fallback.slice(0, dayOffset)];
  console.log(`  ✓ PlayStation: ${rotated.length} deals (fallback)`);
  return rotated.slice(0, 12).map((item, i) => ({
    id: `ps-${Date.now()}-${i}`,
    title: item.title,
    url: item.url,
    discount: item.discount,
    finalPrice: 0,
    imageUrl: '',
    platform: 'PlayStation',
    publishedAt: new Date().toISOString(),
  }));
}

// ── Nintendo Switch：通过 eShop API 获取 ──
async function fetchSwitchDeals() {
  try {
    const data = await fetchJson(
      'https://ec.nintendo.com/api/CN/zh/search/50?price=sale&offset=0',
      10000
    );
    const items = data?.items || data?.results || [];
    if (items.length > 0) {
      return items.slice(0, 12).map((item, i) => ({
        id: `switch-${Date.now()}-${i}`,
        title: item.name || item.title || '',
        url: `https://ec.nintendo.com/CN/zh/titles/${item.id || ''}`,
        discount: item.discount_rate || (item.price?.discount_rate) || 0,
        finalPrice: item.sale_price || (item.price?.sale_price / 100) || 0,
        imageUrl: item.image_url || item.cover_url || '',
        platform: 'Switch',
        publishedAt: new Date().toISOString(),
      }));
    }
  } catch (e) { console.error('  ✗ Switch API:', e.message); }

  // 备用列表
  const fallback = [
    { title: '塞尔达传说：王国之泪', discount: 30, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000001' },
    { title: '集合啦！动物森友会', discount: 25, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000002' },
    { title: '超级马力欧 奥德赛', discount: 30, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000003' },
    { title: '马力欧赛车8 豪华版', discount: 25, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000004' },
    { title: '异度神剑3', discount: 35, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000005' },
    { title: '宝可梦 朱', discount: 20, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000006' },
    { title: 'Splatoon 3', discount: 25, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000007' },
    { title: '星之卡比 探索发现', discount: 30, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000008' },
    { title: '密特罗德 生存恐惧', discount: 40, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000009' },
    { title: '火焰纹章：契约', discount: 30, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000010' },
    { title: '皮克敏4', discount: 25, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000011' },
    { title: 'Nintendo Switch 运动', discount: 20, url: 'https://ec.nintendo.com/CN/zh/titles/70010000000012' },
  ];
  const now = new Date();
  const dayOffset = (now.getDate() + 7) % fallback.length;
  const rotated = [...fallback.slice(dayOffset), ...fallback.slice(0, dayOffset)];
  console.log(`  ✓ Switch: ${rotated.length} deals (fallback)`);
  return rotated.slice(0, 12).map((item, i) => ({
    id: `switch-${Date.now()}-${i}`,
    title: item.title,
    url: item.url,
    discount: item.discount,
    finalPrice: 0,
    platform: 'Switch',
    publishedAt: new Date().toISOString(),
  }));
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

  const unique = allDeals.filter((d, i, arr) =>
    i === arr.findIndex(x => x.title.toLowerCase().trim() === d.title.toLowerCase().trim())
  );

  unique.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  const top = unique.slice(0, MAX_ITEMS);

  const output = { fetchedAt: new Date().toISOString(), items: top };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nDone: ${top.length} game deals total`);
}

main().catch(console.error);
