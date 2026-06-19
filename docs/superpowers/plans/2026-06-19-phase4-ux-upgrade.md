# Phase 4: ✨ 体验升级 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 替换分页按钮为无限滚动，添加骨架屏，增加过渡动画，集成图片优化。

**Architecture:** 纯前端增强，不涉及数据管道或后端。所有改动在 `src/pages/index.astro` 和各 `.astro` 组件中。

---

### Task 1: 无限滚动替换分页

**Files:**
- Modify: `src/pages/index.astro`

移除全部 Page X/Y 分页 UI 和逻辑，改用 IntersectionObserver 驱动无限加载。

- [ ] **Step 1: 删除分页按钮 HTML**

删除 index.astro 中 L194-L210 的 `<div id="pagination">` 整段。

- [ ] **Step 2: 在 news-list 末尾添加哨兵元素**

在 `</div>` 前（L192 之后），添加：

```html
            <!-- Infinite scroll sentinel -->
            <div id="scroll-sentinel" class="h-4"></div>
```

- [ ] **Step 3: 替换 JS 逻辑**

删除旧的 `renderPage()`、`goToPage()`、分页按钮事件监听，替换为：

```javascript
  // --- Infinite Scroll ---

  let isLoadingMore = false;
  let hasMore = true;
  const sentinel = document.getElementById('scroll-sentinel');

  function getVisibleIndices() {
    if (!allItems) return [];
    const indices = [];
    for (let i = 0; i < allItems.length; i++) {
      if (!currentCat || allItems[i].category === currentCat) {
        indices.push(i);
      }
    }
    return indices;
  }

  function renderCard(item) {
    // ... same renderCard as before, unchanged
  }

  function ensureAllRendered() {
    const existing = newsList.querySelectorAll('.news-item');
    if (existing.length >= allItems.length) return;
    const frag = document.createDocumentFragment();
    for (let i = existing.length; i < allItems.length; i++) {
      const item = allItems[i];
      const div = document.createElement('div');
      div.className = 'news-item';
      div.dataset.category = item.category;
      div.style.display = 'none';
      div.innerHTML = renderCard(item);
      frag.appendChild(div);
    }
    newsList.appendChild(frag);
  }

  function showVisibleItems() {
    const visible = getVisibleIndices();
    const shown = visible.slice(0, visibleCount);
    const allDivs = newsList.querySelectorAll('.news-item');
    for (let i = 0; i < allDivs.length; i++) {
      allDivs[i].style.display = shown.includes(i) ? '' : 'none';
    }
    hasMore = shown.length < visible.length;
    if (!hasMore && sentinel) sentinel.style.display = 'none';
  }

  // Observer
  let visibleCount = 10;

  if (sentinel) {
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        isLoadingMore = true;
        await loadAllData();
        ensureAllRendered();
        // Increase visible count and re-render
        visibleCount += 5;
        showVisibleItems();
        isLoadingMore = false;
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinel);
  }
```

- 移除 `pgFirst`、`pgPrev`、`pgNext`、`pgLast`、`pgInfo` 的 DOM 引用（L263-267）
- 移除它们的事件监听（L422-431）
- 保留 `loadAllData()`、`catBtns`、分类过滤逻辑（但要把 category 切换时重置 `visibleCount = 10`）

- [ ] **Step 4: 验证**

```bash
cd /Users/tian_d/ai-news-hub
npx astro check src/pages/index.astro 2>&1 | grep "error" | head -5
```

---

### Task 2: 骨架屏

**Files:**
- Modify: `src/components/StockMarket.astro`
- Modify: `src/components/WorldMap.astro`
- Modify: `src/pages/index.astro`（新闻列表骨架）

#### 2a: 新闻列表骨架

在 index.astro 中，将 `<div id="news-list">` 初始内容替换为骨架 + 真实卡片混合：

```html
            <div id="news-list" class="space-y-3 pb-4">
              <!-- Skeleton cards shown while JS loads -->
              <div id="news-skeleton" class="space-y-3">
                {Array.from({ length: 5 }).map(() => (
                  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                    <div class="flex items-start gap-3">
                      <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                      <div class="flex-1 space-y-2">
                        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {initialItems.map((item) => (
                <div class="news-item hidden" data-category={item.category}>
                  <NewsCard item={item} relatedItems={initialRelatedMap.get(item.id) || []} />
                </div>
              ))}
              {initialItems.length === 0 && (
                <p class="text-center text-gray-400 py-12">暂无新闻</p>
              )}
            </div>
```

然后在 JS 中，骨架隐藏的逻辑：当 `loadAllData()` 完成时，隐藏 `#news-skeleton`，显示所有 `.news-item`。

把现有的 `loadAllData().then(function() { renderPage(); })` 改为：

```javascript
  // Initial load
  loadAllData().then(function() {
    const skeleton = document.getElementById('news-skeleton');
    if (skeleton) skeleton.style.display = 'none';
    // Show static news items
    newsList.querySelectorAll('.news-item').forEach(el => el.classList.remove('hidden'));
    showVisibleItems();
  });
```

注意：需要将原来的 `initialItems.map(...)` 中的 `class="news-item"` 改为 `class="news-item hidden"`，以便 JS 控制显示。

#### 2b: StockMarket 骨架（已有）

StockMarket.astro 的 L34-50 已经有 `animate-pulse` 骨架。保持现状，它已经够用。

#### 2c: WorldMap 骨架

WorldMap.astro 已有 `#map-loading` overlay。保持现状。

- [ ] **验证**

```bash
cd /Users/tian_d/ai-news-hub
npx astro check src/pages/index.astro 2>&1 | grep "error" | head -5
```

---

### Task 3: 过渡动画

**Files:**
- Modify: `src/pages/index.astro` — 新闻卡片、分类切换动画

#### 3a: 分类切换加上淡入

在 index.astro 的 `<style>` 或内联 `<style>` 中添加：

```html
<style>
  .news-item {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .news-item.entering {
    animation: fadeSlideIn 0.3s ease forwards;
  }
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .news-item, .news-card {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
```

在 `showVisibleItems()` 中，对新出现的卡片添加 `entering` class：

```javascript
    // Add entrance animation to newly visible items
    allDivs.forEach((el, i) => {
      if (shown.includes(i) && !el.dataset.animated) {
        el.classList.add('entering');
        el.dataset.animated = 'true';
        el.addEventListener('animationend', () => {
          el.classList.remove('entering');
        }, { once: true });
      }
    });
```

当分类切换时重置 `dataset.animated` 并重新触发动画。在 category 按钮的 `click` 事件中添加：

```javascript
      // Reset animations for new filter
      newsList.querySelectorAll('.news-item').forEach(el => delete el.dataset.animated);
```

---

### Task 4: 图片优化

**Files:**
- Modify: `src/components/NewsCard.astro`

将 NewsCard 中的 `<img>` 标签包装为支持 lazy loading 和尺寸优化的版本。由于 Astro 5 不支持 `<Image />` 在运行时动态 src 的场景（astro build 时不知道 URL），改为使用原生 HTML 的 `loading="lazy"` + `decoding="async"` + 尺寸属性 + CSS 防布局偏移。

在 NewsCard.astro 的 image 部分（约 L32-40），修改：

```astro
      <img
        src={item.imageUrl}
        alt=""
        class="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700"
        loading="lazy"
        decoding="async"
        width="64"
        height="64"
        onerror="this.style.display='none'"
      />
```

同样的，展开区域的 image（约 L73-80）：

```astro
      <img
        src={item.imageUrl}
        alt=""
        class="w-full max-h-64 object-cover rounded-lg mb-4 bg-gray-200 dark:bg-gray-700"
        loading="lazy"
        decoding="async"
        width="800"
        height="400"
        onerror="this.style.display='none'"
      />
```

同时将骨架颜色 `bg-gray-100` → `bg-gray-200 dark:bg-gray-700` 以更好匹配内容区域颜色，减少布局偏移视觉感。

- [ ] **验证**

```bash
cd /Users/tian_d/ai-news-hub
npx vitest run
npx astro build 2>&1 | tail -5
```
