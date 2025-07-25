import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  fetchCalendarEvents,
  transformGoogleCalendarEvent,
  validateCalendarId,
  validateApiKey,
  filterEventsForWeek,
  groupEventsByDay
} from '../google-calendar-api';
import { CalendarError } from '../../types/utils';
import type { GoogleCalendarEvent, CalendarEvent } from '../../types/events';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

describe('Google Calendar API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('fetchCalendarEvents', () => {
    const mockCalendarId = 'test@example.com';
    const mockApiKey = 'AIzaSyDummyKeyForTesting123456789012345';

    const mockGoogleEvent: GoogleCalendarEvent = {
      id: 'event123',
      summary: 'Test Event',
      description: 'Test Description',
      start: {
        dateTime: '2024-01-15T10:00:00Z',
        timeZone: 'UTC'
      },
      end: {
        dateTime: '2024-01-15T11:00:00Z',
        timeZone: 'UTC'
      },
      location: 'Test Location',
      htmlLink: 'https://calendar.google.com/event?eid=test123'
    };

    const mockApiResponse = {
      items: [mockGoogleEvent],
      nextPageToken: undefined
    };

    it('should fetch and transform calendar events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      });

      const events = await fetchCalendarEvents(mockCalendarId, mockApiKey);

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'event123',
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        isAllDay: false,
        status: 'confirmed',
        googleCalendarId: mockCalendarId
      });
    });

    it('should handle recurring events with singleEvents=true parameter', async () => {
      const recurringEvent = {
        ...mockGoogleEvent,
        id: 'recurring123_20240115T100000Z',
        summary: 'Recurring Meeting'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          items: [recurringEvent]
        })
      });

      await fetchCalendarEvents(mockCalendarId, mockApiKey);

      // Verify that singleEvents=true is included in the API call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('singleEvents=true'),
        expect.any(Object)
      );
    });

    it('should use environment variable for API key when not provided', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      });

      await fetchCalendarEvents(mockCalendarId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`key=${mockApiKey}`),
        expect.any(Object)
      );
    });

    it('should throw CalendarError when calendar ID is missing', async () => {
      await expect(fetchCalendarEvents('', mockApiKey))
        .rejects
        .toThrow(new CalendarError('Calendar ID is required', 'INVALID_CALENDAR_ID'));
    });

    it('should throw CalendarError when API key is missing', async () => {
      delete process.env.GOOGLE_CALENDAR_API_KEY;

      await expect(fetchCalendarEvents(mockCalendarId))
        .rejects
        .toThrow(new CalendarError(
          'Google Calendar API key is required. Set GOOGLE_CALENDAR_API_KEY environment variable.',
          'MISSING_API_KEY'
        ));
    });

    it('should handle 401 authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(new CalendarError(
          'Invalid API key or insufficient permissions',
          'AUTH_ERROR'
        ));
    });

    it('should handle 403 permission errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(new CalendarError(
          'Access forbidden. Check calendar permissions and API key.',
          'PERMISSION_ERROR'
        ));
    });

    it('should handle 404 calendar not found errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(new CalendarError(
          `Calendar not found: ${mockCalendarId}`,
          'INVALID_CALENDAR_ID'
        ));
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(new CalendarError(
          'Network error: Unable to connect to Google Calendar API',
          'NETWORK_ERROR'
        ));
    });

    it('should handle invalid API response format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: 'response' })
      });

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(expect.objectContaining({
          code: 'INVALID_DATA',
          message: expect.stringContaining('Invalid API response format')
        }));
    });

    it('should handle API-level errors in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          items: [],
          error: {
            message: 'API quota exceeded',
            code: 403
          }
        })
      });

      await expect(fetchCalendarEvents(mockCalendarId, mockApiKey))
        .rejects
        .toThrow(new CalendarError(
          'Google Calendar API error: API quota exceeded',
          'UNKNOWN_ERROR'
        ));
    });

    it('should continue processing when individual events fail transformation', async () => {
      const invalidEvent = {
        ...mockGoogleEvent,
        id: 'invalid123',
        start: { dateTime: 'invalid-date' },
        end: { dateTime: 'invalid-date' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          items: [mockGoogleEvent, invalidEvent]
        })
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const events = await fetchCalendarEvents(mockCalendarId, mockApiKey);

      expect(events).toHaveLength(1); // Only valid event should be included
      expect(events[0].id).toBe('event123');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to transform event invalid123'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('transformGoogleCalendarEvent', () => {
    const mockCalendarId = 'test@example.com';

    it('should transform timed events correctly', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'event123',
        summary: 'Test Event',
        description: 'Test Description',
        start: {
          dateTime: '2024-01-15T10:00:00Z',
          timeZone: 'UTC'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z',
          timeZone: 'UTC'
        },
        location: 'Test Location',
        htmlLink: 'https://calendar.google.com/event?eid=test123'
      };

      const result = transformGoogleCalendarEvent(googleEvent, mockCalendarId);

      expect(result).toMatchObject({
        id: 'event123',
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        isAllDay: false,
        url: 'https://calendar.google.com/event?eid=test123',
        status: 'confirmed',
        googleCalendarId: mockCalendarId,
        icalUrl: `https://calendar.google.com/calendar/ical/${mockCalendarId}/public/basic.ics`
      });
    });

    it('should transform all-day events correctly', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'allday123',
        summary: 'All Day Event',
        start: {
          date: '2024-01-15'
        },
        end: {
          date: '2024-01-16'
        },
        htmlLink: 'https://calendar.google.com/event?eid=allday123'
      };

      const result = transformGoogleCalendarEvent(googleEvent, mockCalendarId);

      expect(result.isAllDay).toBe(true);
      expect(result.startTime).toEqual(new Date(2024, 0, 15, 12, 0, 0)); // Noon local time
      expect(result.endTime).toEqual(new Date(2024, 0, 16, 12, 0, 0));
    });

    it('should sanitize HTML content', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'html123',
        summary: '<script>alert("xss")</script>Safe Title',
        description: '<b>Bold text</b><script>alert("xss")</script>',
        location: '<i>Italic location</i><script>alert("xss")</script>',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=html123'
      };

      const result = transformGoogleCalendarEvent(googleEvent, mockCalendarId);

      expect(result.title).toBe('Safe Title');
      expect(result.description).toBe('<b>Bold text</b>');
      expect(result.location).toBe('<i>Italic location</i>');
    });

    it('should handle missing optional fields', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'minimal123',
        summary: '',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=minimal123'
      };

      const result = transformGoogleCalendarEvent(googleEvent, mockCalendarId);

      expect(result.title).toBe('Untitled Event');
      expect(result.description).toBe('');
      expect(result.location).toBe('');
    });

    it('should throw CalendarError for invalid dates', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'invalid123',
        summary: 'Invalid Event',
        start: { dateTime: 'invalid-date' },
        end: { dateTime: 'invalid-date' },
        htmlLink: 'https://calendar.google.com/event?eid=invalid123'
      };

      expect(() => transformGoogleCalendarEvent(googleEvent, mockCalendarId))
        .toThrow(new CalendarError(
          'Invalid date format in event invalid123',
          'INVALID_DATA'
        ));
    });

    it('should handle attendees correctly', () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'attendees123',
        summary: 'Meeting with Attendees',
        start: { dateTime: '2024-01-15T10:00:00Z' },
        end: { dateTime: '2024-01-15T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=attendees123',
        attendees: [
          {
            email: 'john@example.com',
            displayName: 'John Doe',
            responseStatus: 'accepted'
          },
          {
            email: 'jane@example.com',
            responseStatus: 'tentative'
          }
        ]
      };

      const result = transformGoogleCalendarEvent(googleEvent, mockCalendarId);

      expect(result.attendees).toHaveLength(2);
      expect(result.attendees![0]).toMatchObject({
        email: 'john@example.com',
        name: 'John Doe',
        status: 'accepted'
      });
      expect(result.attendees![1]).toMatchObject({
        email: 'jane@example.com',
        name: undefined,
        status: 'tentative'
      });
    });
  });

  describe('validateCalendarId', () => {
    it('should validate correct email format calendar IDs', () => {
      expect(validateCalendarId('test@example.com')).toBe(true);
      expect(validateCalendarId('user.name@domain.co.uk')).toBe(true);
      expect(validateCalendarId('calendar123@gmail.com')).toBe(true);
    });

    it('should reject invalid calendar IDs', () => {
      expect(validateCalendarId('')).toBe(false);
      expect(validateCalendarId('invalid-email')).toBe(false);
      expect(validateCalendarId('missing@domain')).toBe(false);
      expect(validateCalendarId('@domain.com')).toBe(false);
      expect(validateCalendarId('user@')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(validateCalendarId(null as any)).toBe(false);
      expect(validateCalendarId(undefined as any)).toBe(false);
      expect(validateCalendarId(123 as any)).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct Google API key format', () => {
      expect(validateApiKey('AIzaSyDummyKeyForTesting123456789012345')).toBe(true);
      expect(validateApiKey('AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567')).toBe(true);
    });

    it('should reject invalid API keys', () => {
      expect(validateApiKey('')).toBe(false);
      expect(validateApiKey('invalid-key')).toBe(false);
      expect(validateApiKey('AIza')).toBe(false); // Too short
      expect(validateApiKey('BIzaSyDummyKeyForTesting123456789012345')).toBe(false); // Wrong prefix
      expect(validateApiKey('AIzaSyDummyKeyForTesting1234567890123456')).toBe(false); // Too long
    });

    it('should handle non-string inputs', () => {
      expect(validateApiKey(null as any)).toBe(false);
      expect(validateApiKey(undefined as any)).toBe(false);
      expect(validateApiKey(123 as any)).toBe(false);
    });
  });

  describe('filterEventsForWeek', () => {
    const createMockEvent = (id: string, startDate: string, endDate: string): CalendarEvent => ({
      id,
      title: `Event ${id}`,
      startTime: new Date(startDate),
      endTime: new Date(endDate),
      isAllDay: false,
      status: 'confirmed'
    });

    it('should filter events that overlap with the specified week', () => {
      const weekStart = new Date('2024-01-15'); // Monday
      const events = [
        createMockEvent('1', '2024-01-16T10:00:00Z', '2024-01-16T11:00:00Z'), // Tuesday - included
        createMockEvent('2', '2024-01-14T10:00:00Z', '2024-01-14T11:00:00Z'), // Sunday before - excluded
        createMockEvent('3', '2024-01-22T10:00:00Z', '2024-01-22T11:00:00Z'), // Monday after - excluded
        createMockEvent('4', '2024-01-21T23:00:00Z', '2024-01-22T01:00:00Z'), // Spans week boundary - included (ends after week starts)
        createMockEvent('5', '2024-01-14T23:00:00Z', '2024-01-15T01:00:00Z'), // Spans into week - included
      ];

      const filtered = filterEventsForWeek(events, weekStart);

      expect(filtered).toHaveLength(3);
      expect(filtered.map(e => e.id).sort()).toEqual(['1', '4', '5']);
    });

    it('should handle empty events array', () => {
      const weekStart = new Date('2024-01-15');
      const filtered = filterEventsForWeek([], weekStart);
      expect(filtered).toEqual([]);
    });
  });

  describe('groupEventsByDay', () => {
    const createMockEvent = (id: string, startDate: string): CalendarEvent => ({
      id,
      title: `Event ${id}`,
      startTime: new Date(startDate),
      endTime: new Date(startDate),
      isAllDay: false,
      status: 'confirmed'
    });

    it('should group events by day and sort by start time', () => {
      const weekStart = new Date('2024-01-15'); // Monday
      const events = [
        createMockEvent('1', '2024-01-16T14:00:00Z'), // Tuesday afternoon
        createMockEvent('2', '2024-01-16T10:00:00Z'), // Tuesday morning
        createMockEvent('3', '2024-01-17T12:00:00Z'), // Wednesday
        createMockEvent('4', '2024-01-15T09:00:00Z'), // Monday
      ];

      const grouped = groupEventsByDay(events, weekStart);

      expect(grouped.size).toBe(7); // All 7 days of the week

      // Check Monday
      const mondayEvents = grouped.get('2024-01-15');
      expect(mondayEvents).toHaveLength(1);
      expect(mondayEvents![0].id).toBe('4');

      // Check Tuesday - should be sorted by time
      const tuesdayEvents = grouped.get('2024-01-16');
      expect(tuesdayEvents).toHaveLength(2);
      expect(tuesdayEvents![0].id).toBe('2'); // 10:00 comes before 14:00
      expect(tuesdayEvents![1].id).toBe('1');

      // Check Wednesday
      const wednesdayEvents = grouped.get('2024-01-17');
      expect(wednesdayEvents).toHaveLength(1);
      expect(wednesdayEvents![0].id).toBe('3');

      // Check empty days
      const thursdayEvents = grouped.get('2024-01-18');
      expect(thursdayEvents).toEqual([]);
    });

    it('should initialize all days of the week even with no events', () => {
      const weekStart = new Date('2024-01-15');
      const grouped = groupEventsByDay([], weekStart);

      expect(grouped.size).toBe(7);
      
      // Check that all days are initialized with empty arrays
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dayKey = day.toISOString().split('T')[0];
        expect(grouped.get(dayKey)).toEqual([]);
      }
    });
  });
});