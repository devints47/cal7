import { fetchCalendarEvents } from '../utils/google-calendar-api';
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
    const error = new CalendarError(
      'Google Calendar API key is required. Please set the GOOGLE_CALENDAR_API_KEY environment variable.',
      'MISSING_API_KEY'
    );
    
    if (onError) {
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
        <CalendarErrorState error={error} />
      </div>
    );
  }

  // Fetch calendar events with retry functionality
  let events: CalendarEvent[] = [];
  let calendarError: CalendarError | null = null;

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
      events = await withRetry(
        () => fetchCalendarEventsWithCache(apiKey),
        DEFAULT_RETRY_CONFIG
      );
    }
  } catch (error) {
    console.error('Calendar fetch error:', error);
    
    if (error instanceof CalendarError) {
      calendarError = error;
    } else {
      calendarError = new CalendarError(
        'Failed to load calendar events. Please try again later.',
        'UNKNOWN_ERROR',
        error instanceof Error ? error : undefined
      );
    }
    
    if (onError) {
      onError(calendarError);
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
          />
        </CalendarErrorBoundary>
      </div>
    </ThemeProvider>
  );
}

/**
 * Fetches calendar events with Next.js caching
 * Uses the hardcoded public calendar ID from the service
 */
async function fetchCalendarEventsWithCache(
  apiKey: string,
): Promise<CalendarEvent[]> {
  try {
    // Use the service function which handles the calendar ID internally
    const events = await fetchCalendarEvents(apiKey);
    return events;
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    
    throw new CalendarError(
      'Failed to fetch calendar events',
      'NETWORK_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

