"use client";

import EditBlogPage from "@/components/Blogs/EditBlogPage";
import { useParams } from 'next/navigation';

const Page = () => {
  const { id } = useParams();

  return (
    <EditBlogPage id={id} />
  )
}

export default Page;