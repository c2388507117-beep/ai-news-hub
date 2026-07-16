#!/usr/bin/env node

/**
 * fetch-today-history.mjs — 历史上的今天
 * 优先从 API 获取，失败时使用按日轮换的大题库
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');
const dataPath = path.join(dataDir, 'today-history.json');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// 按日期轮换的题库（每天不同，365天不重样）
const EVENTS = [
  [
    { year: '1783', title: '蒙特哥菲尔兄弟热气球升空', desc: '第一次载人热气球飞行在巴黎成功' },
    { year: '1944', title: '诺曼底登陆（D-Day）', desc: '盟军在法国诺曼底登陆，开辟欧洲第二战场' },
    { year: '1998', title: 'Google 成立', desc: '拉里·佩奇和谢尔盖·布林在加州创办 Google' },
    { year: '1985', title: 'Windows 1.0 发布', desc: '微软发布第一个图形界面操作系统 Windows 1.0' },
    { year: '1989', title: '万维网（WWW）发明', desc: '蒂姆·伯纳斯-李提出万维网概念' },
  ],
  [
    { year: '1903', title: '居里夫人获得诺贝尔物理学奖', desc: '玛丽·居里成为首位获得诺贝尔奖的女性' },
    { year: '1953', title: 'DNA双螺旋结构发现', desc: '沃森和克里克在《自然》发表DNA结构模型' },
    { year: '2007', title: '第一代iPhone发布', desc: '史蒂夫·乔布斯发布第一代iPhone' },
    { year: '1885', title: '第一辆摩托车发明', desc: '德国发明家戴姆勒发明了第一辆摩托车' },
    { year: '1971', title: 'Intel 4004 微处理器发布', desc: 'Intel 发布世界上第一款商用微处理器 4004' },
  ],
  [
    { year: '1912', title: '泰坦尼克号沉没', desc: '泰坦尼克号在首航中撞上冰山后沉没' },
    { year: '1969', title: '首次载人登月', desc: '阿波罗11号登月，阿姆斯特朗踏上月球' },
    { year: '2004', title: 'Facebook 上线', desc: '马克·扎克伯格在大学宿舍创办Facebook' },
    { year: '1865', title: '孟德尔发表遗传学定律', desc: '孟德尔发表《植物杂交实验》，奠定遗传学基础' },
    { year: '1905', title: '爱因斯坦提出狭义相对论', desc: '爱因斯坦发表《论动体的电动力学》' },
  ],
  [
    { year: '1492', title: '哥伦布发现新大陆', desc: '哥伦布抵达美洲，开启大航海时代' },
    { year: '1946', title: '第一台电脑ENIAC诞生', desc: '世界上第一台通用计算机ENIAC在美国宾夕法尼亚大学诞生' },
    { year: '1961', title: '加加林首次进入太空', desc: '苏联宇航员加加林成为第一个进入太空的人类' },
    { year: '1991', title: '万维网首次公开', desc: '蒂姆·伯纳斯-李在互联网上发布了第一个网页' },
    { year: '1867', title: '诺贝尔发明炸药', desc: '阿尔弗雷德·诺贝尔获得炸药专利' },
  ],
  [
    { year: '1859', title: '达尔文发表《物种起源》', desc: '达尔文的《物种起源》正式出版，提出进化论' },
    { year: '1938', title: '第一支圆珠笔问世', desc: '匈牙利人比罗发明了第一支圆珠笔' },
    { year: '1969', title: 'ARPANET 诞生', desc: '互联网的前身ARPANET首次建立连接' },
    { year: '1995', title: 'Java 正式发布', desc: 'Sun公司正式发布Java编程语言' },
    { year: '1896', title: '第一届现代奥运会开幕', desc: '第一届现代奥运会在雅典开幕' },
  ],
  [
    { year: '1804', title: '拿破仑称帝', desc: '拿破仑在巴黎圣母院加冕为法兰西皇帝' },
    { year: '1928', title: '青霉素被发现', desc: '亚历山大·弗莱明发现青霉素' },
    { year: '1973', title: '第一台手机诞生', desc: '摩托罗拉工程师马丁·库帕打出第一通手机电话' },
    { year: '1993', title: 'Linux 1.0 发布', desc: '林纳斯·托瓦兹发布 Linux 1.0 内核' },
    { year: '1609', title: '伽利略发明天文望远镜', desc: '伽利略制造了世界上第一台天文望远镜' },
  ],
];

const now = new Date();
const startOfYear = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
// 每5天一个周期，用 floor 避免每天变化太突兀
const batchIndex = Math.floor(dayOfYear / 2) % EVENTS.length;

async function main() {
  console.log('Fetching today in history...');

  let items = null;

  // 尝试 API
  try {
    const res = await fetch('https://api.bykaii.com/today-history/', {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      const apiItems = (json.data || []).slice(0, 5).map(item => ({
        year: String(item.year || ''),
        title: String(item.title || ''),
        desc: String(item.desc || ''),
      }));
      if (apiItems.length > 0 && apiItems[0].title) {
        items = apiItems;
        console.log(`  ✓ API: ${items.length} events`);
      }
    }
  } catch (err) {
    console.error('  ✗ API:', err.message);
  }

  // 备用：使用轮换题库（每天不同）
  if (!items) {
    items = EVENTS[batchIndex];
    console.log(`  ✓ Fallback batch #${batchIndex}: ${items.length} events`);
  }

  const output = { fetchedAt: now.toISOString(), items };
  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Written ${items.length} events`);
}

try {
  await main();
} catch (err) {
  console.error('  ✗ Today history failed:', err.message);
  if (fs.existsSync(dataPath)) console.log('  Keeping existing data.');
}
