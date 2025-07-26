import React from 'react';
import { 
  Calendar, 
  ThemeProvider, 
  useTheme, 
  CalendarTheme,
  defaultTheme,
  defaultDarkTheme 
} from 'cal7';

// Custom theme example
const customTheme: CalendarTheme = {
  colors: {
    primary: '#8b5cf6', // Purple
    secondary: '#6b7280',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#64748b',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    today: '#7c3aed',
    todayBackground: '#f3e8ff',
    focus: '#8b5cf6',
    hover: '#f1f5f9',
    eventBackground: '#ffffff',
    eventBorder: '#e2e8f0',
    eventText: '#1e293b',
    tentative: '#f59e0b',
    cancelled: '#ef4444',
    confirmed: '#10b981',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
};

// Custom dark theme
const customDarkTheme: CalendarTheme = {
  ...customTheme,
  colors: {
    ...customTheme.colors,
    primary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    border: '#334155',
    borderLight: '#475569',
    today: '#a78bfa',
    todayBackground: '#312e81',
    hover: '#334155',
    eventBackground: '#1e293b',
    eventBorder: '#334155',
    eventText: '#f1f5f9',
  },
};

// Theme controls component
function ThemeControls() {
  const { mode, setMode, toggleMode } = useTheme();

  return (
    <div style={{ 
      padding: '1rem', 
      marginBottom: '1rem', 
      border: '1px solid var(--cal7-color-border)',
      borderRadius: 'var(--cal7-border-radius-md)',
      backgroundColor: 'var(--cal7-color-surface)'
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0',
        color: 'var(--cal7-color-text)',
        fontFamily: 'var(--cal7-font-family)'
      }}>
        Theme Controls
      </h3>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setMode('light')}
          style={{
            padding: '0.5rem 1rem',
            border: mode === 'light' ? '2px solid var(--cal7-color-primary)' : '1px solid var(--cal7-color-border)',
            borderRadius: 'var(--cal7-border-radius-md)',
            backgroundColor: mode === 'light' ? 'var(--cal7-color-primary)' : 'var(--cal7-color-background)',
            color: mode === 'light' ? 'white' : 'var(--cal7-color-text)',
            cursor: 'pointer',
            fontFamily: 'var(--cal7-font-family)',
          }}
        >
          Light
        </button>
        
        <button
          onClick={() => setMode('dark')}
          style={{
            padding: '0.5rem 1rem',
            border: mode === 'dark' ? '2px solid var(--cal7-color-primary)' : '1px solid var(--cal7-color-border)',
            borderRadius: 'var(--cal7-border-radius-md)',
            backgroundColor: mode === 'dark' ? 'var(--cal7-color-primary)' : 'var(--cal7-color-background)',
            color: mode === 'dark' ? 'white' : 'var(--cal7-color-text)',
            cursor: 'pointer',
            fontFamily: 'var(--cal7-font-family)',
          }}
        >
          Dark
        </button>
        
        <button
          onClick={() => setMode('system')}
          style={{
            padding: '0.5rem 1rem',
            border: mode === 'system' ? '2px solid var(--cal7-color-primary)' : '1px solid var(--cal7-color-border)',
            borderRadius: 'var(--cal7-border-radius-md)',
            backgroundColor: mode === 'system' ? 'var(--cal7-color-primary)' : 'var(--cal7-color-background)',
            color: mode === 'system' ? 'white' : 'var(--cal7-color-text)',
            cursor: 'pointer',
            fontFamily: 'var(--cal7-font-family)',
          }}
        >
          System
        </button>
        
        <button
          onClick={toggleMode}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--cal7-color-border)',
            borderRadius: 'var(--cal7-border-radius-md)',
            backgroundColor: 'var(--cal7-color-background)',
            color: 'var(--cal7-color-text)',
            cursor: 'pointer',
            fontFamily: 'var(--cal7-font-family)',
          }}
        >
          Toggle
        </button>
      </div>
      
      <p style={{ 
        margin: 0, 
        fontSize: 'var(--cal7-font-size-sm)',
        color: 'var(--cal7-color-text-secondary)'
      }}>
        Current mode: <strong>{mode}</strong>
      </p>
    </div>
  );
}

// Example 1: Default theme
export function DefaultThemeExample() {
  return (
    <ThemeProvider>
      <div style={{ padding: '2rem' }}>
        <h2>Default Theme Example</h2>
        <ThemeControls />
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

// Example 2: Custom theme
export function CustomThemeExample() {
  return (
    <ThemeProvider 
      config={{ 
        theme: customTheme,
        darkTheme: customDarkTheme,
        mode: 'light'
      }}
    >
      <div style={{ padding: '2rem' }}>
        <h2>Custom Purple Theme Example</h2>
        <ThemeControls />
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

// Example 3: Custom class prefix
export function CustomPrefixExample() {
  return (
    <ThemeProvider 
      config={{ 
        classPrefix: 'my-calendar',
        mode: 'system'
      }}
    >
      <div style={{ padding: '2rem' }}>
        <h2>Custom Class Prefix Example</h2>
        <p>This example uses "my-calendar" as the CSS class prefix instead of "cal7".</p>
        <ThemeControls />
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

// Example 4: Partial theme customization
export function PartialThemeExample() {
  const partialTheme: Partial<CalendarTheme> = {
    colors: {
      primary: '#ff6b6b', // Red accent
      today: '#ff6b6b',
      todayBackground: '#ffe0e0',
    },
    borderRadius: {
      sm: '12px',
      md: '16px',
      lg: '20px',
    },
  };

  return (
    <ThemeProvider 
      config={{ 
        theme: partialTheme,
        mode: 'light'
      }}
    >
      <div style={{ padding: '2rem' }}>
        <h2>Partial Theme Customization</h2>
        <p>Only customizing colors and border radius, keeping other defaults.</p>
        <ThemeControls />
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

// Example 5: Multiple calendars with different themes
export function MultipleThemesExample() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <ThemeProvider config={{ theme: customTheme, mode: 'light' }}>
        <div>
          <h3>Purple Theme</h3>
          <Calendar />
        </div>
      </ThemeProvider>
      
      <ThemeProvider config={{ mode: 'dark' }}>
        <div>
          <h3>Default Dark Theme</h3>
          <Calendar />
        </div>
      </ThemeProvider>
    </div>
  );
}

// Main demo component
export default function ThemingDemo() {
  const [activeExample, setActiveExample] = React.useState('default');

  const examples = {
    default: <DefaultThemeExample />,
    custom: <CustomThemeExample />,
    prefix: <CustomPrefixExample />,
    partial: <PartialThemeExample />,
    multiple: <MultipleThemesExample />,
  };

  return (
    <div>
      <nav style={{ 
        padding: '1rem', 
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h1>Cal7 Theming Examples</h1>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {Object.keys(examples).map((key) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              style={{
                padding: '0.5rem 1rem',
                border: activeExample === key ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: activeExample === key ? '#3b82f6' : 'white',
                color: activeExample === key ? 'white' : '#374151',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </nav>
      
      {examples[activeExample as keyof typeof examples]}
    </div>
  );
}