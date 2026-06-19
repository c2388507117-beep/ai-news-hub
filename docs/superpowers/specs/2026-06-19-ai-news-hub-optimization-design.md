# AI News Hub — 全面优化设计文档

> 日期: 2026-06-19
> 状态: Draft
> 作者: Claude

## 概述

对 AI News Hub 个人仪表盘项目进行全面优化，涵盖 Bug 修复、基础设施、数据源、UI/UX 和高阶功能五大阶段，提升可靠性、开发体验和用户感知。

---

## 阶段划分

### Phase 1: 🔧 修复基石

**目标：** 消灭已知 bug，加固类型系统，建立测试防线。

| # | 任务 | 详情 |
|---|------|------|
| 1.1 | Fix trending 分类 | `fetch-trending.mjs` 写入 `trending` 分类不存在于 `Category` 类型，导致文章在分类筛选时不可见。方案：在 `fetch-trending.mjs` 中将 `trending` 替换为映射逻辑（按标题关键词映射到 `ai`/`tech`/`gaming`）；在 `index.astro` 中添加 "热门仓库" 作为可选的临时分类标签。 |
| 1.2 | Fix `/api/update` | index.astro 中"🔄 更新新闻"按钮请求 `/api/update`，该端点不存在。方案：删除该按钮及其全部 JS 逻辑（在 CI/CD 自动抓取建立后失去意义）。 |
| 1.3 | 旧数据迁移 | 扫描 news.json，将 `research`、`industry`、`trending`、`popular` 等废弃分类映射到当前 `Category` 类型（`ai`/`tech`/`business`/`gaming`），确保所有已有数据正确显示。 |
| 1.4 | TypeScript strict 模式 | 开启 `tsconfig.json` 中 `strict: true`，修复所有类型错误。重点是：空值检查（`allNews`/`relatedItems`）、`any` 类型替换为具体类型、组件 Props 的完整类型标注。 |
| 1.5 | 单元测试 | 用 vitest 为 `scripts/fetch-news.mjs` 中的核心函数写测试：`autoCategorize()`、`extractKeywords()`、`getRelated()`、`cleanContent()`。测试数据使用静态 fixture。 |

**涉及文件：** `tsconfig.json`、`scripts/fetch-trending.mjs`、`src/pages/index.astro`、`src/data/news.json`、`src/lib/types.ts` + 新建 `src/lib/__tests__/*.test.ts`

---

### Phase 2: 🏗️ 基础设施

**目标：** 数据自动更新，代码即部署。

| # | 任务 | 详情 |
|---|------|------|
| 2.1 | GitHub Actions — 定时抓取 | 新建 `.github/workflows/fetch-data.yml`，每天 UTC 0/6/12/18 点运行所有 `scripts/fetch-*.mjs` 脚本。使用 `actions/checkout` + node 20，运行完毕后 `git commit` + `git push` 数据变更。注意：需要配置 GitHub token 用于 push。 |
| 2.2 | GitHub Actions — 自动部署 | 在现有或新建 workflow 中，main 分支 push 后自动 `npm run build` → deploy 到 Cloudflare Pages（用 `wrangler pages deploy` 或 CF Pages 的 Git 集成）。 |
| 2.3 | 统一 fetch 编排脚本 | 新建 `scripts/fetch-all.mjs`，按依赖顺序串行运行所有 fetch 脚本，统一错误处理和日志输出。便于 CI 单步调用。 |

**涉及文件：** `.github/workflows/fetch-data.yml`、`.github/workflows/deploy.yml`、`scripts/fetch-all.mjs`

---

### Phase 3: 🌐 数据源 & SEO

**目标：** 扩展内容来源，完善社交分享。

| # | 任务 | 详情 |
|---|------|------|
| 3.1 | Hacker News 集成 | 通过 `https://hacker-news.firebaseio.com/v0/topstories.json` + `/v0/item/{id}.json` 获取前 30 条最新热门文章。自动分类为 `tech`/`ai`。新建 `scripts/fetch-hackernews.mjs`。 |
| 3.2 | Product Hunt 集成 | 通过 Product Hunt Token API 或 RSS 获取每日新品。新建 `scripts/fetch-producthunt.mjs`。 |
| 3.3 | 中文新闻源扩展 | 添加虎嗅（RSS）、澎湃新闻（RSS）等源到 `fetch-news.mjs` 的 `SOURCES` 数组。 |
| 3.4 | OG 标签完善 | `BaseLayout.astro` 增加 `<meta property="og:title">`、`og:description`、`og:image`，从首页前几条新闻动态提取。每页可通过 Astro.props 传入覆盖。 |

**涉及文件：** `scripts/fetch-hackernews.mjs`、`scripts/fetch-producthunt.mjs`、`scripts/fetch-news.mjs`、`src/layouts/BaseLayout.astro`、`src/pages/*.astro`

---

### Phase 4: ✨ 体验升级

**目标：** 更流畅、现代的浏览体验。

| # | 任务 | 详情 |
|---|------|------|
| 4.1 | 无限滚动 | 移除分页按钮 UI。在 `index.astro` 的 script 中用 IntersectionObserver 监听哨兵元素，自动加载后续 10 条。配合已有懒加载数据（`loadAllData()`），无缝切换。保留分类过滤功能。 |
| 4.2 | 骨架屏 | 替换当前 `animate-pulse` loading 区块为完整的 Tailwind 骨架屏组件：新闻列表骨架（卡片形状）、StockMarket 骨架（表格行）、StockMarket 骨架等。每个骨架屏匹配最终内容的尺寸和布局，减少布局偏移。添加适当的 `aria-label` 属性。 |
| 4.3 | 过渡动画 | 分类切换时使用 CSS `transition` 做淡入（opacity 0→1），翻页时用 `transform` 滑动。通过 `@starting-style` 或 `animation-fill-mode` 做进入动画。全局添加 `prefers-reduced-motion` 尊重无障碍设置。|
| 4.4 | 图片优化 | 将新闻卡片的 `<img>` 改为 Astro `<Image />` 组件（需集成 `@astrojs/image` 或使用 Astro 5 内置的 `sharp` 支持）。对卡片缩略图做尺寸裁剪（64×64），对展开大图做 responsive sizes。 |

**涉及文件：** `src/pages/index.astro`、`src/components/NewsCard.astro`、`src/components/StockMarket.astro`、`src/components/WorldMap.astro`、`astro.config.mjs`

---

### Phase 5: 🚀 高级功能

**目标：** 增强内容价值和个性化。

| # | 任务 | 详情 |
|---|------|------|
| 5.1 | 自动周报 | 增强已有 `/weekly` 页面，改为"本周 AI 大事记"样式。按热度（星标/评论/来源权威性）排序，为顶部 3 篇生成简要趋势分析段落。周末抓取时触发周报生成脚本 `scripts/generate-weekly.mjs`，输出为独立 JSON 文件。 |
| 5.2 | 自动月报 | 与周报类似，按月汇总。每月 1 号运行 `scripts/generate-monthly.mjs`，识别本月最高热度话题、数据趋势、新入库工具。存储为 `src/data/reports/monthly-YYYY-MM.json`。在首页以组件形式展示摘要。 |
| 5.3 | 可定制首页布局 | 各小组件（DailyDigest、StockMarket、WorldMap 等）添加拖拽排序功能。使用 localStorage 存储顺序和显示/隐藏状态。用已有的 `id` 选择器 + HTML Drag and Drop API 实现，不引入额外依赖。保存后定稿，刷新恢复。 |

**涉及文件：** `src/pages/weekly.astro`、`src/pages/index.astro`、`src/data/`、`scripts/generate-weekly.mjs`、`scripts/generate-monthly.mjs`、`src/components/DraggableGrid.astro`（新建）

---

## 优先级考虑

- **Phase 1 必须先做** — 所有后续阶段依赖更可靠的代码基
- **Phase 2 可部分并行** — CI/CD 配置与 Phase 1 测试不冲突
- **Phase 3-5 顺序灵活** — 可按兴趣调整，无强依赖

## 不包含（已与用户确认排除）

- 安全加固（Basic Auth 保持不变）
- 标签云 / 热门关键词
- 每日邮件订阅
- 书签 / 稍后读
- 阅读时长估算
- Docker Compose 开发环境
- AI 文章摘要
