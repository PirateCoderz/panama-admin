"use client";
import Link from "next/link";
import { Globe, FileText, Plane, Compass, Info, Star, Flag } from "lucide-react";

const sections = [
  { name: "About Panama", href: "/homepage/about", icon: <Info className="w-6 h-6" /> },
  { name: "Popular Flights", href: "/homepage/popular-flights", icon: <Plane className="w-6 h-6" /> },
  { name: "Why Choose Us", href: "/homepage/why-choose-us", icon: <Star className="w-6 h-6" /> },
  { name: "Dream Destinations", href: "/homepage/dream-destinations", icon: <Compass className="w-6 h-6" /> },
  { name: "Need Help Section", href: "/homepage/need-help", icon: <FileText className="w-6 h-6" /> },
  { name: "Exclusive Deals", href: "/homepage/exclusive-deals", icon: <Flag className="w-6 h-6" /> },
  { name: "Discover About", href: "/homepage/discover-about", icon: <Globe className="w-6 h-6" /> },
  // { name: "Discover Items", href: "/homepage/discover-items", icon: <Globe className="w-6 h-6" /> },
  { name: "Trending Countries (Top 5)", href: "/homepage/trending-first", icon: <Globe className="w-6 h-6" /> },
  { name: "Trending Countries (Next 9)", href: "/homepage/trending-second", icon: <Globe className="w-6 h-6" /> },
  { name: "Travel Tips", href: "/homepage/travel-tips", icon: <FileText className="w-6 h-6" /> },
  { name: "Feefo Testimonials", href: "/homepage/testimonials-feefo", icon: <Star className="w-6 h-6" /> },
  { name: "Google Testimonials", href: "/homepage/testimonials-google", icon: <Star className="w-6 h-6" /> },
];

export default function HomepageAdmin() {





  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Homepage Content Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.name}
            href={section.href}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg flex items-center space-x-4 border border-gray-200 dark:border-gray-700 transition"
          >
            <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
              {section.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{section.name}</h2>
              <p className="text-sm text-gray-500">Manage this section</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
