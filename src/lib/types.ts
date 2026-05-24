export type Category = 'research' | 'industry' | 'trending' | 'gaming';

export const CATEGORY_LABELS: Record<Category, string> = {
  research: '研究突破',
  industry: '行业动态',
  trending: '热门项目',
  gaming: '游戏资讯',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  research: '🔬',
  industry: '🏢',
  trending: '📦',
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

export const ALL_CATEGORIES: Category[] = ['research', 'industry', 'trending', 'gaming'];
