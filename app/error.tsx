
'use client';

import { useEffect } from 'react';
import { logger } from '../lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Global error boundary caught error', error, {
      digest: error.digest,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <div className="mt-4 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}
          
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-100 text-gray-900 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
