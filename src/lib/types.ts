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
  caseType: number | null;
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
  caseType: number | null;
  date: string;
  articles: GroupArticleFull[];
}

// ── Period Reports ──

export type Period = '1d' | '7d' | '30d';

export interface PeriodReportEntity {
  name: string;
  type: Entity['type'];
  count: number;
}

export interface PeriodReport {
  period: Period;
  fromDate: string;
  toDate: string;
  summary: string;
  stats: {
    totalStories: number;
    totalArticles: number;
    criticalStories: number;
    signalDistribution: Record<string, number>;
    topEntities: PeriodReportEntity[];
    storiesPerDay: Record<string, number>;
    vulnerableStories?: number;
    fixedStories?: number;
    infoStories?: number;
    topAffectedProducts?: string[];
    topAffectedSectors?: string[];
    topThreatActors?: string[];
  };
  generatedAt: string;
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

// ── User Settings (Schedule + Email) ──

export type DigestInterval = '1h' | '3h' | '6h' | '12h' | '1d' | '3d' | '7d';

export interface UserSettings {
  digestFrequency: DigestInterval;
  digestTime: string;          // HH:MM (UTC)
  emailEnabled: boolean;
  lastDigestAt: string | null;
  email: string;
}

// ── Tech Stack ──

export type TechStackCategory =
  | 'EDGE_DEVICE'
  | 'NETWORK'
  | 'OS'
  | 'APPLICATION'
  | 'CLOUD'
  | 'IDENTITY'
  | 'DATABASE'
  | 'LIBRARY'
  | 'OTHER';

export interface TechStackItem {
  id: string;
  userId: string;
  vendor: string;
  product: string;
  version: string | null;
  category: TechStackCategory;
  cpePattern: string;
  active: boolean;
  createdAt: string;
  _count: { exposures: number };
}

export interface TechStackCatalogItem {
  vendor: string;
  product: string;
  category: TechStackCategory;
  displayName: string;
}

export interface TechStackBulkResult {
  added: number;
  skipped: number;
}

export interface TechStackCreateResult extends TechStackItem {
  retroactiveMatches: number;
}

// ── Exposure ──

export type ExposureState = 'VULNERABLE' | 'FIXED' | 'NOT_APPLICABLE' | 'INDIRECT';

export interface ExposureArticleCve {
  cveId: string;
  cvssScore: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  inKEV: boolean;
  kevDueDate: string | null;
}

export interface ExposureTechStackRef {
  vendor: string;
  product: string;
  version: string | null;
  category: TechStackCategory;
}

export interface Exposure {
  id: string;
  cveId: string;
  exposureState: ExposureState;
  firstDetectedAt: string;
  patchedAt: string | null;
  remediationDeadline: string | null;
  articleCve: ExposureArticleCve;
  techStackItem: ExposureTechStackRef;
}

export interface ExposureListResponse {
  data: Exposure[];
  pagination: PaginationInfo;
}

export interface ExposureStats {
  totalVulnerable: number;
  totalFixed: number;
  totalNotApplicable: number;
  totalIndirect: number;
  totalOverdue: number;
  patchRate: number;
  slaCompliance: number;
  avgMttrDays: number;
  medianMttrDays: number;
  kevExposureCount: number;
  overdueKevCount: number;
  criticalExposed: number;
  avgCvssExposed: number;
}
