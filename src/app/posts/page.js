import type { GetServerSideProps, NextPage } from 'next';
import pool from '@/lib/mysql';

type Post = { id: number; title: string; slug: string; featured_image_url?: string | null };

type Props = { posts: Post[] };

const BlogIndex: NextPage<Props> = ({ posts }) => (
  <section className="py-10">
    <h1 className="mb-6 text-3xl font-bold">Blog</h1>
    <ul className="space-y-3">
      {posts.map(p => (
        <li key={p.id} className="border rounded p-3">
          <a href={`/blog/${p.slug}`} className="font-semibold">{p.title}</a>
        </li>
      ))}
      {posts.length === 0 && <li>No posts yet.</li>}
    </ul>
  </section>
);

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [rows] = await pool.query(
    `SELECT id, title, slug, featured_image_url
     FROM blogs
     WHERE status='published' AND (deleted_at IS NULL)
     ORDER BY COALESCE(published_at, created_at) DESC
     LIMIT 50`
  );
  return { props: { posts: rows as Post[] } };
};

export default BlogIndex;
