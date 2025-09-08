"use client";
import React, { Suspense } from 'react'
import AccessDeniedPage from '@/components/Utils/AccessDeniedPage'
import Head from "next/head";



const Page = () => {

  return (
    <>
      <Head>
        <title>Access Denied | Panama Travel</title>
        <meta
          name="description"
          content="You don’t have permission to view this page on Panama Travel. Please log in with the correct account or contact support."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Suspense fallback={<div>Loading...</div>}>
        <AccessDeniedPage />
      </Suspense>
    </>
  )
}

export default Page