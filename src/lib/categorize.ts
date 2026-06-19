import type { Category } from './types';

// Keyword rules for auto-categorization
export const CATEGORY_RULES: { category: Category; keywords: string[] }[] = [
  {
    category: 'ai',
    keywords: [
      'ai', '人工智能', '大模型', 'gpt', 'llm', 'openai', 'chatgpt', 'claude',
      'gemini', 'llama', 'deepseek', 'qwen', '通义', '文心', '星火', '混元',
      'neural', '深度学习', '机器学习', 'pytorch', 'tensorflow', 'hugging face',
      'copilot', 'agi', 'transformer', 'diffusion', 'stable diffusion',
      'computer vision', '计算机视觉', 'nlp', '自然语言处理',
      '强化学习', 'reinforcement learning', '多模态', 'multimodal',
      '向量', 'embedding', 'ai agent', '智能体',
      '推理', 'inference', '模型', 'model', '训练', 'training',
    ],
  },
  {
    category: 'tech',
    keywords: [
      'iphone', 'android', '芯片', '处理器', '手机', '电脑', '笔记本',
      '华为', '小米', 'apple', 'samsung', '5g', '6g', '操作系统',
      '软件', 'app', 'ios', 'mac', 'windows', 'linux', '智能',
      '可穿戴', 'vr', 'ar', '自动驾驶', '电动汽车', '机器人',
      'iot', '传感器', '显卡', 'gpu', 'cpu', '固态', 'ssd', '内存',
      '屏幕', '显示器', '电池', '充电', '数码', '科技',
    ],
  },
  {
    category: 'business',
    keywords: [
      '融资', '上市', '收购', '投资', '财报', '营收', '利润', '市值',
      '创业', '独角兽', 'ipo', '估值', '股票', '股东', '股市',
      '监管', '反垄断', '合规', '裁员', '招聘', '比特币', '加密货币',
      '区块链', 'web3', '元宇宙', '量化', '基金', '金融',
    ],
  },
];

export const JUNK_PATTERNS: RegExp[] = [
  /登录\s*(注册)?\s*(免费)?\s*(订阅)?\s*(阅读)?\s*(全文)?\s*(查看)?\s*(更多)?/gi,
  /免费\s*(订阅|注册)/gi,
  /点击\s*(阅读|查看|下载|订阅|关注)/gi,
  /本文\s*(来自|来源于|转载|出处)/gi,
  /扫描\s*二维码/gi,
  /关注\s*(我们|公众号)/gi,
  /微信\s*(搜索|扫码)/gi,
  /投稿|商务合作|广告|推广/gi,
  /免责声明|版权声明|免责条款/gi,
  /Copyright\s+\d+/gi,
  /All\s+[Rr]ights\s+[Rr]eserved/gi,
  /未经.*(许可|授权|允许).*不得/gi,
  /\[领取.*\]|抽奖|奖品|抽送|红包|福利/gi,
  /分享到|转发|点赞|在看/gi,
  /阅读原文|了解更多/gi,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
];

export const COMMON_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'has', 'have',
  'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'may', 'might',
  'this', 'that', 'these', 'those', 'its', 'it', 'we', 'they', 'he', 'she',
  'not', 'no', 'all', 'new', 'how', 'why', 'what', 'who', 'which', 'up', 'out',
]);

/**
 * Auto-categorize an article based on title + summary keyword matching.
 * Returns the category with the highest keyword match count.
 * If no keywords match, returns the default category.
 */
export function autoCategorize(
  title: string,
  summary: string,
  defaultCategory: Category = 'tech'
): Category {
  const text = (title + ' ' + summary).toLowerCase();
  const scores: Partial<Record<Category, number>> = {};
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) scores[rule.category] = score;
  }
  const entries = Object.entries(scores) as [Category, number][];
  if (entries.length === 0) return defaultCategory;
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Clean content by removing junk patterns (ads, login prompts, boilerplate).
 */
export function cleanContent(text: string): string {
  if (!text) return '';
  let cleaned = text;
  for (const pattern of JUNK_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s*[\r\n]/gm, '\n');
  return cleaned.trim();
}

/**
 * Generate a summary by extracting the first meaningful sentences.
 */
export function generateSummary(text: string, maxLen = 400): string {
  if (!text) return '';
  const cleaned = cleanContent(text);
  const sentences = cleaned.split(/(?<=[。！？.!?\n])\s*/).filter((s) => s.trim().length > 10);
  let summary = '';
  for (const sentence of sentences) {
    if ((summary + sentence).length > maxLen) {
      if (!summary) return sentence.slice(0, maxLen) + '…';
      break;
    }
    summary += sentence;
  }
  return summary || cleaned.slice(0, maxLen).trim();
}

/**
 * Extract meaningful keywords from a title for related-article matching.
 */
export function extractKeywords(title: string): string[] {
  const cleaned = title.toLowerCase().replace(/[^\w一-鿿]/g, ' ');
  const tokens: string[] = [];
  for (const word of cleaned.split(/\s+/)) {
    if (word.length >= 3 && !COMMON_WORDS.has(word)) tokens.push(word);
  }
  const chineseChars = title.match(/[一-鿿]/g) || [];
  for (let i = 0; i < chineseChars.length - 1; i++) {
    tokens.push(chineseChars[i] + chineseChars[i + 1]);
  }
  return [...new Set(tokens)];
}

/**
 * Get related articles from a list based on keyword overlap.
 */
export function getRelated<T extends { id: string; title: string; category: string; publishedAt: string }>(
  item: T,
  all: T[],
  max = 3
): T[] {
  const tokens = extractKeywords(item.title);
  if (tokens.length === 0) return [];
  const scored = all
    .filter((n) => n.id !== item.id && n.category === item.category)
    .map((n) => {
      const otherTokens = extractKeywords(n.title);
      const overlap = tokens.filter((t) => otherTokens.includes(t)).length;
      return { item: n, score: overlap };
    })
    .filter((n) => n.score > 0);
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime();
  });
  return scored.slice(0, max).map((s) => s.item);
}
