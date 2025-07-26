import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme, useThemeClasses, useThemeVariables } from '../ThemeProvider';
import { defaultTheme, defaultDarkTheme } from '../../types/theme';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Test component that uses theme hooks
function TestComponent() {
  const { theme, darkTheme, mode, resolvedMode, classPrefix, setMode, toggleMode } = useTheme();
  const classes = useThemeClasses();
  const variables = useThemeVariables();

  // Get the active theme based on resolved mode
  const activeTheme = resolvedMode === 'dark' ? darkTheme : theme;

  return (
    <div data-testid="test-component">
      <div data-testid="mode">{mode}</div>
      <div data-testid="resolved-mode">{resolvedMode}</div>
      <div data-testid="class-prefix">{classPrefix}</div>
      <div data-testid="primary-color">{activeTheme.colors?.primary}</div>
      <div data-testid="calendar-class">{classes.calendar}</div>
      <div data-testid="primary-variable">{variables.primary}</div>
      <button data-testid="toggle-mode" onClick={toggleMode}>
        Toggle Mode
      </button>
      <button data-testid="set-dark" onClick={() => setMode('dark')}>
        Set Dark
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
    
    // Mock matchMedia to return light mode by default
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

  describe('Basic Theme Provider Functionality', () => {
    it('provides default theme values', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('class-prefix')).toHaveTextContent('cal7');
      expect(screen.getByTestId('primary-color')).toHaveTextContent(defaultTheme.colors!.primary!);
    });

    it('applies custom theme configuration', () => {
      const customTheme = {
        colors: {
          primary: '#ff0000',
          background: '#ffffff',
        },
      };

      render(
        <ThemeProvider config={{ theme: customTheme, classPrefix: 'custom' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('primary-color')).toHaveTextContent('#ff0000');
      expect(screen.getByTestId('class-prefix')).toHaveTextContent('custom');
      expect(screen.getByTestId('calendar-class')).toHaveTextContent('custom-calendar');
    });

    it('applies custom dark theme', () => {
      const customDarkTheme = {
        colors: {
          primary: '#00ff00',
          background: '#000000',
        },
      };

      render(
        <ThemeProvider config={{ darkTheme: customDarkTheme, mode: 'dark' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#00ff00');
    });
  });

  describe('Theme Mode Management', () => {
    it('handles light mode correctly', () => {
      render(
        <ThemeProvider config={{ mode: 'light' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('cal7-theme-light')).toBe(true);
    });

    it('handles dark mode correctly', () => {
      render(
        <ThemeProvider config={{ mode: 'dark' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('cal7-theme-dark')).toBe(true);
    });

    it('handles system mode with light preference', () => {
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

      render(
        <ThemeProvider config={{ mode: 'system' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
    });

    it('handles system mode with dark preference', () => {
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

      render(
        <ThemeProvider config={{ mode: 'system' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
    });
  });

  describe('CSS Custom Properties', () => {
    it('applies CSS custom properties to document root', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--cal7-color-primary')).toBe(defaultTheme.colors!.primary);
      expect(rootStyle.getPropertyValue('--cal7-color-background')).toBe(defaultTheme.colors!.background);
    });

    it('applies custom prefix to CSS variables', () => {
      render(
        <ThemeProvider config={{ classPrefix: 'custom' }}>
          <TestComponent />
        </ThemeProvider>
      );

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--custom-color-primary')).toBe(defaultTheme.colors!.primary);
    });

    it('updates CSS variables when theme changes', async () => {
      function TestComponentWithModeChange() {
        const { setMode } = useTheme();
        
        return (
          <div>
            <TestComponent />
            <button data-testid="change-to-dark" onClick={() => setMode('dark')}>
              Change to Dark
            </button>
          </div>
        );
      }

      render(
        <ThemeProvider config={{ mode: 'light' }}>
          <TestComponentWithModeChange />
        </ThemeProvider>
      );

      let rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--cal7-color-primary')).toBe(defaultTheme.colors!.primary);

      act(() => {
        screen.getByTestId('change-to-dark').click();
      });

      rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--cal7-color-primary')).toBe(defaultDarkTheme.colors!.primary);
    });
  });

  describe('Theme Classes', () => {
    it('provides correct theme classes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('calendar-class')).toHaveTextContent('cal7-calendar');
    });

    it('uses custom class prefix', () => {
      render(
        <ThemeProvider config={{ classPrefix: 'custom' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('calendar-class')).toHaveTextContent('custom-calendar');
    });
  });

  describe('Theme Variables Hook', () => {
    it('provides CSS custom property references', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('primary-variable')).toHaveTextContent('var(--cal7-color-primary)');
    });

    it('uses custom prefix in variable names', () => {
      render(
        <ThemeProvider config={{ classPrefix: 'custom' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('primary-variable')).toHaveTextContent('var(--custom-color-primary)');
    });
  });

  describe('Mode Toggle Functionality', () => {
    it('toggles between light and dark modes', () => {
      render(
        <ThemeProvider config={{ mode: 'light' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');

      act(() => {
        screen.getByTestId('toggle-mode').click();
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');

      act(() => {
        screen.getByTestId('toggle-mode').click();
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });

    it('sets specific mode', () => {
      render(
        <ThemeProvider config={{ mode: 'light' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('light');

      act(() => {
        screen.getByTestId('set-dark').click();
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('toggles from system mode correctly', () => {
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

      render(
        <ThemeProvider config={{ mode: 'system' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');

      act(() => {
        screen.getByTestId('toggle-mode').click();
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
    });
  });

  describe('Error Handling', () => {
    it('throws error when useTheme is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('System Theme Change Detection', () => {
    it('listens for system theme changes', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();

      mockMatchMedia.mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: vi.fn(),
      }));

      const { unmount } = render(
        <ThemeProvider config={{ mode: 'system' }}>
          <TestComponent />
        </ThemeProvider>
      );

      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Cleanup', () => {
    it('cleans up CSS variables on unmount', () => {
      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const rootStyle = document.documentElement.style;
      expect(rootStyle.getPropertyValue('--cal7-color-primary')).toBe(defaultTheme.colors!.primary);

      unmount();

      expect(rootStyle.getPropertyValue('--cal7-color-primary')).toBe('');
    });

    it('cleans up theme classes on unmount', () => {
      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains('cal7-theme-light')).toBe(true);

      unmount();

      expect(document.documentElement.classList.contains('cal7-theme-light')).toBe(false);
    });
  });
});