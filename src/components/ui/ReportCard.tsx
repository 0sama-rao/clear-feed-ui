import { BarChart3, FileText, AlertTriangle, Radio } from 'lucide-react';
import type { PeriodReport } from '../../lib/types';
import EntityChip from './EntityChip';
import SignalBadge from './SignalBadge';
import Prose from './Prose';

const periodLabels: Record<string, string> = {
  '1d': 'Daily',
  '7d': 'Weekly',
  '30d': 'Monthly',
};

function formatDateRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${f.toLocaleDateString('en-US', opts)} - ${t.toLocaleDateString('en-US', opts)}`;
}

interface ReportCardProps {
  report: PeriodReport;
}

export default function ReportCard({ report }: ReportCardProps) {
  const { stats } = report;
  const label = periodLabels[report.period] || report.period;
  const dateRange = formatDateRange(report.fromDate, report.toDate);

  // Signal bar chart — find max for relative widths
  const signalEntries = Object.entries(stats.signalDistribution).sort(([, a], [, b]) => b - a);
  const maxSignalCount = signalEntries.length > 0 ? signalEntries[0][1] : 1;

  return (
    <div
      className="bg-surface border border-border rounded-md overflow-hidden mb-5"
      style={{ boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)' }}
    >
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4.5 w-4.5 text-primary" />
          <h2 className="text-sm font-semibold text-text">
            {label} Intelligence Report
          </h2>
          <span className="text-xs text-text-secondary">({dateRange})</span>
        </div>

        {/* Stat counters */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <StatCounter
            icon={<FileText className="h-4 w-4 text-primary" />}
            value={stats.totalStories}
            label="Stories"
          />
          <StatCounter
            icon={<BarChart3 className="h-4 w-4 text-blue-500" />}
            value={stats.totalArticles}
            label="Articles"
          />
          <StatCounter
            icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            value={stats.criticalStories}
            label="Critical"
            highlight={stats.criticalStories > 0}
          />
          <StatCounter
            icon={<Radio className="h-4 w-4 text-amber-500" />}
            value={signalEntries.length}
            label="Signals"
          />
        </div>

        {/* AI Summary */}
        {report.summary && (
          <div className="bg-background rounded-md px-4 py-3 mb-4">
            <Prose content={report.summary} />
          </div>
        )}

        {/* Signal distribution + Top entities side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signal distribution bars */}
          {signalEntries.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2">Top Signals</p>
              <div className="space-y-1.5">
                {signalEntries.slice(0, 6).map(([slug, count]) => (
                  <div key={slug} className="flex items-center gap-2">
                    <SignalBadge slug={slug} name={slug.replace(/-/g, ' ')} className="text-[10px] px-1.5 py-0.5" />
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${(count / maxSignalCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-secondary tabular-nums w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top entities */}
          {stats.topEntities.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-secondary mb-2">Top Entities</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topEntities.slice(0, 10).map((e) => (
                  <span key={`${e.type}-${e.name}`} className="inline-flex items-center gap-1">
                    <EntityChip entity={{ type: e.type, name: e.name, confidence: 1 }} />
                    <span className="text-xs text-text-secondary font-medium">({e.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCounter({
  icon,
  value,
  label,
  highlight = false,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-background rounded-md px-3 py-2.5 text-center ${highlight ? 'ring-1 ring-red-200' : ''}`}>
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-text'}`}>
        {value}
      </p>
      <p className="text-[10px] text-text-secondary">{label}</p>
    </div>
  );
}
