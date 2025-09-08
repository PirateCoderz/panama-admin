import mysqlpool from '@/lib/mysql';
import Image from 'next/image';

export const runtime = 'nodejs';
export const revalidate = 0; // disable ISR while developing

export default async function BlogIndexPage() {
  const [posts] = await mysqlpool.query(
    `SELECT id, title, slug, excerpt, featured_image_url, published_at
     FROM blogs
     WHERE status='published' AND deleted_at IS NULL
     ORDER BY COALESCE(published_at, created_at) DESC
     LIMIT 60`
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.id} className="border rounded p-4">
            {p.featured_image_url && (
              <Image
                src={p.featured_image_url}
                alt={p.title}
                width={640}
                height={360}
                className="mb-3 h-40 w-full rounded object-cover"
              />
            )}
            <a href={`/blog/${p.slug}`} className="font-semibold text-lg">
              {p.title}
            </a>
            {p.excerpt && <p className="mt-2 text-sm text-neutral-600">{p.excerpt}</p>}
          </li>
        ))}
        {!posts.length && <li>No posts yet.</li>}
      </ul>
    </main>
  );
}
