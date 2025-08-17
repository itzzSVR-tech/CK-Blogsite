'use client';

import Link from 'next/link';
import { Blog } from '../lib/types';
import { Calendar, User } from 'lucide-react';

interface BlogCardProps {
  blog: Blog;
  showStatus?: boolean;
}

export default function BlogCard({ blog, showStatus = false }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: 'badge badge-draft',
      pending: 'badge badge-pending',
      published: 'badge badge-published',
      rejected: 'badge badge-rejected',
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          <Link 
            href={`/blog/${blog.id}`}
            className="hover:text-primary-600 transition-colors"
          >
            {blog.title}
          </Link>
        </h3>
        {showStatus && (
          <div className="ml-2 flex-shrink-0">
            {getStatusBadge(blog.status)}
          </div>
        )}
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {blog.content.length > 200 
          ? `${blog.content.substring(0, 200)}...` 
          : blog.content
        }
      </p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{blog.author.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {blog.status === 'published' && blog.publishedAt
                ? formatDate(blog.publishedAt)
                : formatDate(blog.createdAt)
              }
            </span>
          </div>
        </div>
        
        <Link 
          href={`/blog/${blog.id}`}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
}
