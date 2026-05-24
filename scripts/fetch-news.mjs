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

// Only Chinese domestic news sources
const SOURCES = [
  { name: '36氪', url: 'https://36kr.com/feed', category: 'business' },
  { name: '爱范儿', url: 'https://www.ifanr.com/feed', category: 'tech' },
  { name: '钛媒体', url: 'https://www.tmtpost.com/rss.xml', category: 'business' },
  { name: 'IT之家', url: 'https://www.ithome.com/rss', category: 'tech' },
  { name: '机核网', url: 'https://www.gcores.com/rss', category: 'gaming' },
];

// Keyword rules for auto-categorization (overrides source default)
const CATEGORY_RULES = [
  {
    category: 'ai',
    keywords: [
      'ai', '人工智能', '大模型', 'gpt', 'llm', 'openai', 'chatgpt', 'claude',
      'gemini', 'llama', 'deepseek', 'qwen', '通义', '文心', '星火', '混元',
      'neural', '深度学习', '机器学习', 'pytorch', 'tensorflow', 'hugging face',
      'copilot', 'agi', 'transformer', 'diffusion', 'stable diffusion',
      'computer vision', '计算机视觉', 'nlp', '自然语言处理',
      '强化学习', 'reinforcement learning', '多模态', 'multimodal',
      '向量', 'embedding', 'ai agent', 'ai agent', '智能体',
      '推理', 'inference', '模型', 'model', '训练', 'training',
    ],
  },
  {
    category: 'tech',
    keywords: [
      'iphone', 'android', '芯片', '处理器', '手机', '电脑', '笔记本',
      '华为', '小米', 'apple', 'samsung', '5g', '6g', '操作系统',
      '软件', 'app', 'ios', 'mac', 'windows', 'linux', '智能',
      '可穿戴', 'vr', 'ar', '自动驾驶', '电动汽车', '机器人',
      'iot', '传感器', '显卡', 'gpu', 'cpu', '固态', 'ssd', '内存',
      '屏幕', '显示器', '电池', '充电', '数码', '科技',
    ],
  },
  {
    category: 'business',
    keywords: [
      '融资', '上市', '收购', '投资', '财报', '营收', '利润', '市值',
      '创业', '独角兽', 'ipo', '估值', '股票', '股东', '股市',
      '监管', '反垄断', '合规', '裁员', '招聘', '比特币', '加密货币',
      '区块链', 'web3', '元宇宙', '量化', '基金', '金融',
    ],
  },
];

function autoCategorize(title, summary, defaultCategory) {
  const text = (title + ' ' + summary).toLowerCase();
  const scores = {};
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) scores[rule.category] = score;
  }
  if (Object.keys(scores).length === 0) return defaultCategory;
  // Return the category with the highest keyword match count
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

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
      const title = item.title || 'Untitled';
      const summary = generateSummary(rawContent, 400);
      // Auto-categorize based on title + summary keywords
      const category = autoCategorize(title, summary, source.category);
      return {
        id: slugify(title) + '-' + Date.now(),
        title,
        url: item.link || '',
        summary,
        fullContent: cleanContent(rawContent).slice(0, 3000),
        source: source.name,
        category,
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
  console.log('Fetching RSS feeds from Chinese sources...');

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

  // Re-categorize existing items too (in case category rules changed)
  const recategorized = existing.map((item) => {
    if (item.category === 'research' || item.category === 'industry') {
      // Map old categories to new ones
      const newCat = autoCategorize(item.title, item.summary || '', 'tech');
      return { ...item, category: newCat };
    }
    return item;
  });

  const merged = mergeNews(recategorized, fresh);

  const removed = recategorized.length - removeOldNews(recategorized).length;
  if (removed > 0) console.log(`  \u{1F5D1} Cleaned ${removed} items older than 7 days`);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${fresh.length} new items, ${merged.length} total after cleanup`);
}

main().catch(console.error);
