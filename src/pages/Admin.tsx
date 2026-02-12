import { useState, useEffect } from 'react';
import { Shield, Users, Globe, Tags, FileText, CheckSquare } from 'lucide-react';
import { getAdminUsers, getAdminStats } from '../lib/services';
import type { AdminUser, AdminStats } from '../lib/types';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const [usersData, statsData] = await Promise.all([
          getAdminUsers(),
          getAdminStats(),
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch {
        setError('Failed to load admin data. You may not have admin access.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text">Admin</h1>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Users" value={stats.totalUsers} />
          <StatCard icon={Globe} label="Sources" value={stats.totalSources} />
          <StatCard icon={Tags} label="Keywords" value={stats.totalKeywords} />
          <StatCard icon={FileText} label="Articles" value={stats.totalArticles} />
          <StatCard icon={CheckSquare} label="Matched" value={stats.totalMatched} />
        </div>
      )}

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text">
            All Users ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-5 py-3 font-medium text-text-secondary">Email</th>
                <th className="text-left px-5 py-3 font-medium text-text-secondary">Role</th>
                <th className="text-right px-5 py-3 font-medium text-text-secondary">Sources</th>
                <th className="text-right px-5 py-3 font-medium text-text-secondary">Keywords</th>
                <th className="text-left px-5 py-3 font-medium text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-text">{u.name}</td>
                  <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-primary-light text-primary'
                          : 'bg-gray-100 text-text-secondary'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-secondary">{u.sourcesCount}</td>
                  <td className="px-5 py-3 text-right text-text-secondary">{u.keywordsCount}</td>
                  <td className="px-5 py-3 text-text-secondary">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-surface border border-border rounded-md px-5 py-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-text-secondary" />
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <span className="text-2xl font-bold text-text">{value}</span>
    </div>
  );
}
