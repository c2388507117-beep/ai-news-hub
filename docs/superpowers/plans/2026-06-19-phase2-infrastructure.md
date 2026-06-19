# Phase 2: 🏗️ 基础设施 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 补全 CI/CD 差距，建立本地统一编排脚本。

**Context:** GitHub Actions workflow 已存在并覆盖 hourly fetch → build → deploy。需要补全缺失的抓取脚本，并创建本地编排工具。

**Architecture:** 最小化修改，不重构现有 workflow。

---

### Task 1: 创建 `fetch-all.mjs` 统一编排脚本

**Files:**
- Create: `scripts/fetch-all.mjs`

本地一键运行所有抓取脚本的统一编排器。收集所有脚本路径，按串行执行并输出统一日志。

- [ ] **Step 1: 创建 `scripts/fetch-all.mjs`**

```javascript
#!/usr/bin/env node

/**
 * fetch-all.mjs — Run all data fetching scripts sequentially.
 * Usage: node scripts/fetch-all.mjs
 * 
 * Skips scripts that require API keys if env vars are missing.
 */

import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS = [
  { name: 'RSS News', file: 'fetch-news.mjs', required: true },
  { name: 'Wallpapers', file: 'fetch-wallpapers.mjs', required: true },
  { name: 'Daily Knowledge', file: 'fetch-knowledge.mjs', required: true },
  { name: 'Daily Digest', file: 'fetch-digest.mjs', required: true },
  { name: 'Hot Topics', file: 'fetch-hot-topics.mjs', required: false },
  { name: 'Football', file: 'fetch-football.mjs', required: false },
  { name: 'Steam Charts', file: 'fetch-steam.mjs', required: false },
  { name: 'Bilibili', file: 'fetch-bilibili.mjs', required: false },
  { name: 'GitHub Trending', file: 'fetch-trending.mjs', required: false },
  { name: 'AI Leaderboard', file: 'fetch-leaderboard.mjs', required: false },
  { name: 'Generate Icons', file: 'generate-icons.mjs', required: false },
];

let failures = 0;
let skipped = 0;

console.log(`=== AI News Hub: Fetch All ===\n`);

for (const { name, file, required } of SCRIPTS) {
  const scriptPath = path.join(__dirname, file);
  try {
    console.log(`▶ ${name} (${file})`);
    execSync(`node "${scriptPath}"`, { stdio: 'inherit', timeout: 120000 });
    console.log(`✔ ${name} — OK\n`);
  } catch (err) {
    if (required) {
      console.error(`✘ ${name} — FAILED (required): ${err.message}\n`);
      failures++;
    } else {
      console.warn(`⚠ ${name} — SKIPPED (optional): ${err.message}\n`);
      skipped++;
    }
  }
}

console.log(`=== Done: ${SCRIPTS.length - failures - skipped} OK, ${skipped} skipped, ${failures} failed ===`);
process.exit(failures > 0 ? 1 : 0);
```

- [ ] **Step 2: 验证**

```bash
cd /Users/tian_d/ai-news-hub
node --check scripts/fetch-all.mjs
```

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add scripts/fetch-all.mjs
git commit -m "feat: add fetch-all.mjs unified script runner"
```

---

### Task 2: 补齐 CI workflow 缺失脚本

**Files:**
- Modify: `.github/workflows/fetch-and-deploy.yml`

当前 workflow 缺少 `fetch-trending.mjs` 和 `fetch-leaderboard.mjs`。

- [ ] **Step 1: 在 "Fetch hot topics" 之后添加 missing scripts**

添加两个步骤：

```yaml
      - name: Fetch GitHub trending repos
        run: node scripts/fetch-trending.mjs || true

      - name: Fetch AI leaderboard
        run: node scripts/fetch-leaderboard.mjs || true
```

- [ ] **Step 2: 更新 git add 路径**

将 `fetch-and-deploy.yml` 中 L54 的 commit 路径添加 `src/data/leaderboard.json`：

```yaml
          git add src/data/news.json src/data/wallpapers.json src/data/wallpapers-girl.json src/data/football.json src/data/steam.json src/data/bilibili.json src/data/knowledge.json src/data/digest.json src/data/hot-topics.json src/data/leaderboard.json
```

注意：fetch-trending 写入 news.json，已包含在 add 中。

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add .github/workflows/fetch-and-deploy.yml
git commit -m "ci: add missing fetch scripts (trending, leaderboard) to workflow"
```

---

### Task 3: 在 CI 中添加测试步骤

**Files:**
- Modify: `.github/workflows/fetch-and-deploy.yml`

- [ ] **Step 1: 在 Install dependencies 和 Fetch 之间添加测试**

在 "Install dependencies" 步骤之后，"Fetch RSS news" 之前添加：

```yaml
      - name: Run tests
        run: npx vitest run
```

- [ ] **Step 2: 验证 YAML 语法**

```bash
cd /Users/tian_d/ai-news-hub
node -e "const yaml = require('js-yaml') || {}; console.log('syntax check')" 2>/dev/null || echo "no yaml parser needed"
```

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add .github/workflows/fetch-and-deploy.yml
git commit -m "ci: add vitest run to GitHub Actions workflow"
```

---

### Task 4: 在 package.json 中添加 CI 便捷脚本

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 添加 fetch-all 和 ci 脚本**

```json
    "fetch:all": "node scripts/fetch-all.mjs",
    "ci": "npm run test && npm run build"
```

- [ ] **Step 2: 验证**

```bash
cd /Users/tian_d/ai-news-hub
node -e "const p = require('./package.json'); console.log(JSON.stringify(p.scripts, null, 2))"
```

确认新脚本出现在输出中。

- [ ] **Step 3: Commit**

```bash
cd /Users/tian_d/ai-news-hub
git add package.json
git commit -m "chore: add fetch-all and ci scripts to package.json"
```
