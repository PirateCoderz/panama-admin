'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

/** Small util for slug + date formatting */
function formatDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
}

export default function AdminCategoriesListPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  // Modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setErr('');
      const res = await fetch('/api/blogs/categories', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load categories');
      setCategories(data.categories || []);
    } catch (e) {
      setErr(e.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return categories;
    const needle = q.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(needle) ||
        c.slug?.toLowerCase().includes(needle) ||
        c.description?.toLowerCase().includes(needle)
    );
  }, [q, categories]);

  function onView(cat) {
    setSelected(cat);
    setOpen(true);
  }

  function onEdit(cat) {
    router.push(`/admin/categories/edit/${cat.id}`);
  }

  async function onDelete(cat) {
    const res = await Swal.fire({
      title: 'Delete category?',
      html: `<div style="text-align:left">
        <p>This will permanently remove <b>${cat.name}</b> (${cat.slug}).</p>
        <p class="text-sm" style="opacity:.8">Any blog relations (blog_categories) referencing it will also be removed.</p>
      </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      confirmButtonColor: '#e53935',
    });
    if (!res.isConfirmed) return;

    try {
      const resp = await fetch(`/api/blogs/categories/${cat.id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Delete failed');

      await Swal.fire({ icon: 'success', title: 'Deleted', timer: 1100, showConfirmButton: false });
      // remove locally without full reload
      setCategories((prev) => prev.filter((x) => x.id !== cat.id));
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Failed to delete' });
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Header / breadcrumb */}
      <div className="border-b border-[color-mix(in_oklab,var(--text-secondary)_15%,transparent)] bg-[var(--surface)]/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/admin" className="hover:text-[var(--primary)] transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">Categories</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
            <Link
              href="/admin/categories/new"
              className="rounded-xl bg-[var(--primary,#00E5FF)] px-4 py-2 font-medium text-[var(--bg,#121212)] shadow-sm hover:brightness-95"
            >
              + New Category
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage travel categories used across your Panama Travel blog.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search categories…"
              className="w-full rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--surface)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary,#00E5FF)]"
            />
          </div>
          <button
            onClick={loadCategories}
            className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] px-4 py-2 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && err && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-red-600">
                      {err}
                    </td>
                  </tr>
                )}
                {!loading && !err && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[var(--text-secondary)]">
                      No categories found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !err &&
                  filtered.map((c, i) => (
                    <tr key={c.id} className="border-t border-[color-mix(in_oklab,var(--text-secondary)_10%,transparent)]">
                      <td className="px-4 py-3 align-top">{i + 1}</td>
                      <td className="px-4 py-3 align-top font-medium">{c.name}</td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{c.slug}</td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{formatDate(c.created_at)}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onView(c)}
                            className="rounded-lg border px-3 py-1.5 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                            title="View"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onEdit(c)}
                            className="rounded-lg border px-3 py-1.5 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            className="rounded-lg bg-[var(--accent,#D81B60)] px-3 py-1.5 text-white hover:brightness-95"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {open && selected && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4"
          onClick={() => { setOpen(false); setSelected(null); }}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">Category Details</h3>
              <button
                onClick={() => { setOpen(false); setSelected(null); }}
                className="rounded-lg border px-2 py-1 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--text-secondary)]">ID</dt>
                <dd className="font-medium">{selected.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Name</dt>
                <dd className="font-medium break-words">{selected.name || '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Slug</dt>
                <dd className="font-medium break-words">{selected.slug || '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--text-secondary)]">Description</dt>
                <dd className="whitespace-pre-wrap break-words">{selected.description || '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Created At</dt>
                <dd className="font-medium">{formatDate(selected.created_at)}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-secondary)]">Updated At</dt>
                <dd className="font-medium">{formatDate(selected.updated_at)}</dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => onEdit(selected)}
                className="rounded-lg border px-3 py-1.5 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(selected)}
                className="rounded-lg bg-[var(--accent,#D81B60)] px-3 py-1.5 text-white hover:brightness-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
