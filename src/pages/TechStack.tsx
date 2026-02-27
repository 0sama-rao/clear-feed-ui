import { useState, useEffect, useCallback, useRef } from 'react';
import { Server, Plus, Trash2, Search } from 'lucide-react';
import {
  getTechStack,
  createTechStackItem,
  deleteTechStackItem,
  searchTechStackCatalog,
} from '../lib/services';
import type { TechStackItem, TechStackCatalogItem, TechStackCategory } from '../lib/types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';

const categoryOptions: { value: string; label: string }[] = [
  { value: 'EDGE_DEVICE', label: 'Edge Device' },
  { value: 'NETWORK', label: 'Network' },
  { value: 'OS', label: 'Operating System' },
  { value: 'APPLICATION', label: 'Application' },
  { value: 'CLOUD', label: 'Cloud' },
  { value: 'IDENTITY', label: 'Identity' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'LIBRARY', label: 'Library' },
  { value: 'OTHER', label: 'Other' },
];

const categoryColors: Record<TechStackCategory, string> = {
  EDGE_DEVICE: 'text-red-600 bg-red-50',
  NETWORK: 'text-blue-600 bg-blue-50',
  OS: 'text-purple-600 bg-purple-50',
  APPLICATION: 'text-teal-600 bg-teal-50',
  CLOUD: 'text-sky-600 bg-sky-50',
  IDENTITY: 'text-indigo-600 bg-indigo-50',
  DATABASE: 'text-amber-600 bg-amber-50',
  LIBRARY: 'text-emerald-600 bg-emerald-50',
  OTHER: 'text-gray-600 bg-gray-100',
};

function CategoryBadge({ category }: { category: TechStackCategory }) {
  const color = categoryColors[category] || 'text-gray-600 bg-gray-100';
  const label = categoryOptions.find((o) => o.value === category)?.label || category;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}

export default function TechStack() {
  const [items, setItems] = useState<TechStackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Catalog search
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogResults, setCatalogResults] = useState<TechStackCatalogItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<TechStackCatalogItem | null>(null);

  // Manual input (when catalog has no match)
  const [formVendor, setFormVendor] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formVersion, setFormVersion] = useState('');
  const [formCategory, setFormCategory] = useState<TechStackCategory>('APPLICATION');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<TechStackItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setError('');
      const data = await getTechStack();
      setItems(data);
    } catch {
      setError('Failed to load tech stack');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setSelectedCatalogItem(null);
    setSearchDone(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setCatalogResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchTechStackCatalog(value.trim());
        setCatalogResults(results);
        setSearchDone(true);
      } catch {
        setCatalogResults([]);
        setSearchDone(true);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function selectCatalogItem(item: TechStackCatalogItem) {
    setSelectedCatalogItem(item);
    setFormCategory(item.category);
    setSearchQuery(item.displayName);
    setCatalogResults([]);
  }

  function openAdd() {
    setSearchQuery('');
    setCatalogResults([]);
    setSearchDone(false);
    setSelectedCatalogItem(null);
    setFormVendor('');
    setFormProduct('');
    setFormVersion('');
    setFormCategory('APPLICATION');
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let vendor: string;
    let product: string;
    let displayLabel: string;

    if (selectedCatalogItem) {
      vendor = selectedCatalogItem.vendor;
      product = selectedCatalogItem.product;
      displayLabel = selectedCatalogItem.displayName;
    } else if (formVendor.trim() && formProduct.trim()) {
      vendor = formVendor.trim();
      product = formProduct.trim();
      displayLabel = `${vendor} / ${product}`;
    } else {
      setFormError('Select a product from the catalog or enter vendor and product manually');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const result = await createTechStackItem({
        vendor,
        product,
        version: formVersion.trim() || undefined,
        category: formCategory,
      });

      const newItem: TechStackItem = {
        ...result,
        _count: result._count ?? { exposures: result.retroactiveMatches },
      };
      setItems((prev) => [newItem, ...prev]);
      setModalOpen(false);

      if (result.retroactiveMatches > 0) {
        setSuccessMessage(
          `Added ${displayLabel}. Found ${result.retroactiveMatches} existing exposure(s).`
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { error: string } } }).response?.data?.error
          : 'Something went wrong';
      setFormError(msg || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTechStackItem(deleteTarget.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete item');
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
        <h1 className="text-2xl font-bold text-text">Tech Stack</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

      {items.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No tech stack items"
          description="Add the products and services in your infrastructure to track vulnerability exposure."
          action={
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add your first item
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-border rounded-md px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text truncate">
                      {item.vendor} / {item.product}
                    </span>
                    {item.version && (
                      <Badge variant="default">{item.version}</Badge>
                    )}
                    <CategoryBadge category={item.category} />
                    {item._count?.exposures > 0 && (
                      <Badge variant="danger">
                        {item._count.exposures} exposure{item._count.exposures !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {item.cpePattern}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-4">
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-2 text-text-secondary hover:text-danger transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Tech Stack Item">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          {/* Catalog search */}
          <div className="relative">
            <Input
              id="catalog-search"
              label="Search Product Catalog"
              placeholder="e.g. palo alto, cisco, apache..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searching && (
              <div className="absolute right-3 top-9">
                <Spinner size="sm" />
              </div>
            )}

            {catalogResults.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-surface border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {catalogResults.map((item) => (
                  <button
                    key={`${item.vendor}-${item.product}`}
                    type="button"
                    onClick={() => selectCatalogItem(item)}
                    className="w-full text-left px-4 py-2.5 text-sm text-text hover:bg-primary-light transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span className="font-medium">{item.displayName}</span>
                    <CategoryBadge category={item.category} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCatalogItem && (
            <div className="bg-primary-light rounded-md px-3 py-2 text-sm text-primary flex items-center gap-2">
              <Search className="h-4 w-4" />
              Selected: <strong>{selectedCatalogItem.displayName}</strong>
              <span className="text-primary/60">
                ({selectedCatalogItem.vendor}/{selectedCatalogItem.product})
              </span>
            </div>
          )}

          {/* Manual input — shown when catalog search finds no match */}
          {!selectedCatalogItem && searchDone && catalogResults.length === 0 && searchQuery.trim().length >= 2 && (
            <div className="border border-border rounded-md px-4 py-3 space-y-3">
              <p className="text-xs text-text-secondary">
                No catalog match found. Add manually:
              </p>
              <Input
                id="techstack-vendor"
                label="Vendor"
                placeholder="e.g. solarwinds, qnap, veeam"
                value={formVendor}
                onChange={(e) => setFormVendor(e.target.value)}
              />
              <Input
                id="techstack-product"
                label="Product"
                placeholder="e.g. serv-u, qts, backup_and_replication"
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
              />
            </div>
          )}

          <Input
            id="techstack-version"
            label="Version (optional)"
            placeholder="e.g. 11.1, 17.x"
            value={formVersion}
            onChange={(e) => setFormVersion(e.target.value)}
          />

          <Select
            id="techstack-category"
            label="Category"
            options={categoryOptions}
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value as TechStackCategory)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tech Stack Item"
        message={`Are you sure you want to delete "${deleteTarget?.vendor} / ${deleteTarget?.product}"? Associated exposures will remain but will no longer be linked to your stack.`}
        isLoading={deleting}
      />
    </div>
  );
}
