# Phase 2: API 集成 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 AI News Hub 个人仪表盘新增 6 个 API 集成功能：天气、汇率、比价、Spotify、股票、封面抓取

**Architecture:** 每个功能是一个独立的 Astro 组件，包含内联 `<script>` 客户端 JavaScript。全部在浏览器端 fetch 外部 API，无需构建时数据抓取。通过 `index.astro` 统一排版布局。

**Tech Stack:** Astro 5 (静态渲染), 原生 JS (无框架), Tailwind CSS, wttr.in, frankfurter.app, Spotify iframe, 新浪财经, OpenLibrary/iTunes

**Layout changes to index.astro:**
- 左侧主栏：DailyDigest → **XingtaiWeather** → SalaryCountdown → **CurrencyExchange** → RandomPicker → 新闻(折叠)
- 左上角固定：**SpotifyPlayer**（替代现有 MusicPlayer，或共存）
- 底部行（3列 → 变为 grid-cols-1 md:grid-cols-3）：
  行1: **ShoppingCompare** | **StockMarket** | DailyKnowledge
  行2: ElectricalCalc | SteamCharts | **CoverArt**

---

### Task A: 邢台天气组件 (XingtaiWeather.astro)

**Files:**
- Create: `src/components/XingtaiWeather.astro`
- Modify: `src/pages/index.astro`（在 DailyDigest 之后插入组件）

**API:** wttr.in — `https://wttr.in/Xingtai?format=j1`（返回 JSON，无需 API key）
**数据字段：**
- `current_condition[0].temp_C` — 当前温度
- `current_condition[0].weatherDesc[0].value` — 天气描述
- `current_condition[0].humidity` — 湿度
- `current_condition[0].windSpeedKmph` — 风速
- `current_condition[0].weatherCode` — 天气代码（用来选 emoji）
- `weather[0].hourly[]` — 24小时预报
- `weather[1-2]` — 未来2天预报

**组件设计：**
- 橙色/黄色渐变 header：`bg-gradient-to-r from-amber-500 to-orange-500`
- 加载状态："🌤️ 加载天气..."
- 错误状态："❌ 天气加载失败"
- 显示：当前温度(大号)、天气描述、湿度+风速小字
- 折叠展开：3天预报（默认折叠，用 `<details>`）
- 24h 预报：水平滚动条显示接下来6个时段（简化版）
- 缓存：获取后存 sessionStorage，30分钟内不重复请求

**Client JS 逻辑：**

```js
const CACHE_KEY = 'xt-weather';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

async function fetchWeather() {
  // Check cache first
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.fetchedAt < CACHE_TTL) {
      return parsed.data;
    }
  }
  
  const res = await fetch('https://wttr.in/Xingtai?format=j1');
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  
  // Cache it
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), data }));
  return data;
}
```

**Weather emoji mapping (weatherCode → emoji):**
- 113 → ☀️ (晴)
- 116 → ⛅ (多云)
- 119-122 → ☁️ (阴)
- 143-248 → 🌫️ (雾)
- 176-200 → 🌧️ (雨)
- 227-230 → ❄️ (雪)
- 248-260 → 🌫️ (雾)
- 263-389 → 🌧️ (各种雨/雪)
- default → 🌤️

- [ ] **Step 1: 创建 XingtaiWeather.astro 组件**

完整组件代码，包含：
- Astro frontmatter (无 props)
- HTML 结构：header + 当前天气 + 详情 + 预报折叠
- `<script>` 标签：fetch 天气、缓存、DOM 更新、天气 emoji 映射
- DOM null 保护 + try/catch

- [ ] **Step 2: 在 index.astro 中集成**

在 `DailyDigest` 组件之后、`SalaryCountdown` 之前插入：
```astro
<XingtaiWeather />
```
并在 imports 区添加 import。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```
确认无错误。

- [ ] **Step 4: 提交**

```bash
git add src/components/XingtaiWeather.astro src/pages/index.astro
git commit -m "feat: add Xingtai weather component (wttr.in)"
```

---

### Task B: 汇率计算组件 (CurrencyExchange.astro)

**Files:**
- Create: `src/components/CurrencyExchange.astro`
- Modify: `src/pages/index.astro`（在 SalaryCountdown 之后插入，默认折叠）

**API:** frankfurter.app — `https://api.frankfurter.app/latest?from={base}&to={target}`（免费，无需 key）

**支持的货币对：**
- USD → CNY (美元→人民币)
- EUR → CNY (欧元→人民币)
- JPY → CNY (日元→人民币)
- GBP → CNY (英镑→人民币)
- HKD → CNY (港币→人民币)
- KRW → CNY (韩元→人民币)
- CNY → USD (人民币→美元)
- CNY → EUR (人民币→欧元)
- CNY → JPY (人民币→日元)
- EXTRA: 用户可在下拉菜单中自选任意货币对

**组件设计：**
- 紫色渐变 header：`bg-gradient-to-r from-indigo-500 to-purple-600`
- 默认折叠（`<details>` 元素或 JS toggle）
- 输入框：金额（默认 100）
- 两个下拉框：源货币、目标货币
- 实时换算结果（大号字体展示）
- 速率显示 + 更新时间
- 加载错误处理

**Client JS 逻辑：**
```js
async function fetchRate(from, to) {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  return data.rates[to];
}
```

- [ ] **Step 1: 创建 CurrencyExchange.astro 组件**

包含完整 HTML 结构、货币选择、金额输入、fetch 逻辑、DOM null 保护。

- [ ] **Step 2: 在 index.astro 中集成**

在 `SalaryCountdown` 之后、`RandomPicker` 之前插入。使用 `<details>` 默认折叠。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/CurrencyExchange.astro src/pages/index.astro
git commit -m "feat: add currency exchange component (frankfurter.app)"
```

---

### Task C: 购物比价面板 (ShoppingCompare.astro)

**Files:**
- Create: `src/components/ShoppingCompare.astro`
- Modify: `src/pages/index.astro`（底部行，替换某个位置）

**功能：** 搜索框输入商品名 → 生成各平台搜索链接（跳转，不在站内抓取）

**支持的平台链接格式：**
```
淘宝:   https://s.taobao.com/search?q={关键词}
京东:   https://search.jd.com/Search?keyword={关键词}
拼多多: https://mobile.yangkeduo.com/search_result.html?search_key={关键词}
什么值得买: https://www.smzdm.com/s/{关键词}
```

**组件设计：**
- 红色渐变 header：`bg-gradient-to-r from-red-500 to-pink-500`
- 居中布局
- 输入框 + 搜索按钮
- 搜索后显示 4 个平台按钮（含图标 emoji）
- 每个按钮点击在新标签页打开对应平台搜索
- 默认显示示例："输入商品名称，一键比价"

- [ ] **Step 1: 创建 ShoppingCompare.astro 组件**

包含完整 HTML、输入处理表单、平台链接生成、URL encode 处理。

- [ ] **Step 2: 在 index.astro 底部行集成**

在底部 grid 第一行第一列（替换或增加）。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/ShoppingCompare.astro src/pages/index.astro
git commit -m "feat: add shopping comparison panel (platform search links)"
```

---

### Task D: Spotify 音乐播放器 (SpotifyPlayer.astro)

**Files:**
- Create: `src/components/SpotifyPlayer.astro`
- Modify: `src/pages/index.astro`（在右侧栏上方或替代 MusicPlayer 区域）

**功能：** 固定位置 Spotify iframe 嵌入，可折叠

**设计：**
- 右上角固定（`fixed top-20 right-4 z-50`）
- 圆形按钮（🎵）默认显示
- 点击展开 iframe（宽度 300px）
- 关闭按钮
- Spotify 公开歌单 iframe 嵌入

**Spotify iframe URL 格式：**
```
https://open.spotify.com/embed/playlist/{PLAYLIST_ID}?utm_source=generator&theme=0
```
需要用户提供公开歌单 ID。

**方案：** 组件嵌入一个默认的纯音乐/学习歌单。用户可自定义歌单 ID（存 localStorage）。

**备选方案：** 如果 Spotify iframe 在墙内无法加载，优雅降级提示用户。

**注意：** 无需 API key，只需要公开歌单的 embed URL。

- [ ] **Step 1: 创建 SpotifyPlayer.astro 组件**

包含：圆形按钮、滑动展开面板、iframe 嵌入、关闭按钮、localStorage 自定义歌单 ID。

- [ ] **Step 2: 在 index.astro 中集成**

在 `<BaseLayout>` 内、`<main>` 外添加 SpotifyPlayer（固定定位不需要在布局流中）。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/SpotifyPlayer.astro src/pages/index.astro
git commit -m "feat: add Spotify player (iframe embed, collapsible)"
```

---

### Task E: 股票行情组件 (StockMarket.astro)

**Files:**
- Create: `src/components/StockMarket.astro`
- Modify: `src/pages/index.astro`（底部行）

**数据源：**
- 新浪财经 API：`https://hq.sinajs.cn/list={codes}`（A股 + 港股）
  - 需要设置 Referer header
  - 格式：`sh000001`（上证）, `sz399001`（深证）, `hkHSI`（恒生）
  - CORS 限制 — 需要注意。如果前端直接请求遇到 CORS 问题，改用 Yahoo Finance 或有道
- Yahoo Finance API (无需 key):
  - `https://query1.finance.yahoo.com/v8/finance/chart/^HSI?interval=1d&range=1mo`（恒生）
  - `https://query1.finance.yahoo.com/v8/finance/chart/000001.SS?interval=1d&range=1mo`（上证）
  - `https://query1.finance.yahoo.com/v8/finance/chart/^IXIC?interval=1d&range=1mo`（纳斯达克）

**更新策略：**
- 优先用 Yahoo Finance（CORS 友好，无需 key）
- 指数列表：上证(000001.SS)、深证(399001.SZ)、恒生(^HSI)、纳斯达克(^IXIC)、道琼斯(^DJI)、标普500(^GSPC)、日经225(^N225)
- 可选：用户可添加自定义股票代码（存 localStorage）
- 缓存：30秒内不重复请求

**组件设计：**
- 绿色渐变 header：`bg-gradient-to-r from-green-600 to-emerald-600`
- 列表显示每个指数：名称 + 当前价 + 涨跌点数 + 涨跌幅%
- 涨红色、跌绿色（中国标准）
- 加载状态
- 可选：自定义股票搜索添加

- [ ] **Step 1: 创建 StockMarket.astro 组件**

包含：指数列表、Yahoo Finance fetch、涨跌显示、缓存、localStorage 自定义股票。

- [ ] **Step 2: 在 index.astro 底部行集成**

放在底部 grid 第一行第二列。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/StockMarket.astro src/pages/index.astro
git commit -m "feat: add stock market component (Yahoo Finance)"
```

---

### Task F: 封面抓取组件 (CoverArt.astro)

**Files:**
- Create: `src/components/CoverArt.astro`
- Modify: `src/pages/index.astro`（底部行）

**API 选择（无需 key）：**
- **OpenLibrary**（书籍）：`https://openlibrary.org/search.json?q={书名}`
  - 封面 URL：`https://covers.openlibrary.org/b/id/{cover_i}-L.jpg`
- **iTunes Search API**（电影/音乐/电子书）：`https://itunes.apple.com/search?term={关键词}&media=all&limit=10`
  - 返回 `artworkUrl100` → 替换 `100x100` 为 `600x600` 获得大图

**功能：**
- 搜索框输入关键词
- 下拉选择搜索类型：书籍 / 影视 / 全部
- 点击搜索，展示结果网格（封面图 + 标题）
- 点击封面放大查看

**组件设计：**
- 蓝色渐变 header：`bg-gradient-to-r from-sky-500 to-blue-600`
- 搜索框 + 类型选择 + 搜索按钮
- 结果网格（grid-cols-3 sm:grid-cols-4 gap-2）
- 每个结果：封面缩略图 + 标题
- 点击封面弹出大图查看（简易 modal）
- 空状态："输入关键词搜索封面"
- 加载/错误处理

- [ ] **Step 1: 创建 CoverArt.astro 组件**

包含：搜索 UI、API fetch（OpenLibrary + iTunes）、结果网格渲染、点击放大。

- [ ] **Step 2: 在 index.astro 底部行集成**

放在底部 grid 第一行第三列（替换 DailyKnowledge 位置，把 DailyKnowledge 移到某个其他位置或第二行）。

- [ ] **Step 3: 构建验证**

```bash
npm run build
```

- [ ] **Step 4: 提交**

```bash
git add src/components/CoverArt.astro src/pages/index.astro
git commit -m "feat: add cover art search component (OpenLibrary + iTunes)"
```

---

### Task G: HotTopics 接入右侧栏

**Files:**
- Modify: `src/pages/index.astro`（右侧栏）

HotTopics 组件已存在（`src/components/HotTopics.astro`）但未接入页面。`fetch-hot-topics.mjs` 已配置 `MAX_TOPICS = 3`。将其插入右侧栏。

- [ ] **Step 1: 在 index.astro 右侧栏集成**

在 `WallpaperGallery` 之前插入：
```astro
<HotTopics topics={hotTopics as HotTopic[]} />
```
添加 import 并读取 `hotTopicsData`。

- [ ] **Step 2: 构建验证**

```bash
npm run build
```

- [ ] **Step 3: 提交**

```bash
git add src/pages/index.astro
git commit -m "feat: wire up HotTopics component in sidebar"
```

---

## 最终整合

在所有 7 个任务完成后：
1. 检查 `index.astro` 布局：左侧栏 6 个组件 + 新闻折叠；右侧栏 3 个组件（HotTopics + WallpaperGallery + Bilibili）；底部 3×2 网格
2. 全面构建：`npm run build`
3. 推送部署：`git push origin main`
