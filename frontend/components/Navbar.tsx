'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, User, Facebook, Instagram, Music } from 'lucide-react';
import LoginModal from './LoginModal';
import { useTheme, createGradient } from '@/hooks/useTheme';

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Close login modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginModalRef.current && !loginModalRef.current.contains(event.target as Node)) {
        setShowLoginModal(false);
      }
    };

    if (showLoginModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoginModal]);

  const navbarStyle = {
    position: theme.components.navbar.sticky ? ('sticky' as const) : ('relative' as const),
    top: 0,
    backgroundColor: theme.components.navbar.backgroundColor,
    borderBottom: `1px solid ${theme.components.navbar.borderColor}`,
    boxShadow: theme.components.navbar.shadow,
    zIndex: theme.components.navbar.zIndex,
  };

  const logoStyle = {
    width: theme.components.navbar.logo.width,
    height: theme.components.navbar.logo.height,
    borderRadius: theme.components.navbar.logo.borderRadius,
    background: createGradient(
      theme.components.navbar.logo.gradientFrom,
      theme.components.navbar.logo.gradientTo
    ),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <nav style={navbarStyle}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between w-full max-w-7xl mx-auto px-4" style={{ height: theme.components.navbar.height.desktop }}>
        {/* Logo and Brand */}
        <div className="flex items-center" style={{ gap: theme.spacing.sm }}>
          <div style={logoStyle}>
            <span 
              style={{
                color: theme.components.navbar.logo.textColor,
                fontSize: theme.components.navbar.logo.fontSize,
                fontWeight: theme.components.navbar.logo.fontWeight as 'bold',
              }}
            >
              {theme.brand.name.charAt(0)}
            </span>
          </div>
          <span 
            style={{
              fontSize: theme.components.navbar.logo.fontSize,
              fontWeight: theme.components.navbar.logo.fontWeight as 'bold',
              background: createGradient(
                theme.components.navbar.logo.gradientFrom,
                theme.components.navbar.logo.gradientTo
              ),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {theme.brand.name}
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1" style={{ maxWidth: theme.components.navbar.searchBar.maxWidth, marginLeft: theme.spacing.lg, marginRight: theme.spacing.lg }}>
          <div style={{ position: 'relative' }}>
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
              style={{ 
                width: theme.components.navbar.searchBar.iconSize,
                height: theme.components.navbar.searchBar.iconSize,
              }}
            />
            <input
              type="text"
              placeholder={theme.components.navbar.searchBar.placeholder}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: theme.components.navbar.searchBar.paddingY,
                paddingBottom: theme.components.navbar.searchBar.paddingY,
                borderWidth: '1px',
                borderColor: theme.components.navbar.searchBar.borderColor,
                borderRadius: theme.components.navbar.searchBar.borderRadius,
                fontSize: theme.components.navbar.searchBar.fontSize,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.components.navbar.searchBar.focusBorderColor}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.components.navbar.searchBar.borderColor}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center" style={{ gap: theme.spacing.md }}>
          {/* Login Button */}
          <div style={{ position: 'relative' }} ref={loginModalRef}>
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
              }} />
              <span>Login</span>
            </button>
            {showLoginModal && (
              <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <ShoppingCart style={{ 
              width: theme.components.navbar.buttons.iconSize, 
              height: theme.components.navbar.buttons.iconSize,
              color: theme.colors.neutral[700],
            }} />
            <span 
              style={{
                position: 'absolute',
                top: '-0.25rem',
                right: '-0.25rem',
                backgroundColor: theme.colors.primary,
                color: 'white',
                fontSize: '0.75rem',
                width: '1rem',
                height: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
              }}
            >
              0
            </span>
          </button>

          {/* Social Icons */}
          <div 
            className="flex items-center border-l" 
            style={{ 
              gap: theme.spacing.sm, 
              borderColor: theme.colors.neutral[200],
              paddingLeft: theme.spacing.md,
            }}
          >
            <a 
              href="#" 
              style={{ 
                color: theme.colors.neutral[600],
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.social.facebook}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
            >
              <Facebook style={{ 
                width: theme.components.navbar.buttons.iconSize, 
                height: theme.components.navbar.buttons.iconSize 
              }} />
            </a>
            <a 
              href="#" 
              style={{ 
                color: theme.colors.neutral[600],
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.social.instagram}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
            >
              <Instagram style={{ 
                width: theme.components.navbar.buttons.iconSize, 
                height: theme.components.navbar.buttons.iconSize 
              }} />
            </a>
            <a 
              href="#" 
              style={{ 
                color: theme.colors.neutral[600],
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.neutral[900]}
              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
            >
              <Music style={{ 
                width: theme.components.navbar.buttons.iconSize, 
                height: theme.components.navbar.buttons.iconSize 
              }} />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between w-full px-4" style={{ height: theme.components.navbar.height.mobile }}>
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {showMobileMenu ? (
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          ) : (
            <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
          )}
        </button>

        <div className="flex items-center" style={{ gap: theme.spacing.sm }}>
          <div style={logoStyle}>
            <span 
              className="font-bold text-white text-sm"
              style={{
                color: theme.components.navbar.logo.textColor,
                fontSize: '0.875rem',
                fontWeight: theme.components.navbar.logo.fontWeight as 'bold',
              }}
            >
              {theme.brand.name.charAt(0)}
            </span>
          </div>
          <span 
            className="text-base font-bold"
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.components.navbar.logo.fontWeight as 'bold',
              background: createGradient(
                theme.components.navbar.logo.gradientFrom,
                theme.components.navbar.logo.gradientTo
              ),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {theme.brand.name}
          </span>
        </div>

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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ShoppingCart style={{ width: '1.25rem', height: '1.25rem', color: theme.colors.neutral[700] }} />
          <span 
            style={{
              position: 'absolute',
              top: '-0.25rem',
              right: '-0.25rem',
              backgroundColor: theme.colors.primary,
              color: 'white',
              fontSize: '0.75rem',
              width: '1rem',
              height: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.borderRadius.full,
            }}
          >
            0
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div 
          className="md:hidden border-t"
          style={{ borderColor: theme.colors.neutral[200] }}
        >
          <div 
            className="px-4 py-3"
            style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}
          >
            <div style={{ position: 'relative' }}>
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                style={{ 
                  width: theme.components.navbar.searchBar.iconSize,
                  height: theme.components.navbar.searchBar.iconSize,
                }}
              />
              <input
                type="text"
                placeholder={theme.components.navbar.searchBar.placeholder}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  paddingTop: theme.spacing.sm,
                  paddingBottom: theme.spacing.sm,
                  borderWidth: '1px',
                  borderColor: theme.components.navbar.searchBar.borderColor,
                  borderRadius: theme.components.navbar.searchBar.borderRadius,
                  fontSize: theme.components.navbar.searchBar.fontSize,
                  outline: 'none',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = theme.components.navbar.searchBar.focusBorderColor}
                onBlur={(e) => e.currentTarget.style.borderColor = theme.components.navbar.searchBar.borderColor}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowLoginModal(!showLoginModal)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: theme.spacing.sm,
                  paddingLeft: theme.spacing.md,
                  paddingRight: theme.spacing.md,
                  paddingTop: theme.spacing.sm,
                  paddingBottom: theme.spacing.sm,
                  borderWidth: '1px',
                  borderColor: theme.components.navbar.buttons.login.borderColor,
                  borderRadius: theme.components.navbar.buttons.login.borderRadius,
                  fontSize: theme.components.navbar.buttons.login.fontSize,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <User style={{ 
                  width: theme.components.navbar.buttons.iconSize,
                  height: theme.components.navbar.buttons.iconSize,
                }} />
                <span>Login</span>
              </button>
              {showLoginModal && (
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
              )}
            </div>

            <div 
              className="flex items-center justify-center pt-2"
              style={{ gap: theme.spacing.md }}
            >
              <a 
                href="#"
                style={{ 
                  color: theme.colors.neutral[600],
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.social.facebook}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
              >
                <Facebook style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
              <a 
                href="#"
                style={{ 
                  color: theme.colors.neutral[600],
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.social.instagram}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
              >
                <Instagram style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
              <a 
                href="#"
                style={{ 
                  color: theme.colors.neutral[600],
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.neutral[900]}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.neutral[600]}
              >
                <Music style={{ width: '1.25rem', height: '1.25rem' }} />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
