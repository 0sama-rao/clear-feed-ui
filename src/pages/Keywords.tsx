import { Tags } from 'lucide-react';

export default function Keywords() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Keywords</h1>

      <div
        className="bg-surface rounded-md p-16 text-center border border-border"
      >
        <Tags className="h-10 w-10 text-text-secondary/30 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-text mb-1">
          No keywords added
        </h2>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          Add keywords like "AI", "stocks", or "regulations" to filter articles
          that matter to you.
        </p>
      </div>
    </div>
  );
}
