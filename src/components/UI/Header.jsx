"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { LayoutDashboard, Sun, Moon, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { clientAuth } from "@/lib/auth-client";
import Swal from "sweetalert2";


export default function Header() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState("admin");

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      const success = await clientAuth.logout();
      if (success) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  async function refreshHomepageCache() {
    const confirm = await Swal.fire({
      title: "Refresh Homepage Data?",
      text: "This will re-fetch data from the database and update the cache.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, refresh it",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return; // user cancelled

    try {
      const res = await fetch("/api/homepage", { method: "POST" });
      const data = await res.json();

      if (data.ok) {
        Swal.fire({
          icon: "success",
          title: "Cache Refreshed ✅",
          text: "Homepage data was updated successfully.",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "Something went wrong."
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to refresh homepage cache."
      });
    }
  }

  return (
    <header
      className={`${darkMode ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-200"
        } backdrop-blur-sm border-b sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
              >
                Admin Dashboard
              </h1>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Panama Travel Administration
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Homepage Link */}
            <Link
              href="/homepage"
              className={`px-4 py-2 rounded-lg border transition-colors ${darkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
            >
              Homepage
            </Link>

            {/* User Info + Logout */}
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user}</span>
              </div>
              <button
                onClick={refreshHomepageCache}
                className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-md"
              >
                Refetch Data
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
