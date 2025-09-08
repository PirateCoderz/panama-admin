"use client";
import React, { Suspense } from 'react'
import AccessDeniedPage from '@/components/Utils/AccessDeniedPage'



const Page = () => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccessDeniedPage />
    </Suspense>
  )
}

export default Page