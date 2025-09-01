import Link from "next/link";
import { FileText, Calendar, User, ArrowLeft } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
        const response = await fetch('/api/articles', {
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

export default async function BlogPage() {
    const articles = await getArticles();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Home
                            </Link>
                            <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
                        </div>
                        <nav>
                            <ul className="flex space-x-8">
                                <li><Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</Link></li>
                                <li><Link href="/blog" className="text-gray-900 hover:text-indigo-600 transition-colors">Blog</Link></li>
                                <li><Link href="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Admin</Link></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Blog Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">All Articles</h2>
                    <p className="text-lg text-gray-600">Explore all published articles and stories</p>
                </div>

                {articles.length > 0 ? (
                    <div className="space-y-8">
                        {articles.map((article) => (
                            <article key={article.id} className="bg-white rounded-xl shadow-sm border p-8 hover:shadow-lg transition-shadow">
                                <div className="mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        <Link href={`/blog/${article.slug}`} className="hover:text-indigo-600 transition-colors">
                                            {article.title}
                                        </Link>
                                    </h3>
                                    {article.excerpt && (
                                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{article.excerpt}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {article.author_name || 'Anonymous'}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(article.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-4">No articles published yet</h3>
                        <p className="text-gray-600 mb-8">Check back soon for new content!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Home
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center items-center mb-4">
                            <FileText className="h-6 w-6 text-indigo-600 mr-2" />
                            <h3 className="text-lg font-bold text-gray-900">My Blog</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Sharing thoughts and ideas with the world</p>
                        <div className="flex justify-center space-x-6">
                            <Link href="/" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
                            <Link href="/blog" className="text-gray-600 hover:text-indigo-600 transition-colors">Blog</Link>
                            <Link href="/admin/login" className="text-gray-600 hover:text-indigo-600 transition-colors">Admin</Link>
                        </div>
                        <p className="text-gray-500 mt-6">&copy; 2024 My Blog. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
