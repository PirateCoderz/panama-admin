"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clientAuth } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  BarChart3,
  Globe,
  ChevronRight,
  Calendar,
  TrendingUp,
  Eye,
  Tags,
  Edit3,
  Plus,
  Sun,
  Moon,
  LogOut,
  User,
} from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalCategories: 0,
    totalViews: 0,
    totalUsers: 0,
    recentPosts: 0,
  });
  const [user, setUser] = useState('admin');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    // Fetch basic stats
    fetchStats();
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/blogs/posts", {
        method: "GET",
      });
      const response2 = await fetch("/api/blogs/categories", {
        method: "GET",
      });
      const categories = await response2.json();

      if (response.ok) {
        const data = await response.json();
        const blogs = await data.blogs;

        setStats({
          totalBlogs: blogs.length,
          totalCategories: categories.categories.length,
          // totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
          totalUsers: 1, // Static for now
          recentPosts: blogs.filter(blog => {
            const createdAt = new Date(blog.published_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt > thirtyDaysAgo;
          }).length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      const success = await clientAuth.logout();
      if (success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminCards = [
    {
      title: "Blog Management",
      description: "Create, edit, and manage blog posts",
      icon: <FileText className="w-8 h-8" />,
      href: "/blogs",
      color: "from-blue-500 to-blue-600",
      available: true,
      stats: `${stats.totalBlogs} Posts`,
    },
    {
      title: "Categories Management",
      description: "Create, edit, and manage blog categories",
      icon: <Tags className="w-8 h-8" />,
      href: "/categories",
      color: "from-blue-500 to-blue-600",
      available: true,
      stats: `${stats.totalCategories || 0} Categories`,
    },
    {
      title: "Website Content",
      description: "Edit website content and pages",
      icon: <Globe className="w-8 h-8" />,
      href: "#",
      color: "from-green-500 to-green-600",
      available: false,
      stats: "Coming Soon",
    },
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: <Users className="w-8 h-8" />,
      href: "#",
      color: "from-purple-500 to-purple-600",
      available: false,
      stats: `${stats.totalUsers} Users`,
    },
    {
      title: "Analytics",
      description: "View website analytics and insights",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "#",
      color: "from-orange-500 to-orange-600",
      available: false,
      stats: `${stats.totalViews} Views`,
    },
  ];

  const quickActions = [
    {
      title: "Create New Post",
      icon: <Plus className="w-5 h-5" />,
      href: "/blogs/new",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Blog",
      icon: <Eye className="w-5 h-5" />,
      href: "/blog",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: "#",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  const recentActivity = [
    { action: "Blog post created", time: "2 hours ago", type: "create" },
    { action: "Website content updated", time: "1 day ago", type: "update" },
    { action: "User registered", time: "2 days ago", type: "user" },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-950" : "bg-gray-50"
        }`}
    >
      {/* Header */}
      <header
        className={`${darkMode
          ? "bg-gray-900/95 border-gray-800"
          : "bg-white/95 border-gray-200"
          } backdrop-blur-sm border-b sticky top-0 z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
            <div className="flex items-center space-x-4">
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
              <Link
                href="https://panamatravel.co.uk/blogs"
                className={`px-4 py-2 rounded-lg border transition-colors ${darkMode
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                View Site
              </Link>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${darkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
                  }`}>
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user}</span>
                </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2
            className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
              } mb-2`}
          >
            Welcome back!
          </h2>
          <p
            className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            Here's what's happening with your website today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Total Posts
                </p>
                <p
                  className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                >
                  {stats.totalBlogs}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Total Views
                </p>
                <p
                  className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                >
                  {stats.totalViews}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div> */}

          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Recent Posts
                </p>
                <p
                  className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                >
                  {stats.recentPosts}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div
            className={`${darkMode ? "bg-gray-800" : "bg-white"
              } rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Active Users
                </p>
                <p
                  className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"
                    }`}
                >
                  {stats.totalUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3
            className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
              } mb-4`}
          >
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className={`${action.color} text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg`}
              >
                {action.icon}
                <span className="font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Admin Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Cards */}
          <div>
            <h3
              className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
                } mb-6`}
            >
              Administration
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {adminCards.map((card) => (
                <div
                  key={card.title}
                  className={`${darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group transition-all duration-300 hover:shadow-xl`}
                >
                  {card.available ? (
                    <Link href={card.href} className="block">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div
                              className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}
                            >
                              {card.icon}
                            </div>
                            <div className="flex-1">
                              <h4
                                className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
                                  } mb-2 group-hover:text-teal-500 transition-colors`}
                              >
                                {card.title}
                              </h4>
                              <p
                                className={`${darkMode ? "text-gray-400" : "text-gray-600"
                                  } mb-3`}
                              >
                                {card.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                                    }`}
                                >
                                  {card.stats}
                                </span>
                                <ChevronRight
                                  className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-500"
                                    } group-hover:text-teal-500 transition-colors`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="p-6 opacity-60 cursor-not-allowed">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            {card.icon}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
                                } mb-2`}
                            >
                              {card.title}
                            </h4>
                            <p
                              className={`${darkMode ? "text-gray-400" : "text-gray-600"
                                } mb-3`}
                            >
                              {card.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"
                                  }`}
                              >
                                {card.stats}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${darkMode
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-200 text-gray-600"
                                  }`}
                              >
                                Coming Soon
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3
              className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
                } mb-6`}
            >
              Recent Activity
            </h3>
            <div
              className={`${darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6`}
            >
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-900"
                          }`}
                      >
                        {activity.action}
                      </p>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                      >
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div
              className={`${darkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-6`}
            >
              <h4
                className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"
                  } mb-4`}
              >
                System Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Database
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-sm font-medium">
                      Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    API Services
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-sm font-medium">
                      Running
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`${darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    File Storage
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-500 text-sm font-medium">
                      Available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}
