import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Your Feed</h1>

      {/* Empty state */}
      <div
        className="bg-surface rounded-md p-16 text-center border border-border"
      >
        <LayoutDashboard className="h-10 w-10 text-text-secondary/30 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-text mb-1">
          No articles yet
        </h2>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          Add some sources and keywords to start receiving your personalized
          daily feed.
        </p>
      </div>
    </div>
  );
}
