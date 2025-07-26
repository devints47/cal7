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
    eventPastText?: string; // For greying out past events
    
    // Day alternating colors
    dayEven?: string;
    dayOdd?: string;
    dayHover?: string;
    
    // Header alternating colors
    headerEven?: string;
    headerOdd?: string;
    
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
    customFontUrl?: string; // Allow custom font URL
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
    calendar?: string; // Drop shadow for entire calendar component
  };
  
  // Event customization
  event?: {
    height?: string; // Customizable event height
    maxHeight?: string; // Maximum event height
    width?: string; // Customizable event width
    titleMinHeight?: string; // Minimum height for event titles
  };
  
  // Calendar layout
  calendar?: {
    height?: string; // Customizable calendar day column height
  };
  
  // Border customization
  borders?: {
    weekNavigation?: string; // Border between date range and days header
    dayColumn?: string; // Borders around each day column
    eventSection?: string; // Borders between event sections
    headerBottom?: string; // Border below header area
    calendarTop?: string; // Border at top of calendar
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

// Default light theme values - Classic white/blue/grey color scheme
export const defaultTheme: CalendarTheme = {
  colors: {
    primary: '#2563eb', // Classic blue
    secondary: '#64748b', // Slate grey
    background: '#ffffff', // Pure white
    surface: '#f8fafc', // Light grey-blue
    
    text: '#1e293b', // Dark slate
    textSecondary: '#475569', // Medium slate
    textMuted: '#64748b', // Light slate
    
    border: '#cbd5e1', // Light slate border
    borderLight: '#e2e8f0', // Very light slate
    
    today: '#1d4ed8', // Bright blue for today
    todayBackground: '#dbeafe', // Light blue background
    focus: '#2563eb', // Classic blue focus
    hover: '#f1f5f9', // Very light blue-grey hover
    
    eventBackground: '#ffffff', // White event cards
    eventBorder: '#cbd5e1', // Light border for events
    eventText: '#1e293b', // Dark text on events
    eventPastText: '#94a3b8', // Muted grey for past events
    
    // Day alternating colors - subtle blue-grey tones
    dayEven: '#f8fafc',
    dayOdd: '#ffffff',
    dayHover: '#f1f5f9',
    
    // Header alternating colors - blue-grey tones
    headerEven: '#e2e8f0',
    headerOdd: '#f1f5f9',
    
    tentative: '#f59e0b', // Amber for tentative
    cancelled: '#dc2626', // Red for cancelled
    confirmed: '#059669', // Green for confirmed
    error: '#dc2626',
    success: '#059669',
    warning: '#f59e0b',
    info: '#2563eb',
  },
  
  typography: {
    fontFamily: '"Playfair Display", serif', // Changed to Playfair Display serif
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
    calendar: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
  
  event: {
    height: 'auto',
    maxHeight: '540px', // Triple the original height
    width: '100%',
    titleMinHeight: '2.5rem', // Minimum 2 lines height
  },
  
  calendar: {
    height: '240px', // Double the original 120px
  },
  
  borders: {
    weekNavigation: '1px solid var(--cal7-color-border, #e5e7eb)',
    dayColumn: '1px solid var(--cal7-color-border, #e5e7eb)',
    eventSection: '1px solid var(--cal7-color-border, #e5e7eb)',
    headerBottom: '1px solid var(--cal7-color-border, #e5e7eb)',
    calendarTop: 'none',
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
    eventPastText: '#6b7280',
    
    // Day alternating colors
    dayEven: '#1f2937',
    dayOdd: '#111827',
    dayHover: '#374151',
    
    // Header alternating colors
    headerEven: '#374151',
    headerOdd: '#1f2937',
    
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
    calendar: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
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
  
  event: {
    height: 'auto',
    maxHeight: '540px', // Triple the original height
    width: '100%',
    titleMinHeight: '2.5rem', // Minimum 2 lines height
  },
  
  calendar: {
    height: '240px', // Double the original 120px
  },
  
  borders: {
    weekNavigation: '1px solid var(--cal7-color-border, #374151)',
    dayColumn: '1px solid var(--cal7-color-border, #374151)',
    eventSection: '1px solid var(--cal7-color-border, #374151)',
    headerBottom: '1px solid var(--cal7-color-border, #374151)',
    calendarTop: 'none',
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
    event: { ...baseTheme.event, ...customTheme.event },
    calendar: { ...baseTheme.calendar, ...customTheme.calendar },
    borders: { ...baseTheme.borders, ...customTheme.borders },
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
  
  // Event customization
  if (theme.event) {
    Object.entries(theme.event).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-event-${kebabCase(key)}`] = value;
      }
    });
  }
  
  // Calendar customization
  if (theme.calendar) {
    Object.entries(theme.calendar).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-calendar-${kebabCase(key)}`] = value;
      }
    });
  }
  
  // Border customization
  if (theme.borders) {
    Object.entries(theme.borders).forEach(([key, value]) => {
      if (value) {
        variables[`--${prefix}-border-${kebabCase(key)}`] = value;
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