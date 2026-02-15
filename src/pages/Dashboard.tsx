import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ExternalLink,
  BookOpen,
  RefreshCw,
  RotateCcw,
  FileText,
  List,
} from 'lucide-react';
import { getFeed, getGroupedFeed, runDigest, resetGroups, getPeriodReport } from '../lib/services';
import type {
  FeedArticle,
  PaginationInfo,
  GroupBriefing,
  Period,
  PeriodReport,
} from '../lib/types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import ConfidenceScore from '../components/ui/ConfidenceScore';
import SignalBadge from '../components/ui/SignalBadge';
import EntityChip from '../components/ui/EntityChip';
import Accordion from '../components/ui/Accordion';
import ReportCard from '../components/ui/ReportCard';
import Prose from '../components/ui/Prose';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// caseType → left border color
const caseBorderColors: Record<number, string> = {
  1: 'border-l-4 border-l-red-500',    // Actively Exploited
  2: 'border-l-4 border-l-orange-400',  // Vulnerable, No Exploit
  3: 'border-l-4 border-l-emerald-400', // Fixed
  4: '',                                 // Not Applicable
};

type ViewMode = 'brief' | 'articles';

const periods: { value: Period; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('brief');
  const [period, setPeriod] = useState<Period>('7d');

  // Grouped feed state
  const [groups, setGroups] = useState<GroupBriefing[]>([]);
  const [groupPagination, setGroupPagination] = useState<PaginationInfo | null>(null);
  const [groupPage, setGroupPage] = useState(1);
  const [groupLoading, setGroupLoading] = useState(true);

  // Period report state
  const [report, setReport] = useState<PeriodReport | null>(null);

  // Flat feed state
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [articlePagination, setArticlePagination] = useState<PaginationInfo | null>(null);
  const [articlePage, setArticlePage] = useState(1);
  const [articleLoading, setArticleLoading] = useState(false);

  const [error, setError] = useState('');

  // Digest + reset state
  const [digestRunning, setDigestRunning] = useState(false);
  const [digestMessage, setDigestMessage] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setError('');
      setGroupLoading(true);
      const data = await getGroupedFeed(groupPage, 10, period);
      setGroups(data.groups);
      setGroupPagination(data.pagination);
    } catch {
      setError('Failed to load intelligence brief');
    } finally {
      setGroupLoading(false);
    }
  }, [groupPage, period]);

  const fetchReport = useCallback(async () => {
    try {
      const data = await getPeriodReport(period);
      setReport(data);
    } catch {
      // Report may not exist yet — silently ignore
      setReport(null);
    }
  }, [period]);

  const fetchArticles = useCallback(async () => {
    try {
      setError('');
      setArticleLoading(true);
      const data = await getFeed(articlePage);
      setArticles(data.articles);
      setArticlePagination(data.pagination);
    } catch {
      setError('Failed to load articles');
    } finally {
      setArticleLoading(false);
    }
  }, [articlePage]);

  useEffect(() => {
    if (viewMode === 'brief') {
      fetchGroups();
      fetchReport();
    }
  }, [viewMode, fetchGroups, fetchReport]);

  useEffect(() => {
    if (viewMode === 'articles') fetchArticles();
  }, [viewMode, fetchArticles]);

  // Reset to page 1 when period changes
  useEffect(() => {
    setGroupPage(1);
  }, [period]);

  async function handleRunDigest() {
    setDigestRunning(true);
    setDigestMessage('');
    setError('');
    try {
      const result = await runDigest();
      const { scraped, matched, summarized, errors } = result.result;
      let msg = `Found ${scraped} articles, ${matched} matched, ${summarized} summarized.`;
      if (errors.length > 0) msg += ` ${errors.length} source(s) had errors.`;
      setDigestMessage(msg);
      if (viewMode === 'brief') {
        await fetchGroups();
        await fetchReport();
      } else {
        await fetchArticles();
      }
    } catch {
      setError('Failed to run digest. Please try again.');
    } finally {
      setDigestRunning(false);
    }
  }

  async function handleResetGroups() {
    setResetting(true);
    setDigestMessage('');
    setError('');
    try {
      const result = await resetGroups();
      setDigestMessage(result.message);
      if (viewMode === 'brief') await fetchGroups();
    } catch {
      setError('Failed to reset groups. Please try again.');
    } finally {
      setResetting(false);
    }
  }

  const isLoading = viewMode === 'brief' ? groupLoading : articleLoading;

  if (isLoading && !digestRunning) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Your Feed</h1>
        <div className="flex items-center gap-2">
          {viewMode === 'brief' && (
            <button
              onClick={handleResetGroups}
              disabled={resetting || digestRunning}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded border border-border text-text-secondary hover:text-text hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting...' : 'Reset Feed'}
            </button>
          )}
          <Button onClick={handleRunDigest} isLoading={digestRunning}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${digestRunning ? 'animate-spin' : ''}`} />
            {digestRunning ? 'Running...' : 'Run Digest'}
          </Button>
        </div>
      </div>

      {digestMessage && <Alert variant="success" className="mb-4">{digestMessage}</Alert>}
      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* View toggle */}
      <div className="flex items-center gap-1 mb-4 bg-surface border border-border rounded-md p-1 w-fit">
        <button
          onClick={() => setViewMode('brief')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer ${
            viewMode === 'brief' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Intelligence Brief
        </button>
        <button
          onClick={() => setViewMode('articles')}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer ${
            viewMode === 'articles' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          All Articles
        </button>
      </div>

      {/* Period tabs — only in brief view */}
      {viewMode === 'brief' && (
        <div className="flex items-center gap-1 mb-5">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                period === p.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text hover:bg-surface'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'brief' ? (
        <BriefView
          groups={groups}
          pagination={groupPagination}
          page={groupPage}
          onPageChange={setGroupPage}
          onRunDigest={handleRunDigest}
          digestRunning={digestRunning}
          navigate={navigate}
          report={report}
        />
      ) : (
        <ArticlesView
          articles={articles}
          pagination={articlePagination}
          page={articlePage}
          onPageChange={setArticlePage}
          onRunDigest={handleRunDigest}
          digestRunning={digestRunning}
          navigate={navigate}
        />
      )}
    </div>
  );
}

// ── Grouped Intelligence Brief View ──

function BriefView({
  groups, pagination, page, onPageChange, onRunDigest, digestRunning, navigate, report,
}: {
  groups: GroupBriefing[];
  pagination: PaginationInfo | null;
  page: number;
  onPageChange: (p: number) => void;
  onRunDigest: () => void;
  digestRunning: boolean;
  navigate: (path: string) => void;
  report: PeriodReport | null;
}) {
  if (groups.length === 0) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No intelligence stories yet"
        description="Add sources and keywords, then run your digest to generate intelligence briefs."
        action={
          <Button onClick={onRunDigest} isLoading={digestRunning}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Run Digest
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* Period report card */}
      {report && <ReportCard report={report} />}

      {pagination && (
        <p className="text-xs text-text-secondary mb-4">
          {pagination.total} stories &middot; {groups.reduce((s, g) => s + g.articleCount, 0)} articles analyzed
        </p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <StoryCard key={group.id} group={group} navigate={navigate} />
        ))}
      </div>

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}

// ── Story Card ──

function StoryCard({ group, navigate }: { group: GroupBriefing; navigate: (path: string) => void }) {
  const allSignals = group.articles.flatMap((a) => a.signals);
  const uniqueSignals = allSignals.filter((s, i, arr) => arr.findIndex((x) => x.slug === s.slug) === i);

  const allEntities = group.articles.flatMap((a) => a.entities);
  const uniqueEntities = allEntities
    .filter((e, i, arr) => arr.findIndex((x) => x.type === e.type && x.name === e.name) === i)
    .slice(0, 8);

  const borderClass = group.caseType ? (caseBorderColors[group.caseType] || '') : '';

  return (
    <div className={`bg-surface border border-border rounded-md overflow-hidden ${borderClass}`}>
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <button
            onClick={() => navigate(`/dashboard/group/${group.id}`)}
            className="text-base font-semibold text-text hover:text-primary transition-colors text-left cursor-pointer"
          >
            {group.title}
          </button>
          <ConfidenceScore score={group.confidence} className="shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary mb-3">
          <span>{group.articleCount} articles</span>
          <span className="text-text-secondary/40">&middot;</span>
          <span>{timeAgo(group.date)}</span>
          {group.caseType === 1 && (
            <>
              <span className="text-text-secondary/40">&middot;</span>
              <span className="text-red-600 font-semibold">Actively Exploited</span>
            </>
          )}
          {group.caseType === 2 && (
            <>
              <span className="text-text-secondary/40">&middot;</span>
              <span className="text-orange-600 font-medium">Vulnerable</span>
            </>
          )}
        </div>

        {uniqueSignals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {uniqueSignals.slice(0, 5).map((s) => (
              <SignalBadge key={s.slug} slug={s.slug} name={s.name} confidence={s.confidence} />
            ))}
          </div>
        )}

        {uniqueEntities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {uniqueEntities.map((e, i) => (
              <EntityChip key={`${e.type}-${e.name}-${i}`} entity={e} />
            ))}
          </div>
        )}

        <p className="text-sm text-text-secondary leading-relaxed mb-3">{group.synopsis}</p>

        <div className="space-y-2 border-t border-border pt-3">
          <Accordion title="Executive Summary">
            <Prose content={group.executiveSummary} />
          </Accordion>
          <Accordion title="Impact Analysis">
            <Prose content={group.impactAnalysis} />
          </Accordion>
          <Accordion title="What To Do">
            <Prose content={group.actionability} />
          </Accordion>
          <Accordion
            title="Sources"
            badge={<span className="text-xs text-text-secondary">{group.articles.length} articles</span>}
          >
            <div className="space-y-2">
              {group.articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-text hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                  <span className="truncate">{article.title}</span>
                  <span className="text-xs text-text-secondary shrink-0">— {article.source.name}</span>
                </a>
              ))}
            </div>
            <button
              onClick={() => navigate(`/dashboard/group/${group.id}`)}
              className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              View all {group.articleCount} articles &rarr;
            </button>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

// ── Flat Articles View ──

function ArticlesView({
  articles, pagination, page, onPageChange, onRunDigest, digestRunning, navigate,
}: {
  articles: FeedArticle[];
  pagination: PaginationInfo | null;
  page: number;
  onPageChange: (p: number) => void;
  onRunDigest: () => void;
  digestRunning: boolean;
  navigate: (path: string) => void;
}) {
  if (articles.length === 0) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title="No articles yet"
        description="Add sources and keywords, then run your digest!"
        action={
          <Button onClick={onRunDigest} isLoading={digestRunning}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Run Digest
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {articles.map((article) => (
          <div
            key={article.id}
            className={`bg-surface border rounded-md px-5 py-4 ${
              article.read ? 'border-border' : 'border-primary/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0 flex items-start gap-2">
                {!article.read && <span className="mt-1.5 shrink-0 h-2 w-2 rounded-full bg-primary" />}
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
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            {article.summary && (
              <p className="text-sm text-text-secondary mb-3 leading-relaxed">{article.summary}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-secondary">{article.source.name}</span>
              <span className="text-xs text-text-secondary/40">&middot;</span>
              <span className="text-xs text-text-secondary">{timeAgo(article.publishedAt)}</span>
              {article.matchedKeywords.length > 0 && (
                <>
                  <span className="text-xs text-text-secondary/40">&middot;</span>
                  {article.matchedKeywords.map((kw) => (
                    <Badge key={kw} variant="primary">{kw}</Badge>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}
