// pages/blog/index.js
import Link from 'next/link';
import pool from '@/lib/mysql'; // your mysql2/promise pool

export default function BlogIndex({ posts }) {
  return (
    <section className="py-10">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <Link href={`/blog/${p.slug}`} className="font-semibold">
              {p.title}
            </Link>
          </li>
        ))}
        {posts.length === 0 && <li>No posts yet.</li>}
      </ul>
    </section>
  );
}

export async function getServerSideProps() {
  const [rows] = await pool.query(
    `SELECT id, title, slug, featured_image_url
       FROM blogs
      WHERE status = 'published' AND deleted_at IS NULL
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 50`
  );

  return { props: { posts: rows || [] } };
}
