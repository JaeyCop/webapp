import Link from "next/link";
import { FileText, Calendar, User, ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author_name?: string;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/articles`, {
      cache: 'no-store'
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
  return [];
}

export default async function Home() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">My Blog</h1>
            </div>
            <nav>
              <ul className="flex space-x-8">
                <li><Link href="/" className="text-gray-900 hover:text-indigo-600 transition-colors">Home</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</Link></li>
                <li><Link href="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Admin</Link></li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Welcome to My Blog</h2>
          <p className="text-xl md:text-2xl mb-8 text-indigo-100">Thoughts, ideas, and stories worth sharing</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-lg text-indigo-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Read Articles
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Latest Articles</h3>
            <p className="text-lg text-gray-600">Discover the most recent stories and insights</p>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.slice(0, 6).map((article) => (
                <article key={article.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      <Link href={`/blog/${article.slug}`} className="hover:text-indigo-600 transition-colors">
                        {article.title}
                      </Link>
                    </h4>
                    {article.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600">Check back soon for new content!</p>
            </div>
          )}

          {articles.length > 6 && (
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
              >
                View All Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <FileText className="h-8 w-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">My Blog</h3>
            </div>
            <p className="text-gray-600 mb-4">Sharing thoughts and ideas with the world</p>
            <div className="flex justify-center space-x-6">
              <Link href="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</Link>
              <Link href="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Admin</Link>
            </div>
            <p className="text-gray-500 mt-8">&copy; 2024 My Blog. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
