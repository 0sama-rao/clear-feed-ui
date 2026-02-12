import { useState, useEffect, useCallback } from 'react';
import { Tags, Plus } from 'lucide-react';
import { getKeywords, createKeyword, deleteKeyword } from '../lib/services';
import type { Keyword } from '../lib/types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

export default function Keywords() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add keyword state
  const [newWord, setNewWord] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchKeywords = useCallback(async () => {
    try {
      setError('');
      const data = await getKeywords();
      setKeywords(data);
    } catch {
      setError('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const word = newWord.trim();
    if (!word) return;

    setAdding(true);
    setError('');

    try {
      const created = await createKeyword(word);
      setKeywords((prev) => [created, ...prev]);
      setNewWord('');
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data
              ?.error
          : 'Failed to add keyword';
      setError(msg || 'Failed to add keyword');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await deleteKeyword(id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError('Failed to remove keyword');
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
      <h1 className="text-2xl font-bold text-text mb-6">Keywords</h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Add keyword form */}
      <form
        onSubmit={handleAdd}
        className="bg-surface border border-border rounded-md px-5 py-4 mb-6 flex items-end gap-3"
      >
        <div className="flex-1">
          <label
            htmlFor="new-keyword"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Add a keyword
          </label>
          <input
            id="new-keyword"
            type="text"
            placeholder='e.g. "AI", "stocks", "regulations"'
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="block w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-border-focus transition-all"
          />
        </div>
        <Button type="submit" isLoading={adding} disabled={!newWord.trim()}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add
        </Button>
      </form>

      {keywords.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No keywords added"
          description='Add keywords like "AI", "stocks", or "regulations" to filter articles that matter to you.'
        />
      ) : (
        <div className="bg-surface border border-border rounded-md p-5">
          <p className="text-sm text-text-secondary mb-3">
            {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} — articles matching
            these words will appear in your feed.
          </p>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Badge
                key={kw.id}
                variant="primary"
                onRemove={() => handleRemove(kw.id)}
              >
                {kw.word}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
