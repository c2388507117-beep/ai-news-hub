export type Category = 'research' | 'industry' | 'opensource' | 'trending' | 'policy' | 'gaming';

export const CATEGORY_LABELS: Record<Category, string> = {
  research: '研究突破',
  industry: '行业动态',
  opensource: '开源工具',
  trending: '热门项目',
  policy: '政策监管',
  gaming: '游戏资讯',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  research: '🔬',
  industry: '🏢',
  opensource: '🛠',
  trending: '📦',
  policy: '🏛',
  gaming: '🎮',
};

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  source: string;
  category: Category;
  publishedAt: string;
  imageUrl?: string;
  type: 'article' | 'repo';
  stars?: number;
  language?: string;
}

export const ALL_CATEGORIES: Category[] = ['research', 'industry', 'opensource', 'trending', 'policy', 'gaming'];
