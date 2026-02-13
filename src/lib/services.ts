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

// ── Feed ──

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
