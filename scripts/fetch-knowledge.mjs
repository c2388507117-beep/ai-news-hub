#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, '..', 'src', 'data', 'knowledge.json');

const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const diff = now - start;
const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

const WIKIPEDIA_URL = 'https://zh.wikipedia.org/api/rest_v1/page/random/summary';

async function fetchFromWikipedia() {
  const res = await fetch(WIKIPEDIA_URL, {
    headers: { 'User-Agent': 'ai-news-hub/1.0' },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
  const data = await res.json();

  const extract = data.extract ? data.extract.slice(0, 500) : '';
  return {
    title: data.title || '',
    extract,
    url: data.content_urls?.desktop?.page || '',
    imageUrl: data.thumbnail?.source || null,
    source: 'wikipedia',
  };
}

function getCuratedFact() {
  const facts = [
    {
      title: '光的波粒二象性',
      extract: '光既可以表现出波的特性，也可以表现出粒子的特性，这一理论被称为波粒二象性。爱因斯坦通过光电效应实验证明光由光子组成，而托马斯·杨的双缝实验则展示了光的波动性。这一概念是量子力学的基石之一。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '人类基因组计划',
      extract: '人类基因组计划于1990年正式启动，2003年完成，历时13年，耗资约30亿美元。该计划成功绘制了人类基因组的完整图谱，确定了约2.5万个基因的序列，为现代医学和生物学的革命性发展奠定了基础。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '围棋的复杂度',
      extract: '围棋的棋盘为19×19网格，其可能的棋局数量约为10的170次方，远超宇宙中的原子总数（约10的80次方）。正因如此，围棋长期被视为人工智能领域最难攻克的棋类游戏，直到2016年AlphaGo击败李世石。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '丝绸之路',
      extract: '丝绸之路是公元前2世纪至公元15世纪连接中国与地中海世界的贸易网络，全长约7000公里。它不仅交易丝绸、香料、宝石等商品，更促进了东西方文化、宗教和技术的交流，佛教、伊斯兰教、造纸术、火药等都通过这条路线传播。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '贝多芬的第九交响曲',
      extract: '贝多芬的《第九交响曲》创作于1822至1824年间，是音乐史上第一部加入合唱的交响曲。此时的贝多芬已完全失聪，但他仍然完成了这部杰作。终乐章《欢乐颂》的旋律取自席勒的同名诗歌，现为欧盟的官方颂歌。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '万有引力定律',
      extract: '艾萨克·牛顿在1687年发表的《自然哲学的数学原理》中提出了万有引力定律：任意两个质点之间都存在相互吸引的力，其大小与质量的乘积成正比，与距离的平方成反比。传说牛顿因观察到苹果落地而联想到引力的存在。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '玛雅文明',
      extract: '玛雅文明是美洲三大古文明之一，存在于公元前2000年至公元1500年左右的墨西哥和中美洲地区。玛雅人创造了美洲唯一的完整文字系统，发展出精密的历法和天文学知识，并建造了众多金字塔和城市。其古典期在公元900年左右神秘衰落。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '元素周期表',
      extract: '元素周期表由俄国化学家门捷列夫于1869年首次提出。他按照原子量和化学性质将已知的63种元素排列成表，并大胆预测了尚未发现的元素的性质。现代周期表按原子序数排列，共有118个确认元素，是化学科学的基石工具。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '威尼斯',
      extract: '威尼斯建于公元5世纪，建在亚得里亚海威尼斯潟湖中的118个小岛上，通过177条水道和约400座桥梁连接。整座城市没有汽车，交通工具主要是船只。威尼斯在历史上曾是威尼斯共和国的中心，被称为"亚得里亚海的女王"。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: 'DNA双螺旋结构',
      extract: '1953年，詹姆斯·沃森和弗朗西斯·克里克在《自然》杂志上发表了DNA的双螺旋结构模型。这一发现揭示了遗传信息的存储和传递机制，标志着分子生物学的诞生。他们利用罗莎琳德·富兰克林的X射线衍射照片得出了这一突破性结论。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '蒙娜丽莎',
      extract: '《蒙娜丽莎》是列奥纳多·达·芬奇于1503至1506年间创作的肖像画，现藏于法国卢浮宫博物馆。画中人物的神秘微笑和达·芬奇运用的"晕涂法"技法使其成为世界上最著名的画作之一。该画每年吸引约600万游客前来参观。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '互联网的起源',
      extract: '互联网的前身是1969年美国国防部高级研究计划局（ARPA）建立的阿帕网（ARPANET），最初仅连接了4所大学的计算机。1989年，蒂姆·伯纳斯-李提出了万维网的概念，发明了HTTP协议和HTML语言，为现代互联网奠定了基础。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '哈勃太空望远镜',
      extract: '哈勃太空望远镜于1990年由发现号航天飞机送入轨道，以天文学家埃德温·哈勃命名。它在距离地球约540公里的轨道上运行，避免了大气层的干扰，拍摄了无数深空图像。哈勃的观测帮助科学家确定了宇宙的年龄约为138亿年。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '罗马数字的起源',
      extract: '罗马数字起源于古罗马，大约在公元前8至9世纪开始使用。其基本符号包括I（1）、V（5）、X（10）、L（50）、C（100）、D（500）、M（1000）。罗马数字采用加减组合的记数方式，如IV表示5减1等于4。如今常用于钟表、书名和年份标记。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '埃菲尔铁塔',
      extract: '埃菲尔铁塔建于1887至1889年间，为1889年巴黎世博会而建，以工程师古斯塔夫·埃菲尔的名字命名。塔高330米，采用锻铁结构，由18038个金属部件和250万个铆钉组成。原计划在建造20年后拆除，但因无线电通信价值而被保留。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '光合作用',
      extract: '光合作用是植物、藻类和某些细菌利用光能将二氧化碳和水转化为有机物和氧气的过程。该过程发生在叶绿体中，依靠叶绿素吸收光能。光合作用每年约产生1400亿吨有机物，是地球生命所需能量和氧气的主要来源。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '大堡礁',
      extract: '大堡礁位于澳大利亚东北海岸，全长约2300公里，由约2900个独立礁石和900个岛屿组成，是世界上最大的珊瑚礁系统。它于1981年被列为世界自然遗产，拥有超过1500种鱼类、400种珊瑚和众多海洋生物。大堡礁对气候变化极为敏感。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '四季的成因',
      extract: '地球四季的形成并非因为太阳距离的变化，而是由于地轴与轨道平面之间存在约23.5度的倾斜角。当地球公转时，南北半球交替朝向太阳，导致日照角度和时长的变化，从而形成春、夏、秋、冬四季。这一倾斜角也决定了回归线的位置。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '巧克力与可可',
      extract: '可可豆原产于中美洲和南美洲，奥尔梅克文明是最早利用可可的人类，距今约3500年。可可豆曾被阿兹特克人用作货币和制作"神的食物"——一种苦味饮料。现代巧克力直到1847年才由英国公司J.S. Fry & Sons制成固体食用形态。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '联合国成立',
      extract: '联合国于1945年10月24日正式成立，由51个国家在旧金山签署《联合国宪章》而创立，以取代失败的国际联盟。联合国的宗旨包括维护国际和平与安全、促进社会进步和更高生活标准。目前有193个成员国，总部设在纽约市。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '青霉素的发现',
      extract: '1928年，英国细菌学家亚历山大·弗莱明在伦敦圣玛丽医院的实验室中发现，青霉素霉菌能抑制葡萄球菌的生长。这一发现开启了抗生素时代，但直到二战期间才实现大规模量产。弗莱明与霍华德·弗洛里和恩斯特·钱恩共同获得了1945年的诺贝尔奖。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '泰姬陵',
      extract: '泰姬陵位于印度阿格拉，是莫卧儿帝国皇帝沙贾汗为纪念其爱妻慕塔芝玛哈于1632至1653年间建造的陵墓。它全部采用白色大理石建造，以精美的宝石镶嵌和伊斯兰几何图案装饰。泰姬陵被公认为伊斯兰建筑的瑰宝，每年吸引约800万游客。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '人类大脑的能耗',
      extract: '人类大脑虽然仅占体重的约2%，却消耗了全身约20%的能量和氧气。大脑拥有约860亿个神经元，每个神经元与数千个其他神经元相连，形成复杂的神经网络。大脑的能耗主要用于维持神经元之间的电化学信号传递。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '造纸术的发明',
      extract: '造纸术由东汉宦官蔡伦于公元105年改进并推广。他利用树皮、麻头、破布和旧渔网为原料，制造出轻便廉价的纸张。造纸术后来通过阿拉伯世界传入欧洲，极大地促进了知识的传播和记录，被列为中国古代四大发明之一。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '极光的原理',
      extract: '极光是太阳风中的带电粒子被地球磁场引导至两极附近的高空，与大气中的原子和分子碰撞而产生的发光现象。极光颜色取决于碰撞的气体种类和高度：氧原子产生绿色和红色，氮分子产生蓝色和紫色。极光主要出现在南北极圈附近的高纬度地区。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '罗塞塔石碑',
      extract: '罗塞塔石碑于1799年在埃及罗塞塔镇被发现，上面刻有古希腊文、埃及象形文和通俗体文字三种文字书写的同一段诏书。法国学者商博良利用这块石碑成功破译了古埃及象形文字，打开了理解古埃及文明的大门。现藏于大英博物馆。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '莫比乌斯环',
      extract: '莫比乌斯环由德国数学家奥古斯特·莫比乌斯于1858年发现，是将一条纸条扭转180度后两端粘合而成的曲面。它只有一个面和一条边界，是一个不可定向的曲面。从环上任一点出发沿表面行进，最终会回到起点但方向反转。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '咖啡的传播',
      extract: '咖啡原产于埃塞俄比亚，传说公元9世纪一位牧羊人发现羊吃了咖啡果实后变得异常活跃。咖啡从15世纪开始在也门苏菲派修道院中作为提神饮品使用，随后传入麦加、开罗等地。17世纪欧洲第一家咖啡馆在威尼斯开业，咖啡从此风靡全球。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '珠穆朗玛峰',
      extract: '珠穆朗玛峰海拔8848.86米，是地球上最高的山峰，位于喜马拉雅山脉中尼边界上。1953年，埃德蒙·希拉里和丹增·诺尔盖首次登顶。珠峰每年约以4毫米的速度上升，由印度板块与欧亚板块持续碰撞所致。藏语中"珠穆朗玛"意为"圣母"。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '蝴蝶效应',
      extract: '蝴蝶效应是混沌理论中的重要概念，由气象学家爱德华·洛伦兹在1963年提出。其核心思想是初始条件的微小变化可能导致长期结果的巨大差异——一只蝴蝶在巴西扇动翅膀可能引发德克萨斯州的一场龙卷风。这一概念后来被广泛应用于气象学、经济学和系统科学中。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '死海古卷',
      extract: '死海古卷是1947至1956年间在死海附近的库姆兰洞穴中发现的一批古代犹太文献，包含约900份手稿，其中大部分是希伯来文、阿拉姆文和希腊文写成的。这些文献包括现存最古老的旧约圣经抄本，距今约2000年，对研究犹太教和基督教的起源具有不可估量的价值。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '语言的多样性',
      extract: '目前全世界约有7000种语言，但超过一半的语言面临消亡的危险。世界上使用人数最多的语言是汉语（约13亿），其次是西班牙语和英语。巴布亚新几内亚虽然只有约900万人口，却拥有超过800种语言，是语言多样性最丰富的国家。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '黄金比例',
      extract: '黄金比例约等于1.618，通常用希腊字母φ（phi）表示。它定义为将一条线段分成两段，使较长段与全长的比等于较短段与较长段的比。黄金比例在自然界中广泛存在，如向日葵种子的螺旋排列、鹦鹉螺的壳等，在艺术和建筑中也常被用作和谐的比例标准。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '国际空间站',
      extract: '国际空间站（ISS）始于1998年，是由美国、俄罗斯、欧洲、日本和加拿大等15个国家合作建造的太空实验室。它在距地球约400公里的轨道上运行，以每小时约28000公里的速度绕地球飞行，每90分钟绕行一圈。ISS长109米，面积相当于一个足球场。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
    {
      title: '细菌与人体健康',
      extract: '人体内寄居着约100万亿个微生物，数量是人体自身细胞的10倍。这些微生物总重量约1至2公斤，主要分布在肠道、皮肤和口腔中。肠道微生物群帮助消化食物、合成维生素、调节免疫系统，甚至影响情绪和行为。每个人的微生物组都是独一无二的。',
      url: '',
      imageUrl: null,
      source: 'curated',
    },
  ];

  const index = dayOfYear % facts.length;
  return { ...facts[index] };
}

async function main() {
  console.log('Fetching knowledge fact...');

  let result = null;

  // Try Wikipedia API first
  try {
    console.log('  Trying Wikipedia API...');
    result = await fetchFromWikipedia();
    console.log(`  ✓ Fetched from Wikipedia: ${result.title}`);
  } catch (err) {
    console.log('  ✗ Wikipedia API failed:', err.message);
  }

  // Fallback to curated facts
  if (!result) {
    console.log('  Using curated fact (seeded by day of year)...');
    result = getCuratedFact();
    console.log(`  ✓ Curated fact: ${result.title}`);
  }

  // Ensure extract is at most 500 chars
  if (result && result.extract && result.extract.length > 500) {
    result.extract = result.extract.slice(0, 500);
  }

  // Read existing items and prepend new one
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

  // Graceful degradation: if all sources failed, try to keep existing data
  if (!result) {
    if (fs.existsSync(dataPath)) {
      console.log('  All sources failed. Keeping existing knowledge data.');
    } else {
      console.log('  All sources failed and no existing data found.');
    }
  }
}

main().catch((err) => {
  console.error('  ✗ Knowledge fetch failed:', err.message);
  // Keep existing data if fetch fails
  if (fs.existsSync(dataPath)) {
    console.log('  Keeping existing knowledge data.');
  }
});
