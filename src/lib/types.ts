export type Category = 'ai' | 'tech' | 'business' | 'gaming';

export const CATEGORY_LABELS: Record<Category, string> = {
  ai: 'AI 前沿',
  tech: '科技动态',
  business: '商业财经',
  gaming: '游戏资讯',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  ai: '🤖',
  tech: '💻',
  business: '📈',
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

export const ALL_CATEGORIES: Category[] = ['ai', 'tech', 'business', 'gaming'];

export function isValidCategory(c: string): c is Category {
  return ['ai', 'tech', 'business', 'gaming'].includes(c);
}

/** Lightweight reference for related-item lookups (used by index.astro). */
export interface RelatedItemRef {
  t: string; // title
  u: string; // url
}

// --- Hot Topic types ---

export interface HotTopic {
  title: string;
  url: string;
  brief: string;
  date: string;
  source: string;
  hot: boolean;
}

// --- Music types ---

export interface MusicSong {
  id: string;
  title: string;
  artist: string;
}

// --- Wallpaper types ---

export interface WallpaperItem {
  url: string;
  title?: string;
  copyright?: string;
  date?: string;
}

export interface WallpaperData {
  fetchedAt: string | null;
  urls: (string | WallpaperItem)[];
}

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

// --- Football types ---

export interface FootballStanding {
  position: number;
  teamId: string;
  teamName: string;
  teamAbbrev: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  note: string;
  noteColor: string;
}

export interface FootballMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  isHome: boolean;
}

export interface FootballData {
  fetchedAt: string;
  standings: FootballStanding[];
  lastMatch: FootballMatch | null;
  nextMatch: FootballMatch | null;
}

// --- Tool types ---

export interface Tool {
  name: string;
  url: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  popular: boolean;
}

export const TOOL_CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'chat', label: '对话助手', emoji: '💬' },
  { key: 'code', label: '代码开发', emoji: '👩‍💻' },
  { key: 'image', label: '图像生成', emoji: '🎨' },
  { key: 'video', label: '视频生成', emoji: '🎬' },
  { key: 'audio', label: '音频音乐', emoji: '🎵' },
  { key: 'search', label: 'AI 搜索', emoji: '🔎' },
];

export const LEADERBOARD_CATEGORIES: { name: string; displayName: string }[] = [
  { name: 'text', displayName: '文本对话' },
  { name: 'code', displayName: '代码生成' },
  { name: 'vision', displayName: '多模态' },
];

// --- Steam types ---

export interface SteamItem {
  name: string;
  appid: number;
  price: number;
  finalPrice: number;
  discount: number;
  imageUrl: string;
}

export interface SteamMostPlayedItem {
  rank: number;
  appid: number;
  name: string;
  concurrentPlayers: number;
}

export interface SteamData {
  fetchedAt: string;
  topSellers: SteamItem[];
  mostPlayed: SteamMostPlayedItem[];
}

// --- Bilibili types ---

export interface BilibiliFolder {
  id: number;
  title: string;
  mediaCount: number;
}

export interface BilibiliVideo {
  bvid: string;
  title: string;
  cover: string;
  link: string;
  author: string;
  duration: number;
  progress: number;
  remaining: number;
  isWatched: boolean;
}

export interface BilibiliData {
  fetchedAt: string;
  folders: BilibiliFolder[];
  videos: BilibiliVideo[];
}

// --- Knowledge types ---

export interface KnowledgeItem {
  fetchedAt: string;
  title: string;
  extract: string;
  url: string;
  imageUrl: string | null;
  source: string;
}

// --- Digest types ---

export interface DigestItem {
  quote: string;
  book: string;
  author: string;
}

export interface DigestData {
  fetchedAt: string;
  items: DigestItem[];
}

export interface TodayHistoryItem {
  year: string;
  title: string;
  desc: string;
}
export interface TodayHistoryData {
  fetchedAt: string;
  items: TodayHistoryItem[];
}

export interface KnowledgeList {
  fetchedAt: string;
  items: KnowledgeItem[];
}

