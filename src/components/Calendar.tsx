import { fetchCalendarData } from '../utils/google-calendar-api';
import { CalendarClient } from './CalendarClient';
import { CalendarError } from '../types/utils';
import { CalendarErrorBoundary } from './CalendarErrorBoundary';
import { CalendarErrorState, DevelopmentWarning } from './ErrorStates';
import { withRetry, DEFAULT_RETRY_CONFIG } from '../utils/retry';
import { ThemeProvider } from './ThemeProvider';
import type { CalendarProps } from '../types/calendar';
import type { CalendarEvent } from '../types/events';

/**
 * Calendar Server Component
 * 
 * Securely fetches Google Calendar events server-side using environment variables
 * and passes processed data to client components for rendering.
 * 
 * Features:
 * - Server-only API key access via process.env
 * - Next.js caching with configurable revalidation
 * - Environment variable validation with helpful error messages
 * - Data sanitization using dompurify
 * - Comprehensive error handling with retry functionality
 * - Development-time configuration warnings
 * - Uses hardcoded public calendar ID (no configuration needed)
 */
export async function Calendar({
  timeZone = 'UTC',
  locale = 'en-US',
  className,
  theme,
  darkTheme,
  mode = 'light',
  classPrefix = 'cal7',
  fetcher,
  onError,
  showSubscribeButton = false,
}: CalendarProps) {
  // Environment variable validation with development warnings
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const developmentWarnings: string[] = [];
  
  // Check for common configuration issues in development
  if (process.env.NODE_ENV === 'development') {
    if (!apiKey) {
      developmentWarnings.push('GOOGLE_CALENDAR_API_KEY environment variable is not set');
    } else if (!apiKey.startsWith('AIza')) {
      developmentWarnings.push('GOOGLE_CALENDAR_API_KEY does not appear to be a valid Google API key format');
    } else if (apiKey.length !== 39) {
      developmentWarnings.push('GOOGLE_CALENDAR_API_KEY length is unexpected (should be 39 characters)');
    }
  }
  
  if (!apiKey) {
    const errorData = {
      message: 'Google Calendar API key is required. Please set the GOOGLE_CALENDAR_API_KEY environment variable.',
      code: 'MISSING_API_KEY' as const,
      name: 'CalendarError'
    };
    
    if (onError) {
      const error = new CalendarError(errorData.message, errorData.code);
      onError(error);
    }
    
    return (
      <div className={className}>
        {developmentWarnings.map((warning, index) => (
          <DevelopmentWarning
            key={index}
            message={warning}
            type="error"
          />
        ))}
        <CalendarErrorState error={errorData} />
      </div>
    );
  }

  // Fetch calendar data with retry functionality
  let events: CalendarEvent[] = [];
  let calendarName = 'Calendar';
  let calendarError: any = null;

  try {
    if (fetcher) {
      // Use custom fetcher if provided, with retry wrapper
      events = await withRetry(
        () => fetcher(),
        {
          ...DEFAULT_RETRY_CONFIG,
          maxAttempts: 2, // Reduce retries for custom fetchers
        }
      );
    } else {
      // Use built-in secure fetcher with Next.js caching and retry
      const calendarData = await withRetry(
        () => fetchCalendarDataWithCache(apiKey),
        DEFAULT_RETRY_CONFIG
      );
      events = calendarData.events;
      calendarName = calendarData.metadata.name;
    }
  } catch (error) {
    console.error('Calendar fetch error:', error);
    
    // Create plain object error data for client components
    if (error instanceof CalendarError) {
      calendarError = {
        message: error.message,
        code: error.code,
        name: 'CalendarError'
      };
    } else {
      calendarError = {
        message: 'Failed to load calendar events. Please try again later.',
        code: 'UNKNOWN_ERROR' as const,
        name: 'CalendarError'
      };
    }
    
    if (onError) {
      const actualError = new CalendarError(
        calendarError.message,
        calendarError.code,
        error instanceof Error ? error : undefined
      );
      onError(actualError);
    }
  }

  // Render error state if we have an error
  if (calendarError) {
    return (
      <div className={className}>
        {developmentWarnings.map((warning, index) => (
          <DevelopmentWarning
            key={index}
            message={warning}
            type="warning"
          />
        ))}
        <CalendarErrorState error={calendarError} />
      </div>
    );
  }

  // Render the calendar with events wrapped in error boundary and theme provider
  // Only pass theme config if any theme parameters are provided, otherwise use defaults
  const themeConfig = theme || darkTheme || mode !== 'light' || classPrefix !== 'cal7' 
    ? { theme, darkTheme, mode, classPrefix }
    : undefined;

  return (
    <ThemeProvider config={themeConfig}>
      <div className={className}>
        {developmentWarnings.map((warning, index) => (
          <DevelopmentWarning
            key={index}
            message={warning}
            type="warning"
          />
        ))}
        <CalendarErrorBoundary>
                  <CalendarClient
          events={events}
          locale={locale}
          timeZone={timeZone}
          calendarName={calendarName}
          showSubscribeButton={showSubscribeButton}
        />
        </CalendarErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

/**
 * Fetches calendar data with Next.js caching
 * Uses the hardcoded public calendar ID from the service
 */
async function fetchCalendarDataWithCache(
  apiKey: string,
): Promise<{ events: CalendarEvent[], metadata: { name: string } }> {
  try {
    // Use the service function which handles the calendar ID internally
    const calendarData = await fetchCalendarData(apiKey);
    return calendarData;
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    
    throw new CalendarError(
      'Failed to fetch calendar data',
      'NETWORK_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

