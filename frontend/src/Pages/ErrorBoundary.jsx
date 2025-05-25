import React from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  // Determine error type
  let errorMessage = 'An unexpected error occurred';
  let errorTitle = 'Application Error';
  let showRefresh = true;

  if (error.status === 404) {
    errorTitle = 'Page Not Found';
    errorMessage = "The page you're looking for doesn't exist or has been moved.";
    showRefresh = false;
  } else if (error.status === 401) {
    errorTitle = 'Unauthorized';
    errorMessage = 'You need to be logged in to access this page.';
  } else if (error.status === 403) {
    errorTitle = 'Forbidden';
    errorMessage = 'You dont have permission to access this resource.';
  } else if (error.status === 500) {
    errorTitle = 'Server Error';
    errorMessage = 'Something went wrong on our servers. Please try again later.';
  }

  return (
    <div className="relative w-full h-full bg-black text-[#fffbfeff] flex flex-col p-4">
      <div className="bg-[#121212] rounded-2xl flex-1 overflow-hidden flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold mb-2">{errorTitle}</h1>
          
          {/* Error Message */}
          <p className="text-gray-400 mb-6">{errorMessage}</p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>

            {showRefresh && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}