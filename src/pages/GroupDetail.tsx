import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Rss, User } from 'lucide-react';
import { getGroupDetail } from '../lib/services';
import type { GroupDetail as GroupDetailType } from '../lib/types';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import SignalBadge from '../components/ui/SignalBadge';
import EntityChip from '../components/ui/EntityChip';
import Accordion from '../components/ui/Accordion';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Prose from '../components/ui/Prose';

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getGroupDetail(id!);
        setGroup(data);
      } catch {
        setError('Failed to load story');
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

  if (error || !group) {
    return (
      <div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to brief
        </button>
        <Alert variant="error">{error || 'Story not found'}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to brief
      </button>

      {/* Title + confidence */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-text leading-tight">{group.title}</h1>
        <ConfidenceScore score={group.confidence} className="shrink-0 mt-1" />
      </div>

      {/* Case type badge */}
      {group.caseType === 1 && (
        <span className="inline-block text-xs font-semibold text-red-700 bg-red-50 rounded-full px-3 py-1 mb-4">
          Actively Exploited
        </span>
      )}
      {group.caseType === 2 && (
        <span className="inline-block text-xs font-semibold text-orange-700 bg-orange-50 rounded-full px-3 py-1 mb-4">
          Vulnerable — No Known Exploit
        </span>
      )}
      {group.caseType === 3 && (
        <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 mb-4">
          Fixed
        </span>
      )}

      {/* Synopsis */}
      <p className="text-sm text-text-secondary leading-relaxed mb-6">{group.synopsis}</p>

      {/* Executive Summary */}
      <div className="bg-primary-light border border-primary/20 rounded-md px-5 py-4 mb-6">
        <p className="text-xs font-semibold text-primary mb-2">Executive Summary</p>
        <Prose content={group.executiveSummary} />
      </div>

      {/* Impact Analysis */}
      <div className="bg-surface border border-border rounded-md px-5 py-4 mb-4">
        <p className="text-xs font-semibold text-text-secondary mb-2">Impact Analysis</p>
        <Prose content={group.impactAnalysis} />
      </div>

      {/* Actionability */}
      <div className="bg-surface border border-border rounded-md px-5 py-4 mb-6">
        <p className="text-xs font-semibold text-text-secondary mb-2">What To Do</p>
        <Prose content={group.actionability} />
      </div>

      {/* All articles */}
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            Source Articles ({group.articles.length})
          </h2>
        </div>

        <div className="divide-y divide-border">
          {group.articles.map((article) => (
            <div key={article.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-2">
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

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
                <span className="inline-flex items-center gap-1">
                  <Rss className="h-3 w-3" />
                  {article.source.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                {article.author && (
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </span>
                )}
              </div>

              {/* Signals */}
              {article.signals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {article.signals.map((s) => (
                    <SignalBadge
                      key={s.slug}
                      slug={s.slug}
                      name={s.name}
                      confidence={s.confidence}
                    />
                  ))}
                </div>
              )}

              {/* Entities */}
              {article.entities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {article.entities.map((e, i) => (
                    <EntityChip key={`${e.type}-${e.name}-${i}`} entity={e} />
                  ))}
                </div>
              )}

              {/* Content preview */}
              {article.cleanText && (
                <Accordion title="Full article text">
                  <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                    {article.cleanText}
                  </div>
                </Accordion>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
