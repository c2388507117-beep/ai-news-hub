# Phase 5: 🚀 新功能 — 实施计划

> **方案 A（分批）：** 第一批数据/API → 第二批可视化/页面

**Goal:** 添加 6 个新功能，分两批交付。

---

## 第一批：数据 & API

### Task 1: 历史上的今天

**Files:**
- Create: `scripts/fetch-today-history.mjs`
- Create: `src/components/TodayHistory.astro`
- Data: `src/data/today-history.json`
- Modify: `src/pages/index.astro`（引用组件）
- Modify: `.github/workflows/fetch-and-deploy.yml`（添加步骤）

免费 API: `https://api.bykaii.com/today-history/`

```javascript
// scripts/fetch-today-history.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'today-history.json');

async function main() {
  const res = await fetch('https://api.bykaii.com/today-history/', {
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  
  const output = {
    fetchedAt: new Date().toISOString(),
    items: (data.data || []).slice(0, 5).map(item => ({
      year: item.year || '',
      title: item.title || '',
      desc: item.desc || '',
    })),
  };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Today in history: ${output.items.length} events`);
}
main().catch(console.error);
```

组件代码侧：一个紧凑卡片，显示 3-5 条历史事件，年份 + 标题。

---

### Task 2: 多城市天气

**Files:**
- Modify: `src/components/XingtaiWeather.astro`

将 XingtaiWeather 改为支持多城市。用户通过下拉选择城市，选中的存 localStorage。城市数据硬编码（北京、上海、广州、深圳、成都、杭州 + 邢台保留）。

天气 API 使用 wttr.in（免费，无需 key）：`https://wttr.in/{city}?format=j1`

---

### Task 3: 掘金/知乎 RSS 扩展

**Files:**
- Modify: `scripts/fetch-news.mjs`

在 SOURCES 数组添加：
```javascript
  { name: '掘金', url: 'https://rsshub.app/juejin/trending', category: 'tech' },
  { name: '知乎日报', url: 'https://rsshub.app/zhihu/daily', category: 'tech' },
```

（RSSHub 实例可能被限流，需要备选方案或自建实例）

---

## 第二批：可视化 & 页面

### Task 4: GitHub 星标趋势图

**Files:**
- Create: `src/components/StarTrend.astro`
- Modify: `src/pages/index.astro`

向 `fetch-trending.mjs` 添加历史星标数据存储。每次抓取时记录 TOP 10 仓库的星标数到 `src/data/star-history.json`。组件用 Chart.js CDN 画折线图。

---

### Task 5: AI 产品发布日历

**Files:**
- Create: `src/data/ai-events.json`（手动维护 + 自动抓取）
- Create: `src/components/AIEventCalendar.astro`
- Modify: `src/pages/index.astro`

维护一个结构化的 AI 产品发布时间线：OpenAI DevDay、Google I/O、Claude 版本发布等。组件用时间线样式展示。

---

### Task 6: 科技大事件时间线

**Files:**
- Create: `src/data/tech-milestones.json`
- Create: `src/components/TechTimeline.astro`
- Modify: `src/pages/index.astro` 或新页面 `/timeline`

与 `/weekly` 联动，按月归档。从 news.json 中自动提取重要事件，按时间排序展示。
