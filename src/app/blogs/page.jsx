import React, { Suspense } from 'react'
import AdminBlogsListPageContent from '@/components/Blogs/AdminBlogsListPageContent'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminBlogsListPageContent />
    </Suspense>
  )
}

export default Page