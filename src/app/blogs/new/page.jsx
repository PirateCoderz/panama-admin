import NewPostFormJodit from '@/components/NewPostFormJodit';

export const runtime = 'nodejs';

export const metadata = {
  title: "Create New Blog | Admin Panel | Panama Travel",
  description:
    "Add a new blog post to Panama Travel. Use the admin panel to create and publish travel blogs with images, SEO settings, and more.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNewBlogPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">New Blog Post</h1>
      <NewPostFormJodit />
    </div>
  );
}
