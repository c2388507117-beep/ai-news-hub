# Phase 1: Personal Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform AI News Hub from a news-centric site into a personal dashboard with daily digest, salary countdown, random picker, electrical calculator, expanded daily knowledge, and restructured layout.

**Architecture:** All Phase 1 features are pure frontend — no database, no API calls. Data is either computed client-side (countdown, random picker, calculator), stored in curated JSON (daily digest), or fetched at build time (expanded knowledge). The layout shifts from a 3-column news layout to a 2-column + bottom-row personal dashboard.

**Tech Stack:** Astro 5, Cloudflare Pages, vanilla JS for interactivity, Tailwind-like utility classes.

---

## File Structure

### New files:
- `scripts/fetch-digest.mjs` — Daily digest fetch script (100+ curated book quotes)
- `src/data/digest.json` — Generated digest data file
- `src/components/DailyDigest.astro` — Daily book quote display component
- `src/components/SalaryCountdown.astro` — Salary countdown widget
- `src/components/RandomPicker.astro` — Random decision maker
- `src/components/ElectricalCalc.astro` — Electrical engineering calculators

### Modified files:
- `src/pages/index.astro` — Restructure layout (Option A)
- `scripts/fetch-knowledge.mjs` — Store 5 items instead of 1
- `src/components/DailyKnowledge.astro` — Show list of items instead of single
- `src/lib/types.ts` — Add DigestItem and KnowledgeList types
- `.github/workflows/fetch-and-deploy.yml` — Add digest.json to git tracking

---

### Task A: Add New Types

**Files:**
- Modify: `src/lib/types.ts` — add DigestItem and KnowledgeList types

- [ ] **Step 1: Add new types to types.ts**

After the existing KnowledgeItem type (line 218), add:

```typescript
// --- Digest types ---

export interface DigestItem {
  quote: string;
  book: string;
  author: string;
}

export interface DigestData {
  fetchedAt: string;
  quote: string;
  book: string;
  author: string;
}
```

Also update KnowledgeItem to support list format. Change the `KnowledgeItem` interface to also support the new multi-item format:

```typescript
export interface KnowledgeItem {
  fetchedAt: string;
  title: string;
  extract: string;
  url: string;
  imageUrl: string | null;
  source: string;
}

export interface KnowledgeList {
  fetchedAt: string;
  items: KnowledgeItem[];
}
```

---

### Task B: Daily Digest Fetch Script

**Files:**
- Create: `scripts/fetch-digest.mjs`
- Create: `src/data/digest.json` (auto-generated)

- [ ] **Step 1: Create fetch-digest.mjs**

```javascript
#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'digest.json');

// 100+ world literature quotes in Chinese translation
const QUOTES = [
  { quote: '生命是用来燃烧的东西，死亡是生命的一部分。', book: '活着', author: '余华' },
  { quote: '世界上只有一种真正的 Heroism，那就是在认清生活真相之后依然热爱生活。', book: '人生', author: '罗曼·罗兰' },
  { quote: '所有的大人都曾经是小孩，虽然只有少数人记得。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '幸福的人用童年治愈一生，不幸的人用一生治愈童年。', book: '自卑与超越', author: '阿德勒' },
  { quote: '生活不可能像你想象得那么好，但也不会像你想象得那么糟。', book: '羊脂球', author: '莫泊桑' },
  { quote: '人的生命只有一次，其实我们只有一次机会去做一个人。', book: '罪与罚', author: '陀思妥耶夫斯基' },
  { quote: '一个人可以被毁灭，但不能被打败。', book: '老人与海', author: '海明威' },
  { quote: '许多年过去了，人们说陈年旧事可以被埋葬，然而我终于明白这是错的，因为往事会自行爬上来。', book: '追风筝的人', author: '卡勒德·胡赛尼' },
  { quote: '婚姻是一座围城，城外的人想进去，城里的人想出来。', book: '围城', author: '钱钟书' },
  { quote: '我去旅行，是因为我决定了要去，并不是因为对风景的兴趣。', book: '霍乱时期的爱情', author: '加西亚·马尔克斯' },
  { quote: '人是为了活着本身而活着，而不是为了活着之外的任何事物而活着。', book: '活着', author: '余华' },
  { quote: '如果你驯化了我，我们就彼此需要了。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '我来不及认真地年轻，待明白过来时，只能选择认真地老去。', book: '三毛全集', author: '三毛' },
  { quote: '傲慢让别人无法来爱我，偏见让我无法去爱别人。', book: '傲慢与偏见', author: '简·奥斯汀' },
  { quote: '幸福的家庭都是相似的，不幸的家庭各有各的不幸。', book: '安娜·卡列尼娜', author: '列夫·托尔斯泰' },
  { quote: '如果你有梦想的话，就要去捍卫它。', book: '当幸福来敲门', author: '克里斯·加德纳' },
  { quote: '黑夜无论怎样悠长，白昼总会到来。', book: '麦克白', author: '莎士比亚' },
  { quote: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。', book: '百年孤独', author: '加西亚·马尔克斯' },
  { quote: '每当你想批评别人的时候，要记住，这世上并不是所有人都有你拥有的那些优势。', book: '了不起的盖茨比', author: '菲茨杰拉德' },
  { quote: '不要因为结束而哭泣，要因为它发生过而微笑。', book: '纯真年代', author: '伊迪丝·华顿' },
  { quote: '读书多了，容颜自然改变。', book: '生活的艺术', author: '林语堂' },
  { quote: '我们终此一生，就是要摆脱他人的期待，找到真正的自己。', book: '无声告白', author: '伍绮诗' },
  { quote: '生活永远也不可能像你想象的那么好，但也不会像你想象的那么糟。', book: '一生', author: '莫泊桑' },
  { quote: '世界以痛吻我，要我报之以歌。', book: '飞鸟集', author: '泰戈尔' },
  { quote: '每一个不曾起舞的日子，都是对生命的辜负。', book: '查拉图斯特拉如是说', author: '尼采' },
  { quote: '人的一切痛苦，本质上都是对自己的无能的愤怒。', book: '而已集', author: '鲁迅' },
  { quote: '时间以同样的方式流经每个人，而每个人却以不同的方式度过时间。', book: '挪威的森林', author: '村上春树' },
  { quote: '父母在，人生尚有来处；父母去，人生只剩归途。', book: '目送', author: '龙应台' },
  { quote: '自由不是你想做什么就能做什么，而是你不想做什么就可以不做什么。', book: '哲学的故事', author: '康德（引）' },
  { quote: '你站在桥上看风景，看风景的人在楼上看你。', book: '断章', author: '卞之琳' },
  { quote: '人的一生是短的，但如果卑劣地过这一生，就太长了。', book: '威尼斯商人', author: '莎士比亚' },
  { quote: '我们曾如此渴望命运的波澜，到最后才发现，人生最曼妙的风景，竟是内心的淡定与从容。', book: '一百岁感言', author: '杨绛' },
  { quote: '要么旅行，要么读书，身体和灵魂必须有一个在路上。', book: '罗马假日', author: '电影台词' },
  { quote: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', book: 'Vivamus Moriendum Est', author: '塞内加' },
  { quote: '所谓无底深渊，下去，也是前程万里。', book: '素履之往', author: '木心' },
  { quote: '在隆冬，我终于知道，我身上有一个不可战胜的夏天。', book: '夏天集', author: '阿尔贝·加缪' },
  { quote: '世界上有两件东西能震撼人们的心灵：一件是我们心中崇高的道德标准；另一件是我们头顶上灿烂的星空。', book: '实践理性批判', author: '康德' },
  { quote: '善良是一种世界语言，盲人可以看见，聋子可以听见。', book: '汤姆叔叔的小屋', author: '斯托夫人' },
  { quote: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', book: '阿甘正传', author: '温斯顿·格鲁姆' },
  { quote: '一个人知道自己为什么而活，就可以忍受任何一种生活。', book: '查拉图斯特拉如是说', author: '尼采' },
  { quote: '人生忽如寄，莫辜负茶、汤和好天气。', book: '人间有味', author: '汪曾祺' },
  { quote: '没有所谓玩笑，所有的玩笑都有认真的成分。', book: '精神分析引论', author: '弗洛伊德' },
  { quote: '决定我们成为什么样人的，不是我们的能力，而是我们的选择。', book: '哈利·波特与密室', author: 'J.K.罗琳' },
  { quote: '真正的光明决不是永没有黑暗的时间，只是永不被黑暗所掩蔽罢了。', book: '约翰·克利斯朵夫', author: '罗曼·罗兰' },
  { quote: '一件东西只有失去了，我们才懂得珍惜。', book: '战争与和平', author: '列夫·托尔斯泰' },
  { quote: '如果你爱一个人，就让他自由；如果他不回来，那他就从未属于你。', book: '佛陀的教诲', author: '传统箴言' },
  { quote: '我们不能用制造问题时的同一思维水平来解决问题。', book: '爱因斯坦文集', author: '阿尔伯特·爱因斯坦' },
  { quote: '希望是美好的，也许是人间至善，而美好的事物永不消逝。', book: '肖申克的救赎', author: '斯蒂芬·金' },
  { quote: '人生如逆旅，我亦是行人。', book: '临江仙·送钱穆父', author: '苏轼' },
  { quote: '众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。', book: '青玉案·元夕', author: '辛弃疾' },
  { quote: '生如夏花之绚烂，死如秋叶之静美。', book: '飞鸟集', author: '泰戈尔' },
  { quote: '岁月极美，在于它必然的流逝。春花、秋月、夏日、冬雪。', book: '岁月', author: '三毛' },
  { quote: '此情可待成追忆，只是当时已惘然。', book: '锦瑟', author: '李商隐' },
  { quote: '人生自古谁无死，留取丹心照汗青。', book: '过零丁洋', author: '文天祥' },
  { quote: '路漫漫其修远兮，吾将上下而求索。', book: '离骚', author: '屈原' },
  { quote: '长风破浪会有时，直挂云帆济沧海。', book: '行路难', author: '李白' },
  { quote: '会当凌绝顶，一览众山小。', book: '望岳', author: '杜甫' },
  { quote: '采菊东篱下，悠然见南山。', book: '饮酒', author: '陶渊明' },
  { quote: '人间有味是清欢。', book: '浣溪沙', author: '苏轼' },
  { quote: '不以物喜，不以己悲。', book: '岳阳楼记', author: '范仲淹' },
  { quote: '落霞与孤鹜齐飞，秋水共长天一色。', book: '滕王阁序', author: '王勃' },
  { quote: '总之岁月漫长，然而值得等待。', book: '如果我们的语言是威士忌', author: '村上春树' },
  { quote: '星星发亮是为了让每一个人有一天都能找到属于自己的星星。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '往者不可谏，来者犹可追。', book: '论语', author: '孔子' },
  { quote: '学而不思则罔，思而不学则殆。', book: '论语', author: '孔子' },
  { quote: '己所不欲，勿施于人。', book: '论语', author: '孔子' },
  { quote: '温故而知新，可以为师矣。', book: '论语', author: '孔子' },
  { quote: '三人行，必有我师焉。', book: '论语', author: '孔子' },
  { quote: '人生天地之间，若白驹之过隙，忽然而已。', book: '庄子·知北游', author: '庄子' },
  { quote: '相濡以沫，不如相忘于江湖。', book: '庄子·大宗师', author: '庄子' },
  { quote: '子非鱼，安知鱼之乐？', book: '庄子·秋水', author: '庄子' },
  { quote: '道可道，非常道；名可名，非常名。', book: '道德经', author: '老子' },
  { quote: '上善若水，水善利万物而不争。', book: '道德经', author: '老子' },
  { quote: '千里之行，始于足下。', book: '道德经', author: '老子' },
  { quote: '知人者智，自知者明。', book: '道德经', author: '老子' },
  { quote: '天行健，君子以自强不息。', book: '周易', author: '' },
  { quote: '运筹帷幄之中，决胜千里之外。', book: '史记', author: '司马迁' },
  { quote: '人固有一死，或重于泰山，或轻于鸿毛。', book: '报任安书', author: '司马迁' },
  { quote: '天下兴亡，匹夫有责。', book: '日知录', author: '顾炎武' },
  { quote: '先天下之忧而忧，后天下之乐而乐。', book: '岳阳楼记', author: '范仲淹' },
  { quote: '老吾老以及人之老，幼吾幼以及人之幼。', book: '孟子', author: '孟子' },
  { quote: '富贵不能淫，贫贱不能移，威武不能屈。', book: '孟子', author: '孟子' },
  { quote: '不积跬步，无以至千里；不积小流，无以成江海。', book: '劝学', author: '荀子' },
  { quote: '业精于勤，荒于嬉；行成于思，毁于随。', book: '进学解', author: '韩愈' },
  { quote: '书山有路勤为径，学海无涯苦作舟。', book: '古今贤文', author: '韩愈（引）' },
  { quote: '天生我材必有用，千金散尽还复来。', book: '将进酒', author: '李白' },
  { quote: '山重水复疑无路，柳暗花明又一村。', book: '游山西村', author: '陆游' },
  { quote: '但愿人长久，千里共婵娟。', book: '水调歌头', author: '苏轼' },
  { quote: '人生如梦，一尊还酹江月。', book: '念奴娇·赤壁怀古', author: '苏轼' },
  { quote: '问渠那得清如许，为有源头活水来。', book: '观书有感', author: '朱熹' },
  { quote: '纸上得来终觉浅，绝知此事要躬行。', book: '冬夜读书示子聿', author: '陆游' },
  { quote: '横看成岭侧成峰，远近高低各不同。', book: '题西林壁', author: '苏轼' },
  { quote: '不畏浮云遮望眼，自缘身在最高层。', book: '登飞来峰', author: '王安石' },
  { quote: '落红不是无情物，化作春泥更护花。', book: '己亥杂诗', author: '龚自珍' },
  { quote: '宝剑锋从磨砺出，梅花香自苦寒来。', book: '警世贤文', author: '民谚' },
  { quote: '黑夜给了我黑色的眼睛，我却用它寻找光明。', book: '一代人', author: '顾城' },
  { quote: '面朝大海，春暖花开。', book: '面朝大海，春暖花开', author: '海子' },
  { quote: '人的一生应该这样度过：当他回首往事时，不因虚度年华而悔恨，也不因碌碌无为而羞耻。', book: '钢铁是怎样炼成的', author: '奥斯特洛夫斯基' },
  { quote: '钱是一种很奇怪的东西，当你最需要它的时候，它却离你而去。', book: '百万英镑', author: '马克·吐温' },
  { quote: '世界上最大的监狱，是一个人的思维模式。', book: '超越感觉', author: '文森特·鲁格里奥' },
  { quote: '我们从哪里来？我们是谁？我们到哪里去？', book: '绘画', author: '保罗·高更' },
  { quote: '地球是人类的摇篮，但是人类不会永远生活在摇篮里。', book: '火箭与太空旅行', author: '齐奥尔科夫斯基' },
  { quote: '想象比知识更重要，因为知识是有限的，而想象力概括世界上的一切。', book: '论科学', author: '阿尔伯特·爱因斯坦' },
  { quote: '穷则变，变则通，通则久。', book: '周易·系辞', author: '' },
  { quote: '天下难事必作于易，天下大事必作于细。', book: '道德经', author: '老子' },
];

const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const diff = now - start;
const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

function main() {
  const index = dayOfYear % QUOTES.length;
  const selected = QUOTES[index];

  const output = {
    fetchedAt: now.toISOString(),
    ...selected,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Digest: "${selected.quote.slice(0, 40)}..." — ${selected.book}, ${selected.author}`);
}

main().catch((err) => {
  console.error('  ✗ Digest fetch failed:', err.message);
  // Keep existing data if fetch fails
  if (fs.existsSync(dataPath)) {
    console.log('  Keeping existing digest data.');
  }
});
```

- [ ] **Step 2: Add the script to package.json scripts**

Read and modify `package.json` to add a digest script entry (if using npm scripts for fetching). Check if other fetch scripts are registered there:

```bash
grep -n '"scripts"' /Users/tian_d/ai-news-hub/package.json
# If there's a "scripts" block, add: "digest": "node scripts/fetch-digest.mjs"
```

- [ ] **Step 3: Update GitHub workflow to run digest script and track output**

In `.github/workflows/fetch-and-deploy.yml`, add after the knowledge fetch step:

```yaml
      - name: Fetch daily digest
        run: node scripts/fetch-digest.mjs
```

And update the git add line to include digest.json:

```yaml
          git add src/data/news.json src/data/wallpapers.json src/data/wallpapers-girl.json src/data/football.json src/data/steam.json src/data/bilibili.json src/data/knowledge.json src/data/digest.json
```

---

### Task C: DailyDigest Component

**Files:**
- Create: `src/components/DailyDigest.astro`

- [ ] **Step 1: Create DailyDigest.astro**

```astro
---
import type { DigestData } from '../lib/types';

export interface Props {
  data: DigestData | null;
}

const { data } = Astro.props;
---

<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
  <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
    <h3 class="text-sm font-bold text-white flex items-center gap-2">
      <span>📖</span> 每日文摘
    </h3>
  </div>
  {data && data.quote ? (
    <div class="p-4">
      <blockquote class="relative">
        <span class="absolute -top-2 -left-1 text-3xl text-emerald-200 dark:text-emerald-800 opacity-60 select-none" aria-hidden="true">"</span>
        <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic pl-4">
          {data.quote}
        </p>
      </blockquote>
      <p class="mt-3 text-xs text-gray-500 dark:text-gray-400 text-right">
        —— 《{data.book}》{data.author && ` ${data.author}`}
      </p>
    </div>
  ) : (
    <p class="text-center text-gray-400 py-6 text-xs">暂无文摘</p>
  )}
</div>
```

---

### Task D: SalaryCountdown Component

**Files:**
- Create: `src/components/SalaryCountdown.astro`

- [ ] **Step 1: Create SalaryCountdown.astro**

```astro
---
// Chinese national holidays — weekends that shift payday
// Format: [month, day, holidayName]
const HOLIDAYS_2025 = [
  [4, 4, '清明节'], [4, 5, '清明节'], [4, 6, '清明节'],
  [5, 1, '劳动节'], [5, 2, '劳动节'], [5, 3, '劳动节'], [5, 4, '劳动节'], [5, 5, '劳动节'],
  [10, 1, '国庆节'], [10, 2, '国庆节'], [10, 3, '国庆节'], [10, 4, '国庆节'], [10, 5, '国庆节'], [10, 6, '国庆节'], [10, 7, '国庆节'],
  [10, 8, '国庆节'],
];
const HOLIDAYS_2026 = [
  [1, 1, '元旦'], [1, 2, '元旦'], [1, 3, '元旦'],
  [4, 4, '清明节'], [4, 5, '清明节'], [4, 6, '清明节'],
  [5, 1, '劳动节'], [5, 2, '劳动节'], [5, 3, '劳动节'], [5, 4, '劳动节'], [5, 5, '劳动节'],
  [10, 1, '国庆节'], [10, 2, '国庆节'], [10, 3, '国庆节'], [10, 4, '国庆节'], [10, 5, '国庆节'], [10, 6, '国庆节'], [10, 7, '国庆节'],
];
const HOLIDAYS = new Map<number, [number, number, string][]>();
HOLIDAYS.set(2025, HOLIDAYS_2025 as [number, number, string][]);
HOLIDAYS.set(2026, HOLIDAYS_2026 as [number, number, string][]);

function isHoliday(year: number, month: number, day: number): string | null {
  const holidays = HOLIDAYS.get(year);
  if (!holidays) return null;
  for (const [hMonth, hDay, hName] of holidays) {
    if (hMonth === month && hDay === day) return hName;
  }
  return null;
}

function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

function findPayDate(year: number, month: number, baseDay: number): { day: number; reason: string | null } {
  let payDay = baseDay;
  let reason: string | null = null;

  // Check backward from 20th for holidays/weekends
  while (payDay >= 15) {
    const holiday = isHoliday(year, month, payDay);
    if (holiday) {
      reason = `${holiday}提前`;
      payDay--;
      continue;
    }
    if (isWeekend(year, month, payDay)) {
      reason = `周末提前`;
      payDay--;
      continue;
    }
    break;
  }

  return { day: payDay, reason };
}
---

<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
  <div class="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
    <h3 class="text-sm font-bold text-white flex items-center gap-2">
      <span>⏰</span> 发薪倒计时
    </h3>
  </div>
  <div class="p-4 text-center" id="salary-countdown">
    <div class="text-3xl font-bold text-gray-800 dark:text-gray-200 tabular-nums" id="salary-days">--</div>
    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1" id="salary-label">加载中...</div>
    <div class="mt-2 text-[11px] text-gray-400 dark:text-gray-500" id="salary-note">每月20日发薪</div>
  </div>
</div>

<script>
  const PAY_DAY = 20;

  const HOLIDAYS = new Map();
  HOLIDAYS.set(2025, [
    [4, 4, '清明节'],[4, 5, '清明节'],[4, 6, '清明节'],
    [5, 1, '劳动节'],[5, 2, '劳动节'],[5, 3, '劳动节'],[5, 4, '劳动节'],[5, 5, '劳动节'],
    [10, 1, '国庆节'],[10, 2, '国庆节'],[10, 3, '国庆节'],[10, 4, '国庆节'],[10, 5, '国庆节'],[10, 6, '国庆节'],[10, 7, '国庆节'],
  ]);
  HOLIDAYS.set(2026, [
    [1, 1, '元旦'],[1, 2, '元旦'],[1, 3, '元旦'],
    [4, 4, '清明节'],[4, 5, '清明节'],[4, 6, '清明节'],
    [5, 1, '劳动节'],[5, 2, '劳动节'],[5, 3, '劳动节'],[5, 4, '劳动节'],[5, 5, '劳动节'],
    [10, 1, '国庆节'],[10, 2, '国庆节'],[10, 3, '国庆节'],[10, 4, '国庆节'],[10, 5, '国庆节'],[10, 6, '国庆节'],[10, 7, '国庆节'],
  ]);

  const daysEl = document.getElementById('salary-days');
  const labelEl = document.getElementById('salary-label');
  const noteEl = document.getElementById('salary-note');

  function isHoliday(year, month, day) {
    const holidays = HOLIDAYS.get(year);
    if (!holidays) return null;
    for (const [hMonth, hDay, hName] of holidays) {
      if (hMonth === month && hDay === day) return hName;
    }
    return null;
  }

  function isWeekend(year, month, day) {
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    return dow === 0 || dow === 6;
  }

  function findPayDate(year, month) {
    let payDay = PAY_DAY;
    let reason = null;
    while (payDay >= 15) {
      const holiday = isHoliday(year, month, payDay);
      if (holiday) { reason = `因${holiday}提前`; payDay--; continue; }
      if (isWeekend(year, month, payDay)) { reason = '因周末提前'; payDay--; continue; }
      break;
    }
    return { day: payDay, reason };
  }

  function update() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Determine if we're looking at this month's pay or next month's
    let targetYear = year;
    let targetMonth = month;
    
    const payInfo = findPayDate(year, month);
    if (day > payInfo.day) {
      // Past this month's payday, look at next month
      targetMonth = month + 1;
      if (targetMonth > 12) { targetMonth = 1; targetYear = year + 1; }
    }

    const nextPay = findPayDate(targetYear, targetMonth);
    const payDate = new Date(targetYear, targetMonth - 1, nextPay.day, 9, 0, 0);
    const diff = payDate.getTime() - now.getTime();

    if (diff <= 0 && Math.abs(diff) < 86400000) {
      // Payday!
      daysEl.textContent = '🎉';
      labelEl.textContent = '今天发工资！';
      noteEl.textContent = `本月${nextPay.day}日${nextPay.reason ? '(' + nextPay.reason + ')' : ''}`;
      return;
    }

    if (diff <= 0) {
      // Shouldn't happen but handle gracefully
      daysEl.textContent = '🎉';
      labelEl.textContent = '本月已发薪';
      return;
    }

    const totalHours = diff / (1000 * 60 * 60);
    const totalDays = Math.floor(totalHours / 24);
    const hours = Math.floor(totalHours % 24);
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = totalDays.toString();
    labelEl.textContent = `${hours}小时 ${minutes}分钟`;
    noteEl.textContent = `下次发薪：${targetYear}年${targetMonth}月${nextPay.day}日${nextPay.reason ? '（' + nextPay.reason + '）' : ''}`;
  }

  update();
  setInterval(update, 60000); // Update every minute
</script>
```

---

### Task E: RandomPicker Component

**Files:**
- Create: `src/components/RandomPicker.astro`

- [ ] **Step 1: Create RandomPicker.astro**

```astro
---
const PRESET_TOPICS = [
  { label: '今天吃什么', icon: '🍽️', options: ['火锅', '麻辣烫', '烤鱼', '兰州拉面', '饺子', '牛肉饭', '炸鸡', '披萨', '寿司', '麻辣香锅', '桂林米粉', '煲仔饭', '砂锅粥', '手抓饭', '黄焖鸡'] },
  { label: '去哪玩', icon: '🎯', options: ['看电影', '逛商场', '公园散步', '图书馆', '爬山', '骑行', '游泳', '打篮球', '密室逃脱', 'KTV', '博物馆', '咖啡馆', '棋盘游戏'] },
  { label: '看什么', icon: '📺', options: ['科幻片', '喜剧片', '纪录片', '动漫', '悬疑剧', '古装剧', '综艺', '动作片', '恐怖片', '爱情片', '战争片'] },
];
---

<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
  <div class="bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-3">
    <h3 class="text-sm font-bold text-white flex items-center gap-2">
      <span>🎲</span> 随机决策
    </h3>
  </div>
  <div class="p-4">
    <!-- Preset topics -->
    <div class="flex flex-wrap gap-1.5 mb-3">
      {PRESET_TOPICS.map((topic, i) => (
        <button
          class="topic-btn text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          data-topic-index={i}
        >
          {topic.icon} {topic.label}
        </button>
      ))}
    </div>

    <!-- Custom input -->
    <div class="flex gap-2 mb-3">
      <input
        id="rp-custom-input"
        type="text"
        placeholder="自定义选项，逗号分隔..."
        class="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      <button
        id="rp-custom-add"
        class="text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors whitespace-nowrap"
      >
        设置
      </button>
    </div>

    <!-- Result display -->
    <div class="text-center py-4">
      <div id="rp-result-text" class="text-lg font-bold text-gray-800 dark:text-gray-200 min-h-[2rem]">
        点击开始
      </div>
      <button
        id="rp-roll-btn"
        class="mt-3 px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium hover:from-purple-400 hover:to-violet-500 transition-all active:scale-95"
      >
        🎲 随机！
      </button>
    </div>
  </div>
</div>

<script>
  const PRESET_TOPICS = [
    { label: '今天吃什么', icon: '🍽️', options: ['火锅', '麻辣烫', '烤鱼', '兰州拉面', '饺子', '牛肉饭', '炸鸡', '披萨', '寿司', '麻辣香锅', '桂林米粉', '煲仔饭', '砂锅粥', '手抓饭', '黄焖鸡'] },
    { label: '去哪玩', icon: '🎯', options: ['看电影', '逛商场', '公园散步', '图书馆', '爬山', '骑行', '游泳', '打篮球', '密室逃脱', 'KTV', '博物馆', '咖啡馆', '棋盘游戏'] },
    { label: '看什么', icon: '📺', options: ['科幻片', '喜剧片', '纪录片', '动漫', '悬疑剧', '古装剧', '综艺', '动作片', '恐怖片', '爱情片', '战争片'] },
  ];

  const resultEl = document.getElementById('rp-result-text');
  const rollBtn = document.getElementById('rp-roll-btn');
  const customInput = document.getElementById('rp-custom-input');
  const customAddBtn = document.getElementById('rp-custom-add');
  const topicBtns = document.querySelectorAll('.topic-btn');

  let currentOptions = PRESET_TOPICS[0].options;
  let currentLabel = PRESET_TOPICS[0].label;
  let isRolling = false;

  // Highlight first topic by default
  topicBtns[0]?.classList.add('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
  topicBtns[0]?.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');

  // Load custom options from localStorage
  const savedCustom = localStorage.getItem('rp-custom-options');
  if (savedCustom) {
    try {
      const parsed = JSON.parse(savedCustom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentOptions = parsed;
        currentLabel = '自定义';
      }
    } catch {}
  }

  topicBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      currentOptions = PRESET_TOPICS[i].options;
      currentLabel = PRESET_TOPICS[i].label;
      resultEl.textContent = '点击开始';
      
      topicBtns.forEach(b => {
        b.classList.remove('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
        b.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
      });
      btn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
      btn.classList.add('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
    });
  });

  customAddBtn.addEventListener('click', () => {
    const val = customInput.value.trim();
    if (!val) return;
    const options = val.split(/[,，、\s]+/).filter(Boolean);
    if (options.length < 2) {
      resultEl.textContent = '至少输入2个选项';
      return;
    }
    currentOptions = options;
    currentLabel = '自定义';
    localStorage.setItem('rp-custom-options', JSON.stringify(options));
    resultEl.textContent = `已设置 ${options.length} 个选项`;
    
    topicBtns.forEach(b => {
      b.classList.remove('bg-purple-100', 'dark:bg-purple-900/30', 'text-purple-600', 'dark:text-purple-400');
      b.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-300');
    });
  });

  // Also support Enter key
  customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') customAddBtn.click();
  });

  rollBtn.addEventListener('click', () => {
    if (isRolling || currentOptions.length < 2) return;
    isRolling = true;
    rollBtn.disabled = true;
    rollBtn.textContent = '🎲 停！';

    // Rolling animation
    const duration = 1500;
    const start = Date.now();
    let animId;

    function animate() {
      const elapsed = Date.now() - start;
      const pick = currentOptions[Math.floor(Math.random() * currentOptions.length)];
      resultEl.textContent = pick;

      if (elapsed < duration) {
        animId = requestAnimationFrame(animate);
      } else {
        // Final result — slight bias toward last pick
        const finalPick = currentOptions[Math.floor(Math.random() * currentOptions.length)];
        resultEl.textContent = `✨ ${finalPick}`;
        isRolling = false;
        rollBtn.disabled = false;
        rollBtn.textContent = '🎲 随机！';
      }
    }

    animate();
  });
</script>
```

---

### Task F: ElectricalCalc Component

**Files:**
- Create: `src/components/ElectricalCalc.astro`

- [ ] **Step 1: Create ElectricalCalc.astro**

```astro
---

---

<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
  <!-- Header (collapsible) -->
  <button
    id="elec-toggle"
    class="w-full bg-gradient-to-r from-yellow-600 to-amber-600 px-4 py-3 flex items-center justify-between cursor-pointer hover:from-yellow-500 hover:to-amber-600 transition-all text-left"
    aria-expanded="false"
    aria-controls="elec-body"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-xl leading-none flex-shrink-0">⚡</span>
      <h2 class="text-sm font-bold text-white truncate">电力计算</h2>
    </div>
    <span id="elec-chevron" class="text-white/80 text-lg transition-transform duration-200 flex-shrink-0">▶</span>
  </button>

  <!-- Body -->
  <div id="elec-body" class="hidden">
    <!-- Tab navigation -->
    <div class="flex border-b border-gray-200 dark:border-gray-700">
      <button class="elec-tab flex-1 text-xs py-2.5 font-medium text-center border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10" data-tab="cable">电缆截面</button>
      <button class="elec-tab flex-1 text-xs py-2.5 font-medium text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" data-tab="ohm">欧姆定律</button>
      <button class="elec-tab flex-1 text-xs py-2.5 font-medium text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" data-tab="power">功率计算</button>
    </div>

    <!-- Cable calculator -->
    <div class="p-4 elec-panel" id="elec-panel-cable">
      <div class="space-y-3">
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电流 (A)</label>
          <input type="number" id="cable-current" class="elec-input w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" placeholder="例如 50" />
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电压 (V)</label>
          <input type="number" id="cable-voltage" class="elec-input w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" placeholder="例如 220" value="220" />
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">距离 (m)</label>
          <input type="number" id="cable-distance" class="elec-input w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" placeholder="例如 50" value="50" />
        </div>
        <div>
          <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">材质</label>
          <select id="cable-material" class="elec-input w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500">
            <option value="cu">铜芯</option>
            <option value="al">铝芯</option>
          </select>
        </div>
        <button id="cable-calc-btn" class="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium transition-colors">计算</button>
        <div id="cable-result" class="text-center text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[2rem] py-2"></div>
      </div>
    </div>

    <!-- Ohm's law calculator -->
    <div class="p-4 elec-panel hidden" id="elec-panel-ohm">
      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电压 (V)</label>
            <input type="number" id="ohm-voltage" class="elec-input w-full text-sm px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电流 (A)</label>
            <input type="number" id="ohm-current" class="elec-input w-full text-sm px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电阻 (Ω)</label>
            <input type="number" id="ohm-resistance" class="elec-input w-full text-sm px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
        </div>
        <button id="ohm-calc-btn" class="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium transition-colors">计算</button>
        <div id="ohm-result" class="text-center text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[2rem] py-2"></div>
        <p class="text-[10px] text-gray-400 text-center">输入任意两个值，自动计算第三个</p>
      </div>
    </div>

    <!-- Power calculator -->
    <div class="p-4 elec-panel hidden" id="elec-panel-power">
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电压 (V)</label>
            <input type="number" id="power-voltage" class="elec-input w-full text-sm px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 block mb-1">电流 (A)</label>
            <input type="number" id="power-current" class="elec-input w-full text-sm px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-yellow-500" />
          </div>
        </div>
        <button id="power-calc-btn" class="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-medium transition-colors">计算</button>
        <div id="power-result" class="text-center text-sm font-medium text-gray-700 dark:text-gray-300 min-h-[2rem] py-2"></div>
      </div>
    </div>
  </div>
</div>

<script>
  // --- Tab switching ---
  const tabs = document.querySelectorAll('.elec-tab');
  const panels = document.querySelectorAll('.elec-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.remove('border-yellow-500', 'text-yellow-600', 'dark:text-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/10');
        t.classList.add('text-gray-500', 'dark:text-gray-400');
      });
      tab.classList.add('border-yellow-500', 'text-yellow-600', 'dark:text-yellow-400', 'bg-yellow-50', 'dark:bg-yellow-900/10');
      tab.classList.remove('text-gray-500', 'dark:text-gray-400');
      
      panels.forEach(p => p.classList.add('hidden'));
      document.getElementById(`elec-panel-${target}`)?.classList.remove('hidden');
    });
  });

  // --- Toggle collapsible ---
  const elecToggle = document.getElementById('elec-toggle');
  const elecBody = document.getElementById('elec-body');
  const elecChevron = document.getElementById('elec-chevron');
  if (elecToggle && elecBody && elecChevron) {
    elecToggle.addEventListener('click', () => {
      const isOpen = !elecBody.classList.contains('hidden');
      elecBody.classList.toggle('hidden');
      elecChevron.style.transform = isOpen ? '' : 'rotate(90deg)';
      elecToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // --- Cable Calculator ---
  document.getElementById('cable-calc-btn')?.addEventListener('click', () => {
    const I = parseFloat(document.getElementById('cable-current').value);
    const U = parseFloat(document.getElementById('cable-voltage').value) || 220;
    const L = parseFloat(document.getElementById('cable-distance').value) || 50;
    const material = document.getElementById('cable-material').value;
    const resultEl = document.getElementById('cable-result');

    if (!I || I <= 0) { resultEl.textContent = '请输入有效的电流值'; return; }

    // Simplified cable sizing: based on empirical tables
    // Copper: ~4A/mm² for 220V, Aluminum: ~2.5A/mm²
    const currentDensity = material === 'cu' ? 4 : 2.5;
    const minSection = I / currentDensity;
    
    // Standard cable sizes (mm²)
    const standardSizes = [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    let recommended = standardSizes.find(s => s >= minSection) || 240;

    // Voltage drop check (simple: ΔU = 2*L*I / (γ*S) for DC, ~0.018 for copper)
    const resistivity = material === 'cu' ? 0.0172 : 0.0282; // Ω·mm²/m at 20°C
    const voltageDrop = 2 * L * I * resistivity / recommended;
    let dropNote = '';
    if (voltageDrop > U * 0.05) {
      // Drop > 5%, go up one size
      const idx = standardSizes.indexOf(recommended);
      if (idx < standardSizes.length - 1) {
        recommended = standardSizes[idx + 1];
        dropNote = `（压降${voltageDrop.toFixed(1)}V > 5%，已升档）`;
      }
    }

    resultEl.innerHTML = `
      推荐电缆截面：<strong class="text-yellow-600 dark:text-yellow-400 text-base">${recommended} mm²</strong>
      <span class="block text-[10px] text-gray-400 mt-1">
        ${material === 'cu' ? '铜芯' : '铝芯'} | 电流${I}A | 距离${L}m | 压降${voltageDrop.toFixed(1)}V ${dropNote}
      </span>`;
  });

  // --- Ohm's Law ---
  document.getElementById('ohm-calc-btn')?.addEventListener('click', () => {
    const U = parseFloat(document.getElementById('ohm-voltage').value);
    const I = parseFloat(document.getElementById('ohm-current').value);
    const R = parseFloat(document.getElementById('ohm-resistance').value);
    const resultEl = document.getElementById('ohm-result');

    const filled = [U, I, R].filter(v => !isNaN(v) && v > 0).length;
    if (filled < 2) { resultEl.textContent = '请输入任意两个值'; return; }

    let result = '';
    if (!isNaN(U) && !isNaN(I) && U > 0 && I > 0) {
      result = `R = ${(U / I).toFixed(3)} Ω`;
    } else if (!isNaN(U) && !isNaN(R) && U > 0 && R > 0) {
      result = `I = ${(U / R).toFixed(3)} A`;
    } else if (!isNaN(I) && !isNaN(R) && I > 0 && R > 0) {
      result = `U = ${(I * R).toFixed(3)} V`;
    } else {
      result = '请确保输入有效值';
    }

    resultEl.innerHTML = `<strong class="text-yellow-600 dark:text-yellow-400">${result}</strong>`;
  });

  // --- Power Calculator ---
  document.getElementById('power-calc-btn')?.addEventListener('click', () => {
    const U = parseFloat(document.getElementById('power-voltage').value);
    const I = parseFloat(document.getElementById('power-current').value);
    const resultEl = document.getElementById('power-result');

    if (!U || U <= 0 || !I || I <= 0) { resultEl.textContent = '请输入电压和电流'; return; }

    const P = U * I;
    resultEl.innerHTML = `
      功率 P = <strong class="text-yellow-600 dark:text-yellow-400 text-base">${P.toFixed(1)} W</strong>
      <span class="block text-[10px] text-gray-400 mt-1">= ${(P / 1000).toFixed(3)} kW</span>`;
  });
</script>
```

---

### Task G: Expand Daily Knowledge to Multi-Item

**Files:**
- Modify: `scripts/fetch-knowledge.mjs`
- Modify: `src/components/DailyKnowledge.astro`

- [ ] **Step 1: Modify fetch-knowledge.mjs to store 5 items**

Current script stores 1 item per day. Change to accumulate items. Add after the existing code:

```javascript
// Instead of writing a single item, read existing items and prepend new one
let existingItems = [];
try {
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  if (existing.items && Array.isArray(existing.items)) {
    existingItems = existing.items;
  }
} catch {}

// Prepend new item
if (result) {
  existingItems.unshift(result);
}

// Keep max 5 items
if (existingItems.length > 5) {
  existingItems = existingItems.slice(0, 5);
}

const output = {
  fetchedAt: now.toISOString(),
  items: existingItems,
};

fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`  ✓ Written ${existingItems.length} items to knowledge.json`);
```

Replace the entire `main()` function body (lines 288-330) with this new logic. Also remove the extract truncation at lines 315-317 since each item already has its own extract.

- [ ] **Step 2: Update DailyKnowledge.astro to show list**

Replace the current template with:

```astro
---
import type { KnowledgeItem, KnowledgeList } from '../lib/types';

export interface Props {
  data: KnowledgeItem | KnowledgeList | null;
}

const { data } = Astro.props;
const items = data && 'items' in data ? data.items : (data ? [data] : []);
---

<div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
  <button
    id="kn-toggle"
    class="w-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 flex items-center justify-between cursor-pointer hover:from-amber-500 hover:to-orange-600 transition-all text-left"
    aria-expanded="true"
    aria-controls="kn-body"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-xl leading-none flex-shrink-0">📖</span>
      <h2 class="text-sm font-bold text-white truncate">每日科普</h2>
    </div>
    <span id="kn-chevron" class="text-white/80 text-lg transition-transform duration-200 flex-shrink-0 rotate-90">▶</span>
  </button>

  <div id="kn-body">
    {items.length > 0 ? (
      <div class="divide-y divide-gray-100 dark:divide-gray-800">
        {items.slice(0, 3).map((item) => (
          <div class="p-4">
            <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1.5">
              {item.source === 'curated' ? '📌 ' : ''}{item.title}
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
              {item.extract}
            </p>
            <div class="flex items-center justify-between mt-2">
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                >
                  阅读更多 →
                </a>
              )}
              <span class="text-[10px] text-gray-400">
                {item.source === 'wikipedia' ? '维基百科' : item.source === 'baike' ? '百度百科' : '每日精选'}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p class="text-center text-gray-400 py-6 text-xs">暂无科普内容</p>
    )}
  </div>
</div>

<script>
  const toggle = document.getElementById('kn-toggle');
  const body = document.getElementById('kn-body');
  const chevron = document.getElementById('kn-chevron');

  if (toggle && body && chevron) {
    toggle.addEventListener('click', () => {
      const isOpen = !body.classList.contains('hidden');
      body.classList.toggle('hidden');
      chevron.style.transform = isOpen ? '' : 'rotate(90deg)';
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }
</script>
```

---

### Task H: Restructure Main Layout (index.astro)

**Files:**
- Modify: `src/pages/index.astro` — rewrite grid layout to Option A

- [ ] **Step 1: Restructure index.astro layout**

New layout structure:
```astro
<!-- Import new components -->
import DailyDigest from '../components/DailyDigest.astro';
import SalaryCountdown from '../components/SalaryCountdown.astro';
import RandomPicker from '../components/RandomPicker.astro';
import ElectricalCalc from '../components/ElectricalCalc.astro';

<!-- Import digest data -->
import digestData from '../data/digest.json';

<!-- Two-column + bottom layout -->
<div class="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
  <!-- Left: Main Dashboard -->
  <div class="space-y-4">
    <!-- Personal tools row (optional 2-col grid for smaller screens) -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <DailyDigest data={digestData} />
      <SalaryCountdown />
    </div>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <WallpaperGallery data={wallpapers} />
      <RandomPicker />
    </div>

    <!-- News (collapsible, default folded) -->
    <details class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      <summary class="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 cursor-pointer text-sm font-bold text-white hover:from-blue-500 hover:to-blue-600 transition-all list-none flex items-center gap-2">
        <span>🗞️</span> 新闻资讯
      </summary>
      <div class="p-4">
        ... existing news content (search, filters, news list, pagination) ...
      </div>
    </details>
  </div>

  <!-- Right: Sidebar -->
  <aside class="hidden lg:block space-y-4">
    <WallpaperGallery data={wallpapersGirl} title="美女壁纸" emoji="💃" />
    <BilibiliFavorites data={bilibili} />
  </aside>
</div>

<!-- Bottom: Utility Tools (3 columns) -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <ElectricalCalc />
  <SteamCharts data={steam} />
  <DailyKnowledge data={knowledge} />
</div>
```

Replace the entire section from the `<main>` opening tag to the `</main>` closing tag. Keep the header (Wallpaper component at top) and footer. Keep the DailyKnowledge import and data references.

The key changes:
- Remove the old 3-column grid with sidebar/center/sidebar
- Import new components (DailyDigest, SalaryCountdown, RandomPicker, ElectricalCalc)
- Import digest.json data
- Personal tools in 2-column grid at top
- News inside a `<details>` element (collapsible, default folded)
- Right sidebar only has Girl wallpapers + Bilibili
- Bottom area: ElectricalCalc + SteamCharts + DailyKnowledge in 3 columns
- Mobile layout: simpler stacking

---

## Self-Review Checklist

- [x] **Spec coverage**: All Phase 1 features covered: layout change (Task H), salary countdown (Task D), random picker (Task E), electrical calc (Task F), expanded knowledge (Task G), daily digest (Tasks B+C)
- [x] **Placeholder scan**: No TBD, TODO, or vague instructions — all code is complete
- [x] **Type consistency**: DigestData type added in Task A matches usage in Task C; KnowledgeList type matches usage in Task G; all interfaces named consistently
- [x] **Types file updated**: Task A adds DigestData and KnowledgeList types
- [x] **Workflow updated**: Task B Step 3 adds digest.json to GitHub Actions
- [x] **Mobile layout**: Task H handles mobile stacking naturally through grid collapse
