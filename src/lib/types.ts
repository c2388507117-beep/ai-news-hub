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
  fullContent?: string;
  source: string;
  category: Category;
  publishedAt: string;
  imageUrl?: string;
  type: 'article' | 'repo';
  stars?: number;
  language?: string;
}

export const ALL_CATEGORIES: Category[] = ['research', 'industry', 'trending', 'gaming'];

// --- Leaderboard types ---

export interface LeaderboardModel {
  rank: number;
  model: string;
  vendor: string;
  license: string;
  score: number;
  ci: number;
  votes: number;
}

export interface LeaderboardMeta {
  leaderboard: string;
  source_url: string;
  fetched_at: string;
  model_count: number;
}

export interface LeaderboardCategoryData {
  meta: LeaderboardMeta | null;
  models: LeaderboardModel[];
}

export interface LeaderboardData {
  fetchedAt: string | null;
  categories: Record<string, LeaderboardCategoryData>;
}

export const LEADERBOARD_CATEGORIES: { name: string; displayName: string }[] = [
  { name: 'text', displayName: '文本对话' },
  { name: 'code', displayName: '代码生成' },
  { name: 'vision', displayName: '多模态' },
];
