// /src/app/posts/page.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import mysqlPool from '@/lib/mysql';

export default async function PostsPage() {
  let conn;
  try {
    conn = await mysqlPool.getConnection();
    const [rows] = await conn.query(
      `SELECT id, title, slug, featured_image_url
         FROM blogs
        WHERE status='published' AND deleted_at IS NULL
        ORDER BY COALESCE(published_at, created_at) DESC
        LIMIT 50`
    );

    return (
      <section className="py-10">
        <h1 className="mb-6 text-3xl font-bold">Blog</h1>
        <ul className="space-y-3">
          {rows.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <Link href={`/blog/${p.slug}`} className="font-semibold">
                {p.title}
              </Link>
            </li>
          ))}
          {rows.length === 0 && <li>No posts yet.</li>}
        </ul>
      </section>
    );
  } finally {
    if (conn) conn.release();
  }
}
