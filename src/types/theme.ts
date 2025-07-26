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
    };
    fontWeight?: {
      normal?: number;
      medium?: number;
      semibold?: number;
      bold?: number;
    };
  };
  
  // Spacing
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  // Border radius
  borderRadius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  
  // Shadows
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}

// Default theme values
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
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
    },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
    shadows: { ...baseTheme.shadows, ...customTheme.shadows },
  };
}

export function generateCSSVariables(theme: CalendarTheme): Record<string, string> {
  const colors = theme.colors || defaultTheme.colors!;
  return {
    '--cal7-primary': colors.primary || defaultTheme.colors!.primary!,
    '--cal7-secondary': colors.secondary || defaultTheme.colors!.secondary!,
    '--cal7-background': colors.background || defaultTheme.colors!.background!,
    '--cal7-surface': colors.surface || defaultTheme.colors!.surface!,
    '--cal7-text-primary': colors.text || defaultTheme.colors!.text!,
    '--cal7-text-secondary': colors.textSecondary || defaultTheme.colors!.textSecondary!,
    '--cal7-text-muted': colors.textMuted || defaultTheme.colors!.textMuted!,
    '--cal7-border': colors.border || defaultTheme.colors!.border!,
    '--cal7-border-light': colors.borderLight || defaultTheme.colors!.borderLight!,
    '--cal7-today': colors.today || defaultTheme.colors!.today!,
    '--cal7-today-bg': colors.todayBackground || defaultTheme.colors!.todayBackground!,
    '--cal7-focus': colors.focus || defaultTheme.colors!.focus!,
    '--cal7-hover': colors.hover || defaultTheme.colors!.hover!,
  };
}