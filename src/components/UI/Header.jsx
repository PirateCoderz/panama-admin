'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Phone, Home, Briefcase, Mail } from 'lucide-react';
import Image from 'next/image';

// Keep only 3 items
const menuLinks = [
  { label: 'Home', to: 'home-section', type: 'scroll', icon: <Home size={18} /> },
  { label: 'Blogs', to: '/blogs', type: 'scroll', icon: <Briefcase size={18} /> },
  { label: 'Contact Us', href: '/contact-us', type: 'route', icon: <Mail size={18} /> },
];

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const closeMenu = () => setShowMobileMenu(false);

  // Close mobile drawer on >= lg
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && showMobileMenu) setShowMobileMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileMenu]);

  // Smooth-scroll to a section
  const handleSectionClick = (sectionId) => {
    if (isHomePage) {
      const el = document.getElementById(sectionId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      router.push(`/?scroll=${sectionId}`);
    }
  };

  const renderNavLink = (item, className = '', onClick) => {
    const icon = item.icon ? <span className="mr-2">{item.icon}</span> : null;
    if (item.type === 'scroll') {
      return (
        <span
          key={item.label}
          className={`cursor-pointer flex items-center ${className}`}
          onClick={() => {
            handleSectionClick(item.to);
            onClick?.();
          }}
        >
          {icon}
          <span>{item.label}</span>
        </span>
      );
    }
    return (
      <Link
        key={item.label}
        href={item.href || '/'}
        className={`flex items-center ${className}`}
        onClick={onClick}
      >
        {icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="w-full bg-white text-primary shadow">
      {/* === Mobile Top Bar === */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2">
        <button onClick={() => setShowMobileMenu(true)} className="flex items-center gap-1">
          <Menu size={22} />
          <span className="text-xs">Menu</span>
        </button>

        <div className="text-2xl font-bold text-center">
          <Link href="/">Panama Travel</Link>
        </div>

        <a
          href="tel:+442071770066"
          className="text-xs px-3 py-1 rounded-sm flex items-center gap-1 bg-primary text-white"
        >
          <Phone size={14} /> Call Us
        </a>
      </div>

      {/* Overlay for mobile */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={closeMenu} />
      )}

      {/* === Mobile Drawer Menu === */}
      <div
        className={`fixed top-0 right-0 h-full w-64 z-50 transform transition-transform duration-300 ${
          showMobileMenu ? 'translate-x-0' : 'translate-x-full'
        } bg-white text-primary`}
      >
        <div className="flex items-center justify-between px-4 py-4 bg-primary text-white">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={closeMenu}>
            <X size={26} />
          </button>
        </div>
        <ul className="space-y-2 text-base py-2">
          {menuLinks.map((item) => (
            <li key={item.label} className="transition duration-200 ease-in-out hover:bg-gray-100">
              {renderNavLink(item, 'block w-full px-4 py-2', closeMenu)}
            </li>
          ))}
        </ul>
      </div>

      {/* === Desktop Navbar === */}
      <div className="hidden lg:flex justify-between items-center py-2 px-6">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/images/panamatravellogo.png"
            alt="Logo"
            width={200}
            height={50}
            className="h-16 w-auto transition-opacity"
          />
        </Link>

        {/* NAVIGATION BAR (3 items only) */}
        <nav className="flex gap-2">
          {menuLinks.map((item) =>
            renderNavLink(
              item,
              'px-3 py-2 font-medium text-primary hover:underline transition',
            ),
          )}
        </nav>
      </div>
    </div>
  );
}
