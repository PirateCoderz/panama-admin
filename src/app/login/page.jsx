import React from 'react';
import LoginPage from '@/components/Utils/LoginPage';

// ✅ App Router way to define page-specific metadata
export const metadata = {
  title: "Login | Panama Travel",
  description:
    "Log in to your Panama Travel account to manage bookings, access exclusive deals, and update your profile securely.",
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return (
    <>
      <LoginPage />
    </>
  )
}

export default Page;