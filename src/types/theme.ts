// Calendar theme configuration types

export interface CalendarTheme {
  // Color scheme
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    
    // Text colors
    text?: string;
    textSecondary?: string;
    textMuted?: string;
    
    // Border colors
    border?: string;
    borderLight?: string;
    
    // State colors
    today?: string;
    todayBackground?: string;
    focus?: string;
    hover?: string;
    
    // Event colors
    eventBackground?: string;
    eventBorder?: string;
    eventText?: string;
    
    // Status colors
    tentative?: string;
    cancelled?: string;
    confirmed?: string;
    error?: string;
    success?: string;
    warning?: string;
    info?: string;
  };
  
  // Typography
  typography?: {
    fontFamily?: string;
    fontSize?: {
      xs?: string;
      sm?: string;
      base?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
    };
    fontWeight?: {
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
    lineHeight?: {
      tight?: number;
      normal?: number;
      relaxed?: number;
    };
  };
  
  // Spacing
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  
  // Border radius
  borderRadius?: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    full?: string;
  };
  
  // Shadows
  shadows?: {
    none?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  // Z-index values
  zIndex?: {
    dropdown?: number;
    modal?: number;
    tooltip?: number;
  };
  
  // Transitions
  transitions?: {
    fast?: string;
    normal?: string;
    slow?: string;
  };
}

// Dark theme configuration
export interface DarkTheme extends CalendarTheme {
  isDark: true;
}

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// CSS class prefix configuration
export interface ThemeConfig {
  theme?: CalendarTheme;
  darkTheme?: CalendarTheme;
  mode?: ThemeMode;
  classPrefix?: string;
}

// Default light theme values
export const defaultTheme: CalendarTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f9fafb',
    
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    
    today: '#92400e',
    todayBackground: '#fef3c7',
    focus: '#3b82f6',
    hover: '#f3f4f6',
    
    eventBackground: '#ffffff',
    eventBorder: '#e5e7eb',
    eventText: '#111827',
    
    tentative: '#92400e',
    cancelled: '#dc2626',
    confirmed: '#059669',
    error: '#dc2626',
    success: '#059669',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
  
  zIndex: {
    dropdown: 50,
    modal: 100,
    tooltip: 200,
  },
  
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },
};

// Default dark theme values
export const defaultDarkTheme: CalendarTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#9ca3af',
    background: '#111827',
    surface: '#1f2937',
    
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    
    border: '#374151',
    borderLight: '#4b5563',
    
    today: '#fbbf24',
    todayBackground: '#451a03',
    focus: '#60a5fa',
    hover: '#374151',
    
    eventBackground: '#1f2937',
    eventBorder: '#374151',
    eventText: '#f9fafb',
    
    tentative: '#fbbf24',
    cancelled: '#f87171',
    confirmed: '#34d399',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 2px 4px rgba(0, 0, 0, 0.4)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.4)',
    xl: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
  
  zIndex: {
    dropdown: 50,
    modal: 100,
    tooltip: 200,
  },
  
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },
};

// Theme utility functions
export function mergeTheme(baseTheme: CalendarTheme, customTheme?: Partial<CalendarTheme>): CalendarTheme {
  if (!customTheme) return baseTheme;
  
  return {
    ...baseTheme,
    ...customTheme,
    colors: { ...baseTheme.colors, ...customTheme.colors },
    typography: { 
      ...baseTheme.typography, 
      ...customTheme.typography,
      fontSize: { ...baseTheme.typography?.fontSize, ...customTheme.typography?.fontSize },
      fontWeight: { ...baseTheme.typography?.fontWeight, ...customTheme.typography?.fontWeight },
      lineHeight: { ...baseTheme.typography?.lineHeight, ...customTheme.typography?.lineHeight },
    },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
    shadows: { ...baseTheme.shadows, ...customTheme.shadows },
    zIndex: { ...baseTheme.zIndex, ...customTheme.zIndex },
    transitions: { ...baseTheme.transitions, ...customTheme.transitions },
  };
}

export function generateCSSVariables(theme: CalendarTheme, prefix: string = 'cal7'): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-color-${kebabCase(key)}`] = value;
      }
    });
  }
  
  // Typography
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      variables[`--${prefix}-font-family`] = theme.typography.fontFamily;
    }
    
    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        if (value) {
          variables[`--${prefix}-font-size-${key}`] = value;
        }
      });
    }
    
    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        if (value) {
          variables[`--${prefix}-font-weight-${key}`] = value.toString();
        }
      });
    }
    
    if (theme.typography.lineHeight) {
      Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
        if (value) {
          variables[`--${prefix}-line-height-${key}`] = value.toString();
        }
      });
    }
  }
  
  // Spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-spacing-${key}`] = value;
      }
    });
  }
  
  // Border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-border-radius-${key}`] = value;
      }
    });
  }
  
  // Shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-shadow-${key}`] = value;
      }
    });
  }
  
  // Z-index
  if (theme.zIndex) {
    Object.entries(theme.zIndex).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-z-index-${key}`] = value.toString();
      }
    });
  }
  
  // Transitions
  if (theme.transitions) {
    Object.entries(theme.transitions).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-transition-${key}`] = value;
      }
    });
  }
  
  return variables;
}

// Theme validation
export function validateTheme(theme: CalendarTheme): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required color properties
  const requiredColors = ['primary', 'background', 'text', 'border'];
  requiredColors.forEach(color => {
    if (!theme.colors?.[color as keyof typeof theme.colors]) {
      errors.push(`Missing required color: ${color}`);
    }
  });
  
  // Validate font sizes are valid CSS values
  if (theme.typography?.fontSize) {
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      if (value && !isValidCSSValue(value)) {
        errors.push(`Invalid font size value for ${key}: ${value}`);
      }
    });
  }
  
  // Validate spacing values are valid CSS values
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      if (value && !isValidCSSValue(value)) {
        errors.push(`Invalid spacing value for ${key}: ${value}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility functions
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function isValidCSSValue(value: string): boolean {
  // Basic validation for CSS values (rem, px, em, %, etc.)
  return /^[\d.]+(?:px|rem|em|%|vh|vw|vmin|vmax)$/.test(value) || 
         /^[\d.]+$/.test(value) || 
         value === '0';
}

// System preference detection
export function getSystemThemePreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Theme mode resolution
export function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemThemePreference();
  }
  return mode;
}