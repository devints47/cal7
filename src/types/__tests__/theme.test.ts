import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CalendarTheme,
  defaultTheme,
  defaultDarkTheme,
  mergeTheme,
  generateCSSVariables,
  validateTheme,
  getSystemThemePreference,
  resolveThemeMode,
} from '../theme';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('Theme Utilities', () => {
  beforeEach(() => {
    mockMatchMedia.mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('mergeTheme', () => {
    it('returns base theme when no custom theme provided', () => {
      const result = mergeTheme(defaultTheme);
      expect(result).toEqual(defaultTheme);
    });

    it('merges custom theme with base theme', () => {
      const customTheme: Partial<CalendarTheme> = {
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
        },
      };

      const result = mergeTheme(defaultTheme, customTheme);

      expect(result.colors?.primary).toBe('#ff0000');
      expect(result.colors?.secondary).toBe('#00ff00');
      expect(result.colors?.background).toBe(defaultTheme.colors?.background);
      expect(result.typography?.fontFamily).toBe('Arial, sans-serif');
      expect(result.typography?.fontSize).toEqual(defaultTheme.typography?.fontSize);
    });

    it('deeply merges nested objects', () => {
      const customTheme: Partial<CalendarTheme> = {
        typography: {
          fontSize: {
            lg: '1.5rem',
            xl: '2rem',
          },
          fontWeight: {
            bold: 800,
          },
        },
      };

      const result = mergeTheme(defaultTheme, customTheme);

      expect(result.typography?.fontSize?.lg).toBe('1.5rem');
      expect(result.typography?.fontSize?.xl).toBe('2rem');
      expect(result.typography?.fontSize?.sm).toBe(defaultTheme.typography?.fontSize?.sm);
      expect(result.typography?.fontWeight?.bold).toBe(800);
      expect(result.typography?.fontWeight?.normal).toBe(defaultTheme.typography?.fontWeight?.normal);
    });
  });

  describe('generateCSSVariables', () => {
    it('generates CSS variables with default prefix', () => {
      const theme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
          secondary: '#6b7280',
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: {
            sm: '0.875rem',
            base: '1rem',
          },
        },
        spacing: {
          sm: '0.5rem',
          md: '1rem',
        },
      };

      const variables = generateCSSVariables(theme);

      expect(variables['--cal7-color-primary']).toBe('#3b82f6');
      expect(variables['--cal7-color-secondary']).toBe('#6b7280');
      expect(variables['--cal7-font-family']).toBe('Arial, sans-serif');
      expect(variables['--cal7-font-size-sm']).toBe('0.875rem');
      expect(variables['--cal7-font-size-base']).toBe('1rem');
      expect(variables['--cal7-spacing-sm']).toBe('0.5rem');
      expect(variables['--cal7-spacing-md']).toBe('1rem');
    });

    it('generates CSS variables with custom prefix', () => {
      const theme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
        },
      };

      const variables = generateCSSVariables(theme, 'custom');

      expect(variables['--custom-color-primary']).toBe('#3b82f6');
    });

    it('handles camelCase to kebab-case conversion', () => {
      const theme: CalendarTheme = {
        colors: {
          textSecondary: '#374151',
          todayBackground: '#fef3c7',
        },
      };

      const variables = generateCSSVariables(theme);

      expect(variables['--cal7-color-text-secondary']).toBe('#374151');
      expect(variables['--cal7-color-today-background']).toBe('#fef3c7');
    });

    it('handles numeric values', () => {
      const theme: CalendarTheme = {
        typography: {
          fontWeight: {
            normal: 400,
            bold: 700,
          },
        },
        zIndex: {
          modal: 100,
          dropdown: 50,
        },
      };

      const variables = generateCSSVariables(theme);

      expect(variables['--cal7-font-weight-normal']).toBe('400');
      expect(variables['--cal7-font-weight-bold']).toBe('700');
      expect(variables['--cal7-z-index-modal']).toBe('100');
      expect(variables['--cal7-z-index-dropdown']).toBe('50');
    });

    it('skips undefined values', () => {
      const theme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
          secondary: undefined,
        },
      };

      const variables = generateCSSVariables(theme);

      expect(variables['--cal7-color-primary']).toBe('#3b82f6');
      expect(variables['--cal7-color-secondary']).toBeUndefined();
    });
  });

  describe('validateTheme', () => {
    it('validates a complete valid theme', () => {
      const result = validateTheme(defaultTheme);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects missing required colors', () => {
      const incompleteTheme: CalendarTheme = {
        colors: {
          secondary: '#6b7280',
          // Missing primary, background, text, border
        },
      };

      const result = validateTheme(incompleteTheme);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required color: primary');
      expect(result.errors).toContain('Missing required color: background');
      expect(result.errors).toContain('Missing required color: text');
      expect(result.errors).toContain('Missing required color: border');
    });

    it('validates font size CSS values', () => {
      const invalidTheme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          text: '#111827',
          border: '#e5e7eb',
        },
        typography: {
          fontSize: {
            sm: 'invalid-value',
            base: '1rem',
            lg: '1.5px',
          },
        },
      };

      const result = validateTheme(invalidTheme);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid font size value for sm: invalid-value');
    });

    it('validates spacing CSS values', () => {
      const invalidTheme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          text: '#111827',
          border: '#e5e7eb',
        },
        spacing: {
          sm: 'invalid-spacing',
          md: '1rem',
        },
      };

      const result = validateTheme(invalidTheme);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid spacing value for sm: invalid-spacing');
    });

    it('accepts valid CSS values', () => {
      const validTheme: CalendarTheme = {
        colors: {
          primary: '#3b82f6',
          background: '#ffffff',
          text: '#111827',
          border: '#e5e7eb',
        },
        typography: {
          fontSize: {
            sm: '0.875rem',
            base: '16px',
            lg: '1.5em',
            xl: '120%',
          },
        },
        spacing: {
          sm: '0.5rem',
          md: '8px',
          lg: '1.5em',
          xl: '0',
        },
      };

      const result = validateTheme(validTheme);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getSystemThemePreference', () => {
    it('returns light when matchMedia indicates light preference', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const result = getSystemThemePreference();
      expect(result).toBe('light');
    });

    it('returns dark when matchMedia indicates dark preference', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const result = getSystemThemePreference();
      expect(result).toBe('dark');
    });

    it('returns light when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const result = getSystemThemePreference();
      expect(result).toBe('light');

      global.window = originalWindow;
    });
  });

  describe('resolveThemeMode', () => {
    it('returns light for light mode', () => {
      const result = resolveThemeMode('light');
      expect(result).toBe('light');
    });

    it('returns dark for dark mode', () => {
      const result = resolveThemeMode('dark');
      expect(result).toBe('dark');
    });

    it('returns system preference for system mode', () => {
      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const result = resolveThemeMode('system');
      expect(result).toBe('dark');
    });
  });

  describe('Default Themes', () => {
    it('default theme has all required properties', () => {
      expect(defaultTheme.colors?.primary).toBeDefined();
      expect(defaultTheme.colors?.background).toBeDefined();
      expect(defaultTheme.colors?.text).toBeDefined();
      expect(defaultTheme.colors?.border).toBeDefined();
      expect(defaultTheme.typography?.fontFamily).toBeDefined();
      expect(defaultTheme.spacing?.sm).toBeDefined();
    });

    it('default dark theme has all required properties', () => {
      expect(defaultDarkTheme.colors?.primary).toBeDefined();
      expect(defaultDarkTheme.colors?.background).toBeDefined();
      expect(defaultDarkTheme.colors?.text).toBeDefined();
      expect(defaultDarkTheme.colors?.border).toBeDefined();
      expect(defaultDarkTheme.typography?.fontFamily).toBeDefined();
      expect(defaultDarkTheme.spacing?.sm).toBeDefined();
    });

    it('default themes pass validation', () => {
      const lightValidation = validateTheme(defaultTheme);
      const darkValidation = validateTheme(defaultDarkTheme);

      expect(lightValidation.isValid).toBe(true);
      expect(darkValidation.isValid).toBe(true);
    });
  });
});