# Phase 3: 动态后端功能 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 AI News Hub 增加动态后端能力（Cloudflare D1 + Pages Functions），实现私人豆瓣、值班表、中国地图（含景点打卡）三个功能

**Architecture:** Astro 5 保持静态输出，所有动态交互通过客户端 JS 调用 Pages Functions API 操作 D1 数据库。D1 绑定通过 `context.env.DB` 访问，API 采用 RESTful 设计。

**Tech Stack:** Astro 5, Cloudflare D1, Pages Functions, Leaflet.js, Tailwind CSS, wrangler

---

## 文件映射

### 基础设施
- Create: `wrangler.toml` — D1 binding + Pages project 配置
- Create: `migrations/0001_initial.sql` — 5 张表 DDL
- Modify: `.github/workflows/fetch-and-deploy.yml` — 部署前执行 migration

### 种子数据
- Create: `scripts/seed-attractions.sql` — 约 400 条预制景点 INSERT 语句

### API 层 (Cloudflare Pages Functions)
- Create: `functions/api/collections/search.js` — POST 豆瓣 suggest 代理
- Create: `functions/api/collections/index.js` — GET 列表 + POST 新增
- Create: `functions/api/collections/[id].js` — PUT 更新 + DELETE 删除
- Create: `functions/api/duty/index.js` — GET 按月查询 + POST 新增
- Create: `functions/api/duty/[id].js` — PUT 更新 + DELETE 删除
- Create: `functions/api/markers/index.js` — GET 全部 + POST 新增
- Create: `functions/api/markers/[id].js` — PUT + DELETE
- Create: `functions/api/attractions/cities.js` — GET 城市列表
- Create: `functions/api/attractions/index.js` — GET 按城市查景点
- Create: `functions/api/visit-logs/index.js` — GET + POST
- Create: `functions/api/visit-logs/[id].js` — PUT 更新打卡状态

### 前端组件
- Create: `src/components/PrivateDouban.astro`
- Create: `src/components/DutyRoster.astro`
- Create: `src/components/ChinaMap.astro`
- Modify: `src/pages/index.astro` — 布局整合

---

### Task 1: 基础设施 — wrangler.toml + SQL migration + CI

**Files:**
- Create: `wrangler.toml`
- Create: `migrations/0001_initial.sql`
- Modify: `.github/workflows/fetch-and-deploy.yml`

- [ ] **Step 1: 创建 wrangler.toml**

```toml
name = "ai-news-hub"
compatibility_date = "2026-05-31"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "ai-news-hub-db"
database_id = "your-database-id-here"
```

Note: `database_id` 需要用户在 Cloudflare Dashboard 创建 D1 数据库后填入。本地开发时也需执行 `npx wrangler d1 create ai-news-hub-db`。

- [ ] **Step 2: 创建 migration SQL**

`migrations/0001_initial.sql`:
```sql
-- Migration 0001: 初始化 Phase 3 五张表

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('book','music','movie','tv')),
  title TEXT NOT NULL,
  creator TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  status TEXT DEFAULT 'done' CHECK(status IN ('want','doing','done')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS duty_roster (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  person TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS map_markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'default',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attractions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS visit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attraction_id INTEGER NOT NULL,
  visited INTEGER DEFAULT 0,
  visited_at TEXT DEFAULT NULL,
  note TEXT DEFAULT '',
  FOREIGN KEY (attraction_id) REFERENCES attractions(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(type);
CREATE INDEX IF NOT EXISTS idx_duty_date ON duty_roster(date);
CREATE INDEX IF NOT EXISTS idx_attractions_city ON attractions(city);
CREATE INDEX IF NOT EXISTS idx_visit_logs_attraction ON visit_logs(attraction_id);
```

- [ ] **Step 3: 更新 CI/CD workflow**

在 `.github/workflows/fetch-and-deploy.yml` 中，`Build site` 步骤之前添加 D1 migration 步骤：

```yaml
      - name: Apply D1 migrations
        run: |
          npx wrangler@3 d1 migrations apply ai-news-hub-db --remote
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

- [ ] **Step 4: 创建 migrations 目录并生成 .gitkeep**

```bash
mkdir -p /Users/tian_d/ai-news-hub/migrations
```

- [ ] **Step 5: 构建验证**

```bash
cd /Users/tian_d/ai-news-hub && npm run build
```
Expected: Build 成功，无错误。

- [ ] **Step 6: 提交**

```bash
git add wrangler.toml migrations/ .github/workflows/fetch-and-deploy.yml
git commit -m "feat: add D1 database infrastructure (wrangler + migration + CI)"
```

---

### Task 2: 种子数据 — 预制景点 SQL

**Files:**
- Create: `scripts/seed-attractions.sql`

- [ ] **Step 1: 创建景点数据 SQL**

在 `scripts/seed-attractions.sql` 中插入约 40+ 个城市、每个城市 8-12 个景点，总计约 400 条记录。格式：

```sql
-- 清空旧数据（重新播种时使用）
DELETE FROM visit_logs;
DELETE FROM attractions;

-- 北京
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '故宫博物院', '明清两代的皇家宫殿，世界最大木质结构古建筑群', 39.9163, 116.3972, '历史古迹');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '长城（八达岭）', '世界文化遗产，明长城最著名的段落', 40.3540, 116.0072, '历史古迹');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '颐和园', '中国现存最大的皇家园林', 39.9998, 116.2755, '历史古迹');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '天坛公园', '明清皇帝祭天的场所', 39.8822, 116.4066, '历史古迹');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '798艺术区', '北京最著名的当代艺术园区', 39.9781, 116.4952, '人文艺术');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '国家博物馆', '世界上最大的博物馆之一', 39.9054, 116.3976, '人文艺术');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '南锣鼓巷', '北京最古老的胡同街区之一', 39.9375, 116.4038, '美食街区');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '香山公园', '北京西郊著名的红叶观赏地', 39.9902, 116.1854, '自然风光');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '北海公园', '中国现存最古老的皇家园林之一', 39.9254, 116.3892, '自然风光');
INSERT INTO attractions (city, name, description, lat, lng, category) VALUES ('北京', '恭王府', '清代规模最大的王府，曾为和珅宅邸', 39.9371, 116.3852, '历史古迹');
-- ... 其余城市类似格式
```

覆盖城市列表（40+ 个）：
北京、上海、广州、深圳、成都、重庆、杭州、西安、武汉、南京、长沙、天津、苏州、昆明、大理、丽江、桂林、三亚、黄山、张家界、厦门、青岛、洛阳、敦煌、拉萨、哈尔滨、呼和浩特、西双版纳、秦皇岛、凤凰、平遥、绍兴、景德镇、庐山、泰山、华山、长白山、乐山、九寨沟、峨眉山、武当山、都江堰、武夷山、邢台、邯郸、石家庄、保定、承德、正定

- [ ] **Step 2: 提交**

```bash
git add scripts/seed-attractions.sql
git commit -m "feat: add 400+ preset attractions across 40+ cities"
```

---

### Task 3: API 层 — Collections CRUD + 豆瓣搜索代理

**Files:**
- Create: `functions/api/collections/search.js`
- Create: `functions/api/collections/index.js`
- Create: `functions/api/collections/[id].js`

- [ ] **Step 1: 创建 collections 搜索代理**

```javascript
// functions/api/collections/search.js
export async function onRequest(context) {
  const { request } = context;
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.json();
  const { q, type } = body || {};
  if (!q || !type) {
    return Response.json({ results: [] });
  }

  // Map our type to Douban suggest API URL
  let doubanUrl;
  switch (type) {
    case 'book':
      doubanUrl = `https://book.douban.com/j/subject_suggest?q=${encodeURIComponent(q)}`;
      break;
    case 'movie':
    case 'tv':
      doubanUrl = `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(q)}`;
      break;
    case 'music':
      doubanUrl = `https://music.douban.com/j/subject_suggest?q=${encodeURIComponent(q)}`;
      break;
    default:
      return Response.json({ results: [] });
  }

  try {
    const res = await fetch(doubanUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ai-news-hub/1.0)' }
    });
    if (!res.ok) return Response.json({ results: [] });

    const data = await res.json();
    const results = (Array.isArray(data) ? data : []).map(item => ({
      title: item.title || '',
      cover_url: item.img || '',
      creator: item.author || item.artist || item.actor || '',
      douban_id: item.id || '',
      type: item.type || type,
    }));

    return Response.json({ results });
  } catch (err) {
    return Response.json({ results: [], error: err.message });
  }
}
```

- [ ] **Step 2: 创建 collections 列表 + 新增**

```javascript
// functions/api/collections/index.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || '';

  // GET: 列表
  if (request.method === 'GET') {
    let sql = 'SELECT * FROM collections';
    const params = [];
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    sql += ' ORDER BY created_at DESC';
    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return Response.json(results);
  }

  // POST: 新增
  if (request.method === 'POST') {
    const body = await request.json();
    const { type: itemType, title, creator, cover_url, rating, review, status } = body;
    if (!itemType || !title) {
      return Response.json({ error: 'type and title are required' }, { status: 400 });
    }
    const result = await env.DB.prepare(
      'INSERT INTO collections (type, title, creator, cover_url, rating, review, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(itemType, title, creator || '', cover_url || '', rating || null, review || '', status || 'done').run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 3: 创建 collections 详情编辑 + 删除**

```javascript
// functions/api/collections/[id].js
export async function onRequest(context) {
  const { request, env, params } = context;
  const { id } = params;

  // PUT: 更新
  if (request.method === 'PUT') {
    const body = await request.json();
    const { rating, review, status, creator, cover_url, title } = body;
    await env.DB.prepare(
      'UPDATE collections SET rating = ?, review = ?, status = ?, creator = ?, cover_url = ?, title = ?, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(rating || null, review || '', status || 'done', creator || '', cover_url || '', title || '', id).run();
    return new Response('OK', { status: 200 });
  }

  // DELETE: 删除
  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM collections WHERE id = ?').bind(id).run();
    return new Response('OK', { status: 200 });
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 4: 提交**

```bash
git add functions/api/collections/
git commit -m "feat: add collections CRUD API with Douban search proxy"
```

---

### Task 4: API 层 — Duty/Markers/Attractions/VisitLogs CRUD

**Files:**
- Create: `functions/api/duty/index.js`
- Create: `functions/api/duty/[id].js`
- Create: `functions/api/markers/index.js`
- Create: `functions/api/markers/[id].js`
- Create: `functions/api/attractions/cities.js`
- Create: `functions/api/attractions/index.js`
- Create: `functions/api/visit-logs/index.js`
- Create: `functions/api/visit-logs/[id].js`

- [ ] **Step 1: 创建 duty API**

```javascript
// functions/api/duty/index.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // GET: 按月查询 ?month=2026-05
  if (request.method === 'GET') {
    const month = url.searchParams.get('month') || '';
    if (!month) return Response.json({ error: 'month required' }, { status: 400 });
    const { results } = await env.DB.prepare(
      "SELECT * FROM duty_roster WHERE substr(date, 1, 7) = ? ORDER BY date"
    ).bind(month).all();
    return Response.json(results);
  }

  // POST: 新增
  if (request.method === 'POST') {
    const { date, person, note } = await request.json();
    if (!date || !person) return Response.json({ error: 'date and person required' }, { status: 400 });
    const result = await env.DB.prepare(
      'INSERT INTO duty_roster (date, person, note) VALUES (?, ?, ?)'
    ).bind(date, person, note || '').run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  }

  return new Response('Method not allowed', { status: 405 });
}
```

```javascript
// functions/api/duty/[id].js
export async function onRequest(context) {
  const { request, env, params } = context;
  const { id } = params;

  if (request.method === 'PUT') {
    const { date, person, note } = await request.json();
    await env.DB.prepare(
      'UPDATE duty_roster SET date = ?, person = ?, note = ? WHERE id = ?'
    ).bind(date, person, note || '', id).run();
    return new Response('OK');
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM duty_roster WHERE id = ?').bind(id).run();
    return new Response('OK');
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 2: 创建 markers API**

```javascript
// functions/api/markers/index.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare('SELECT * FROM map_markers ORDER BY created_at DESC').all();
    return Response.json(results);
  }

  if (request.method === 'POST') {
    const { name, lat, lng, description, category } = await request.json();
    if (!name || lat == null || lng == null) {
      return Response.json({ error: 'name, lat, lng required' }, { status: 400 });
    }
    const result = await env.DB.prepare(
      'INSERT INTO map_markers (name, lat, lng, description, category) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, lat, lng, description || '', category || 'default').run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  }

  return new Response('Method not allowed', { status: 405 });
}
```

```javascript
// functions/api/markers/[id].js
export async function onRequest(context) {
  const { request, env, params } = context;
  const { id } = params;

  if (request.method === 'PUT') {
    const { name, lat, lng, description, category } = await request.json();
    await env.DB.prepare(
      'UPDATE map_markers SET name = ?, lat = ?, lng = ?, description = ?, category = ? WHERE id = ?'
    ).bind(name, lat, lng, description || '', category || 'default', id).run();
    return new Response('OK');
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM map_markers WHERE id = ?').bind(id).run();
    return new Response('OK');
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 3: 创建 attractions API**

```javascript
// functions/api/attractions/cities.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT city, COUNT(*) as count FROM attractions GROUP BY city ORDER BY city'
    ).all();
    return Response.json(results);
  }

  return new Response('Method not allowed', { status: 405 });
}
```

```javascript
// functions/api/attractions/index.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const city = url.searchParams.get('city') || '';
    let sql = 'SELECT * FROM attractions';
    const params = [];
    if (city) {
      sql += ' WHERE city = ?';
      params.push(city);
    }
    sql += ' ORDER BY category, name';
    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return Response.json(results);
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 4: 创建 visit-logs API**

```javascript
// functions/api/visit-logs/index.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT vl.*, a.name as attraction_name, a.city as attraction_city, a.category as attraction_category FROM visit_logs vl JOIN attractions a ON vl.attraction_id = a.id ORDER BY vl.visited_at DESC'
    ).all();
    return Response.json(results);
  }

  if (request.method === 'POST') {
    const { attraction_id, visited, visited_at, note } = await request.json();
    if (!attraction_id) return Response.json({ error: 'attraction_id required' }, { status: 400 });
    const result = await env.DB.prepare(
      'INSERT INTO visit_logs (attraction_id, visited, visited_at, note) VALUES (?, ?, ?, ?)'
    ).bind(attraction_id, visited || 0, visited_at || null, note || '').run();
    return Response.json({ id: result.meta.last_row_id }, { status: 201 });
  }

  return new Response('Method not allowed', { status: 405 });
}
```

```javascript
// functions/api/visit-logs/[id].js
export async function onRequest(context) {
  const { request, env, params } = context;
  const { id } = params;

  if (request.method === 'PUT') {
    const { visited, visited_at, note } = await request.json();
    await env.DB.prepare(
      "UPDATE visit_logs SET visited = ?, visited_at = ?, note = ? WHERE id = ?"
    ).bind(visited ?? 0, visited_at || null, note || '', id).run();
    return new Response('OK');
  }

  return new Response('Method not allowed', { status: 405 });
}
```

- [ ] **Step 5: 提交**

```bash
git add functions/api/duty/ functions/api/markers/ functions/api/attractions/ functions/api/visit-logs/
git commit -m "feat: add duty/marker/attraction/visit-log CRUD APIs"
```

---

### Task 5: PrivateDouban.astro 前端组件

**Files:**
- Create: `src/components/PrivateDouban.astro`

- [ ] **Step 1: 创建组件 HTML 结构**

按照 spec 设计：
- 渐变 header: `bg-gradient-to-r from-rose-500 to-pink-600`
- 顶部 tab 栏：📚书籍 🎵音乐 🎬电影 📺剧集
- 列表渲染：封面 + 标题 + 评分 + 状态 + 短评
- 底部浮动添加按钮
- 添加面板：输入标题 → 搜索封面 → 选择候选 → 完善评分/短评 → 提交
- 编辑/删除功能

渐变色 header 模式（与项目中其他组件一致）：
```
class="bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3"
```

卡片容器模式：
```
class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm"
```

功能：
1. 页面加载时 fetch GET /api/collections（可带 ?type=book 参数）
2. 点击 tab 切换 type，重新 fetch
3. 点击 + 按钮弹出添加面板
4. 输入标题 → 点击"搜索封面" → 调用 POST /api/collections/search
5. 展示候选列表 → 点击选中 → 自动填入封面/标题/作者
6. 完善评分（★点击选择 1-5）+ 短评 + 状态（想读/在读/已读）
7. 提交 POST /api/collections → 刷新列表
8. 每个条目有编辑/删除按钮
9. DOM null 保护 + try/catch
10. 加载骨架屏 + 空状态 + 错误处理

- [ ] **Step 2: 构建验证**

```bash
cd /Users/tian_d/ai-news-hub && npm run build
```
Expected: Build 成功。

- [ ] **Step 3: 提交**

```bash
git add src/components/PrivateDouban.astro
git commit -m "feat: add PrivateDouban component (Douban cover search + CRUD)"
```

---

### Task 6: DutyRoster.astro 前端组件

**Files:**
- Create: `src/components/DutyRoster.astro`

- [ ] **Step 1: 创建组件 HTML 结构**

设计：
- 渐变 header: `bg-gradient-to-r from-violet-500 to-purple-600`
- 默认折叠（`<details>` + summary 模式）
- 月视图网格：7列（日一二三四五六）× 最多6行
- 上月/下月导航按钮
- 点击日期弹窗添加/修改值班人
- 当前日期高亮

功能：
1. 渲染当前月份日历网格
2. 获取 GET /api/duty?month=2026-05 → 填充已有记录
3. 上月/下月切换
4. 点击日期弹出操作框（输入值班人姓名）
5. 提交 POST /api/duty 新增
6. 已有值班记录可编辑/删除（PUT/DELETE）
7. DOM null 保护 + try/catch
8. 空状态 + 错误处理

JS 实现要点：
- 生成日历网格：计算当月天数、第一天星期几，填充空白
- 每个日期格显示日期数字 + 值班人（如果有）
- 纯 JS 实现（无框架）

- [ ] **Step 2: 构建验证**

```bash
cd /Users/tian_d/ai-news-hub && npm run build
```
Expected: Build 成功。

- [ ] **Step 3: 提交**

```bash
git add src/components/DutyRoster.astro
git commit -m "feat: add DutyRoster component (month calendar + D1 CRUD)"
```

---

### Task 7: ChinaMap.astro 前端组件

**Files:**
- Create: `src/components/ChinaMap.astro`

- [ ] **Step 1: 创建组件 HTML 结构**

设计：
- 渐变 header: `bg-gradient-to-r from-teal-500 to-emerald-600`
- 地图容器 div（id, 高度 400px）
- 顶部筛选标签：[全部/自然风光/历史古迹/人文艺术/美食街区/自定义]
- 城市搜索输入框
- 打卡统计摘要（已打卡 X / 总计 Y）
- 自定义标记添加面板

功能：
1. 加载 Leaflet 地图（通过 CDN），中心 (37.07, 114.50) zoom 5
2. 初始化时 fetch 三层数据：
   - GET /api/attractions → 所有景点
   - GET /api/visit-logs → 打卡记录
   - GET /api/markers → 自定义标记
3. 标记分层：
   - 🔵 蓝色图标 = 预制景点（未打卡）
   - 🟢 绿色图标 = 已打卡景点
   - 🔴 红色图标 = 用户自定义标记
4. 点击标记弹窗：景点名 + 描述 + "去过"/"想去"按钮
5. 城市搜索：输入城市名 → 地图 flyTo 定位
6. 分类筛选：按 category 过滤显示标记
7. 点击地图空白处 → 弹出添加自定义标记表单
8. DOM null 保护 + try/catch
9. 加载状态 + 错误处理

Leaflet CDN:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

OpenStreetMap tile layer:
```js
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
```

- [ ] **Step 2: 构建验证**

```bash
cd /Users/tian_d/ai-news-hub && npm run build
```
Expected: Build 成功。

- [ ] **Step 3: 提交**

```bash
git add src/components/ChinaMap.astro
git commit -m "feat: add ChinaMap component (Leaflet + attractions + check-in)"
```

---

### Task 8: 布局整合 + 构建验证 + 部署

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: 修改 index.astro 布局**

改动：
1. 添加三个组件 import
2. 左侧主栏：收藏豆瓣替换汇率计算位置（汇率下移到折叠行）
3. 底部网格：增加第三行

Import:
```astro
import PrivateDouban from '../components/PrivateDouban.astro';
import DutyRoster from '../components/DutyRoster.astro';
import ChinaMap from '../components/ChinaMap.astro';
```

左侧主栏改动（在 CurrencyExchange 之前插入 PrivateDouban，将 CurrencyExchange 移到 RandomPicker 后面）：

```astro
<!-- Personal tools row 1: DailyDigest + XingtaiWeather + SalaryCountdown -->
<div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
  <DailyDigest data={digest} />
  <XingtaiWeather />
  <SalaryCountdown />
</div>

<!-- 私人豆瓣 (full width, between SalaryCountdown and CurrencyExchange) -->
<PrivateDouban />

<!-- Currency Exchange (collapsible, between PrivateDouban and RandomPicker) -->
<CurrencyExchange />

<!-- Personal tools row 2 -->
<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
  <WallpaperGallery data={wallpapers} />
  <RandomPicker />
</div>
```

底部网格增加第三行：
```astro
<!-- Bottom row 3: ChinaMap + DutyRoster -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <ChinaMap />
  <DutyRoster />
  <div></div> <!-- 空位占位 -->
</div>
```

- [ ] **Step 2: 全局构建**

```bash
cd /Users/tian_d/ai-news-hub && npm run build
```
Expected: Build 成功，无错误。

- [ ] **Step 3: 提交并推送**

```bash
git add src/pages/index.astro
git commit -m "feat: integrate Phase 3 components into dashboard layout"
git push origin main
```

---

## 部署后步骤（需人工在 Cloudflare Dashboard 操作）

1. 创建 D1 数据库：
```bash
cd /Users/tian_d/ai-news-hub
npx wrangler d1 create ai-news-hub-db
```
将返回的 `database_id` 填入 `wrangler.toml`。

2. 应用 migration：
```bash
npx wrangler d1 migrations apply ai-news-hub-db --remote
```

3. 导入种子数据：
```bash
npx wrangler d1 execute ai-news-hub-db --file=scripts/seed-attractions.sql --remote
```

4. 在 Cloudflare Dashboard → ai-news-hub → Settings → Functions 中确认 D1 binding `DB` 已绑定。
