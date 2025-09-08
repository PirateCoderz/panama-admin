"use client";

import React, { Suspense } from 'react';
import EditBlogPage from "@/components/Blogs/EditBlogPage";
import { useParams } from 'next/navigation';

const Page = () => {
    const { id } = useParams();
  
  return (
    <Suspense fallback={<div> Edit Page Loading...</div>}>
      <EditBlogPage id={id} />
    </Suspense>
  )
}

export default Page;