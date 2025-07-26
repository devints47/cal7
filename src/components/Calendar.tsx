import { fetchCalendarEvents } from '../utils/google-calendar-api';
import { CalendarClient } from './CalendarClient';
import { CalendarError } from '../types/utils';
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
 * - Graceful error handling with user-friendly messages
 * - Uses hardcoded public calendar ID (no configuration needed)
 */
export async function Calendar({
  timeZone = 'UTC',
  locale = 'en-US',
  className,
  theme,
  fetcher,
  onError,
}: CalendarProps) {
  // Environment variable validation
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  
  if (!apiKey) {
    const error = new CalendarError(
      'Google Calendar API key is required. Please set the GOOGLE_CALENDAR_API_KEY environment variable.',
      'MISSING_API_KEY'
    );
    
    if (onError) {
      onError(error);
    }
    
    return (
      <div className={`cal7-error cal7-error--missing-api-key ${className || ''}`}>
        <div className="cal7-error__content">
          <h3 className="cal7-error__title">API Key Required</h3>
          <p className="cal7-error__message">
            Google Calendar API key is required to display calendar events.
          </p>
          <div className="cal7-error__help">
            <p>To fix this issue:</p>
            <ol>
              <li>Get a Google Calendar API key from the Google Cloud Console</li>
              <li>Set the <code>GOOGLE_CALENDAR_API_KEY</code> environment variable</li>
              <li>Restart your application</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Fetch calendar events
  let events: CalendarEvent[] = [];
  let calendarError: CalendarError | null = null;

  try {
    if (fetcher) {
      // Use custom fetcher if provided
      events = await fetcher();
    } else {
      // Use built-in secure fetcher with Next.js caching
      events = await fetchCalendarEventsWithCache(apiKey);
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
    return <CalendarErrorFallback error={calendarError} />;
  }

  // Render the calendar with events
  return (
    <CalendarClient
      events={events}
      className={className}
      theme={theme}
      locale={locale}
      timeZone={timeZone}
    />
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

/**
 * Error fallback component for calendar errors
 */
function CalendarErrorFallback({ 
  error
}: { 
  error: CalendarError; 
}) {
  const getErrorContent = () => {
    switch (error.code) {
      case 'MISSING_API_KEY':
        return {
          title: 'API Key Required',
          message: 'Google Calendar API key is required to display calendar events.',
          help: (
            <div>
              <p>To fix this issue:</p>
              <ol>
                <li>Get a Google Calendar API key from the Google Cloud Console</li>
                <li>Set the <code>GOOGLE_CALENDAR_API_KEY</code> environment variable</li>
                <li>Restart your application</li>
              </ol>
              <a 
                href="https://developers.google.com/calendar/api/quickstart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cal7-error__link"
              >
                View Google Calendar API Documentation
              </a>
            </div>
          ),
        };
        
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to Google Calendar. Please check your internet connection and try again.',
          help: (
            <div>
              <p>This error can occur due to:</p>
              <ul>
                <li>Network connectivity issues</li>
                <li>Google Calendar API service outage</li>
                <li>Firewall or proxy blocking the request</li>
              </ul>
            </div>
          ),
        };
        
      case 'PERMISSION_ERROR':
        return {
          title: 'Permission Denied',
          message: 'The API key does not have permission to access the calendar.',
          help: (
            <div>
              <p>Please check:</p>
              <ul>
                <li>The API key is valid and active</li>
                <li>The Google Calendar API is enabled in your Google Cloud project</li>
                <li>The calendar is set to public</li>
              </ul>
            </div>
          ),
        };
        
      default:
        return {
          title: 'Calendar Error',
          message: error.message || 'An unexpected error occurred while loading the calendar.',
          help: (
            <div>
              <p>Please try refreshing the page. If the problem persists, contact support.</p>
            </div>
          ),
        };
    }
  };

  const { title, message, help } = getErrorContent();
  const errorClass = `cal7-error--${error.code.toLowerCase().replace('_', '-')}`;

  return (
    <div className={`cal7-error ${errorClass}`}>
      <div className="cal7-error__content">
        <h3 className="cal7-error__title">{title}</h3>
        <p className="cal7-error__message">{message}</p>
        <div className="cal7-error__help">{help}</div>
        
        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="cal7-error__debug">
            <summary>Debug Information</summary>
            <pre className="cal7-error__debug-info">
              {JSON.stringify({
                errorCode: error.code,
                originalError: error.originalError?.message,
                stack: error.stack,
              }, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}