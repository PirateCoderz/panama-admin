'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import Swal from "sweetalert2";
import { joditBaseConfig } from '@/lib/joditConfig';
import { Tags as TagIcon } from 'lucide-react';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function toSlug(s) {
  return s.toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
function parseTags(input) {
  return (input || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}

export default function NewPostFormJodit() {
  const editorRef = useRef(null);

  // blog states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [publishedAt, setPublishedAt] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const joditConfig = useMemo(() => joditBaseConfig, []);

  // load categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/blogs/categories', { cache: 'no-store' });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.categories)) setCategories(data.categories);
      } catch { }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // submit payload
      const payload = {
        title,
        slug: slug || toSlug(title),
        excerpt,
        content_html: content,
        status,
        published_at: publishedAt ? publishedAt.replace('T', ' ') + ':00' : null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        canonical_url: canonicalUrl || null,
        tags: parseTags(tags),
        category_ids: selectedCats,
      };

      const res = await fetch('/api/blogs/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.ok) {
        window.location.href = '/blogs';
      } else {
        await Swal.fire({ icon: 'error', title: 'Failed', text: data?.error || 'Post creation failed' });
      }
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  const tagList = parseTags(tags);
  const showSchedule = status === 'published' || status === 'scheduled';

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 shadow ring-1 ring-black/5" />
            <div>
              <p className="text-sm text-gray-500">Panama Travel • Blog</p>
              <h1 className="text-base font-semibold tracking-tight">New Post</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === 'published'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : status === 'scheduled'
                  ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}
            >
              {status}
            </span>
            <button
              form="new-post-form"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-4 py-2 text-white cursor-pointer shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Create Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Content */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <form id="new-post-form" onSubmit={onSubmit} className="space-y-6">
                {/* Title & Slug */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)); }}
                    placeholder="e.g., Discover Hidden Beaches in Antalya"
                    required
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slug</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5"
                        value={slug}
                        onChange={(e) => setSlug(toSlug(e.target.value))}
                        placeholder="discover-hidden-beaches-in-antalya"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tags</label>
                      <div className="relative">
                        <input
                          className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="turkey, beaches, family, summer"
                        />
                        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      </div>
                      {tagList.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tagList.map((t) => (
                            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3"
                    rows={3}
                    maxLength={240}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <JoditEditor
                      ref={editorRef}
                      value={content}
                      config={joditConfig}
                      onBlur={(newContent) => setContent(newContent)}
                    />
                  </div>
                </div>

                {/* SEO */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                    <textarea
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5"
                      rows={2}
                      maxLength={300}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Status + Schedule */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['draft', 'scheduled', 'published'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium ring-1 transition ${status === s
                      ? s === 'published'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : s === 'scheduled'
                          ? 'bg-cyan-50 text-cyan-800 ring-cyan-200'
                          : 'bg-amber-50 text-amber-800 ring-amber-200'
                      : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {showSchedule && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700">Published At</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5"
                  />
                  <p className="mt-1 text-xs text-gray-400">Set now for immediate publish or a future time for scheduling.</p>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700">Categories</label>
              <div className="mt-3 grid gap-2 max-h-56 overflow-auto pr-1">
                {categories.map((c) => {
                  const checked = selectedCats.includes(c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedCats((prev) =>
                            e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)
                          );
                        }}
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit secondary button */}
            <button
              form="new-post-form"
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gray-900 cursor-pointer px-4 py-3 text-white shadow hover:shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Create Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
