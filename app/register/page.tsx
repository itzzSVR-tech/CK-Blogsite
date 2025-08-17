'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { years, domains } from '../../lib/mockData';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    domain: '',
    registrationNumber: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const code = await register({
        ...formData,
        referenceCode: '',
      });
      console.log('Backend response:', code); // Debug backend response
      setReferenceCode(code);
      setIsSuccess(true);
      addToast('success', 'Registration successful! Please check your email for activation instructions.');
    } catch (error) {
      console.error(error); // Debug error
      addToast('error', 'Registration failed. Please try again.');
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
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Please check your email for activation instructions.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Reference Code</h3>
            <p className="text-2xl font-bold text-primary-600 font-mono">
              {referenceCode}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Keep this code safe. You'll need it for account activation.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/login" className="btn-primary w-full">
              Go to Login
            </Link>
            <button
              onClick={() => {
                setIsSuccess(false);
                setFormData({
                  name: '',
                  year: '',
                  domain: '',
                  registrationNumber: '',
                  email: '',
                });
              }}
              className="btn-secondary w-full"
            >
              Register Another Account
            </button>
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600">Join our club blog platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              className="input-field"
            >
              <option value="">Select year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>
            <select
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              required
              className="input-field"
            >
              <option value="">Select domain</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter your registration number"
            />
          </div>

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

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
