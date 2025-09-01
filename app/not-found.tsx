
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white rounded-md px-6 py-3 font-medium hover:bg-blue-700 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/blog"
            className="block w-full bg-gray-100 text-gray-900 rounded-md px-6 py-3 font-medium hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
