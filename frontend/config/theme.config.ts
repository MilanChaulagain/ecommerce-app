/**
 * Theme Configuration
 * 
 * This file contains all customizable settings for the eCommerce application.
 * Modify values here to change the appearance and behavior of the entire app.
 */

export const themeConfig = {
  // ==================== Brand Identity ====================
  brand: {
    name: "Heramba",
    tagline: "Shop the Latest Trends",
    logo: "/logo.png",
    favicon: "/favicon.ico",
  },

  // ==================== Color Palette ====================
  colors: {
    // Primary brand colors
    primary: "#2563eb",      // Blue
    secondary: "#9333ea",    // Purple
    accent: "#f59e0b",       // Amber
    
    // Status colors
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    
    // Neutral colors
    background: "#ffffff",
    foreground: "#171717",
    muted: "#f3f4f6",
    border: "#e5e7eb",
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
    
    // Text colors
    textPrimary: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    textInverse: "#ffffff",
    
    // Social media brand colors
    social: {
      facebook: "#1877F2",
      instagram: "#E1306C",
      tiktok: "#000000",
    },
    facebook: "#1877F2",
    instagram: "#E1306C",
    tiktok: "#000000",
  },

  // ==================== Typography ====================
  typography: {
    fontFamily: {
      sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "Poppins, sans-serif",
      mono: "Monaco, Consolas, monospace",
    },
    fontSize: {
      xs: "0.75rem",     // 12px
      sm: "0.875rem",    // 14px
      base: "1rem",      // 16px
      lg: "1.125rem",    // 18px
      xl: "1.25rem",     // 20px
      "2xl": "1.5rem",   // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
      "5xl": "3rem",     // 48px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // ==================== Spacing & Layout ====================
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    "2xl": "3rem",    // 48px
    "3xl": "4rem",    // 64px
    container: {
      maxWidth: "1280px",
      paddingX: {
        mobile: "1rem",
        desktop: "1.5rem",
      },
    },
    section: {
      paddingY: {
        mobile: "2rem",
        desktop: "4rem",
      },
    },
  },

  // ==================== Border Radius ====================
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  // ==================== Shadows ====================
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.15)",
  },

  // ==================== Component Configurations ====================
  components: {
    // Navbar Configuration
    navbar: {
      height: {
        mobile: "3rem",      // 48px
        desktop: "3.5rem",   // 56px
      },
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      sticky: true,
      zIndex: 50,
      
      logo: {
        width: "2rem",
        height: "2rem",
        borderRadius: "0.5rem",
        gradientFrom: "#2563eb",
        gradientTo: "#9333ea",
        textColor: "#ffffff",
        fontSize: "0.875rem",
        fontWeight: "700",
      },
      
      searchBar: {
        maxWidth: "40rem",
        placeholder: "Search for products...",
        borderRadius: "9999px",
        borderWidth: "1px",
        borderColor: "#d1d5db",
        focusBorderColor: "#2563eb",
        paddingY: "0.375rem",
        paddingX: "0.75rem",
        fontSize: "0.875rem",
        iconSize: "1rem",
        color: "white",
      },
      
      buttons: {
        iconSize: "1rem",
        login: {
          paddingX: "0.75rem",
          paddingY: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          borderRadius: "9999px",
          borderColor: "#e5e7eb",
          gradientFrom: "#2563eb",
          gradientTo: "#9333ea",
          textColor: "#ffffff",
          iconSize: "0.875rem",
        },
        cart: {
          iconSize: "1.25rem",
          iconColor: "#374151",
          badgeSize: "1rem",
          badgeColor: "#ef4444",
          badgeTextColor: "#ffffff",
          badgeFontSize: "0.75rem",
          padding: "0.375rem",
        },
        socialIcon: {
          size: "1rem",
          padding: "0.375rem",
          borderRadius: "9999px",
        },
        mobile: {
          iconSize: "1.25rem",
          padding: "0.375rem",
        },
      },
    },

    // Hero Section Configuration
    hero: {
      height: {
        mobile: "28rem",
        desktop: "36rem",
      },
      backgroundGradient: {
        from: "#667eea",
        to: "#764ba2",
        direction: "135deg",
      },
      textColor: "#ffffff",
      
      heading: {
        fontSize: {
          mobile: "2rem",
          desktop: "3rem",
        },
        fontWeight: "700",
        lineHeight: "1.2",
      },
      
      subheading: {
        fontSize: {
          mobile: "1rem",
          desktop: "1.25rem",
        },
        fontWeight: "400",
        lineHeight: "1.5",
        marginTop: "1rem",
      },
      
      button: {
        paddingX: "2rem",
        paddingY: "0.75rem",
        fontSize: "1rem",
        fontWeight: "600",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        textColor: "#2563eb",
        hoverScale: "1.05",
        marginTop: "2rem",
      },
      
      image: {
        width: "100%",
        maxWidth: "32rem",
        borderRadius: "1rem",
      },
    },

    // Category Card Configuration
    categoryCard: {
      borderRadius: "1rem",
      aspectRatio: "4/3",
      shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
      
      overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        hoverBackgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      
      title: {
        fontSize: {
          mobile: "1.25rem",
          desktop: "1.5rem",
        },
        fontWeight: "700",
        color: "#ffffff",
      },
    },

    // Product Card Configuration
    productCard: {
      borderRadius: "0.75rem",
      shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
      backgroundColor: "#ffffff",
      padding: "1rem",
      
      image: {
        aspectRatio: "1/1",
        borderRadius: "0.75rem",
        backgroundColor: "#f3f4f6",
      },
      
      title: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#111827",
        lineHeight: "1.5",
        marginTop: "0.75rem",
      },
      
      price: {
        fontSize: "1.125rem",
        fontWeight: "700",
        color: "#2563eb",
        marginTop: "0.5rem",
      },
      
      button: {
        paddingX: "1rem",
        paddingY: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        borderRadius: "0.5rem",
        backgroundColor: "#2563eb",
        hoverBackgroundColor: "#1d4ed8",
        textColor: "#ffffff",
        marginTop: "0.75rem",
      },
    },

    // Footer Configuration
    footer: {
      backgroundColor: "#111827",
      textColor: "#d1d5db",
      linkColor: "#ffffff",
      linkHoverColor: "#3b82f6",
      paddingY: "3rem",
      borderTopColor: "#1f2937",
      
      heading: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: "1rem",
      },
      
      link: {
        fontSize: "0.875rem",
        hoverUnderline: true,
      },
      
      socialIcon: {
        size: "1.5rem",
        spacing: "1rem",
        hoverColor: "#3b82f6",
      },
    },

    // Login Modal/Dropdown Configuration
    loginModal: {
      width: "20rem",
      backgroundColor: "#ffffff",
      borderRadius: "0.5rem",
      shadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
      borderColor: "#e5e7eb",
      borderWidth: "1px",
      
      header: {
        fontSize: "1.125rem",
        fontWeight: "600",
        color: "#111827",
        borderBottomColor: "#e5e7eb",
        paddingX: "1rem",
        paddingY: "1rem",
      },
      
      button: {
        paddingX: "1rem",
        paddingY: "0.625rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        borderRadius: "0.375rem",
        iconSize: "1rem",
        spacing: "0.5rem",
      },
      
      divider: {
        color: "#9ca3af",
        fontSize: "0.75rem",
        marginY: "0.75rem",
      },
    },

    // Button General Configuration
    button: {
      paddingX: "1rem",
      paddingY: "0.5rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      borderRadius: "0.375rem",
      transition: "all 0.2s",
      
      variants: {
        primary: {
          backgroundColor: "#2563eb",
          hoverBackgroundColor: "#1d4ed8",
          textColor: "#ffffff",
        },
        secondary: {
          backgroundColor: "#9333ea",
          hoverBackgroundColor: "#7e22ce",
          textColor: "#ffffff",
        },
        outline: {
          backgroundColor: "transparent",
          borderColor: "#d1d5db",
          borderWidth: "1px",
          textColor: "#374151",
          hoverBackgroundColor: "#f3f4f6",
        },
      },
    },
  },

  // ==================== Animation Settings ====================
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      default: "ease",
      in: "ease-in",
      out: "ease-out",
      inOut: "ease-in-out",
    },
    
    // Specific animations
    fadeIn: {
      duration: "0.2s",
      easing: "ease-out",
    },
    scaleIn: {
      duration: "0.3s",
      easing: "ease-out",
    },
    slideDown: {
      duration: "0.2s",
      easing: "ease-out",
    },
  },

  // ==================== Breakpoints ====================
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ==================== Grid Settings ====================
  grid: {
    categories: {
      columns: {
        mobile: 2,
        tablet: 3,
        desktop: 4,
      },
      gap: "1rem",
    },
    products: {
      columns: {
        mobile: 2,
        tablet: 3,
        desktop: 4,
      },
      gap: "1.5rem",
    },
  },
} as const;

// Export type for TypeScript support
export type ThemeConfig = typeof themeConfig;
