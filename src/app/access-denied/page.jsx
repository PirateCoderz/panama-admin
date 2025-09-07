"use client";
import { useSearchParams } from "next/navigation";
import AccessDenied from "@/components/AccessDenied";

export default function AccessDeniedPage() {
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from');
  
  let message = "You don't have permission to access this page.";
  
  if (fromPath) {
    if (fromPath === '/' || fromPath.startsWith('/admin')) {
      message = `Access to the admin dashboard requires administrator authentication. Please login to continue.`;
    } else {
      message = `You don't have permission to access "${fromPath}".`;
    }
  }

  return (
    <AccessDenied 
      title="Access Denied"
      message={message}
    />
  );
}
