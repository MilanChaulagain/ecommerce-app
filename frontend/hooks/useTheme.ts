/**
 * Theme Hook
 * 
 * Provides access to theme configuration throughout the application
 */

import { themeConfig, ThemeConfig } from '@/config/theme.config';

/**
 * Hook to access theme configuration
 * @returns Theme configuration object
 */
export const useTheme = (): ThemeConfig => {
  return themeConfig;
};

/**
 * Helper function to convert hex color to RGB
 * @param hex - Hex color code
 * @returns RGB color string
 */
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};

/**
 * Helper function to create gradient CSS
 * @param from - Start color
 * @param to - End color
 * @param direction - Gradient direction (default: 'to right')
 * @returns CSS gradient string
 */
export const createGradient = (
  from: string,
  to: string,
  direction: string = 'to right'
): string => {
  return `linear-gradient(${direction}, ${from}, ${to})`;
};

/**
 * Helper function to get responsive value
 * @param config - Object with mobile/desktop values
 * @param isMobile - Whether to return mobile value
 * @returns Appropriate value based on screen size
 */
export const getResponsiveValue = <T>(
  config: { mobile: T; desktop?: T },
  isMobile: boolean
): T => {
  return isMobile ? config.mobile : (config.desktop ?? config.mobile);
};

/**
 * Helper to create a style object from theme config
 */
export const createStyleFromTheme = (styles: Record<string, string>) => {
  return styles;
};
