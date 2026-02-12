import { Shield } from 'lucide-react';

export default function Admin() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Admin</h1>

      <div
        className="bg-surface rounded-md p-16 text-center border border-border"
      >
        <Shield className="h-10 w-10 text-text-secondary/30 mx-auto mb-4" />
        <h2 className="text-base font-semibold text-text mb-1">
          Admin Panel
        </h2>
        <p className="text-text-secondary text-sm max-w-sm mx-auto">
          User management and platform stats will appear here.
        </p>
      </div>
    </div>
  );
}
