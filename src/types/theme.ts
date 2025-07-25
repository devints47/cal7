// Calendar theme configuration types

export interface CalendarTheme {
  // Color scheme
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  
  // Text colors
  textPrimary?: string;
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
  
  // Typography
  fontFamily?: string;
  fontSize?: {
    xs?: string;
    sm?: string;
    base?: string;
    lg?: string;
    xl?: string;
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
  shadow?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
}

// Default theme values
export const defaultTheme: CalendarTheme = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  background: '#ffffff',
  surface: '#f9fafb',
  
  textPrimary: '#111827',
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
  
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
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
  
  shadow: {
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
    fontSize: { ...baseTheme.fontSize, ...customTheme.fontSize },
    spacing: { ...baseTheme.spacing, ...customTheme.spacing },
    borderRadius: { ...baseTheme.borderRadius, ...customTheme.borderRadius },
    shadow: { ...baseTheme.shadow, ...customTheme.shadow },
  };
}

export function generateCSSVariables(theme: CalendarTheme): Record<string, string> {
  return {
    '--cal7-primary': theme.primary || defaultTheme.primary!,
    '--cal7-secondary': theme.secondary || defaultTheme.secondary!,
    '--cal7-background': theme.background || defaultTheme.background!,
    '--cal7-surface': theme.surface || defaultTheme.surface!,
    '--cal7-text-primary': theme.textPrimary || defaultTheme.textPrimary!,
    '--cal7-text-secondary': theme.textSecondary || defaultTheme.textSecondary!,
    '--cal7-text-muted': theme.textMuted || defaultTheme.textMuted!,
    '--cal7-border': theme.border || defaultTheme.border!,
    '--cal7-border-light': theme.borderLight || defaultTheme.borderLight!,
    '--cal7-today': theme.today || defaultTheme.today!,
    '--cal7-today-bg': theme.todayBackground || defaultTheme.todayBackground!,
    '--cal7-focus': theme.focus || defaultTheme.focus!,
    '--cal7-hover': theme.hover || defaultTheme.hover!,
  };
}