// theme.js
import { Platform } from 'react-native';

export const LightTheme = {
  dark: false,
  colors: {
    primary: '#D32F2F',        // Kruncheese Red
    primaryDark: '#B71C1C',    // Deeper red for headers/gradients
    primaryLight: '#FFCDD2',   // Light red tint
    background: '#FFFFFF',     // Pure White
    surface: '#F8F8F8',        // Very light gray for sections
    card: '#FFFFFF',           // White cards
    text: '#1A1A1A',           // Near black
    textSecondary: '#666666',  // Gray text
    textMuted: '#999999',      // Muted text
    border: '#EEEEEE',        // Light border
    borderMedium: '#E0E0E0',  // Medium border
    notification: '#D32F2F',
    secondary: '#FFB800',      // Amber/Gold
    muted: '#6B7280',
    success: '#4CAF50',        // Green
    error: '#F44336',          // Error red
    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.5)',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fonts: {
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    regular: 'System',
  }
};

export const DarkTheme = {
  dark: true,
  colors: {
    primary: '#EF5350',        // Lighter red for dark mode
    primaryDark: '#D32F2F',
    primaryLight: '#4A1A1A',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#1E1E1E',
    text: '#F5F5F5',
    textSecondary: '#BDBDBD',
    textMuted: '#757575',
    border: '#2C2C2C',
    borderMedium: '#3A3A3A',
    notification: '#EF5350',
    secondary: '#FFB800',
    muted: '#94A3B8',
    success: '#66BB6A',
    error: '#EF5350',
    white: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.7)',
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fonts: {
    bold: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed',
    medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    regular: 'System',
  }
};
