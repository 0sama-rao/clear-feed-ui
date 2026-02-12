import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, ExternalLink, BookOpen } from 'lucide-react';
import { getFeed } from '../lib/services';
import type { FeedArticle, PaginationInfo } from '../lib/types';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getFeed(page);
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Your Feed</h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {articles.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No articles yet"
          description="Add some sources and keywords to start receiving your personalized daily feed."
        />
      ) : (
        <>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`bg-surface border rounded-md px-5 py-4 ${
                  article.read
                    ? 'border-border opacity-75'
                    : 'border-border'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-text hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      {article.title}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                  {article.read && (
                    <Badge variant="default">
                      <BookOpen className="h-3 w-3 mr-0.5" />
                      Read
                    </Badge>
                  )}
                </div>

                {/* Summary */}
                {article.summary && (
                  <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                    {article.summary}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-text-secondary">
                      {article.source.name}
                    </span>
                    <span className="text-xs text-text-secondary/40">
                      &middot;
                    </span>
                    <span className="text-xs text-text-secondary">
                      {timeAgo(article.publishedAt)}
                    </span>

                    {article.matchedKeywords.length > 0 && (
                      <>
                        <span className="text-xs text-text-secondary/40">
                          &middot;
                        </span>
                        {article.matchedKeywords.map((kw) => (
                          <Badge key={kw} variant="primary">
                            {kw}
                          </Badge>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
