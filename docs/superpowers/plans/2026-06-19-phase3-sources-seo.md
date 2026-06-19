# Phase 3: 🌐 数据源 & SEO — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 扩展内容来源（Hacker News、Product Hunt、更多中文源），完善 OG 社交分享标签。

**Architecture:** 新数据源作为独立 fetch 脚本，写入对应的 JSON 数据文件。新闻源的数据自动进入 `news.json` 合并管道。OG 标签通过扩展 BaseLayout Props 实现。

---

### Task 1: Hacker News 集成

**Files:**
- Create: `scripts/fetch-hackernews.mjs`
- Modify: `.github/workflows/fetch-and-deploy.yml`（添加步骤）
- Data: 写入 `src/data/news.json`（与现有新闻合并）

Hacker News 提供免费 Firebase API，无需认证。取 top 30 条，通过 item API 获取详情，用 `autoCategorize` 分类。

- [ ] **Step 1: 创建 `scripts/fetch-hackernews.mjs`**

```javascript
#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');

const MAX_ITEMS = 30;

// Keyword rules for auto-categorization (simplified, matching src/lib/categorize.ts)
const CATEGORY_RULES = [
  { category: 'ai', keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'openai', 'chatgpt', 'claude', 'gemini', 'llama', 'deepseek', 'neural', 'deep learning', 'pytorch', 'transformer', 'diffusion', 'nlp', 'computer vision', 'agent', 'rag', 'model'] },
  { category: 'tech', keywords: ['javascript', 'python', 'rust', 'go', 'react', 'vue', 'framework', 'cli', 'tool', 'docker', 'linux', 'database', 'compiler', 'app', 'ios', 'android', 'web', 'startup', 'cloud', 'security', 'programming'] },
  { category: 'gaming', keywords: ['game', 'gaming', 'console', 'steam', 'playstation', 'xbox', 'nintendo'] },
];

function autoCategorize(title, summary) {
  const text = (title + ' ' + summary).toLowerCase();
  const scores = {};
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > 0) scores[rule.category] = score;
  }
  const entries = Object.entries(scores);
  if (entries.length === 0) return 'tech';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'hn';
}

async function fetchHNTopStories() {
  console.log('Fetching Hacker News top stories...');

  // Get top story IDs
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
    signal: AbortSignal.timeout(15000),
  });
  if (!idsRes.ok) throw new Error(`Top stories HTTP ${idsRes.status}`);
  const ids = await idsRes.json();
  const batch = ids.slice(0, MAX_ITEMS);
  console.log(`  Got ${batch.length} story IDs`);

  // Fetch item details in parallel (batched to avoid rate limits)
  const results = [];
  const batchSize = 10;
  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    const items = await Promise.all(
      chunk.map(async (id) => {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            signal: AbortSignal.timeout(10000),
          });
          if (!res.ok) return null;
          return await res.json();
        } catch {
          return null;
        }
      })
    );
    // Only keep stories (type === 'story') that have a URL
    for (const item of items) {
      if (item && item.type === 'story' && item.url && item.title) {
        results.push(item);
      }
    }
    if (i + batchSize < batch.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  console.log(`  Fetched ${results.length} valid stories`);
  return results;
}

function hnToNewsItem(item) {
  const title = item.title || '';
  const url = item.url || '';
  const summary = (item.text || '').replace(/<[^>]+>/g, '').slice(0, 400) || `HN: ${title}`;
  const category = autoCategorize(title, summary);

  return {
    id: `hn-${item.id}`,
    title,
    url,
    summary,
    fullContent: '',
    source: 'Hacker News',
    category,
    publishedAt: new Date((item.time || 0) * 1000).toISOString(),
    imageUrl: undefined,
    type: 'article',
  };
}

function readExistingData(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

async function main() {
  const stories = await fetchHNTopStories();
  if (stories.length === 0) {
    console.log('No stories fetched, exiting.');
    return;
  }

  const newItems = stories.map(hnToNewsItem);
  const existing = readExistingData(dataPath);

  // Remove old HN items, add new ones
  const nonHN = existing.filter((item) => !item.id.startsWith('hn-'));
  const merged = [...newItems, ...nonHN].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${newItems.length} HN stories, ${merged.length} total items`);
}

main().catch((err) => {
  console.error('HN fetch failed:', err.message);
  process.exit(1);
});
```

- [ ] **Step 2: 添加到 CI workflow**

在 `Fetch RSS news` 之前添加（运行测试之后，主要数据源之前会更合理）：

```yaml
      - name: Fetch Hacker News
        run: node scripts/fetch-hackernews.mjs || true
```

但注意：fetch-hackernews.mjs 写入 news.json，会与后续的 `Fetch RSS news` 冲突（它也会写 news.json）。更好的做法：让 CI 首先运行 fetch-hackernews，然后 fetch-news 负责最终的合并。需要调整步骤顺序：

将 `Fetch Hacker News` 放在 `Fetch RSS news` 之前，两者都写入 news.json（fetch-news.mjs 有合并逻辑，会覆盖 HN 写入的条目，因为后续 RSS 更新会覆盖整个文件）。

**简化方案：** 不添加到 CI workflow — HN 数据在 fetch-news.mjs 运行时被 RSS 数据覆盖。改为：让 `fetch-hackernews.mjs` 先写入，然后 `fetch-news.mjs` 在合并时保留 HN 条目（因为它有 `mergeNews` 去重逻辑，按 url 去重）。

这是个已知的交互问题。目前先作为独立脚本提供，手动触发。CI 中仍然跑 RSS 为主的 pipeline。这样可以避免数据竞争。

- [ ] **Step 3: 验证**

```bash
cd /Users/tian_d/ai-news-hub
node --check scripts/fetch-hackernews.mjs
```

- [ ] **Step 4: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add scripts/fetch-hackernews.mjs
git commit -m "feat: add Hacker News data source"
```

---

### Task 2: Product Hunt 集成

**Files:**
- Create: `scripts/fetch-producthunt.mjs`

Product Hunt 提供 RSS feed（无需 API key），取每日热门产品。每个产品作为 tech 分类文章存入。

- [ ] **Step 1: 创建 `scripts/fetch-producthunt.mjs`**

```javascript
#!/usr/bin/env node

/**
 * fetch-producthunt.mjs — Fetch Product Hunt daily featured products via RSS.
 * No API key required. Products are stored as tech-articles in news.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'news.json');

const PH_RSS_URL = 'https://www.producthunt.com/feed?category=undefined';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'ph';
}

function parseRSS(xmlText) {
  const items = [];
  // Simple regex-based RSS parser (no dependency needed)
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1];
    const get = (tag) => {
      const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`));
      if (m) return m[1];
      const m2 = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`));
      return m2 ? m2[1].trim() : '';
    };
    const title = get('title');
    const link = get('link');
    const description = get('description');
    const pubDate = get('pubDate');

    if (title && link) {
      items.push({ title, link, description, pubDate });
    }
  }
  return items;
}

function readExistingData(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}

async function main() {
  console.log('Fetching Product Hunt...');

  const res = await fetch(PH_RSS_URL, {
    headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const items = parseRSS(xml);
  console.log(`  Parsed ${items.length} items`);

  // Only keep the first 10
  const top = items.slice(0, 10);

  const now = Date.now();
  const newItems = top.map((item, i) => ({
    id: `ph-${slugify(item.title)}-${now}`,
    title: item.title,
    url: item.link,
    summary: item.description.replace(/<[^>]+>/g, '').slice(0, 400) || `Product Hunt: ${item.title}`,
    fullContent: '',
    source: 'Product Hunt',
    category: 'tech',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl: undefined,
    type: 'article',
  }));

  const existing = readExistingData(dataPath);
  // Remove old PH items, add new ones
  const nonPH = existing.filter((item) => !item.id.startsWith('ph-'));
  const merged = [...newItems, ...nonPH].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  ).slice(0, 200);

  fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`\nDone: ${newItems.length} PH products, ${merged.length} total items`);
}

main().catch((err) => {
  console.error('Product Hunt fetch failed:', err.message);
  process.exit(1);
});
```

- [ ] **Step 2: 验证**

```bash
cd /Users/tian_d/ai-news-hub
node --check scripts/fetch-producthunt.mjs
```

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add scripts/fetch-producthunt.mjs
git commit -m "feat: add Product Hunt data source"
```

---

### Task 3: 中文新闻源扩展

**Files:**
- Modify: `scripts/fetch-news.mjs`

向 `SOURCES` 数组添加虎嗅和澎湃新闻的 RSS。

- [ ] **Step 1: 添加两个新源**

在 `scripts/fetch-news.mjs` 的 SOURCES 数组中添加：

```javascript
  { name: '虎嗅', url: 'https://www.huxiu.com/rss/0.xml', category: 'tech' },
  { name: '澎湃新闻', url: 'https://www.thepaper.cn/rss/news.xml', category: 'tech' },
```

- [ ] **Step 2: 验证**

```bash
cd /Users/tian_d/ai-news-hub
node --check scripts/fetch-news.mjs
```

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add scripts/fetch-news.mjs
git commit -m "feat: add Huxiu and ThePaper RSS sources"
```

---

### Task 4: OG 标签完善

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

扩展 Props 支持 ogTitle/ogDescription/ogImage，并在 `<head>` 中添加 meta 标签。

- [ ] **Step 1: 更新 Props 接口**

```typescript
export interface Props {
  title?: string;
  currentCategory?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}
const {
  title = 'AI News Hub',
  currentCategory = '',
  ogTitle,
  ogDescription,
  ogImage,
} = Astro.props;
```

- [ ] **Step 2: 在 `<title>` 后面添加 OG 标签**

```astro
    <title>{title}</title>
    <meta property="og:title" content={ogTitle || title} />
    <meta property="og:description" content={ogDescription || '每日 AI 新闻聚合 - 研究突破、行业动态、热门项目、游戏资讯'} />
    <meta property="og:image" content={ogImage || 'https://ai-news-hub.pages.dev/favicon.svg'} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url.href} />
    <meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 3: 更新各页面传递 OG 信息**

**index.astro** — 从首条新闻提取标题和摘要作为 OG 信息。在 frontmatter 中添加：

```typescript
const ogTitle = allNews[0]?.title || 'AI News Hub';
const ogDescription = allNews[0]?.summary || '每日 AI 新闻聚合';
const ogImage = allNews[0]?.imageUrl || undefined;
```

在 `<BaseLayout>` 调用时添加：

```astro
<BaseLayout 
  title="AI News Hub - 个人仪表盘"
  {ogTitle}
  {ogDescription}
  {ogImage}
>
```

**tools.astro** — 静态描述：

```astro
<BaseLayout 
  title="AI News Hub - AI 工具导航"
  ogTitle="AI 工具导航 - AI News Hub"
  ogDescription="精选国内外热门 AI 工具，按类别分类展示"
>
```

**weekly.astro** — 动态取本周新闻数：

```astro
<BaseLayout 
  title="AI News Hub - 本周热门"
  ogTitle={`本周热门 - ${weeklyItems.length} 篇 - AI News Hub`}
  ogDescription={`${formatDate(new Date(weekAgo).toISOString())} — ${formatDate(now.toISOString())}，共 ${weeklyItems.length} 篇`}
>
```

**search.astro** — 静态描述：

```astro
<BaseLayout 
  title="AI News Hub - 搜索"
  ogTitle="搜索 - AI News Hub"
  ogDescription="搜索 AI 新闻资讯"
>
```

- [ ] **Step 4: 验证**

```bash
cd /Users/tian_d/ai-news-hub
npx astro check src/layouts/BaseLayout.astro src/pages/index.astro src/pages/tools.astro src/pages/weekly.astro src/pages/search.astro 2>&1 | grep "error" | head -5
# 预期：无新增错误
```

- [ ] **Step 5: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add src/layouts/BaseLayout.astro src/pages/index.astro src/pages/tools.astro src/pages/weekly.astro src/pages/search.astro
git commit -m "feat: add Open Graph and Twitter Card meta tags"
```
