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
