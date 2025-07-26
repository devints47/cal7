import { z } from 'zod';
import type { 
  CalendarEvent, 
  GoogleCalendarEvent
} from '../types/events';
import { CalendarError } from '../types/utils';

// Calendar metadata interface
export interface CalendarMetadata {
  name: string;
  description?: string;
  timeZone?: string;
}

// Combined response interface
export interface CalendarData {
  events: CalendarEvent[];
  metadata: CalendarMetadata;
}

// Google Calendar configuration - using the same public calendar as NovelTea
const CALENDAR_ID = 'b382cfad3622bc528f1e748cc100b3abc92abfe801f983ca2a527357f7be7445@group.calendar.google.com';

// Create a DOMPurify instance - handle both server and client environments
const createPurify = async () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    const DOMPurify = (await import('dompurify')).default;
    return DOMPurify(window);
  } else {
    // Server environment - use JSDOM to create a proper window object
    const { JSDOM } = await import('jsdom');
    const DOMPurify = (await import('dompurify')).default;
    const window = new JSDOM('').window;
    return DOMPurify(window as unknown as Window & typeof globalThis);
  }
};

let purifyInstance: unknown = null;

// Zod schemas for Google Calendar API response validation
const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional().default('Untitled Event'),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  location: z.string().optional(),
  htmlLink: z.string(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']).optional().default('confirmed'),
  attendees: z.array(z.object({
    email: z.string(),
    displayName: z.string().optional(),
    responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional().default('needsAction'),
  })).optional(),
});

const GoogleCalendarResponseSchema = z.object({
  items: z.array(GoogleCalendarEventSchema),
  summary: z.string().optional(), // Calendar name/title
  nextPageToken: z.string().optional(),
  error: z.object({
    message: z.string(),
    code: z.number(),
  }).optional(),
});

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
async function sanitizeHtml(content: string | undefined): Promise<string> {
  if (!content) return '';
  
  // Get or create purify instance
  if (!purifyInstance) {
    purifyInstance = await createPurify();
  }
  
  // Allow only safe inline tags
  return (purifyInstance as any).sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Transforms a Google Calendar event to our internal CalendarEvent format
 */
export async function transformGoogleCalendarEvent(
  googleEvent: GoogleCalendarEvent
): Promise<CalendarEvent> {
  const isAllDay = !googleEvent.start.dateTime;
  
  let startTime: Date;
  let endTime: Date;
  
  if (isAllDay) {
    // All-day events: Parse date strings and set to noon local time to avoid timezone issues
    const startDateStr = googleEvent.start.date!;
    const endDateStr = googleEvent.end.date!;
    
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);
    
    startTime = new Date(startYear, startMonth - 1, startDay, 12, 0, 0);
    endTime = new Date(endYear, endMonth - 1, endDay, 12, 0, 0);
  } else {
    // Timed events: Use dateTime directly
    startTime = new Date(googleEvent.start.dateTime!);
    endTime = new Date(googleEvent.end.dateTime!);
  }
  
  // Validate dates
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new CalendarError(
      `Invalid date format in event ${googleEvent.id}`,
      'INVALID_DATA'
    );
  }
  
  return {
    id: googleEvent.id,
    title: await sanitizeHtml(googleEvent.summary || 'Untitled Event'),
    description: await sanitizeHtml(googleEvent.description),
    location: await sanitizeHtml(googleEvent.location),
    startTime,
    endTime,
    isAllDay,
    url: googleEvent.htmlLink,
    status: googleEvent.status || 'confirmed',
    googleCalendarId: CALENDAR_ID,
    icalUrl: `https://calendar.google.com/calendar/ical/${CALENDAR_ID}/public/basic.ics`,
    attendees: googleEvent.attendees?.map(attendee => ({
      email: attendee.email,
      name: attendee.displayName,
      status: attendee.responseStatus || 'needsAction',
    })),
  };
}

/**
 * Builds the Google Calendar API URL with proper parameters
 */
function buildCalendarApiUrl(apiKey: string): string {
  const baseUrl = 'https://www.googleapis.com/calendar/v3/calendars';
  const encodedCalendarId = encodeURIComponent(CALENDAR_ID);
  
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
  
  return `${baseUrl}/${encodedCalendarId}/events?${params.toString()}`;
}

/**
 * Fetches calendar events and metadata from Google Calendar API
 */
export async function fetchCalendarData(
  apiKey?: string
): Promise<CalendarData> {
  // Validate API key
  const key = apiKey || process.env.GOOGLE_CALENDAR_API_KEY;
  if (!key) {
    throw new CalendarError(
      'Google Calendar API key is required. Set GOOGLE_CALENDAR_API_KEY environment variable.',
      'MISSING_API_KEY'
    );
  }
  
  try {
    // Fetch events - the response includes calendar name in summary field
    const result = await fetchCalendarEventsInternal(key);
    
    return result;
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    
    throw new CalendarError(
      `Failed to fetch calendar data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetches calendar events from Google Calendar API (internal function)
 * Now also extracts calendar metadata from the response
 */
async function fetchCalendarEventsInternal(apiKey: string): Promise<CalendarData> {
  const url = buildCalendarApiUrl(apiKey);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'cal7-package/1.0.0',
      },
    });
    
    if (!response.ok) {
      // Handle specific HTTP error codes
      switch (response.status) {
        case 401:
          throw new CalendarError(
            'Invalid API key or insufficient permissions',
            'AUTH_ERROR'
          );
        case 403:
          throw new CalendarError(
            'Access forbidden. Check calendar permissions and API key.',
            'PERMISSION_ERROR'
          );
        case 404:
          throw new CalendarError(
            `Calendar not found: ${CALENDAR_ID}`,
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
    
    // Validate response structure with Zod
    const validationResult = GoogleCalendarResponseSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      throw new CalendarError(
        `Invalid API response format: ${validationResult.error.message}`,
        'INVALID_DATA',
        validationResult.error
      );
    }
    
    const data = validationResult.data;
    
    // Check for API-level errors
    if (data.error) {
      throw new CalendarError(
        `Google Calendar API error: ${data.error.message}`,
        data.error.code === 401 ? 'AUTH_ERROR' : 'UNKNOWN_ERROR'
      );
    }
    
    // Extract calendar name from summary field
    let calendarName = 'Calendar'; // Default fallback
    if (data.summary) {
      // Use the full calendar name as provided by the API
      calendarName = data.summary;
    }
    
    // Create metadata from extracted information
    const metadata: CalendarMetadata = {
      name: calendarName,
      description: data.summary || 'NovelTea Event Calendar',
      timeZone: 'UTC'
    };
    
    // Transform events to our internal format
    const events: CalendarEvent[] = [];
    
    for (const googleEvent of data.items) {
      try {
        const transformedEvent = await transformGoogleCalendarEvent(googleEvent);
        events.push(transformedEvent);
      } catch (error) {
        // Log individual event transformation errors but continue processing
        console.warn(`Failed to transform event ${googleEvent.id}:`, error);
        continue;
      }
    }
    
    return { events, metadata };
    
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error;
    }
    
    // Handle network and other unexpected errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new CalendarError(
        'Network error: Unable to connect to Google Calendar API',
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
 * Validates that a calendar ID is properly formatted
 */
export function validateCalendarId(calendarId: string): boolean {
  if (!calendarId || typeof calendarId !== 'string') {
    return false;
  }
  
  // Basic email format validation for calendar IDs
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(calendarId);
}

/**
 * Validates that an API key is properly formatted
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Google API keys typically start with 'AIza' and are 39 characters long
  return apiKey.startsWith('AIza') && apiKey.length === 39;
}

/**
 * Filters events for a specific week
 */
export function filterEventsForWeek(events: CalendarEvent[], weekStart: Date): CalendarEvent[] {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  
  return events.filter(event => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    // Event overlaps with the week if:
    // - Event starts before week ends AND event ends after week starts
    return eventStart < weekEnd && eventEnd >= weekStart;
  });
}

/**
 * Groups events by day for a given week
 */
export function groupEventsByDay(events: CalendarEvent[], weekStart: Date): Map<string, CalendarEvent[]> {
  const eventsByDay = new Map<string, CalendarEvent[]>();
  
  // Initialize all days of the week
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    const dayKey = day.toISOString().split('T')[0]; // YYYY-MM-DD format
    eventsByDay.set(dayKey, []);
  }
  
  // Group events by their start date
  for (const event of events) {
    const eventDate = new Date(event.startTime);
    const dayKey = eventDate.toISOString().split('T')[0];
    
    const dayEvents = eventsByDay.get(dayKey);
    if (dayEvents) {
      dayEvents.push(event);
    }
  }
  
  // Sort events within each day by start time
  eventsByDay.forEach((dayEvents) => {
    dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  });
  
  return eventsByDay;
}