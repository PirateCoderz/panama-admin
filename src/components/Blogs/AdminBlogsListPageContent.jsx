'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import Image from 'next/image';

function fmtDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt;
  return d.toLocaleString();
};

const STATUS_ALL = 'all';
const STATUS = ['draft', 'scheduled', 'published', 'archived'];

function AdminBlogsListPageContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // filters
  const [q, setQ] = useState(sp.get('q') || '');
  const [status, setStatus] = useState(sp.get('status') || STATUS_ALL);

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  async function loadBlogs() {
    try {
      setLoading(true);
      setErr('');
      const qs = new URLSearchParams();
      if (q.trim()) qs.set('q', q.trim());
      if (status && status !== STATUS_ALL) qs.set('status', status);
      const res = await fetch(`/api/blogs/posts/${qs.toString() ? `?${qs}` : ''}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load blogs');
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
    } catch (e) {
      setErr(e.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    };
  };

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    // If API already filtered by q/status, this is a safeguard.
    if (!q.trim() && (status === STATUS_ALL)) return blogs;
    const needle = q.toLowerCase();
    return blogs.filter((b) => {
      const matchQ =
        !needle ||
        b.title?.toLowerCase().includes(needle) ||
        b.slug?.toLowerCase().includes(needle) ||
        b.excerpt?.toLowerCase().includes(needle);
      const matchStatus = status === STATUS_ALL || b.status === status;
      return matchQ && matchStatus;
    });
  }, [blogs, q, status]);

  function onView(blog) {
    setSelected(blog);
    setOpen(true);
  }
  // function onEdit(blog) {
  //   router.push(`/blogs/edit/${blog.id}`);
  // }
  function onEdit(blog) {
    Swal.fire({
      title: 'Edit Blog?',
      text: `Do you want to edit "${blog.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Edit',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        router.push(`/blogs/edit/${blog.id}`);
      }
    });
  }

  async function onDelete(blog) {
    const res = await Swal.fire({
      title: 'Delete blog?',
      html: `<div style="text-align:left">
        <p>This will permanently delete <b>${blog.title || 'Untitled'}</b>.</p>
        <p class="text-sm" style="opacity:.8">Related mappings (blog_categories) and comments will be cascaded if your DB is set accordingly.</p>
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
      const resp = await fetch(`/api/blogs/posts/${blog.id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Delete failed');

      await Swal.fire({ icon: 'success', title: 'Deleted', timer: 1100, showConfirmButton: false });
      setBlogs((prev) => prev.filter((x) => x.id !== blog.id));
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message || 'Failed to delete' });
    }
  }

  function applyFilters() {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (status !== STATUS_ALL) qs.set('status', status);
    const url = `/blogs${qs.toString() ? `?${qs}` : ''}`;
    router.replace(url);
    loadBlogs();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Header */}
      <div className="border-b border-[color-mix(in_oklab,var(--text-secondary)_15%,transparent)] bg-[var(--surface)]/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">Blogs</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
            <Link
              href="/blogs/new"
              className="rounded-xl bg-[var(--primary,#00E5FF)] px-4 py-2 font-medium text-[var(--bg,#121212)] shadow-sm hover:brightness-95"
            >
              + New Blog
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">View and manage all blog posts.</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, slug, excerpt…"
            className="w-full max-w-lg flex-1 min-w-[240px] rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--surface)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary,#00E5FF)]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--surface)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary,#00E5FF)]"
          >
            <option value={STATUS_ALL}>All statuses</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] px-4 py-2 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
          >
            Apply
          </button>
          <button
            onClick={() => { setQ(''); setStatus(STATUS_ALL); applyFilters(); }}
            className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] px-4 py-2 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published</th>
                  <th className="px-4 py-3">Categories</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && err && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-red-600">
                      {err}
                    </td>
                  </tr>
                )}
                {!loading && !err && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-[var(--text-secondary)]">
                      No blogs found.
                    </td>
                  </tr>
                )}
                {!loading && !err && filtered.map((b, i) => (
                  <tr key={b.id} className="border-t border-[color-mix(in_oklab,var(--text-secondary)_10%,transparent)]">
                    <td className="px-4 py-3 align-top">{i + 1}</td>
                    <td className="px-4 py-3 align-top font-medium">{b.title || 'Untitled'}</td>
                    <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{b.slug}</td>
                    <td className="px-4 py-3 align-top">
                      <span className="rounded-md border px-2 py-0.5 text-xs">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-[var(--text-secondary)]">
                      {fmtDate(b.published_at)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {Array.isArray(b.categories) && b.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {b.categories.map((c) => (
                            <span key={c.id} className="rounded-md border px-2 py-0.5 text-xs">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(b)}
                          className="rounded-lg cursor-pointer border px-3 py-1.5 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEdit(b)}
                          className="rounded-lg cursor-pointer border px-3 py-1.5 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(b)}
                          className="rounded-lg cursor-pointer bg-[var(--accent,#D81B60)] px-3 py-1.5 text-white hover:brightness-95"
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
          className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/80 p-4"
          onClick={() => { setOpen(false); setSelected(null); }}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">Blog Details</h3>
              <button
                onClick={() => { setOpen(false); setSelected(null); }}
                className="rounded-lg border px-2 py-1 hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-[var(--text-secondary)]">ID</div>
                <div className="font-medium">{selected.id}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Status</div>
                <div className="font-medium">{selected.status}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">Title</div>
                <div className="font-medium break-words">{selected.title || '—'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">Slug</div>
                <div className="font-medium break-words">{selected.slug || '—'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">Excerpt</div>
                <div className="whitespace-pre-wrap break-words">{selected.excerpt || '—'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">Categories</div>
                {Array.isArray(selected.categories) && selected.categories.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selected.categories.map((c) => (
                      <span key={c.id} className="rounded-md border px-2 py-0.5 text-xs">
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div>—</div>
                )}
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Published At</div>
                <div className="font-medium">{fmtDate(selected.published_at)}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Updated At</div>
                <div className="font-medium">{fmtDate(selected.updated_at)}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">Featured Image</div>
                {selected.canonical_url ? (
                  <Image
                    src={selected.canonical_url}
                    alt="Featured"
                    width={640}
                    height={360}
                    className="mt-2 max-h-64 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div>—</div>
                )}
              </div>
              <div className="sm:col-span-2">
                <div className="text-[var(--text-secondary)]">SEO</div>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <div className="text-[var(--text-secondary)]">SEO Title</div>
                    <div className="font-medium break-words">{selected.seo_title || '—'}</div>
                  </div>
                  <div>
                    <div className="text-[var(--text-secondary)]">SEO Description</div>
                    <div className="font-medium break-words">{selected.seo_description || '—'}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-[var(--text-secondary)]">Canonical URL</div>
                    <div className="font-medium break-words">{selected.canonical_url || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

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

export default function AdminBlogsListPage() {
  return <AdminBlogsListPageContent />;
}
