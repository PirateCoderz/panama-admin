// app/layout.tsx or app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/UI/Header";

// Load fonts as variables
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap", // avoids font flashing
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Metadata for the entire app
export const metadata = {
  title: "Admin Panel | Panama Travel Ltd",
  description: "Secure admin panel for Panama Travel. Manage SEO settings, blogs, images, and website content. Authorized users only.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true} // optional if hydration warning persists
      >
        {/* <Header /> */}
        {children}
      </body>
    </html>
  );
}
