import NewPostFormJodit from '@/components/NewPostFormJodit';

export const runtime = 'nodejs';

export default function AdminNewBlogPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">New Blog Post</h1>
      <NewPostFormJodit />
    </div>
  );
}
