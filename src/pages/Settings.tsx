import { useState, useEffect, useCallback } from 'react';
import { Save, Mail, BellOff } from 'lucide-react';
import { getUserSettings, updateUserSettings } from '../lib/services';
import type { UserSettings, DigestInterval } from '../lib/types';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const intervalOptions: { value: string; label: string }[] = [
  { value: '1h', label: 'Every 1 hour' },
  { value: '3h', label: 'Every 3 hours' },
  { value: '6h', label: 'Every 6 hours' },
  { value: '12h', label: 'Every 12 hours' },
  { value: '1d', label: 'Every day' },
  { value: '3d', label: 'Every 3 days' },
  { value: '7d', label: 'Every 7 days' },
];

// Intervals where preferred time is relevant (daily or longer)
const timeRelevantIntervals = new Set(['1d', '3d', '7d']);

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [digestFrequency, setDigestFrequency] = useState<DigestInterval>('1d');
  const [digestTime, setDigestTime] = useState('06:00');
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isDirty =
    settings !== null &&
    (digestFrequency !== settings.digestFrequency ||
      digestTime !== settings.digestTime ||
      emailEnabled !== settings.emailEnabled);

  const fetchSettings = useCallback(async () => {
    try {
      setError('');
      const data = await getUserSettings();
      setSettings(data);
      setDigestFrequency(data.digestFrequency);
      setDigestTime(data.digestTime);
      setEmailEnabled(data.emailEnabled);
    } catch {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const updated = await updateUserSettings({
        digestFrequency,
        digestTime,
        emailEnabled,
      });
      setSettings(updated);
      setDigestFrequency(updated.digestFrequency);
      setDigestTime(updated.digestTime);
      setEmailEnabled(updated.emailEnabled);
      setSuccessMsg('Settings saved successfully');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">Settings</h1>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

      <div className="space-y-6 max-w-lg">
        {/* Digest Schedule */}
        <div className="bg-surface border border-border rounded-md px-5 py-4">
          <h2 className="text-sm font-semibold text-text mb-1">Digest Schedule</h2>
          <p className="text-xs text-text-secondary mb-4">
            Configure how often Cyber Brief automatically runs your digest to fetch and analyze new articles.
          </p>

          <Select
            id="digest-frequency"
            label="Run frequency"
            options={intervalOptions}
            value={digestFrequency}
            onChange={(e) => setDigestFrequency(e.target.value as DigestInterval)}
          />

          {/* Preferred time — only for daily or longer intervals */}
          {timeRelevantIntervals.has(digestFrequency) && (
            <div className="mt-4">
              <label
                htmlFor="digest-time"
                className="block text-sm font-medium text-text mb-1.5"
              >
                Preferred time (UTC)
              </label>
              <input
                id="digest-time"
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="block w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-border-focus transition-all"
              />
              <p className="text-xs text-text-secondary mt-1">
                The time your digest will run each day (in UTC).
              </p>
            </div>
          )}

          {/* Last run info */}
          {settings?.lastDigestAt && (
            <dl className="mt-4 pt-4 border-t border-border text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Last digest</dt>
                <dd className="text-text">{new Date(settings.lastDigestAt).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </div>

        {/* Email Notifications */}
        <div className="bg-surface border border-border rounded-md px-5 py-4">
          <h2 className="text-sm font-semibold text-text mb-1">Email Notifications</h2>
          <p className="text-xs text-text-secondary mb-4">
            Receive a brief summary via email after each scheduled digest run.
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text">Email Alerts</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {emailEnabled ? 'You will receive email briefs' : 'Email notifications are off'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailEnabled(!emailEnabled)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded transition-colors cursor-pointer ${
                emailEnabled
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:text-text'
              }`}
            >
              {emailEnabled ? (
                <><Mail className="h-3.5 w-3.5" /> Enabled</>
              ) : (
                <><BellOff className="h-3.5 w-3.5" /> Disabled</>
              )}
            </button>
          </div>

          {/* Email address — read-only */}
          {settings?.email && (
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Email address</label>
              <p className="text-sm text-text-secondary bg-background border border-border rounded-lg px-4 py-3">
                {settings.email}
              </p>
            </div>
          )}
        </div>

        {/* Save */}
        <Button onClick={handleSave} isLoading={saving} disabled={!isDirty}>
          <Save className="h-4 w-4 mr-1.5" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
