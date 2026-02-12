import { useState, useEffect, useCallback } from 'react';
import { Globe, Plus, Pencil, Trash2, Rss, ExternalLink } from 'lucide-react';
import { getSources, createSource, updateSource, deleteSource } from '../lib/services';
import type { Source } from '../lib/types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';

const typeOptions = [
  { value: 'RSS', label: 'RSS Feed' },
  { value: 'WEBSITE', label: 'Website' },
];

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Source | null>(null);
  const [formUrl, setFormUrl] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'RSS' | 'WEBSITE'>('RSS');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Source | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSources = useCallback(async () => {
    try {
      setError('');
      const data = await getSources();
      setSources(data);
    } catch {
      setError('Failed to load sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  function openAdd() {
    setEditing(null);
    setFormUrl('');
    setFormName('');
    setFormType('RSS');
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(source: Source) {
    setEditing(source);
    setFormUrl(source.url);
    setFormName(source.name);
    setFormType(source.type);
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formUrl.trim() || !formName.trim()) {
      setFormError('URL and name are required');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editing) {
        const updated = await updateSource(editing.id, {
          url: formUrl.trim(),
          name: formName.trim(),
          type: formType,
        });
        setSources((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
      } else {
        const created = await createSource({
          url: formUrl.trim(),
          name: formName.trim(),
          type: formType,
        });
        setSources((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data
              ?.error
          : 'Something went wrong';
      setFormError(msg || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(source: Source) {
    try {
      const updated = await updateSource(source.id, {
        active: !source.active,
      });
      setSources((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } catch {
      setError('Failed to update source');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSource(deleteTarget.id);
      setSources((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete source');
    } finally {
      setDeleting(false);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Sources</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Source
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {sources.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No sources added"
          description="Add RSS feeds or website URLs to start tracking news."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add your first source
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-surface border border-border rounded-md px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0">
                  {source.type === 'RSS' ? (
                    <Rss className="h-5 w-5 text-primary" />
                  ) : (
                    <Globe className="h-5 w-5 text-primary" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      {source.name}
                    </span>
                    <Badge variant={source.type === 'RSS' ? 'primary' : 'default'}>
                      {source.type}
                    </Badge>
                    {!source.active && (
                      <Badge variant="warning">Paused</Badge>
                    )}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-text-secondary hover:text-primary truncate block mt-0.5"
                  >
                    {source.url}
                    <ExternalLink className="h-3 w-3 inline ml-1 -mt-0.5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button
                  onClick={() => handleToggleActive(source)}
                  className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                    source.active
                      ? 'border-border text-text-secondary hover:bg-gray-50'
                      : 'border-primary/30 text-primary hover:bg-primary-light'
                  }`}
                >
                  {source.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => openEdit(source)}
                  className="p-2 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(source)}
                  className="p-2 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Source' : 'Add Source'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="error">{formError}</Alert>
          )}
          <Input
            id="source-name"
            label="Name"
            placeholder="e.g. Ars Technica"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />
          <Input
            id="source-url"
            label="URL"
            placeholder="https://feeds.arstechnica.com/arstechnica/index"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
          <Select
            id="source-type"
            label="Type"
            options={typeOptions}
            value={formType}
            onChange={(e) => setFormType(e.target.value as 'RSS' | 'WEBSITE')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editing ? 'Save Changes' : 'Add Source'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Source"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also remove all articles from this source.`}
        isLoading={deleting}
      />
    </div>
  );
}
