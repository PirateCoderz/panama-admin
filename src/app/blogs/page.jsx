import React, { Suspense } from 'react'
import AdminBlogsListPageContent from '@/components/Blogs/AdminBlogsListPageContent'

export const metadata = {
  title: "Blogs Dashboard | Admin Panel | Panama Travel",
  description:
    "Manage all blogs for Panama Travel. View, edit, and delete blog posts from the admin dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminBlogsListPageContent />
    </Suspense>
  )
}

export default Page