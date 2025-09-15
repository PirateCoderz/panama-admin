'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from "sweetalert2";
import { joditBaseConfig } from '@/lib/joditConfig';
import { Image as PhotoIcon, Tags as TagIcon } from 'lucide-react';
import Image from 'next/image';
import LoaderSection from '@/components/Utils/LoaderSection';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

function toSlug(s) {
  return s.toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}
function parseTags(input) {
  return (input || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
}
function toDatetimeLocal(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditBlogPage({ id }) {
  const router = useRouter();
  const editorRef = useRef(null);

  // blog states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(''); // existing image url
  const [fileId, setFileId] = useState(null); // store imagekit fileId
  const [newFeaturedFile, setNewFeaturedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('draft');
  const [publishedAt, setPublishedAt] = useState('');

  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cRes = await fetch('/api/blogs/categories', { cache: 'no-store' });
        const cData = await cRes.json();
        if (cData?.ok) setCategories(cData.categories);

        const bRes = await fetch(`/api/blogs/posts/${id}`, { cache: 'no-store' });
        const bData = await bRes.json();
        if (!bRes.ok || !bData?.ok) throw new Error(bData?.error || 'Failed to load blog');

        const b = bData.blog;
        setTitle(b.title || '');
        setSlug(b.slug || '');
        setExcerpt(b.excerpt || '');
        setContent(b.content_html || '');
        setFeatured(b.featured_image_url || '');
        setFileId(b.fileid || null);
        setStatus(b.status || 'draft');
        setPublishedAt(toDatetimeLocal(b.published_at) || '');
        setSeoTitle(b.seo_title || '');
        setSeoDescription(b.seo_description || '');
        setCanonicalUrl(b.canonical_url || '');
        setTags(Array.isArray(b.tags) ? b.tags.join(', ') : '');
        setSelectedCats(Array.isArray(b.category_ids) ? b.category_ids : []);
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ---- Featured Image ----
  async function handleDelete() {
    if (!fileId) return;

    const res = await Swal.fire({
      title: 'Delete image?',
      text: 'This will permanently delete the image from ImageKit.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (res.isConfirmed) {
      try {
        const delRes = await fetch(
          `/api/blogs/upload?fileid=${encodeURIComponent(fileId)}&canonical_url=${encodeURIComponent(canonicalUrl)}`,
          { method: 'DELETE' }
        );
        const delData = await delRes.json();
        if (!delRes.ok || !delData?.success) throw new Error(delData?.error || 'Delete failed');

        setFeatured('');
        setFileId(null);
        setPreview('');
        Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1200, showConfirmButton: false });
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    }
  }

  function handleRemove() {
    setFeatured('');
    setNewFeaturedFile(null);
    setPreview('');
  }

  async function handleReplace(file) {
    setNewFeaturedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/blogs/upload?folder=featured', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok || !data?.ok) throw new Error(data?.error || 'Upload failed');
    setFileId(data.uploaded?.fileId || null);
    return data.url || data.absolute_url;
  }

  // ---- Save ----
  async function onSave(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    try {
      let featuredUrl = featured;

      if (newFeaturedFile) {
        featuredUrl = await uploadFile(newFeaturedFile);
      }

      const payload = {
        title,
        slug: slug || toSlug(title),
        excerpt,
        content_html: content,
        featured_image_url: featuredUrl || null,
        fileid: fileId,
        status,
        published_at: publishedAt ? publishedAt.replace('T', ' ') + ':00' : null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        canonical_url: canonicalUrl || null,
        tags: parseTags(tags),
        category_ids: selectedCats.map(Number),
      };

      const res = await fetch(`/api/blogs/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to save');

      Swal.fire({ icon: 'success', title: 'Changes Saved!', timer: 1200, showConfirmButton: false });
      router.push('/blogs');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoaderSection />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 shadow" />
            <div>
              <p className="text-sm text-gray-500">Panama Travel • Blog</p>
              <h1 className="text-base font-semibold">Edit Post</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status === 'published'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : status === 'scheduled'
                ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
              }`}>{status}</span>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 px-4 py-2 text-white shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input className="w-full rounded-xl border px-4 py-2.5" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input className="w-full rounded-xl border px-4 py-2.5" value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tags</label>
                  <div className="relative">
                    <input className="w-full rounded-xl border px-10 py-2.5" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Excerpt</label>
                <textarea className="w-full rounded-xl border px-4 py-2.5" rows={3} maxLength={240} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Content</label>
                <div className="rounded-xl border overflow-hidden">
                  <JoditEditor ref={editorRef} value={content} config={joditBaseConfig} onBlur={(html) => setContent(html)} />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium">SEO Title</label>
                <input className="w-full rounded-xl border px-4 py-2.5" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Canonical URL</label>
                <input className="w-full rounded-xl border px-4 py-2.5" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">SEO Description</label>
                <textarea className="w-full rounded-xl border px-4 py-2.5" rows={2} maxLength={300} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <label className="block text-sm font-medium">Featured Image</label>
              {featured || preview ? (
                <div className="mt-3">
                  <Image src={preview || featured} alt="featured" width={640} height={360} className="h-48 w-full rounded-xl object-cover" />
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {fileId ? (
                      <button type="button" onClick={handleDelete} className="rounded-xl border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Delete
                      </button>
                    ) : (
                      <button type="button" onClick={handleRemove} className="rounded-xl cursor-pointer border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed bg-gradient-to-b from-sky-50/60 to-white p-6 text-center hover:bg-sky-50/80">
                  <PhotoIcon className="mx-auto h-8 w-8 text-sky-400" />
                  <p className="mt-2 text-sm text-gray-600">Drag & drop an image, or <span className="font-medium text-sky-700">browse</span></p>
                  <input type="file" accept="image/*" hidden onChange={(e) => e.target.files && handleReplace(e.target.files[0])} />
                </label>
              )}
            </div>

            {/* Status */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <label className="block text-sm font-medium">Status</label>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {['draft', 'scheduled', 'published', 'archived'].map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium ring-1 transition ${status === s
                      ? s === 'published'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : s === 'scheduled'
                          ? 'bg-cyan-50 text-cyan-800 ring-cyan-200'
                          : s === 'archived'
                            ? 'bg-gray-100 text-gray-800 ring-gray-200'
                            : 'bg-amber-50 text-amber-800 ring-amber-200'
                      : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50'
                      }`}>{s}</button>
                ))}
              </div>
              {(status === 'published' || status === 'scheduled') && (
                <div className="mt-3">
                  <label className="block text-sm font-medium">Published At</label>
                  <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="mt-1 w-full rounded-xl border px-4 py-2.5" />
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 shadow-sm">
              <label className="block text-sm font-medium">Categories</label>
              <div className="mt-3 grid gap-2 max-h-56 overflow-auto pr-1">
                {categories.map((c) => {
                  const checked = selectedCats.includes(c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={checked}
                        onChange={(e) => setSelectedCats(prev => e.target.checked ? [...prev, c.id] : prev.filter(x => x !== c.id))} />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full rounded-2xl bg-gray-900 px-4 py-3 text-white shadow hover:shadow-md disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
