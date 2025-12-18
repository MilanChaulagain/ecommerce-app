'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import Image from 'next/image';
import { Search, ShoppingCart, Menu, X, User, Bell, TrendingUp, Globe } from 'lucide-react';
import LoginModal from './LoginModal';
import ProfileModal from './ProfileModal';
import LanguageModal from './LanguageModal';
import { useTheme, createGradient } from '@/hooks/useTheme';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const languageBtnRef = useRef<HTMLButtonElement>(null);
    // Close language modal on outside click or Escape
    useEffect(() => {
      if (!showLanguageModal) return;
      function handleClick(e: MouseEvent) {
        if (
          languageBtnRef.current &&
          !languageBtnRef.current.contains(e.target as Node)
        ) {
          const dropdown = document.getElementById('language-dropdown');
          if (dropdown && !dropdown.contains(e.target as Node)) {
            setShowLanguageModal(false);
          }
        }
      }
      function handleEsc(e: KeyboardEvent) {
        if (e.key === 'Escape') setShowLanguageModal(false);
      }
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.removeEventListener('mousedown', handleClick);
        document.removeEventListener('keydown', handleEsc);
      };
    }, [showLanguageModal]);
  const [language, setLanguage] = useState('en');
  const loginModalRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const router = useRouter();

  // Check login status on mount and listen for login events
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('admin_token');
      const cachedUserName = localStorage.getItem('admin_username');
      if (token) {
        setIsLoggedIn(true);
        if (cachedUserName) {
          setUserName(cachedUserName);
          // Try to read stored user to determine admin role without extra network request
          const storedUser = apiClient.auth.getUser?.();
          if (storedUser && storedUser.role) {
            setIsAdmin(storedUser.role === 'admin' || storedUser.role === 'superemployee');
          }
        } else {
          // Fetch user data only if not cached
          apiClient.auth.getCurrentUser().then(user => {
            setUserName(user.username);
            localStorage.setItem('admin_username', user.username);
            setIsAdmin(user.role === 'admin' || user.role === 'superemployee');
          }).catch(() => {
            // If token is invalid, clear it
            localStorage.removeItem('admin_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('admin_username');
            setIsLoggedIn(false);
            setUserName('');
            setIsAdmin(false);
          });
        }
      } else {
        setIsLoggedIn(false);
        setUserName('');
        localStorage.removeItem('admin_username');
        setIsAdmin(false);
      }
    };

    checkLoginStatus();

    // read language from localStorage
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
    if (storedLang) {
      startTransition(() => setLanguage(storedLang));
    }

    // Listen for login event (from popup)
    const handleUserLoggedIn = () => {
      setIsLoggedIn(true);
      apiClient.auth.getCurrentUser().then(user => {
        setUserName(user.username);
        localStorage.setItem('admin_username', user.username);
        setIsAdmin(user.role === 'admin' || user.role === 'superemployee');
        console.log(`Welcome, ${user.username}! 🎉`);
      }).catch(err => {
        console.error('Failed to fetch user:', err);
      });
    };

    // Listen for storage event (from new tab)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin_token' && event.newValue) {
        // Token was set in another tab (OAuth login)
        handleUserLoggedIn();
      }
      if (event.key === 'admin_token' && event.newValue === null) {
        // Token was removed (logout in another tab)
        setIsLoggedIn(false);
        setUserName('');
        localStorage.removeItem('admin_username');
      }
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    window.addEventListener('storage', handleStorage);
    const handleLangChange = () => {
      const l = localStorage.getItem('lang');
      if (l) setLanguage(l);
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_username');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
    setShowUserMenu(false);
    setShowProfileModal(false);
    // No full page reload
  };

  const navbarStyle = {
    position: theme.components.navbar.sticky ? ('sticky' as const) : ('relative' as const),
    top: 0,
    backgroundColor: theme.components.navbar.backgroundColor,
    borderBottom: `1px solid ${theme.components.navbar.borderColor}`,
    boxShadow: theme.components.navbar.shadow,
    zIndex: theme.components.navbar.zIndex,
  };



  return (
    <nav
      style={{
        ...navbarStyle,
        background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)',
        backgroundSize: '200% 200%',
        transition: 'background-position 0.8s ease, box-shadow 0.3s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundPosition = 'right center') }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundPosition = 'left center') }
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between w-full max-w-7xl mx-auto px-4" style={{ height: theme.components.navbar.height.desktop }}>


        <div className="flex items-center" style={{ gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/') }>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}>
              <Image src="/logo.png" alt="Logo" width={50} height={50} style={{ borderRadius: '50%' }} loading="eager" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.5px',
              }}>
                {theme.brand.name}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
              }}>
                Kids Store
              </span>
            </div>
          </div>

        {/* Search Bar (narrower) */}
        <div className="flex-1" style={{ maxWidth: '28rem', marginLeft: theme.spacing.lg, marginRight: theme.spacing.lg }}>
          <div style={{ position: 'relative' }}>
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2" 
              style={{ 
                width: theme.components.navbar.searchBar.iconSize,
                height: theme.components.navbar.searchBar.iconSize,
                color: '#C2185B'
              }}
            />
            <input
              type="text"
              placeholder={theme.components.navbar.searchBar.placeholder}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '0.75rem',
                paddingTop: theme.components.navbar.searchBar.paddingY,
                paddingBottom: theme.components.navbar.searchBar.paddingY,
                borderWidth: '0',
                borderRadius: theme.components.navbar.searchBar.borderRadius,
                fontSize: theme.components.navbar.searchBar.fontSize,
                outline: 'none',
                transition: 'box-shadow 0.18s ease, transform 0.12s',
                backgroundColor: 'white',
                color: theme.colors.neutral[900],
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
              }}
              onFocus={() => router.push('/search')}
              readOnly
            />
          </div>
        </div>

        {/* Quick Links (desktop, pinkish UI) */}
        <div className="hidden lg:flex items-center" style={{ gap: theme.spacing.sm }}>
          <button
            onClick={() => router.push('/categories')}
            className="text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-150 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 80%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(255, 107, 138, 0.15)',
              marginRight: theme.spacing.xs,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Categories
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-150 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(255, 107, 138, 0.15)',
              marginRight: theme.spacing.xs,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Cart
          </button>
          <button
            onClick={() => router.push('/flash-sales')}
            className="text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-150 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(255, 107, 138, 0.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Flash Sales
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center" style={{ gap: theme.spacing.md }}>
          {/* Dashboard (admin only) */}
          {isLoggedIn && isAdmin && (
            <button
              onClick={() => router.push('/admin/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                paddingLeft: theme.components.navbar.buttons.login.paddingX,
                paddingRight: theme.components.navbar.buttons.login.paddingX,
                paddingTop: theme.components.navbar.buttons.login.paddingY,
                paddingBottom: theme.components.navbar.buttons.login.paddingY,
                borderRadius: '9999px',
                fontSize: theme.components.navbar.buttons.login.fontSize,
                background: 'linear-gradient(90deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95))',
                color: '#C2185B',
                cursor: 'pointer',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                boxShadow: '0 6px 20px rgba(194,24,91,0.08)',
                border: '1px solid rgba(194,24,91,0.08)'
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px) scale(1.02)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 40px rgba(194,24,91,0.14)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0) scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(194,24,91,0.08)'; }}
            >
              <TrendingUp style={{ width: '16px', height: '16px', color: '#C2185B' }} />
              <span style={{ fontWeight: 600 }}>Dashboard</span>
              <span style={{ marginLeft: theme.spacing.xs, background: '#FFF0F4', color: '#C2185B', padding: '2px 6px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>Admin</span>
            </button>
          )}
          {/* Login Button / User Profile */}
          <div style={{ 
            position: 'relative' ,
            }} ref={loginModalRef}>
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={() => setShowLoginModal(!showLoginModal)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    paddingLeft: theme.components.navbar.buttons.login.paddingX,
                    paddingRight: theme.components.navbar.buttons.login.paddingX,
                    paddingTop: theme.components.navbar.buttons.login.paddingY,
                    paddingBottom: theme.components.navbar.buttons.login.paddingY,
                    border: 'none',
                    borderRadius: theme.components.navbar.buttons.login.borderRadius,
                    fontSize: theme.components.navbar.buttons.login.fontSize,
                    background: createGradient(
                      theme.components.navbar.buttons.login.gradientFrom,
                      theme.components.navbar.buttons.login.gradientTo
                    ),
                    color: theme.components.navbar.buttons.login.textColor,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <User style={{ 
                    width: theme.components.navbar.buttons.iconSize, 
                    height: theme.components.navbar.buttons.iconSize,
                    color: theme.components.navbar.buttons.login.textColor,
                  }} 
                  />
                  <span>Login</span>
                </button>
                {showLoginModal && (
                  <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
                )}
              </>
            ) : (
              <div ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                    paddingLeft: theme.spacing.md,
                    paddingRight: theme.spacing.md,
                    paddingTop: theme.spacing.sm,
                    paddingBottom: theme.spacing.sm,
                    border: `1px solid ${theme.colors.neutral[300]}`,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: 'pink',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.userbtn;
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'pink';
                    e.currentTarget.style.borderColor = theme.colors.neutral[300];
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: theme.borderRadius.full,
                    background: createGradient(
                      theme.components.navbar.buttons.login.gradientFrom,
                      theme.components.navbar.buttons.login.gradientTo
                    ),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ 
                    fontSize: '14px',
                    fontWeight: '500',
                    color: theme.colors.neutral[700],
                  }}>
                    {userName}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: theme.spacing.xs,
                    width: '200px',
                    backgroundColor: 'white',
                    borderRadius: theme.borderRadius.lg,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: `1px solid ${theme.colors.neutral[200]}`,
                    overflow: 'hidden',
                    zIndex: 50,
                  }}>
                    <div style={{
                      padding: theme.spacing.md,
                      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                    }}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: theme.colors.neutral[900],
                      }}>
                        {userName}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: theme.colors.neutral[500],
                        marginTop: '2px',
                      }}>
                        Welcome back!
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { router.push('/admin/dashboard'); setShowUserMenu(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          padding: theme.spacing.md,
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#C2185B',
                          transition: 'background-color 0.12s, transform 0.12s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF5F7'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; }}
                      >
                        <TrendingUp style={{ width: '16px', height: '16px', color: '#C2185B' }} />
                        <span style={{ marginLeft: theme.spacing.xs, fontWeight: 600, color: theme.colors.neutral[900] }}>Dashboard</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => { router.push('/admin/groups'); setShowUserMenu(false); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          padding: theme.spacing.md,
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: theme.colors.neutral[700],
                          transition: 'background-color 0.12s, transform 0.12s',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; }}
                      >
                        <svg style={{ width: 16, height: 16, color: theme.colors.neutral[700] }} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M3 11h18M5 21h14a2 2 0 0 0 2-2V11H3v8a2 2 0 0 0 2 2z" /></svg>
                        <span style={{ marginLeft: theme.spacing.xs, fontWeight: 600, color: theme.colors.neutral[900] }}>Groups</span>
                      </button>
                    )}
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/account'); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        padding: theme.spacing.md,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: theme.colors.neutral[700],
                        transition: 'background-color 0.12s, transform 0.12s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF5F7'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(4px)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; }}
                    >
                      <User style={{ width: '16px', height: '16px' }} />
                      <span style={{ marginLeft: theme.spacing.xs, fontWeight: 600, color: theme.colors.neutral[900] }}>My Home</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        padding: theme.spacing.md,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: theme.colors.neutral[700],
                        transition: 'background-color 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.neutral[50]}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User style={{ width: '16px', height: '16px' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button 
            style={{
              position: 'relative',
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.userbtn}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ShoppingCart style={{ 
              width: theme.components.navbar.buttons.iconSize, 
              height: theme.components.navbar.buttons.iconSize,
              color: 'white',
            }} />
            <span 
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                backgroundColor: theme.colors.error,
                color: 'white',
                fontSize: '0.75rem',
                width: '1rem',
                height: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                border: `1px solid ${theme.colors.error}`,
                fontWeight: 700,
              }}
            >
              0
            </span>
          </button>
          <div style={{ position: 'relative' }}>
            <button
              ref={languageBtnRef}
              onClick={() => setShowLanguageModal((v) => !v)}
              className="text-sm text-white hover:text-white flex items-center gap-2"
              aria-haspopup="true"
              aria-expanded={showLanguageModal}
            >
              <Globe className="w-4 h-4 text-white" /> {language === 'ne' ? 'ने' : 'EN'}
            </button>
            {showLanguageModal && (
              <div id="language-dropdown" style={{ position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', zIndex: 100 }}>
                <LanguageModal isOpen={true} onClose={() => setShowLanguageModal(false)} current={language} onChange={(l) => setLanguage(l)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden w-full" style={{
        background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)',
        paddingBottom: '1rem',
      }}>
        {/* Top Row - Logo, Notification, Cart, Login */}
          <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Brand */}
          <div className="flex items-center" style={{ gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/') }>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}>
              <Image src="/logo.png" alt="Logo" width={50} height={50} style={{ borderRadius: '50%' }} loading="eager" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-0.5px',
              }}>
                {theme.brand.name}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
              }}>
                Kids Store
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center" style={{ gap: '12px' }}>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer' }}
            >
              {showMobileMenu ? <X style={{ width: 18, height: 18, color: 'white' }} /> : <Menu style={{ width: 18, height: 18, color: 'white' }} />}
            </button>
            {/* Notification Bell */}
            <button 
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={()=> router.push('/notifications')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <Bell style={{ width: '20px', height: '20px', color: 'white', strokeWidth: 2 }} />
            </button>

            {/* Cart Button */}
            {/* <button 
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            >
              <ShoppingCart style={{ width: '20px', height: '20px', color: 'white', strokeWidth: 2 }} />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#1a1a1a',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid #FF6B8A',
              }}>
                2
              </span>
            </button> */}

            {/* Login Button */}
            {!isLoggedIn ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  backgroundColor: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <User style={{ width: '16px', height: '16px', color: '#FF6B8A', strokeWidth: 2.5 }} />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#FF6B8A',
                }}>Login</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowProfileModal(true)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B8A 0%, #FF8FA3 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '11px',
                  }}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#FF6B8A',
                    maxWidth: '50px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {userName}
                  </span>
                </button>
                {/* ProfileModal will be rendered below search bar for mobile */}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4" style={{ position: 'relative' }}>
          <div style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '20px',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              width: '16px',
              height: '16px',
              color: '#9CA3AF',
              strokeWidth: 2,
            }} />
            <input
              type="text"
              placeholder="Search products, brands, stores..."
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '64px',
                paddingTop: '8px',
                paddingBottom: '8px',
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                color: '#1F2937',
                backgroundColor: 'transparent',
              }}
              onFocus={() => router.push('/search')}
              readOnly
            />
            <button style={{
              position: 'absolute',
              right: '6px',
              padding: '6px 12px',
              backgroundColor: '#FF6B8A',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '0.825rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF5577'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B8A'}
            >
              Search
            </button>
          </div>
          {/* ProfileModal below search bar in mobile view */}
          {showProfileModal && (
            <div className="md:hidden" style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', zIndex: 50, display: 'flex', justifyContent: 'center' }}>
              <ProfileModal isOpen={true} onClose={() => setShowProfileModal(false)} userName={userName} onLogout={handleLogout} isAdmin={isAdmin} onDashboard={() => { setShowProfileModal(false); router.push('/admin/dashboard'); }} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - Reserved for future navigation items */}
      {showMobileMenu && (
        <div 
          className="md:hidden border-t"
          style={{ 
            borderColor: theme.colors.neutral[200],
            backgroundColor: 'white',
          }}
        >
          <div 
            className="px-4 py-3"
            style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}
          >
            <button onClick={() => { router.push('/categories'); setShowMobileMenu(false); }} className="text-left py-2 text-gray-700 hover:text-blue-600">Categories</button>
            <button onClick={() => { router.push('/cart'); setShowMobileMenu(false); }} className="text-left py-2 text-gray-700 hover:text-blue-600">Cart</button>
            <button onClick={() => { router.push('/flash-sales'); setShowMobileMenu(false); }} className="text-left py-2 text-gray-700 hover:text-blue-600">Flash Sales</button>
            <button onClick={() => { router.push('/promotions'); setShowMobileMenu(false); }} className="text-left py-2 text-gray-700 hover:text-blue-600">Promotions</button>
            <button onClick={() => { setShowLanguageModal(true); setShowMobileMenu(false); }} className="text-left py-2 text-gray-700 hover:text-blue-600">Change Language</button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      )}
      {/* LanguageModal is now rendered as a dropdown above */}
    </nav>
  );
}
