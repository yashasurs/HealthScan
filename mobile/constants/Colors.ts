/**
 * Colors that match the mobile app design exactly
 */

export const Colors = {
  // Primary colors from mobile app
  primary: '#181818',      // Main dark color for buttons and accents
  secondary: '#000',       // Pure black for strong elements
  accent: '#007AFF',       // iOS blue for links and interactive elements
  
  // Text colors
  text: {
    primary: '#000',       // Main text color
    secondary: '#333',     // Secondary text color
    tertiary: '#666',      // Muted text color
    light: '#999',         // Light text color
    white: '#fff',         // White text
  },
  
  // Background colors
  background: {
    primary: '#fff',       // Main background
    secondary: '#f8f9fa',  // Secondary background
    tertiary: '#f5f7fa',   // Light background for screens
    card: '#fff',          // Card backgrounds
    input: '#F8F9FA',      // Input field backgrounds
  },
  
  // Border colors
  border: {
    light: '#f0f0f0',      // Light borders
    medium: '#e5e5e5',     // Medium borders
    input: '#E5E5EA',      // Input borders
    dark: '#181818',       // Dark borders
  },
  
  // Status colors
  status: {
    error: '#ff4444',
    success: '#28a745',
    warning: '#ffc107',
  },
  
  // Tab bar colors (matching mobile app exactly)
  tabBar: {
    background: 'transparent',
    activeTint: '#FFFFFF',
    inactiveTint: '#9CA3AF',
    focusIndicator: '#FFFFFF',
  },
  
  // Legacy support for expo-router
  light: {
    text: '#000',
    background: '#fff',
    tint: '#007AFF',
    icon: '#666',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FFFFFF',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FFFFFF',
  },
};
