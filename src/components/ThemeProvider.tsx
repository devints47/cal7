'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  CalendarTheme, 
  ThemeConfig, 
  ThemeMode,
  defaultTheme, 
  defaultDarkTheme,
  mergeTheme,
  generateCSSVariables,
  validateTheme,
  resolveThemeMode,
  getSystemThemePreference
} from '../types/theme';

interface ThemeContextValue {
  theme: CalendarTheme;
  darkTheme: CalendarTheme;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  classPrefix: string;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  config?: ThemeConfig;
}

export function ThemeProvider({ children, config = {} }: ThemeProviderProps) {
  const {
    theme: customTheme,
    darkTheme: customDarkTheme,
    mode: initialMode = 'light',
    classPrefix = 'cal7'
  } = config;

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Merge custom themes with defaults
  const theme = useMemo(() => mergeTheme(defaultTheme, customTheme), [customTheme]);
  const darkTheme = useMemo(() => mergeTheme(defaultDarkTheme, customDarkTheme), [customDarkTheme]);

  // Resolve the current theme mode
  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return systemPreference;
    }
    return mode;
  }, [mode, systemPreference]);

  // Get the active theme based on resolved mode
  const activeTheme = useMemo(() => {
    return resolvedMode === 'dark' ? darkTheme : theme;
  }, [resolvedMode, theme, darkTheme]);

  // Validate themes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const lightValidation = validateTheme(theme);
      const darkValidation = validateTheme(darkTheme);
      
      if (!lightValidation.isValid) {
        console.warn('Cal7 Theme Validation - Light theme issues:', lightValidation.errors);
      }
      
      if (!darkValidation.isValid) {
        console.warn('Cal7 Theme Validation - Dark theme issues:', darkValidation.errors);
      }
    }
  }, [theme, darkTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    // Set initial value
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update resolved mode when system preference changes
  useEffect(() => {
    // This effect ensures resolvedMode updates when systemPreference changes
  }, [systemPreference]);

  // Apply CSS custom properties
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const cssVariables = generateCSSVariables(activeTheme, classPrefix);
    
    // Apply CSS custom properties to root
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Handle custom font URL
    let fontLinkElement: HTMLLinkElement | null = null;
    if (activeTheme.typography?.customFontUrl) {
      fontLinkElement = document.createElement('link');
      fontLinkElement.rel = 'stylesheet';
      fontLinkElement.href = activeTheme.typography.customFontUrl;
      fontLinkElement.id = `${classPrefix}-custom-font`;
      document.head.appendChild(fontLinkElement);
    }

    // Add theme class to root for additional styling hooks
    const themeClass = `${classPrefix}-theme-${resolvedMode}`;
    const otherThemeClass = `${classPrefix}-theme-${resolvedMode === 'light' ? 'dark' : 'light'}`;
    
    root.classList.add(themeClass);
    root.classList.remove(otherThemeClass);

    // Cleanup function
    return () => {
      Object.keys(cssVariables).forEach(property => {
        root.style.removeProperty(property);
      });
      root.classList.remove(themeClass);
      
      // Remove custom font link
      if (fontLinkElement && document.head.contains(fontLinkElement)) {
        document.head.removeChild(fontLinkElement);
      }
    };
  }, [activeTheme, resolvedMode, classPrefix]);

  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode(current => {
      if (current === 'system') {
        return systemPreference === 'light' ? 'dark' : 'light';
      }
      return current === 'light' ? 'dark' : 'light';
    });
  };

  const contextValue: ThemeContextValue = {
    theme,
    darkTheme,
    mode,
    resolvedMode,
    classPrefix,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Hook to use theme context with optional fallback
export function useThemeOptional(): ThemeContextValue | null {
  const context = useContext(ThemeContext);
  return context || null;
}

// Hook to get CSS class names with prefix - works with or without ThemeProvider
export function useThemeClasses() {
  const context = useThemeOptional();
  const classPrefix = context?.classPrefix || 'cal7';
  
  return {
    calendar: `${classPrefix}-calendar`,
    weekNavigation: `${classPrefix}-week-navigation`,
    calendarGrid: `${classPrefix}-calendar-grid`,
    dayColumn: `${classPrefix}-day-column`,
    eventCard: `${classPrefix}-event-card`,
    eventModal: `${classPrefix}-event-modal`,
    loadingState: `${classPrefix}-loading`,
    errorState: `${classPrefix}-error`,
    addToCalendarButton: `${classPrefix}-add-to-calendar-button`,
    
    // Utility classes
    srOnly: `${classPrefix}-sr-only`,
    
    // State classes
    today: `${classPrefix}-today`,
    focused: `${classPrefix}-focused`,
    hover: `${classPrefix}-hover`,
    
    // Size variants
    compact: `${classPrefix}-compact`,
    
    // Status classes
    tentative: `${classPrefix}-tentative`,
    cancelled: `${classPrefix}-cancelled`,
    confirmed: `${classPrefix}-confirmed`,
  };
}

// Hook to get CSS custom property values
export function useThemeVariables() {
  const { classPrefix } = useTheme();
  
  return {
    // Colors
    primary: `var(--${classPrefix}-color-primary)`,
    secondary: `var(--${classPrefix}-color-secondary)`,
    background: `var(--${classPrefix}-color-background)`,
    surface: `var(--${classPrefix}-color-surface)`,
    text: `var(--${classPrefix}-color-text)`,
    textSecondary: `var(--${classPrefix}-color-text-secondary)`,
    textMuted: `var(--${classPrefix}-color-text-muted)`,
    border: `var(--${classPrefix}-color-border)`,
    borderLight: `var(--${classPrefix}-color-border-light)`,
    today: `var(--${classPrefix}-color-today)`,
    todayBackground: `var(--${classPrefix}-color-today-background)`,
    focus: `var(--${classPrefix}-color-focus)`,
    hover: `var(--${classPrefix}-color-hover)`,
    
    // Typography
    fontFamily: `var(--${classPrefix}-font-family)`,
    fontSize: {
      xs: `var(--${classPrefix}-font-size-xs)`,
      sm: `var(--${classPrefix}-font-size-sm)`,
      base: `var(--${classPrefix}-font-size-base)`,
      lg: `var(--${classPrefix}-font-size-lg)`,
      xl: `var(--${classPrefix}-font-size-xl)`,
      '2xl': `var(--${classPrefix}-font-size-2xl)`,
    },
    fontWeight: {
      normal: `var(--${classPrefix}-font-weight-normal)`,
      medium: `var(--${classPrefix}-font-weight-medium)`,
      semibold: `var(--${classPrefix}-font-weight-semibold)`,
      bold: `var(--${classPrefix}-font-weight-bold)`,
    },
    
    // Spacing
    spacing: {
      xs: `var(--${classPrefix}-spacing-xs)`,
      sm: `var(--${classPrefix}-spacing-sm)`,
      md: `var(--${classPrefix}-spacing-md)`,
      lg: `var(--${classPrefix}-spacing-lg)`,
      xl: `var(--${classPrefix}-spacing-xl)`,
      '2xl': `var(--${classPrefix}-spacing-2xl)`,
    },
    
    // Border radius
    borderRadius: {
      none: `var(--${classPrefix}-border-radius-none)`,
      sm: `var(--${classPrefix}-border-radius-sm)`,
      md: `var(--${classPrefix}-border-radius-md)`,
      lg: `var(--${classPrefix}-border-radius-lg)`,
      full: `var(--${classPrefix}-border-radius-full)`,
    },
    
    // Shadows
    shadow: {
      none: `var(--${classPrefix}-shadow-none)`,
      sm: `var(--${classPrefix}-shadow-sm)`,
      md: `var(--${classPrefix}-shadow-md)`,
      lg: `var(--${classPrefix}-shadow-lg)`,
      xl: `var(--${classPrefix}-shadow-xl)`,
    },
    
    // Z-index
    zIndex: {
      dropdown: `var(--${classPrefix}-z-index-dropdown)`,
      modal: `var(--${classPrefix}-z-index-modal)`,
      tooltip: `var(--${classPrefix}-z-index-tooltip)`,
    },
    
    // Transitions
    transition: {
      fast: `var(--${classPrefix}-transition-fast)`,
      normal: `var(--${classPrefix}-transition-normal)`,
      slow: `var(--${classPrefix}-transition-slow)`,
    },
  };
}