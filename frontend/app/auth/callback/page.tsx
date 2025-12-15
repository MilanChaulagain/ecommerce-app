'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we're handling OAuth redirect with auth code
      const code = searchParams.get('code');
      const provider = searchParams.get('provider');
      const state = searchParams.get('state');
      
      // Check if backend already processed and sent tokens
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(searchParams.get('message') || 'Authentication failed. Please try again.');
        
        let openerAvailable = false;
        try { openerAvailable = !!window.opener && !window.opener.closed; } catch (e) { openerAvailable = false; }
        if (openerAvailable) {
          // Use wildcard origin so the message reaches the opener regardless of origin differences
          window.opener.postMessage({ type: 'oauth_error', message: error }, '*');
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => router.push('/'), 3000);
        }
        return;
      }

      // If we have a code, we need to exchange it (with PKCE verifier for TikTok)
      if (code && !accessToken) {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          let callbackUrl = `${API_BASE_URL}/api/users/${provider}/callback/?code=${code}`;
          
          // For TikTok, retrieve and pass code_verifier
          if (provider === 'tiktok') {
            const codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
            if (codeVerifier) {
              callbackUrl += `&code_verifier=${encodeURIComponent(codeVerifier)}`;
              sessionStorage.removeItem('tiktok_code_verifier');
            }
          }
          
          // Redirect to backend callback which will redirect back with tokens
          window.location.href = callbackUrl;
          return;
        } catch (err) {
          console.error('Callback error:', err);
          setStatus('error');
          setMessage('Failed to complete authentication');
          return;
        }
      }

      // Backend sends tokens directly in URL after successful OAuth
      if (accessToken && refreshToken) {
        // Store tokens with keys that match what the app expects
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        localStorage.setItem('admin_token', accessToken); // For admin panel
        
        console.log('✅ OAuth Success - Tokens stored');
        console.log('🔑 Access Token:', accessToken.substring(0, 20) + '...');
        console.log('🔄 Refresh Token:', refreshToken.substring(0, 20) + '...');

        // Fetch and log user data
        try {
          const userData = await apiClient.auth.getCurrentUser();
          const role = userData.role || 'customer';
          // Store user info for all roles
          localStorage.setItem('user', JSON.stringify(userData));
          // Send user details and role to parent window, then close popup
          let openerAvailable = false;
          try { openerAvailable = !!window.opener && !window.opener.closed; } catch (e) { openerAvailable = false; }
          if (openerAvailable) {
            // Use wildcard origin so the message reaches the opener regardless of origin differences
            window.opener.postMessage({
              type: 'oauth_success',
              accessToken: accessToken,
              refreshToken: refreshToken,
              user: userData,
              role: role
            }, '*');
            setStatus('success');
            setMessage(`Login successful! Closing window...`);
            setTimeout(() => {
              window.close();
            }, 500);
          } else {
            // Fallback: show message and redirect as before
            if (role === 'admin') {
              localStorage.setItem('admin_user', JSON.stringify(userData));
              setStatus('success');
              setMessage(`Successfully logged in as Admin (${userData.username})! Redirecting to admin dashboard...`);
              setTimeout(() => {
                window.location.href = '/admin/dashboard';
              }, 500);
            } else if (role === 'superemployee' || role === 'employee') {
              localStorage.setItem('admin_user', JSON.stringify(userData));
              setStatus('success');
              setMessage(`Logged in as ${role}. Redirecting to admin dashboard...`);
              setTimeout(() => {
                window.location.href = '/admin/dashboard';
              }, 500);
            } else {
              setStatus('success');
              setMessage('Logged in as customer. Redirecting to home...');
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            }
          }
        } catch (userError) {
          console.error('⚠️ Failed to fetch user data:', userError);
          // Still send success message with tokens, even if user fetch failed
          let openerAvailable = false;
          try { openerAvailable = !!window.opener && !window.opener.closed; } catch (e) { openerAvailable = false; }
          if (openerAvailable) {
            window.opener.postMessage({
              type: 'oauth_success',
              accessToken: accessToken,
              refreshToken: refreshToken,
              user: null,
              role: 'customer'
            }, '*');
            setStatus('success');
            setMessage(`Login successful! Closing window...`);
            setTimeout(() => {
              window.close();
            }, 500);
          } else {
            setStatus('error');
            setMessage('Login failed. Please try again.');
          }
        }
      } else {
        setStatus('error');
        setMessage('Missing authentication tokens.');
        
        let openerAvailable = false;
        try { openerAvailable = !!window.opener && !window.opener.closed; } catch (e) { openerAvailable = false; }
        if (openerAvailable) {
          window.opener.postMessage({ type: 'oauth_error', message: 'Missing tokens' }, '*');
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => router.push('/'), 3000);
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  // Listen for close requests from the opener
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        if (e?.data?.type === 'close_popup') {
          window.close();
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h2>
            <p className="text-gray-600 mb-4">You can close this window and return to the main page.</p>
            <button 
              onClick={() => window.close()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Close Window
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
