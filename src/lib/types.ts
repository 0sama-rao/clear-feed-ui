// ── Shared types matching backend API responses ──

export interface Source {
  id: string;
  userId: string;
  url: string;
  name: string;
  type: 'RSS' | 'WEBSITE';
  active: boolean;
  createdAt: string;
}

export interface Keyword {
  id: string;
  userId: string;
  word: string;
  createdAt: string;
}

export interface ArticleSource {
  id: string;
  name: string;
  url: string;
}

// ── v1 flat feed (still used for "All Articles" toggle) ──

export interface FeedArticle {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  publishedAt: string;
  scrapedAt: string;
  source: ArticleSource;
  matchedKeywords: string[];
  read: boolean;
  sent: boolean;
}

export interface FeedArticleDetail extends FeedArticle {
  content: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedResponse {
  articles: FeedArticle[];
  pagination: PaginationInfo;
}

// ── v2 Onboarding ──

export interface Signal {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  signals: Signal[];
}

export interface IndustriesResponse {
  industries: Industry[];
}

export interface OnboardingResult {
  message: string;
  industry: { id: string; name: string; slug: string };
  sourcesAdded: number;
  keywordsAdded: number;
}

// ── v2 Grouped Intelligence Feed ──

export interface Entity {
  type: 'COMPANY' | 'PERSON' | 'PRODUCT' | 'GEOGRAPHY' | 'SECTOR';
  name: string;
  confidence: number;
}

export interface ArticleSignal {
  name: string;
  slug: string;
  confidence: number;
}

export interface GroupArticlePreview {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  source: ArticleSource;
  entities: Entity[];
  signals: ArticleSignal[];
}

export interface GroupBriefing {
  id: string;
  title: string;
  synopsis: string;
  executiveSummary: string;
  impactAnalysis: string;
  actionability: string;
  confidence: number;
  date: string;
  articleCount: number;
  articles: GroupArticlePreview[];
}

export interface GroupedFeedResponse {
  groups: GroupBriefing[];
  pagination: PaginationInfo;
}

export interface GroupArticleFull {
  id: string;
  title: string;
  url: string;
  content: string | null;
  cleanText: string | null;
  summary: string | null;
  publishedAt: string;
  author: string | null;
  source: ArticleSource;
  entities: Entity[];
  signals: ArticleSignal[];
  matchedKeywords: string[];
  read: boolean;
}

export interface GroupDetail {
  id: string;
  title: string;
  synopsis: string;
  executiveSummary: string;
  impactAnalysis: string;
  actionability: string;
  confidence: number;
  date: string;
  articles: GroupArticleFull[];
}

// ── Admin ──

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  sourcesCount: number;
  keywordsCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSources: number;
  totalKeywords: number;
  totalArticles: number;
  totalMatched: number;
}

// ── Digest ──

export interface DigestResult {
  message: string;
  result: {
    scraped: number;
    matched: number;
    summarized: number;
    errors: string[];
  };
}

export interface DigestAllResult {
  message: string;
  results: Array<{
    userId: string;
    scraped: number;
    matched: number;
    summarized: number;
    errorCount: number;
  }>;
}
