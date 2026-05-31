#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'data');
const dataPath = path.join(dataDir, 'digest.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

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
const startOfYear = new Date(now.getFullYear(), 0, 0);
const diff = now - startOfYear;
const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

function main() {
  const index = dayOfYear % QUOTES.length;
  const selected = QUOTES[index];

  const output = {
    fetchedAt: now.toISOString(),
    items: [selected],
  };

  fs.writeFileSync(dataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  ✓ Digest: "${selected.quote.slice(0, 40)}..." — ${selected.book}, ${selected.author}`);
}

try {
  main();
} catch (err) {
  console.error('  ✗ Digest fetch failed:', err.message);
  // Keep existing data if fetch fails
  if (fs.existsSync(dataPath)) {
    console.log('  Keeping existing digest data.');
  }
}
