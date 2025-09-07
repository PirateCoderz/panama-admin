"use client";
import { useRouter } from "next/navigation";
  import Link from "next/link";
import {
  ShieldX,
  Lock,
  AlertTriangle,
  Clock,
  ArrowLeft,
  LogIn,
} from "lucide-react";

export default function AccessDenied({ 
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  showLoginButton = true,
  showBackButton = true 
}) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-white" />
        </div>

        {/* Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
          {/* Status Code */}
          <div className="text-6xl font-bold text-red-500 mb-4">403</div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h1>
          
          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Security Info */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 dark:text-red-300 text-left">
                <p className="font-medium mb-2">Security Notice</p>
                <ul className="space-y-1 text-xs">
                  <li>• This page requires administrator authentication</li>
                  <li>• Sessions expire after 5 hours of inactivity</li>
                  <li>• Please login with valid credentials to continue</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4" />
              <span>Your session may have expired or you may not be logged in.</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {showLoginButton && (
              <Link
                href={"/login"}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-105"
              >
                <LogIn className="w-5 h-5" />
                <span>Go to Login</span>
              </Link>
            )}
            
            <div className="flex space-x-3">
              {showBackButton && (
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              )}
              
              <Link
                href={"https://panamatravel.co.uk"}
                className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Home</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="flex items-center justify-center space-x-1">
            <Lock className="w-4 h-4" />
            <span>Protected by Panama Admin Security</span>
          </p>
        </div>
      </div>
    </div>
  );
}
