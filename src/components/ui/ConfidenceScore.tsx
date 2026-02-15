interface ConfidenceScoreProps {
  score: number; // 0.0 - 1.0
  className?: string;
}

function getLevel(score: number) {
  if (score >= 0.85) return { label: 'High', color: 'bg-danger', text: 'text-red-700', dot: 'bg-danger' };
  if (score >= 0.65) return { label: 'Medium', color: 'bg-warning', text: 'text-amber-700', dot: 'bg-warning' };
  return { label: 'Low', color: 'bg-success', text: 'text-emerald-700', dot: 'bg-success' };
}

export default function ConfidenceScore({ score, className = '' }: ConfidenceScoreProps) {
  const pct = Math.round(score * 100);
  const { color, text, dot } = getLevel(score);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className={`text-xs font-semibold ${text}`}>{pct}%</span>
      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
