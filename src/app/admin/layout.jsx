import { getServerAuth } from "@/lib/serverAuth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  // Server-side authentication check
  const { authenticated, session } = await getServerAuth();

  // If not authenticated, the middleware will handle the redirect
  // This is just a double-check on the server side
  if (!authenticated) {
    redirect('/access-denied?from=/admin');
  }

  // Render admin content with session info
  return (
    <div className="admin-layout">
      <div className="admin-session-info" style={{ display: 'none' }} data-user={session?.user}>
        {/* Hidden session info for client-side access if needed */}
      </div>
      {children}
    </div>
  );
}
