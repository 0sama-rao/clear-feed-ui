import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  getExposures,
  getExposureStats,
  patchExposure,
} from '../lib/services';
import type {
  Exposure,
  ExposureStats,
  ExposureState,
  PaginationInfo,
} from '../lib/types';
import Badge from '../components/ui/Badge';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';

const stateFilterOptions = [
  { value: '', label: 'All States' },
  { value: 'VULNERABLE', label: 'Vulnerable' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
  { value: 'INDIRECT', label: 'Indirect' },
];

const severityFilterOptions = [
  { value: '', label: 'All Severities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-emerald-100 text-emerald-700',
};

const stateConfig: Record<ExposureState, { variant: 'danger' | 'success' | 'default' | 'warning'; label: string }> = {
  VULNERABLE: { variant: 'danger', label: 'Vulnerable' },
  FIXED: { variant: 'success', label: 'Fixed' },
  NOT_APPLICABLE: { variant: 'default', label: 'Not Applicable' },
  INDIRECT: { variant: 'warning', label: 'Indirect' },
};

function daysOpen(firstDetected: string, patchedAt: string | null): number {
  const end = patchedAt ? new Date(patchedAt) : new Date();
  const start = new Date(firstDetected);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

export default function ExposurePage() {
  const [stats, setStats] = useState<ExposureStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [exposures, setExposures] = useState<Exposure[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [stateFilter, setStateFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const [patchingCve, setPatchingCve] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await getExposureStats();
      setStats(data);
    } catch {
      // Stats are supplementary — silently degrade
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchExposures = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const data = await getExposures({
        state: stateFilter ? (stateFilter as ExposureState) : undefined,
        page,
        limit: 20,
        sort: 'cvss',
      });
      setExposures(data.data);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load exposures');
    } finally {
      setLoading(false);
    }
  }, [stateFilter, page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchExposures();
  }, [fetchExposures]);

  useEffect(() => {
    setPage(1);
  }, [stateFilter, severityFilter]);

  async function handlePatch(cveId: string) {
    setPatchingCve(cveId);
    setError('');
    try {
      const updated = await patchExposure(cveId);
      setExposures((prev) =>
        prev.map((e) => (e.cveId === cveId ? { ...e, ...updated } : e))
      );
      setSuccessMessage(`${cveId} marked as patched`);
      setTimeout(() => setSuccessMessage(''), 4000);
      fetchStats();
    } catch {
      setError(`Failed to patch ${cveId}`);
    } finally {
      setPatchingCve(null);
    }
  }

  // Client-side severity filter (API doesn't accept severity param)
  const filteredExposures = severityFilter
    ? exposures.filter((e) => e.articleCve.severity === severityFilter)
    : exposures;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Exposure Dashboard</h1>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

      {/* Stats cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<ShieldAlert className="h-4 w-4 text-red-500" />}
            value={stats.totalVulnerable}
            label="Vulnerable"
            highlight={stats.totalVulnerable > 0}
          />
          <StatCard
            icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
            value={stats.totalFixed}
            label="Fixed"
          />
          <StatCard
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            value={stats.totalOverdue}
            label="Overdue"
            highlight={stats.totalOverdue > 0}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
            value={`${stats.patchRate.toFixed(1)}%`}
            label="Patch Rate"
          />
        </div>
      ) : null}

      {/* Filter bar */}
      <div className="flex items-end gap-3 mb-6">
        <div className="w-48">
          <Select
            id="state-filter"
            label="State"
            options={stateFilterOptions}
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            id="severity-filter"
            label="Severity"
            options={severityFilterOptions}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          />
        </div>
        {pagination && (
          <span className="text-xs text-text-secondary ml-auto self-end pb-3">
            {pagination.total} total exposures
          </span>
        )}
      </div>

      {/* Exposure list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredExposures.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No exposures found"
          description={
            stateFilter || severityFilter
              ? 'No exposures match your current filters. Try adjusting them.'
              : 'Add items to your tech stack to start tracking vulnerability exposure.'
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {filteredExposures.map((exposure) => (
              <ExposureCard
                key={exposure.id}
                exposure={exposure}
                onPatch={handlePatch}
                isPatching={patchingCve === exposure.cveId}
              />
            ))}
          </div>
          {pagination && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}

// ── Stat Card ──

function StatCard({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-surface border border-border rounded-md px-3 py-3 text-center ${highlight ? 'ring-1 ring-red-200' : ''}`}>
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-text'}`}>
        {value}
      </p>
      <p className="text-[10px] text-text-secondary">{label}</p>
    </div>
  );
}

// ── Exposure Card ──

function ExposureCard({
  exposure,
  onPatch,
  isPatching,
}: {
  exposure: Exposure;
  onPatch: (cveId: string) => void;
  isPatching: boolean;
}) {
  const { articleCve, techStackItem, exposureState } = exposure;
  const days = daysOpen(exposure.firstDetectedAt, exposure.patchedAt);
  const overdue = isOverdue(exposure.remediationDeadline);
  const sevColor = severityColors[articleCve.severity] || 'bg-gray-100 text-gray-700';
  const stCfg = stateConfig[exposureState];

  return (
    <div
      className={`bg-surface border rounded-md px-5 py-4 ${
        overdue && exposureState === 'VULNERABLE' ? 'border-red-300' : 'border-border'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-text">{exposure.cveId}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sevColor}`}>
            {articleCve.severity}
          </span>
          <span className="text-xs font-semibold text-text-secondary">
            CVSS {articleCve.cvssScore.toFixed(1)}
          </span>
          {articleCve.inKEV && (
            <Badge variant="danger">KEV</Badge>
          )}
          {overdue && exposureState === 'VULNERABLE' && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
              <Clock className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={stCfg.variant}>{stCfg.label}</Badge>
          {exposureState === 'VULNERABLE' && (
            <button
              onClick={() => onPatch(exposure.cveId)}
              disabled={isPatching}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPatching ? (
                <Spinner size="sm" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Mark Patched
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed mb-2">
        {articleCve.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-text-secondary">
        <span>
          {techStackItem.vendor} / {techStackItem.product}
          {techStackItem.version ? ` v${techStackItem.version}` : ''}
        </span>
        <span className="text-text-secondary/40">&middot;</span>
        <span>
          {days} day{days !== 1 ? 's' : ''} {exposureState === 'FIXED' ? 'to fix' : 'open'}
        </span>
        {exposure.remediationDeadline && exposureState === 'VULNERABLE' && (
          <>
            <span className="text-text-secondary/40">&middot;</span>
            <span className={overdue ? 'text-red-600 font-semibold' : ''}>
              Due {new Date(exposure.remediationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </>
        )}
        {articleCve.inKEV && articleCve.kevDueDate && (
          <>
            <span className="text-text-secondary/40">&middot;</span>
            <span className="text-red-600">
              KEV due {new Date(articleCve.kevDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
