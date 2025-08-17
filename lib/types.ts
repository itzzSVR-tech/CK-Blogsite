export type UserRole = 'unverified' | 'verified' | 'admin';

export type BlogStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  year: string;
  domain: string;
  registrationNumber: string;
  referenceCode: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  status: BlogStatus;
  referenceLinks: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  rejectionReason?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
