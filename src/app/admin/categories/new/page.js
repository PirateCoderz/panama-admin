'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function slugify(input = '') {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCreateCategoryPage() {
  const router = useRouter();

  // form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const computedSlug = useMemo(() => {
    return slugify(autoSlug ? name : slug);
  }, [name, slug, autoSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setOk('');

    const finalName = name.trim();
    const finalSlug = computedSlug;

    if (!finalName) return setError('Name is required.');
    if (!finalSlug) return setError('Slug is required.');

    try {
      setSubmitting(true);
      const res = await fetch('/api/blogs/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          slug: finalSlug,
          description: description?.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to create category.');
      }
      setOk('Category created successfully.');
      // Navigate back to admin categories list (adjust if your route differs)
      setTimeout(() => router.push('/admin/categories'), 650);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Top bar / breadcrumb */}
      <div className="border-b border-[color-mix(in_oklab,var(--text-secondary)_15%,transparent)] bg-[var(--surface)]/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Link href="/admin" className="hover:text-[var(--primary)] transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/categories" className="hover:text-[var(--primary)] transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-[var(--text-primary)]">New</span>
          </nav>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Create Category
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Add a new travel category (e.g., Destinations, Travel Tips, Budget Travel).
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-12">
          {/* Main card */}
          <div className="md:col-span-8">
            <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-[var(--surface)] shadow-[0_8px_24px_0_rgba(0,0,0,0.06)]">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">
                    Name <span className="text-[var(--accent,#D81B60)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Beaches & Islands"
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--card,#FFFFFF)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary,#00E5FF)]"
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Human-friendly category title.</p>
                </div>

                {/* Slug */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-sm font-medium text-[var(--text-primary)]">
                      Slug <span className="text-[var(--accent,#D81B60)]">*</span>
                    </label>
                    <label className="flex select-none items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="accent-[var(--primary,#00E5FF)]"
                      />
                      Auto-generate from name
                    </label>
                  </div>
                  <input
                    type="text"
                    value={autoSlug ? slugify(name) : slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (autoSlug) setAutoSlug(false);
                    }}
                    disabled={autoSlug}
                    placeholder="beaches-islands"
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--card,#FFFFFF)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--primary,#00E5FF)] disabled:opacity-60"
                  />
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Final slug:&nbsp;
                    <span className="font-mono text-[var(--text-primary)]">
                      {computedSlug || '(empty)'}
                    </span>
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description for this category (optional)…"
                    className="w-full rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-[var(--card,#FFFFFF)] px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--secondary,#26C6DA)]"
                  />
                </div>

                {/* Alerts */}
                {error && (
                  <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {ok && (
                  <div className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {ok}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-xl bg-[var(--primary,#00E5FF)] px-4 py-2 text-[var(--bg,#121212)] font-medium shadow-sm transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Creating…' : 'Create Category'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setName(''); setSlug(''); setDescription(''); setAutoSlug(true);
                      setError(''); setOk('');
                    }}
                    className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] bg-transparent px-4 py-2 text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                  >
                    Reset
                  </button>
                  <Link
                    href="/admin/categories"
                    className="rounded-xl border border-[color-mix(in_oklab,var(--text-secondary)_18%,transparent)] px-4 py-2 text-[var(--text-primary)] hover:bg-[color-mix(in_oklab,var(--text-secondary)_6%,transparent)]"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Side panel / tips */}
          <aside className="md:col-span-4">
            <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-[var(--card,#E0FBFF)]/40 p-5">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Guidelines</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
                <li>Keep names short and descriptive (e.g., “Travel Tips”).</li>
                <li>Slugs should be lowercase, hyphenated (e.g., <code>travel-tips</code>).</li>
                <li>Use description for SEO and admin clarity.</li>
              </ul>
              <div className="mt-4 rounded-xl bg-[var(--surface,#FFFFFF)] p-3 text-xs text-[var(--text-secondary)]">
                Your brand colors are applied via Tailwind + CSS variables:
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <span className="rounded-lg border px-2 py-1">primary: <code>#00E5FF</code></span>
                  <span className="rounded-lg border px-2 py-1">secondary: <code>#26C6DA</code></span>
                  <span className="rounded-lg border px-2 py-1">accent: <code>#D81B60</code></span>
                  <span className="rounded-lg border px-2 py-1">highlight: <code>#FFC107</code></span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Preview */}
        <div className="mt-8 rounded-2xl border border-[color-mix(in_oklab,var(--text-secondary)_12%,transparent)] bg-[var(--surface)] p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Live Preview</h3>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-[var(--text-secondary)]">Name</dt>
              <dd className="break-words font-medium">{name || '—'}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-secondary)]">Slug</dt>
              <dd className="break-words font-medium">{computedSlug || '—'}</dd>
            </div>
            <div className="sm:col-span-3">
              <dt className="text-[var(--text-secondary)]">Description</dt>
              <dd className="whitespace-pre-wrap break-words font-medium">{description || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
