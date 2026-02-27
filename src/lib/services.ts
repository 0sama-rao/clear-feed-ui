import api from './api';
import type {
  Source,
  Keyword,
  FeedResponse,
  FeedArticleDetail,
  AdminUser,
  AdminStats,
  DigestResult,
  DigestAllResult,
  IndustriesResponse,
  OnboardingResult,
  GroupedFeedResponse,
  GroupDetail,
  Period,
  PeriodReport,
  UserSettings,
  DigestInterval,
  TechStackItem,
  TechStackCatalogItem,
  TechStackBulkResult,
  TechStackCreateResult,
  TechStackCategory,
  Exposure,
  ExposureListResponse,
  ExposureStats,
  ExposureState,
} from './types';

// ── Sources ──

export async function getSources(): Promise<Source[]> {
  const { data } = await api.get<Source[]>('/api/sources');
  return data;
}

export async function createSource(body: {
  url: string;
  name: string;
  type: 'RSS' | 'WEBSITE';
}): Promise<Source> {
  const { data } = await api.post<Source>('/api/sources', body);
  return data;
}

export async function updateSource(
  id: string,
  body: Partial<Pick<Source, 'url' | 'name' | 'type' | 'active'>>
): Promise<Source> {
  const { data } = await api.put<Source>(`/api/sources/${id}`, body);
  return data;
}

export async function deleteSource(id: string): Promise<void> {
  await api.delete(`/api/sources/${id}`);
}

// ── Keywords ──

export async function getKeywords(): Promise<Keyword[]> {
  const { data } = await api.get<Keyword[]>('/api/keywords');
  return data;
}

export async function createKeyword(word: string): Promise<Keyword> {
  const { data } = await api.post<Keyword>('/api/keywords', { word });
  return data;
}

export async function deleteKeyword(id: string): Promise<void> {
  await api.delete(`/api/keywords/${id}`);
}

// ── Feed (v1 flat) ──

export async function getFeed(
  page = 1,
  limit = 20
): Promise<FeedResponse> {
  const { data } = await api.get<FeedResponse>('/api/feed', {
    params: { page, limit },
  });
  return data;
}

export async function getFeedArticle(id: string): Promise<FeedArticleDetail> {
  const { data } = await api.get<FeedArticleDetail>(`/api/feed/${id}`);
  return data;
}

// ── Feed (v2 grouped intelligence) ──

export async function getGroupedFeed(
  page = 1,
  limit = 10,
  period?: Period
): Promise<GroupedFeedResponse> {
  const { data } = await api.get<GroupedFeedResponse>('/api/feed/brief', {
    params: { page, limit, ...(period ? { period } : {}) },
  });
  return data;
}

export async function getPeriodReport(period: Period): Promise<PeriodReport> {
  const { data } = await api.get<PeriodReport>('/api/feed/brief/report', {
    params: { period },
  });
  return data;
}

export async function getGroupDetail(id: string): Promise<GroupDetail> {
  const { data } = await api.get<GroupDetail>(`/api/feed/groups/${id}`);
  return data;
}

// ── Onboarding ──

export async function getIndustries(): Promise<IndustriesResponse> {
  const { data } = await api.get<IndustriesResponse>('/api/onboarding/industries');
  return data;
}

export async function submitOnboarding(industrySlug: string): Promise<OnboardingResult> {
  const { data } = await api.post<OnboardingResult>('/api/onboarding', {
    industrySlug,
  });
  return data;
}

export async function resetGroups(): Promise<{ message: string }> {
  const { data } = await api.request<{ message: string }>({
    method: 'POST',
    url: '/api/feed/brief/reset',
    transformRequest: [(_data, headers) => {
      headers.delete('Content-Type');
      return undefined;
    }],
  });
  return data;
}

// ── Admin ──

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>('/api/admin/users');
  return data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/api/admin/stats');
  return data;
}

// ── Digest ──

export async function runDigest(): Promise<DigestResult> {
  const { data } = await api.request<DigestResult>({
    method: 'POST',
    url: '/api/digest/run',
    transformRequest: [(_data, headers) => {
      headers.delete('Content-Type');
      return undefined;
    }],
  });
  return data;
}

export async function runAllDigests(): Promise<DigestAllResult> {
  const { data } = await api.request<DigestAllResult>({
    method: 'POST',
    url: '/api/digest/run-all',
    transformRequest: [(_data, headers) => {
      headers.delete('Content-Type');
      return undefined;
    }],
  });
  return data;
}

// ── User Settings ──

export async function getUserSettings(): Promise<UserSettings> {
  const { data } = await api.get<UserSettings>('/api/settings');
  return data;
}

export async function updateUserSettings(body: {
  digestFrequency?: DigestInterval;
  digestTime?: string;
  emailEnabled?: boolean;
}): Promise<UserSettings> {
  const { data } = await api.put<UserSettings>('/api/settings', body);
  return data;
}

// ── Tech Stack ──

export async function getTechStack(): Promise<TechStackItem[]> {
  const { data } = await api.get<TechStackItem[]>('/api/techstack');
  return data;
}

export async function createTechStackItem(body: {
  vendor: string;
  product: string;
  version?: string;
  category: TechStackCategory;
}): Promise<TechStackCreateResult> {
  const { data } = await api.post<TechStackCreateResult>('/api/techstack', body);
  return data;
}

export async function deleteTechStackItem(id: string): Promise<void> {
  await api.delete(`/api/techstack/${id}`);
}

export async function searchTechStackCatalog(
  search: string,
  category?: TechStackCategory
): Promise<TechStackCatalogItem[]> {
  const { data } = await api.get<TechStackCatalogItem[]>('/api/techstack/catalog', {
    params: { search, ...(category ? { category } : {}) },
  });
  return data;
}

export async function bulkAddTechStack(
  items: Array<{ vendor: string; product: string; category: TechStackCategory }>
): Promise<TechStackBulkResult> {
  const { data } = await api.post<TechStackBulkResult>('/api/techstack/bulk', { items });
  return data;
}

// ── Exposure ──

export async function getExposures(params: {
  state?: ExposureState;
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<ExposureListResponse> {
  const { data } = await api.get<ExposureListResponse>('/api/exposure', { params });
  return data;
}

export async function getExposureStats(): Promise<ExposureStats> {
  const { data } = await api.get<ExposureStats>('/api/exposure/stats');
  return data;
}

export async function patchExposure(
  cveId: string,
  body?: { patchedAt?: string }
): Promise<Exposure> {
  const { data } = await api.post<Exposure>(`/api/exposure/${cveId}/patch`, body ?? {});
  return data;
}

export async function updateExposure(
  cveId: string,
  body: { exposureState: ExposureState; notes?: string }
): Promise<Exposure> {
  const { data } = await api.put<Exposure>(`/api/exposure/${cveId}`, body);
  return data;
}

export async function getOverdueExposures(): Promise<Exposure[]> {
  const { data } = await api.get<Exposure[]>('/api/exposure/overdue');
  return data;
}
