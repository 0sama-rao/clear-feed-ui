import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Rss } from 'lucide-react';
import { getFeedArticle } from '../lib/services';
import type { FeedArticleDetail } from '../lib/types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<FeedArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        setError('');
        const data = await getFeedArticle(id!);
        setArticle(data);
      } catch {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </button>
        <Alert variant="error">{error || 'Article not found'}</Alert>
      </div>
    );
  }

  const publishedDate = new Date(article.publishedAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to feed
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-text mb-3 leading-tight">
        {article.title}
      </h1>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap mb-5 text-sm text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Rss className="h-3.5 w-3.5" />
          {article.source.name}
        </span>
        <span className="text-text-secondary/40">&middot;</span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {publishedDate}
        </span>
      </div>

      {/* Matched keywords */}
      {article.matchedKeywords.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <span className="text-xs text-text-secondary">Matched:</span>
          {article.matchedKeywords.map((kw) => (
            <Badge key={kw} variant="primary">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      {/* AI Summary — highlighted */}
      {article.summary && (
        <div className="bg-primary-light border border-primary/20 rounded-md px-5 py-4 mb-6">
          <p className="text-xs font-semibold text-primary mb-1.5">AI Summary</p>
          <p className="text-sm text-text leading-relaxed">{article.summary}</p>
        </div>
      )}

      {/* Full content */}
      {article.content && (
        <div className="bg-surface border border-border rounded-md px-5 py-5 mb-6">
          <p className="text-xs font-semibold text-text-secondary mb-3">Full Content</p>
          <div className="text-sm text-text leading-relaxed whitespace-pre-line">
            {article.content}
          </div>
        </div>
      )}

      {/* Read original button */}
      <div className="flex gap-3">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          <Button>
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Read Original
          </Button>
        </a>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>
          Back to Feed
        </Button>
      </div>
    </div>
  );
}
