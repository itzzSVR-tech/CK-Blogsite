'use client';

import { useState, useMemo } from 'react';
import { mockBlogs } from '../lib/mockData';
import BlogCard from '../components/BlogCard';
import { Search, Filter } from 'lucide-react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');

  const publishedBlogs = mockBlogs.filter(blog => blog.status === 'published');

  const filteredBlogs = useMemo(() => {
    return publishedBlogs.filter(blog => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.author.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAuthor =
        !selectedAuthor || blog.author.name === selectedAuthor;

      return matchesSearch && matchesAuthor;
    });
  }, [publishedBlogs, searchTerm, selectedAuthor]);

  // Unique list of authors
  const authors = Array.from(
    new Set(publishedBlogs.map(blog => blog.author.name))
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Simple Club Blog Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover insightful articles written by our club members. Explore topics ranging from technology to business and beyond.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search blogs by title, content, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="input-field pl-10 appearance-none"
          >
            <option value="">All Authors</option>
            {authors.map(author => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredBlogs.length === 0 ? (
          <p>No blogs found matching your criteria.</p>
        ) : (
          <p>Showing {filteredBlogs.length} of {publishedBlogs.length} published blogs</p>
        )}
      </div>

      {/* Blog Grid */}
      {filteredBlogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredBlogs.length === 0 && publishedBlogs.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* No Blogs State */}
      {publishedBlogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No published blogs yet</h3>
          <p className="text-gray-600">Be the first to publish a blog post!</p>
        </div>
      )}
    </div>
  );
}
