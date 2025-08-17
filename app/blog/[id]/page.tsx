'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { mockBlogs } from "../../../lib/mockData";
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react';

interface BlogPageProps {
  params: {
    id: string;
  };
}

export default function BlogPage({ params }: BlogPageProps) {
  const blog = mockBlogs.find(b => b.id === params.id);

  if (!blog || blog.status !== 'published') {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blogs
      </Link>

      {/* Blog Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 mb-6">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{blog.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                {blog.publishedAt 
                  ? formatDate(blog.publishedAt)
                  : formatDate(blog.createdAt)
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="card">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {blog.content}
          </div>
        </div>
      </div>

      {/* Reference Links */}
      {blog.referenceLinks && blog.referenceLinks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reference Links</h3>
          <div className="space-y-2">
            {blog.referenceLinks.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="truncate">{link}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Author Info */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{blog.author.name}</p>
            <p className="text-sm text-gray-600">{blog.author.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
