'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();
  const { activateAccount } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await activateAccount(formData.email, formData.password);
      
      if (success) {
        setIsSuccess(true);
        addToast('success', 'Account activated successfully! You can now log in.');
      } else {
        addToast('error', 'Activation failed. Please check your email and try again.');
      }
    } catch (error) {
      addToast('error', 'Activation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Account Activated!
            </h1>
            <p className="text-gray-600 mb-6">
              Your account has been successfully activated. You can now log in to access the platform.
            </p>
          </div>

          <Link href="/login" className="btn-primary w-full">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="card">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Activate Account</h1>
          <p className="text-gray-600">Set your password to activate your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter your password"
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Activating...' : 'Activate Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already activated?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
