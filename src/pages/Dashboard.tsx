import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ExternalLink, BookOpen, RefreshCw } from 'lucide-react';
import { getFeed, runDigest } from '../lib/services';
import type { FeedArticle, PaginationInfo } from '../lib/types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
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

type FilterMode = 'all' | 'unread';

export default function Dashboard() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  // Digest state
  const [digestRunning, setDigestRunning] = useState(false);
  const [digestMessage, setDigestMessage] = useState('');

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

  async function handleRunDigest() {
    setDigestRunning(true);
    setDigestMessage('');
    setError('');

    try {
      const result = await runDigest();
      const { scraped, matched, summarized, errors } = result.result;
      let msg = `Found ${scraped} articles, ${matched} matched your keywords, ${summarized} summarized.`;
      if (errors.length > 0) {
        msg += ` ${errors.length} source(s) had errors.`;
      }
      setDigestMessage(msg);
      // Refresh the feed to show new articles
      await fetchFeed();
    } catch {
      setError('Failed to run digest. Please try again.');
    } finally {
      setDigestRunning(false);
    }
  }

  const displayArticles =
    filter === 'unread'
      ? articles.filter((a) => !a.read)
      : articles;

  if (loading && !digestRunning) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Your Feed</h1>
        <Button onClick={handleRunDigest} isLoading={digestRunning}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${digestRunning ? 'animate-spin' : ''}`} />
          {digestRunning ? 'Running...' : 'Run Digest'}
        </Button>
      </div>

      {/* Digest result notification */}
      {digestMessage && (
        <Alert variant="success" className="mb-4">
          {digestMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {articles.length === 0 ? (
        <EmptyState
          icon={LayoutDashboard}
          title="No articles yet"
          description="Add some RSS sources and keywords, then run your digest!"
          action={
            <Button onClick={handleRunDigest} isLoading={digestRunning}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Run Digest
            </Button>
          }
        />
      ) : (
        <>
          {/* Filter toggle */}
          <div className="flex items-center gap-1 mb-4 bg-surface border border-border rounded-md p-1 w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              Unread
            </button>
          </div>

          {displayArticles.length === 0 ? (
            <div className="bg-surface border border-border rounded-md p-12 text-center">
              <p className="text-sm text-text-secondary">
                No unread articles. Switch to "All" to see everything.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayArticles.map((article) => (
                <div
                  key={article.id}
                  className={`bg-surface border rounded-md px-5 py-4 ${
                    article.read ? 'border-border' : 'border-primary/20'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0 flex items-start gap-2">
                      {/* Unread dot */}
                      {!article.read && (
                        <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-primary" />
                      )}
                      <button
                        onClick={() => navigate(`/dashboard/${article.id}`)}
                        className="text-sm font-semibold text-text hover:text-primary transition-colors text-left cursor-pointer"
                      >
                        {article.title}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {article.read && (
                        <Badge variant="default">
                          <BookOpen className="h-3 w-3 mr-0.5" />
                          Read
                        </Badge>
                      )}
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  {/* Summary */}
                  {article.summary && (
                    <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                      {article.summary}
                    </p>
                  )}

                  {/* Footer */}
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
              ))}
            </div>
          )}

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
