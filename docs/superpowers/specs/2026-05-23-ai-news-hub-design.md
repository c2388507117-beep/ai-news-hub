# AI News Hub — 设计文档

## 概述

自动聚合国外主流 AI 新闻源，生成静态网站，每天 08:00 / 18:00（北京时间）更新。面向国内网络环境优化，部署在 Cloudflare Pages。

## 技术栈

| 层面 | 选型 |
|------|------|
| 框架 | Astro 5.x |
| 样式 | Tailwind CSS 4.x |
| 搜索 | Pagefind |
| 数据抓取 | Node.js (rss-parser, @octokit/rest) |
| 定时任务 | GitHub Actions |
| 部署 | Cloudflare Pages |

## 架构

```
GitHub Actions (scheduled)
  │
  ├─ scripts/fetch-news.mjs      → RSS feeds → src/data/news.json
  ├─ scripts/fetch-trending.mjs  → GitHub API → src/data/news.json (append)
  │
  └─ npx astro build + pagefind  → dist/
       │
       └─ Cloudflare Pages

User Browser → Cloudflare CDN → static assets
```

## 新闻来源

### RSS/Atom Feeds
| 源 | URL | 分类 |
|---|---|---|
| TechCrunch AI | https://techcrunch.com/category/artificial-intelligence/feed/ | 行业动态 |
| The Verge AI | https://www.theverge.com/ai-artificial-intelligence/rss.xml | 行业动态 |
| Ars Technica AI | https://feeds.arstechnica.com/arstechnica/index | 研究突破 |
| Hugging Face Blog | https://huggingface.co/blog/feed.xml | 开源工具 |
| Google AI Blog | https://blog.research.google/atom.xml | 研究突破 |
| Meta AI Blog | https://ai.meta.com/blog/feed.xml | 研究突破 |
| MIT Tech Review AI | https://www.technologyreview.com/topic/artificial-intelligence/feed/ | 研究突破 |
| OpenAI Blog | https://openai.com/blog/rss.xml | 行业动态 |

### GitHub Trending
- 抓取 GitHub Trending 上 AI/ML 相关仓库（按 stars 排序）
- 分类标记为"热门项目"

## 数据模型

```typescript
interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;          // 来源名称
  category: Category;      // 分类枚举
  publishedAt: string;     // ISO 8601
  imageUrl?: string;       // 配图
  type: 'article' | 'repo';
  // repo 专用字段
  stars?: number;
  language?: string;
}

type Category = 'research' | 'industry' | 'opensource' | 'trending' | 'policy';
```

## 分类体系

| 分类 | 标签 | 说明 |
|------|------|------|
| 研究突破 | 🔬 research | 论文、模型发布、技术突破 |
| 行业动态 | 🏢 industry | 融资、收购、商业新闻 |
| 开源工具 | 🛠 opensource | 开源项目、工具发布 |
| 热门项目 | 📦 trending | GitHub Trending AI 仓库 |
| 政策监管 | 🏛 policy | 法律法规、伦理安全 |

## 页面设计

### 页面清单
1. **首页** (`/`) — 新闻卡片列表，支持分类筛选和搜索
2. **搜索** (`/search`) — 搜索结果页（Pagefind 驱动）
3. **RSS Feed** (`/rss.xml`) — 提供站点头条订阅

### UI 组件
- `BaseLayout.astro` — 全局布局（导航 + 页脚）
- `CategoryNav.astro` — 分类选项卡（横向滚动）
- `NewsCard.astro` — 新闻卡片（配图、来源、标题、摘要、时间、分类标签）
- `SearchBox.astro` — 搜索输入框
- `Footer.astro` — 页脚（更新时间和数据来源）

### 视觉风格
- 浅色默认 + 深色模式（跟随系统）
- 卡片式布局，响应式设计
- 来源 favicon + 名称标识
- 相对时间显示（"2小时前"）
- GitHub 项目显示星标数和编程语言

## GitHub Actions 工作流

文件：`.github/workflows/fetch-and-deploy.yml`

```yaml
name: Fetch News and Deploy
on:
  schedule:
    - cron: '0 0 * * *'   # 00:00 UTC = 08:00 CST
    - cron: '0 10 * * *'  # 10:00 UTC = 18:00 CST
  workflow_dispatch:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: node scripts/fetch-news.mjs
      - run: node scripts/fetch-trending.mjs
      - run: npx astro build
      - run: npx pagefind --site dist
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=ai-news-hub
```

## 国内访问优化

- 所有资源托管在 Cloudflare Pages（国内有 PoP 节点）
- 避免使用 Google Fonts，使用系统字体栈
- 无外部依赖运行时（纯静态页面）
- 图片使用外部源链接，不额外存储

## 项目结构

```
ai-news-hub/
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── rss.xml.ts
│   │   └── search.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── NewsCard.astro
│   │   ├── CategoryNav.astro
│   │   ├── SearchBox.astro
│   │   └── Footer.astro
│   ├── data/
│   │   └── news.json          # 由抓取脚本生成
│   └── lib/
│       └── types.ts           # 类型定义
├── scripts/
│   ├── fetch-news.mjs         # RSS 抓取
│   └── fetch-trending.mjs     # GitHub Trending
├── public/
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── .github/workflows/
    └── fetch-and-deploy.yml
```
