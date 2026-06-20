#!/usr/bin/env node

/**
 * fetch-digest.mjs — 每日文摘
 *
 * 与时俱进的文摘：从今日诗词 API 获取随机古诗 + 世界文学名著精选轮换
 * API: https://v2.jinrishici.com/one.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');
const dataPath = path.join(dataDir, 'digest.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 世界文学名著 + 诗歌 + 散文精选（轮换用）
const QUOTES = [
  { quote: '一个人可以被毁灭，但不能被打败。', book: '老人与海', author: '海明威' },
  { quote: '幸福的家庭都是相似的，不幸的家庭各有各的不幸。', book: '安娜·卡列尼娜', author: '列夫·托尔斯泰' },
  { quote: '所有的大人都曾经是小孩，虽然只有少数人记得。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '生命中真正重要的不是你遭遇了什么，而是你记住了哪些事，又是如何铭记的。', book: '百年孤独', author: '加西亚·马尔克斯' },
  { quote: '黑夜无论怎样悠长，白昼总会到来。', book: '麦克白', author: '莎士比亚' },
  { quote: '傲慢让别人无法来爱我，偏见让我无法去爱别人。', book: '傲慢与偏见', author: '简·奥斯汀' },
  { quote: '世界以痛吻我，要我报之以歌。', book: '飞鸟集', author: '泰戈尔' },
  { quote: '每一个不曾起舞的日子，都是对生命的辜负。', book: '查拉图斯特拉如是说', author: '尼采' },
  { quote: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', book: '阿甘正传', author: '温斯顿·格鲁姆' },
  { quote: '希望是美好的，也许是人间至善，而美好的事物永不消逝。', book: '肖申克的救赎', author: '斯蒂芬·金' },
  { quote: '一个人知道自己为什么而活，就可以忍受任何一种生活。', book: '查拉图斯特拉如是说', author: '尼采' },
  { quote: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', book: 'Vivamus Moriendum Est', author: '塞内加' },
  { quote: '在隆冬，我终于知道，我身上有一个不可战胜的夏天。', book: '夏天集', author: '阿尔贝·加缪' },
  { quote: '决定我们成为什么样人的，不是我们的能力，而是我们的选择。', book: '哈利·波特与密室', author: 'J.K.罗琳' },
  { quote: '时间以同样的方式流经每个人，而每个人却以不同的方式度过时间。', book: '挪威的森林', author: '村上春树' },
  { quote: '世界上有两件东西能震撼人们的心灵：一件是我们心中崇高的道德标准；另一件是我们头顶上灿烂的星空。', book: '实践理性批判', author: '康德' },
  { quote: '生活不可能像你想象得那么好，但也不会像你想象得那么糟。', book: '一生', author: '莫泊桑' },
  { quote: '我们曾如此渴望命运的波澜，到最后才发现，人生最曼妙的风景，竟是内心的淡定与从容。', book: '一百岁感言', author: '杨绛' },
  { quote: '读书多了，容颜自然改变。', book: '生活的艺术', author: '林语堂' },
  { quote: '我来不及认真地年轻，待明白过来时，只能选择认真地老去。', book: '三毛全集', author: '三毛' },
  { quote: '你站在桥上看风景，看风景的人在楼上看你。', book: '断章', author: '卞之琳' },
  { quote: '人生忽如寄，莫辜负茶、汤和好天气。', book: '人间有味', author: '汪曾祺' },
  { quote: '所谓无底深渊，下去，也是前程万里。', book: '素履之往', author: '木心' },
  { quote: '生如夏花之绚烂，死如秋叶之静美。', book: '飞鸟集', author: '泰戈尔' },
  { quote: '我们一直寻找的，却是自己原本早已拥有的；我们总是东张西望，唯独漏了自己想要的。', book: '理想国', author: '柏拉图' },
  { quote: '没有什么比时间更具有说服力了，因为时间无需通知我们就可以改变一切。', book: '活着', author: '余华' },
  { quote: '心不是用来算计的，心是用来感受的。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '爱不是相互凝望，而是一起朝同一个方向看去。', book: '小王子', author: '圣埃克苏佩里' },
  { quote: '每一个灵魂都是独一无二的，都有自己独特的道路。', book: '查拉图斯特拉如是说', author: '尼采' },
  { quote: '我们必须习惯，站在人生的交叉路口，却没有红绿灯的事实。', book: '海边的卡夫卡', author: '村上春树' },
];

async function fetchChinesePoem() {
  try {
    const res = await fetch('https://v2.jinrishici.com/one.json', {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'AI-News-Hub/1.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json?.status === 'success' && json?.data?.content) {
      return {
        quote: json.data.content,
        book: json.data.origin || '古诗',
        author: json.data.author || '佚名',
      };
    }
    return null;
  } catch (err) {
    console.error('  ✗ Poetry API:', err.message);
    return null;
  }
}

function getCuratedQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

async function main() {
  console.log('Fetching daily digest...');

  // Try dynamic poetry API first
  const poem = await fetchChinesePoem();
  const curated = getCuratedQuote();

  const items = [];
  if (poem) {
    items.push(poem);
    console.log(`  ✓ 今日诗词: "${poem.quote.slice(0, 30)}..." — ${poem.author}`);
  }
  if (curated) {
    items.push(curated);
    console.log(`  ✓ 文学精选: "${curated.quote.slice(0, 30)}..." — ${curated.book}`);
  }

  if (items.length === 0) {
    console.log('  ✗ No digest items available');
    return;
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    items,
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Written ${items.length} items to digest.json`);
}

try {
  await main();
} catch (err) {
  console.error('  ✗ Digest failed:', err.message);
  if (fs.existsSync(dataPath)) {
    console.log('  Keeping existing digest data.');
  }
}
