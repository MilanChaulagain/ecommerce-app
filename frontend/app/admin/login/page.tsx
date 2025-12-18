'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use centralized API client for login
      const response = await apiClient.auth.login(email, password);
      console.log(response.user.role)

      // Role-based access check
      const allowedRoles = ['admin', 'superemployee', 'employee'];
      if (!allowedRoles.includes(response.user.role)) {
        setError('Access denied. Only admin, superemployee, or employee can access the admin dashboard.');
        apiClient.auth.logout();
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        // Ensure tokens are stored in both admin-specific and general keys
        localStorage.setItem('admin_token', response.access);
        localStorage.setItem('access_token', response.access);
        if (response.refresh) localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
      }

      // Debug: Confirm allowed role and navigation
      console.log('Allowed role, navigating to dashboard:', response.user.role);
        localStorage.setItem('admin_user', JSON.stringify(response.user));
        router.push('/admin/dashboard');
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';
      if (error?.data) {
        if (error.data.detail) errorMessage = error.data.detail;
        else if (error.data.error) errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      if (error?.status === 401) {
        setError('Invalid email or password.');
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        setError('Network error: Backend unreachable or CORS issue. Ensure http://localhost:8000 is running and accessible.');
      } else {
        setError(errorMessage);
      }

      // Log error details for debugging
      console.error('Login error details:', error);
      if (error?.response) {
        error.response.text().then((text: string) => {
          console.error('API response:', text);
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Compact Login Card */}
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-bold text-center mb-1  text-purple-900">Admin Portal</h1>
          <p className="text-xs text-gray-500 text-center mb-4">
            Sign in to access the dashboard
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-900" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent  text-purple-900"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-900" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent  text-purple-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span>
                  <svg className="animate-spin inline-block w-4 h-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="w-full text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-4">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}
