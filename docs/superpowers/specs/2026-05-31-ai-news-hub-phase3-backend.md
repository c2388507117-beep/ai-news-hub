# AI News Hub — Phase 3 动态后端功能设计

## 概述

Phase 3 首次为 AI News Hub 引入后端存储能力，基于 Cloudflare D1 + Pages Functions 实现三个核心功能：私人豆瓣、值班表、中国地图（含景点打卡）。

**架构变更：** 之前是纯静态站点，Phase 3 增加 D1 数据库和 RESTful API 层，但 Astro 仍保持静态输出（`output: 'static'`），所有动态数据通过客户端 JS fetch Pages Functions 实现。

---

## D1 数据库 — 五张表

```sql
-- 1. 私人豆瓣收藏
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('book','music','movie','tv')),
  title TEXT NOT NULL,
  creator TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',        -- 从豆瓣抓取
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  status TEXT DEFAULT 'done' CHECK(status IN ('want','doing','done')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 2. 值班表
CREATE TABLE IF NOT EXISTS duty_roster (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,               -- YYYY-MM-DD
  person TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

-- 3. 地图自定义标记
CREATE TABLE IF NOT EXISTS map_markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'default',  -- 家/公司/常去/旅游
  created_at TEXT DEFAULT (datetime('now'))
);

-- 4. 预制景点
CREATE TABLE IF NOT EXISTS attractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT DEFAULT ''          -- 自然风光/历史古迹/人文艺术/美食街区
);

-- 5. 景点打卡记录
CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attraction_id INTEGER NOT NULL,
  visited INTEGER DEFAULT 0,        -- 0=未去 1=去过
  visited_at TEXT DEFAULT NULL,
  note TEXT DEFAULT '',
  FOREIGN KEY (attraction_id) REFERENCES attractions(id)
);
```

---

## Pages Functions API 路由

统一放在 `/functions/api/*.js` 目录，遵循 Cloudflare Pages Functions 规范。

### 私人豆瓣

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/collections` | GET | 列表（`?type=book` 筛选，默认按时间降序） |
| `/api/collections/search` | POST | 搜索封面，body: `{type, q}` → 代理豆瓣 suggest API 返回 `{results}` |
| `/api/collections` | POST | 新增收藏 |
| `/api/collections/:id` | PUT | 更新评分/短评/状态 |
| `/api/collections/:id` | DELETE | 删除 |

豆瓣封面抓取逻辑：
```
POST /api/collections/search { type: "book", q: "三体" }
  → 根据 type 选豆瓣 suggest 接口：
    type=book  → https://book.douban.com/j/subject_suggest?q={q}
    type=movie → https://movie.douban.com/j/subject_suggest?q={q}
    type=tv    → https://movie.douban.com/j/subject_suggest?q={q}
    type=music → https://music.douban.com/j/subject_suggest?q={q}
  → 返回 { results: [{title, cover_url, creator, douban_id, type}] } 给前端选择

前端交互流程：
  1. 用户输入标题，点击"搜索封面"
  2. 调用 POST /api/collections/search，传入 type + q
  3. Pages Function 代理请求豆瓣 suggest API（服务端 fetch，避免 CORS）
  4. 返回候选结果列表（封面小图 + 标题 + 作者）
  5. 用户点击选中一条 → 自动填充标题/作者/封面 URL 到表单
  6. 用户补充评分(★1-5) + 短评 + 状态(want/doing/done)
  7. 提交 → POST /api/collections 写入 D1
```

### 值班表

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/duty` | GET | 按月查询（`?month=2026-05`） |
| `/api/duty` | POST | 新增值班记录 |
| `/api/duty/:id` | PUT | 修改值班人/备注 |
| `/api/duty/:id` | DELETE | 删除 |

### 地图标记

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/markers` | GET | 获取所有自定义标记 |
| `/api/markers` | POST | 新增标记 |
| `/api/markers/:id` | PUT | 编辑 |
| `/api/markers/:id` | DELETE | 删除 |

### 景点打卡

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/attractions` | GET | 所有景点（`?city=邢台` 按城市筛选） |
| `/api/attractions/cities` | GET | 返回有景点的城市列表 |
| `/api/visit-logs` | GET | 获取打卡记录 |
| `/api/visit-logs` | POST | 新增打卡记录 |
| `/api/visit-logs/:id` | PUT | 更新打卡状态 |

---

## 预制景点数据

从 `scripts/seed-attractions.js` 读取，首次部署时通过 migration 写入 D1，后续增补可重新运行。

### 覆盖城市（约 40+ 个）

一线 + 新一线：北京、上海、广州、深圳、成都、重庆、杭州、西安、武汉、南京、苏州

传统旅游/文化城市：大理、丽江、桂林、三亚、黄山、张家界、厦门、青岛、洛阳、敦煌、拉萨、哈尔滨、呼和浩特、西双版纳、秦皇岛、凤凰、平遥、绍兴、景德镇、庐山、泰山

名山/区域中心：华山、长白山、乐山、九寨沟、峨眉山、武当山、都江堰、武夷山

邢台及周边：邢台、邯郸、石家庄、保定、正定、承德、秦皇岛(北戴河)

每市 8-12 个景点，总约 300-400 条。按类别分：自然风光、历史古迹、人文艺术、美食街区。

示例格式：
```js
{ city: "邢台", name: "崆山白云洞", description: "华北地区最大的溶洞群", lat: 37.45, lng: 114.50, category: "自然风光" }
```

---

## 前端组件

### 1. PrivateDouban.astro

**位置：** 左侧主栏（替换 CurrencyExchange 位置，后者下移到折叠行）

**样式：**
- 渐变 header: `bg-gradient-to-r from-rose-500 to-pink-600`
- 卡片圆角边框风格与现有组件统一
- 默认展开（非折叠）

**功能分区：**

顶部 tab 栏：
```
[📚 书籍] [🎵 音乐] [🎬 电影] [📺 剧集]  ──  ＋ 添加按钮
```

内容区（列表模式）：
```
┌─ 封面图 ──────────────────────────────────┐
│  📚 三体                                    │
│  刘慈欣     ★★★★☆   已读                    │
│  "宏大宇宙观，值得反复读"                    │
│  [编辑] [删除]                              │
├────────────────────────────────────────────┤
│  ...更多条目                                │
└────────────────────────────────────────────┘
```

**交互流程：**
1. 点击 `＋添加` → 弹出添加面板
2. 输入标题 → 点击"搜索封面" → 调用 `/api/collections/search`
3. 展示候选结果（封面缩略图 + 标题 + 作者）→ 用户点击选中
4. 自动填充标题/作者/封面 → 用户完善评分(★1-5) + 短评 + 状态
5. 提交 → POST /api/collections → 列表刷新

**数据状态：**
- 加载中：骨架屏（灰色占位块）
- 空列表："还没有收藏，点击 + 添加第一条" + 友好的空状态图
- 错误："加载失败" + 重试按钮
- 正常：列表渲染

### 2. DutyRoster.astro

**位置：** 底部网格（行3中）

**样式：**
- 渐变 header: `bg-gradient-to-r from-violet-500 to-purple-600`
- 默认折叠（`<details>`）

**日历网格：**
- 显示当月的完整日历（7列 × ~6行）
- 每天格子显示：日期数字 + 值班人名字缩写
- 当前日期高亮（蓝色背景）
- 点击日期弹出操作框：添加/修改/删除该日值班人
- 上月/下月按钮导航

**数据状态：**
- 加载中：表格骨架
- 空月份："本月暂无值班安排"
- 正常：按月渲染

### 3. ChinaMap.astro

**位置：** 底部网格（行3左）

**样式：**
- 渐变 header: `bg-gradient-to-r from-teal-500 to-emerald-600`
- 地图区域高度 400px
- 右侧/下方打卡列表

**功能：**
- Leaflet + OpenStreetMap，默认中心 (37.07°N, 114.50°E) 邢台，zoom 5
- 三层标记叠加显示：
  - 🔵 蓝色 = 预制景点（未打卡）
  - 🟢 绿色 = 已打卡景点
  - 🔴 红色 = 用户自定义标记
- 点击标记弹窗显示景点详情 + "去过/想去"按钮
- 左侧浮动城市搜索框（搜索自动定位到该城市）
- 右侧打卡统计小面板（已打卡 X / 总计 Y）

**分类筛选：** 地图上方显示分类标签[全部/自然风光/历史古迹/人文艺术/美食街区/自定义]

**数据状态：**
- 加载中：地图骨架 + "地图加载中..."
- 错误："地图加载失败，请检查网络"
- 正常：全功能地图

---

## 布局调整

```
左侧主栏（从上到下）：
  📖 每日文摘         → 展开
  🌤️ 邢台天气         → 展开
  ⏰ 发薪倒计时       → 展开
  📚 私人豆瓣         → 展开 ← 新增，替换汇率位置
  💱 汇率计算         → 折叠 ← 从上方移到这里
  🎲 随机决策         → 折叠
  🗞️ 新闻             → 折叠

右侧栏（不变）：
  🔥 热点话题
  💃 美女壁纸
  B站收藏

底部网格（3列 × 3行）：
  行1: 🛒 比价 | 📈 股票 | 🧠 科普
  行2: ⚡ 电力 | 🎮 Steam | 🎨 封面
  行3: 🗺️ 中国地图 | 📋 值班表 | (空)
        ← 新增      ← 新增

右上角固定：🎵 Spotify（不变）
```

---

## 种子数据脚本

`scripts/seed-attractions.js`

功能：将预制景点数据（硬编码的约 400 条）通过 D1 API 写入数据库。

通过 `wrangler d1 execute` 或 Pages Functions 管理页面执行。

格式：`node scripts/seed-attractions.js`（本地开发用 wrangler 连接 D1）。

实际执行方式：
1. 将景点数据写入 `scripts/seed-attractions.sql`（纯 SQL INSERT 语句）
2. 本地执行：`wrangler d1 execute ai-news-hub-db --file=scripts/seed-attractions.sql`
3. 部署后执行：`wrangler d1 execute ai-news-hub-db --file=scripts/seed-attractions.sql --remote`
4. 也可通过 Cloudflare Dashboard → D1 → Console 手动执行 SQL

---

## 技术栈

| 层 | 技术 |
|----|------|
| 静态站点 | Astro 5 (output: static) |
| 样式 | Tailwind CSS 3 |
| 数据库 | Cloudflare D1 (SQLite) |
| API | Cloudflare Pages Functions (ES modules, D1 binding via `context.env.DB`) |
| 地图 | Leaflet.js + OpenStreetMap tiles |
| 部署 | Cloudflare Pages (GitHub Actions) |
| 配置 | wrangler.toml (D1 binding name: `DB`) |

### D1 Binding 配置

Pages Functions 中通过 `context.env.DB` 访问 D1 数据库实例：

```js
// functions/api/collections.js
export async function onRequest(context) {
  const { request, env } = context;
  // env.DB 是 D1 数据库绑定
  const { results } = await env.DB.prepare('SELECT * FROM collections ORDER BY created_at DESC').all();
  return Response.json(results);
}
```

wrangler.toml 配置：
```toml
name = "ai-news-hub"
compatibility_date = "2026-05-31"

[[d1_databases]]
binding = "DB"
database_name = "ai-news-hub-db"
database_id = "your-database-id"
```

---

## 实施顺序

1. **基础设施** — wrangler.toml + D1 database 创建 + Pages Functions 目录
2. **种子数据** — seed-attractions.js + 初始 SQL migration
3. **API 层** — 所有 CRUD endpoint（collections / duty / markers / attractions / visit-logs）
4. **PrivateDouban.astro** — 前端组件（搜索封面 + 列表 + CRUD）
5. **DutyRoster.astro** — 前端组件（月视图日历 + CRUD）
6. **ChinaMap.astro** — 前端组件（Leaflet 地图 + 标记 + 景点打卡）
7. **布局整合** — index.astro 调整 + 构建验证 + 部署
