'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

type SocialProvider = 'facebook' | 'instagram' | 'tiktok';

interface OAuthConfig {
  clientId: string;
  authUrl: string;
  scope: string;
  requiresPKCE: boolean;
} 

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// OAuth configuration for each provider
const getOAuthConfig = (provider: SocialProvider, backendCallback: string): OAuthConfig | null => {
  switch (provider) {
    case 'facebook':
      const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!fbAppId) return null;
      return {
        clientId: fbAppId,
        authUrl: `https://www.facebook.com/v17.0/dialog/oauth`,
        scope: 'email,public_profile',
        requiresPKCE: false,
      };
    
    case 'instagram':
      const igAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
      if (!igAppId) return null;
      return {
        clientId: igAppId,
        authUrl: `https://api.instagram.com/oauth/authorize`,
        scope: 'user_profile,user_media',
        requiresPKCE: false,
      };
    
    case 'tiktok':
      const ttClientKey = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
      if (!ttClientKey) return null;
      return {
        clientId: ttClientKey,
        authUrl: `https://www.tiktok.com/v2/auth/authorize/`,
        scope: 'user.info.basic',
        requiresPKCE: true,
      };
    
    default:
      return null;
  }
};

// Generate random string for PKCE code_verifier (RFC 7636)
const generateCodeVerifier = (length: number = 43): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map((val) => charset[val % charset.length])
    .join('');
};

// Generate SHA-256 hash for PKCE code_challenge (S256 method)
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url format (RFC 7636)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export default function LoginModal({ isOpen, onClose, buttonRef }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setIsLoading(provider);
      setError(null);

      const backendCallback = `${API_BASE_URL}/api/users/social/${provider}/callback/`;
      const config = getOAuthConfig(provider, backendCallback);

      // Validate OAuth configuration
      if (!config) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        setError(`${providerName} login is not configured. Please contact support.`);
        setIsLoading(null);
        return;
      }

      let finalAuthUrl: string;

      // Handle PKCE for providers that require it (TikTok)
      if (config.requiresPKCE) {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        
        // Store verifier for callback
        sessionStorage.setItem(`${provider}_code_verifier`, codeVerifier);

        const params = new URLSearchParams({
          client_key: config.clientId,
          redirect_uri: backendCallback,
          scope: config.scope,
          response_type: 'code',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
        });

        finalAuthUrl = `${config.authUrl}?${params.toString()}`;
      } else {
        // Standard OAuth 2.0 flow (Facebook, Instagram)
        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: backendCallback,
          scope: config.scope,
          response_type: 'code',
          state: generateCodeVerifier(16), // CSRF protection
        });

        finalAuthUrl = `${config.authUrl}?${params.toString()}`;
      }

      // Open OAuth popup
      const popup = openOAuthPopup(finalAuthUrl, provider);
      
      if (!popup) {
        setError('Failed to open authentication window. Please check your popup blocker.');
        setIsLoading(null);
        return;
      }

      // Monitor popup state
      monitorPopup(popup);

    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      setError(`Failed to initiate ${provider} login. Please try again.`);
      setIsLoading(null);
    }
  };

  // Open OAuth popup with optimal settings
  const openOAuthPopup = (url: string, provider: string): Window | null => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'toolbar=0',
      'scrollbars=1',
      'status=1',
      'resizable=1',
      'location=1',
      'menubar=0',
    ].join(',');

    return window.open(url, `${provider}_oauth`, features);
  };

  // Monitor popup closure and handle callbacks
  const monitorPopup = (popup: Window) => {
    const checkInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkInterval);
        setIsLoading(null);
        
        // Check if authentication was successful by checking localStorage
        const token = localStorage.getItem('admin_token');
        if (token) {
          onClose();
          window.location.reload();
        }
      }
    }, 500);

    // Cleanup after 5 minutes (timeout)
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!popup.closed) {
        popup.close();
        setIsLoading(null);
        setError('Authentication timeout. Please try again.');
      }
    }, 300000);
  };

  return (
    <>
      {/* Dropdown Modal - appears below button */}
      <div className="fixed top-14 right-4 md:right-8 z-50 w-72">
        <div 
          ref={modalRef}
          className="bg-white rounded-lg shadow-2xl border border-gray-200 animate-fade-in-down"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Login
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-3 mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="p-3 space-y-2">
            {/* Facebook Login */}
            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#1877F2] hover:bg-[#1664D8] text-white rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === 'facebook' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              <span>{isLoading === 'facebook' ? 'Connecting...' : 'Facebook'}</span>
            </button>

            {/* Instagram Login */}
            <button
              onClick={() => handleSocialLogin('instagram')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-linear-to-r from-[#833AB4] via-[#E1306C] to-[#F56040] hover:opacity-90 text-white rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === 'instagram' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              )}
              <span>{isLoading === 'instagram' ? 'Connecting...' : 'Instagram'}</span>
            </button>

            {/* TikTok Login */}
            <button
              onClick={() => handleSocialLogin('tiktok')}
              disabled={isLoading !== null}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-black hover:bg-gray-800 text-white rounded font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === 'tiktok' ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              )}
              <span>{isLoading === 'tiktok' ? 'Connecting...' : 'TikTok'}</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">
              By continuing, you agree to our <a href="/terms" className="text-blue-500 hover:underline">Terms</a> and <a href="/privacy" className="text-blue-500 hover:underline">Privacy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
