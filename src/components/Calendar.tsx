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
 */
export async function Calendar({
  calendarId,
  revalidate = 300, // 5 minutes default
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
          <h3 className="cal7-error__title">Configuration Error</h3>
          <p className="cal7-error__message">
            Missing Google Calendar API key. Please set the <code>GOOGLE_CALENDAR_API_KEY</code> environment variable.
          </p>
          <div className="cal7-error__help">
            <p>To fix this issue:</p>
            <ol>
              <li>Get a Google Calendar API key from the Google Cloud Console</li>
              <li>Add it to your environment variables: <code>GOOGLE_CALENDAR_API_KEY=your_api_key_here</code></li>
              <li>Restart your development server</li>
            </ol>
            <a 
              href="https://developers.google.com/calendar/api/quickstart" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cal7-error__link"
            >
              View Setup Guide →
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  // Validate calendar ID format
  if (!calendarId || typeof calendarId !== 'string') {
    const error = new CalendarError(
      'Calendar ID is required and must be a valid string',
      'INVALID_CALENDAR_ID'
    );
    
    if (onError) {
      onError(error);
    }
    
    return (
      <div className={`cal7-error cal7-error--invalid-calendar-id ${className || ''}`}>
        <div className="cal7-error__content">
          <h3 className="cal7-error__title">Invalid Calendar ID</h3>
          <p className="cal7-error__message">
            Please provide a valid Google Calendar ID (usually an email address).
          </p>
          <p className="cal7-error__example">
            Example: <code>your-calendar@gmail.com</code> or <code>your-calendar@group.calendar.google.com</code>
          </p>
        </div>
      </div>
    );
  }
  
  try {
    let events: CalendarEvent[];
    
    if (fetcher) {
      // Use custom fetcher if provided
      events = await fetcher(calendarId);
    } else {
      // Use built-in secure fetcher with Next.js caching
      events = await fetchCalendarEventsWithCache(calendarId, apiKey, revalidate);
    }
    
    // Pass sanitized data to client component
    return (
      <CalendarClient
        events={events}
        className={className}
        theme={theme}
        locale={locale}
        timeZone={timeZone}
      />
    );
    
  } catch (error) {
    const calendarError = error instanceof CalendarError 
      ? error 
      : new CalendarError(
          `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'UNKNOWN_ERROR',
          error instanceof Error ? error : undefined
        );
    
    if (onError) {
      onError(calendarError);
    }
    
    return <CalendarErrorFallback error={calendarError} calendarId={calendarId} />;
  }
}

/**
 * Fetches calendar events with Next.js caching
 * 
 * Uses Next.js fetch with revalidate parameter for server-side caching.
 * Multiple Calendar instances within the same request will share cached data.
 */
async function fetchCalendarEventsWithCache(
  calendarId: string,
  apiKey: string,
  revalidate: number
): Promise<CalendarEvent[]> {
  // Build the Google Calendar API URL
  const baseUrl = 'https://www.googleapis.com/calendar/v3/calendars';
  const encodedCalendarId = encodeURIComponent(calendarId);
  
  // Calculate date range: 6 months past to 6 months future
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const sixMonthsFromNow = new Date(now);
  sixMonthsFromNow.setMonth(now.getMonth() + 6);
  
  const params = new URLSearchParams({
    key: apiKey,
    singleEvents: 'true', // Expand recurring events into individual instances
    orderBy: 'startTime',
    timeMin: sixMonthsAgo.toISOString(),
    timeMax: sixMonthsFromNow.toISOString(),
    maxResults: '1000', // Maximum allowed by Google Calendar API
  });
  
  const url = `${baseUrl}/${encodedCalendarId}/events?${params.toString()}`;
  
  try {
    // Use Next.js fetch with caching
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'cal7-package/1.0.0',
      },
      next: { 
        revalidate, // Cache for specified seconds
        tags: [`calendar-${calendarId}`] // Tag for cache invalidation
      },
    } as RequestInit & { next?: { revalidate: number; tags: string[] } });
    
    if (!response.ok) {
      // Handle specific HTTP error codes
      switch (response.status) {
        case 401:
          throw new CalendarError(
            'Invalid API key or insufficient permissions. Please check your GOOGLE_CALENDAR_API_KEY.',
            'AUTH_ERROR'
          );
        case 403:
          throw new CalendarError(
            'Access forbidden. Please check that your API key has Calendar API access enabled and the calendar is public.',
            'PERMISSION_ERROR'
          );
        case 404:
          throw new CalendarError(
            `Calendar not found: ${calendarId}. Please check that the calendar ID is correct and the calendar is public.`,
            'INVALID_CALENDAR_ID'
          );
        default:
          throw new CalendarError(
            `HTTP ${response.status}: ${response.statusText}`,
            'NETWORK_ERROR'
          );
      }
    }
    
    const rawData = await response.json();
    
    // Check for API-level errors
    if (rawData.error) {
      throw new CalendarError(
        `Google Calendar API error: ${rawData.error.message}`,
        rawData.error.code === 401 ? 'AUTH_ERROR' : 'UNKNOWN_ERROR'
      );
    }
    
    // Process and sanitize events using existing utility
    const events: CalendarEvent[] = [];
    
    if (rawData.items && Array.isArray(rawData.items)) {
      for (const googleEvent of rawData.items) {
        try {
          // The fetchCalendarEvents utility already handles sanitization
          const { transformGoogleCalendarEvent } = await import('../utils/google-calendar-api');
          const transformedEvent = transformGoogleCalendarEvent(googleEvent, calendarId);
          events.push(transformedEvent);
        } catch (error) {
          // Log individual event transformation errors but continue processing
          console.warn(`Failed to transform event ${googleEvent.id}:`, error);
          continue;
        }
      }
    }
    
    return events;
    
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    
    // Handle network and other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CalendarError(
        'Network error: Unable to connect to Google Calendar API. Please check your internet connection.',
        'NETWORK_ERROR',
        error
      );
    }
    
    throw new CalendarError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Error fallback component for calendar failures
 */
function CalendarErrorFallback({ 
  error, 
  calendarId 
}: { 
  error: CalendarError; 
  calendarId: string;
}) {
  const getErrorContent = () => {
    switch (error.code) {
      case 'AUTH_ERROR':
        return {
          title: 'Authentication Error',
          message: 'Invalid API key or insufficient permissions.',
          help: (
            <div>
              <p>To fix this issue:</p>
              <ol>
                <li>Verify your Google Calendar API key is correct</li>
                <li>Ensure the API key has Calendar API access enabled</li>
                <li>Check that the calendar is public or shared appropriately</li>
              </ol>
            </div>
          )
        };
      
      case 'PERMISSION_ERROR':
        return {
          title: 'Permission Error',
          message: 'Access to the calendar is forbidden.',
          help: (
            <div>
              <p>To fix this issue:</p>
              <ol>
                <li>Make sure the calendar is set to public</li>
                <li>Verify your API key has the necessary permissions</li>
                <li>Check the calendar sharing settings</li>
              </ol>
            </div>
          )
        };
      
      case 'INVALID_CALENDAR_ID':
        return {
          title: 'Calendar Not Found',
          message: `The calendar "${calendarId}" could not be found.`,
          help: (
            <div>
              <p>Please check:</p>
              <ol>
                <li>The calendar ID is spelled correctly</li>
                <li>The calendar exists and is accessible</li>
                <li>The calendar is set to public if using a public API key</li>
              </ol>
            </div>
          )
        };
      
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Error',
          message: 'Unable to connect to Google Calendar API.',
          help: (
            <div>
              <p>This might be a temporary issue. Try:</p>
              <ol>
                <li>Refreshing the page</li>
                <li>Checking your internet connection</li>
                <li>Waiting a moment and trying again</li>
              </ol>
            </div>
          )
        };
      
      default:
        return {
          title: 'Calendar Error',
          message: error.message || 'An unexpected error occurred.',
          help: (
            <div>
              <p>If this problem persists, please:</p>
              <ol>
                <li>Check the browser console for more details</li>
                <li>Verify your calendar configuration</li>
                <li>Contact support if needed</li>
              </ol>
            </div>
          )
        };
    }
  };
  
  const { title, message, help } = getErrorContent();
  
  return (
    <div className={`cal7-error cal7-error--${error.code.toLowerCase().replace('_', '-')}`}>
      <div className="cal7-error__content">
        <h3 className="cal7-error__title">{title}</h3>
        <p className="cal7-error__message">{message}</p>
        <div className="cal7-error__help">{help}</div>
        {process.env.NODE_ENV === 'development' && (
          <details className="cal7-error__debug">
            <summary>Debug Information</summary>
            <pre className="cal7-error__debug-info">
              {JSON.stringify({
                errorCode: error.code,
                calendarId,
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