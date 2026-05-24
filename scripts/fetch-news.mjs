#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'AI-News-Hub/1.0' },
  customFields: {
    item: [
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SOURCES = [
  // International AI sources
  { name: 'TechCrunch', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'industry' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'industry' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'research' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: 'research' },
  { name: 'Google AI', url: 'https://blog.research.google/atom.xml', category: 'research' },
  { name: 'Meta AI', url: 'https://ai.meta.com/blog/feed.xml', category: 'research' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', category: 'research' },
  { name: 'OpenAI', url: 'https://openai.com/blog/rss.xml', category: 'industry' },
  // Chinese AI & tech sources
  { name: '36氪', url: 'https://36kr.com/feed', category: 'industry' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed', category: 'industry' },
  { name: '钛媒体', url: 'https://www.tmtpost.com/rss.xml', category: 'industry' },
  { name: 'IT之家', url: 'https://www.ithome.com/rss', category: 'industry' },
  // Chinese gaming sources
  { name: '机核网', url: 'https://www.gcores.com/rss', category: 'gaming' },
];

function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return slug || 'untitled';
}

// Patterns to strip from content — login prompts, ads, lottery, boilerplate
const JUNK_PATTERNS = [
  /登录\s*(注册)?\s*(免费)?\s*(订阅)?\s*(阅读)?\s*(全文)?\s*(查看)?\s*(更多)?/gi,
  /免费\s*(订阅|注册)/gi,
  /点击\s*(阅读|查看|下载|订阅|关注)/gi,
  /本文\s*(来自|来源于|转载|出处)/gi,
  /扫描\s*二维码/gi,
  /关注\s*(我们|公众号)/gi,
  /微信\s*(搜索|扫码)/gi,
  /投稿|商务合作|广告|推广/gi,
  /免责声明|版权声明|免责条款/gi,
  /Copyright\s+\d+/gi,
  /All\s+[Rr]ights\s+[Rr]eserved/gi,
  /未经.*(许可|授权|允许).*不得/gi,
  /\[领取.*\]|抽奖|奖品|抽送|红包|福利/gi,
  /分享到|转发|点赞|在看/gi,
  /阅读原文|了解更多/gi,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
];

function cleanContent(text) {
  if (!text) return '';
  let cleaned = text;
  for (const pattern of JUNK_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s*[\r\n]/gm, '\n');
  return cleaned.trim();
}

function generateSummary(text, maxLen = 400) {
  if (!text) return '';
  const cleaned = cleanContent(text);
  const sentences = cleaned.split(/(?<=[。！？.!?\n])\s*/).filter((s) => s.trim().length > 10);
  let summary = '';
  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLen) {
      if (!summary) return sentence.slice(0, maxLen) + '…';
      break;
    }
    summary += sentence;
  }
  return summary || cleaned.slice(0, maxLen).trim();
}

function extractImage(item) {
  // 1. media:thumbnail — most reliable for video thumbnails
  const thumb = item.mediaThumbnail;
  if (thumb) {
    if (typeof thumb === 'string') return thumb;
    if (thumb?.$?.url) return thumb.$.url;
    if (thumb?.url) return thumb.url;
    if (Array.isArray(thumb) && thumb[0]?.$?.url) return thumb[0].$.url;
  }

  // 2. Check media:content — only return image types, skip video
  const mediaContent = item['media:content'];
  if (mediaContent?.$) {
    const { url, type, medium } = mediaContent.$;
    if (url) {
      if (type?.startsWith('image/')) return url;
      if (medium === 'image') return url;
      // Skip video URLs — they won't render as <img>
      if (!type?.startsWith('video/') && medium !== 'video') {
        return url;
      }
    }
  }

  // 3. Check enclosure — skip video types
  if (item.enclosure?.url) {
    const type = item.enclosure.type;
    if (!type || !type.startsWith('video/')) {
      return item.enclosure.url;
    }
  }

  // 4. Try to extract YouTube thumbnail from article URL
  if (item.link) {
    const match = item.link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  // 5. Parse HTML content for <img> tags
  const content = item['content:encoded'] || item.content || '';
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) return imgMatch[1];

  // 6. Check for YouTube embed iframe in content
  const ytMatch = content.match(
    /(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;

  // 7. Raw media:thumbnail in content (fallback)
  const rawMatch = content.match(/media:thumbnail\s+[^>]*?url="([^"]+)"/);
  if (rawMatch) return rawMatch[1];

  return undefined;
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
    const items = (feed.items || []).slice(0, 15).map((item) => {
      const rawContent = item.contentSnippet || item.content || '';
      return {
        id: slugify(item.title || '') + '-' + Date.now(),
        title: item.title || 'Untitled',
        url: item.link || '',
        summary: generateSummary(rawContent, 400),
        fullContent: cleanContent(rawContent).slice(0, 3000),
        source: source.name,
        category: source.category,
        publishedAt: parseDate(item),
        imageUrl: extractImage(item),
        type: 'article',
      };
    });
    console.log(`  ✓ ${source.name}: ${items.length} items`);
    return items;
  } catch (err) {
    console.error(`  ✗ ${source.name}: ${err.message}`);
    return [];
  }
}

function removeOldNews(items) {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  return items.filter((item) => {
    const time = new Date(item.publishedAt).getTime();
    return !isNaN(time) && time >= cutoff;
  });
}

function mergeNews(existing, incoming) {
  const map = new Map();
  for (const item of existing) map.set(item.url, item);
  for (const item of incoming) map.set(item.url, item);
  const merged = [...map.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return removeOldNews(merged);
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
  const fresh = deduped.slice(0, 100);

  const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');
  const existing = readExistingData(dataPath);
  const merged = mergeNews(existing, fresh);

  const removed = existing.length - removeOldNews(existing).length;
  if (removed > 0) console.log(`  🗑 Cleaned ${removed} items older than 7 days`);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${fresh.length} new items, ${merged.length} total after cleanup`);
}

main().catch(console.error);
