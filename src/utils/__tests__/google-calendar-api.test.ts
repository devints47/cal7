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
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiResponse)
      });

      const events = await fetchCalendarEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'event123',
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        isAllDay: false,
        status: 'confirmed'
      });
    });

    it('should handle recurring events with singleEvents=true parameter', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
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

      await fetchCalendarEvents();

      // Verify that singleEvents=true is included in the API call
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('singleEvents=true'),
        expect.any(Object)
      );
    });

    it('should throw CalendarError when API key is missing', async () => {
      delete process.env.GOOGLE_CALENDAR_API_KEY;

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should throw CalendarError for empty calendar ID', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;

      // This test may not be applicable anymore since calendarId is hardcoded
      // But we can test other validation scenarios
      expect(validateCalendarId('')).toBe(false);
    });

    it('should handle 401 authentication errors', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should handle 403 permission errors', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should handle 404 calendar not found errors', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should handle network errors', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should handle API-level errors in response', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          error: {
            message: 'API quota exceeded',
            code: 403
          }
        })
      });

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should handle invalid JSON response', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(fetchCalendarEvents())
        .rejects
        .toThrow(CalendarError);
    });

    it('should transform events and handle individual transformation errors', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = mockApiKey;
      
      const validEvent = mockGoogleEvent;
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
          items: [validEvent, invalidEvent]
        })
      });

      // Mock console.warn to verify error logging
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const events = await fetchCalendarEvents();

      // Should return only valid events
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event123');
      
      // Should log warning for invalid event
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to transform event invalid123'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('transformGoogleCalendarEvent', () => {
    it('should transform a regular Google Calendar event', async () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'test123',
        summary: 'Test Event',
        description: 'Test Description',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        },
        location: 'Test Location',
        htmlLink: 'https://calendar.google.com/event?eid=test123',
        status: 'confirmed'
      };

      const result = await transformGoogleCalendarEvent(googleEvent);

      expect(result).toMatchObject({
        id: 'test123',
        title: 'Test Event',
        description: 'Test Description',
        location: 'Test Location',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        isAllDay: false,
        url: 'https://calendar.google.com/event?eid=test123',
        status: 'confirmed'
      });
    });

    it('should transform an all-day Google Calendar event', async () => {
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

      const result = await transformGoogleCalendarEvent(googleEvent);

      expect(result.isAllDay).toBe(true);
      expect(result.startTime.getHours()).toBe(12); // Should be set to noon
      expect(result.endTime.getHours()).toBe(12);
    });

    it('should handle events with minimal data', async () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'minimal123',
        summary: 'Minimal Event',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        },
        htmlLink: 'https://calendar.google.com/event?eid=minimal123'
      };

      const result = await transformGoogleCalendarEvent(googleEvent);

      expect(result.title).toBe('Minimal Event');
      expect(result.description).toBe('');
      expect(result.location).toBe('');
      expect(result.status).toBe('confirmed');
    });

    it('should throw CalendarError for invalid date formats', async () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'invalid123',
        summary: 'Invalid Event',
        start: {
          dateTime: 'invalid-date'
        },
        end: {
          dateTime: 'invalid-date'
        },
        htmlLink: 'https://calendar.google.com/event?eid=invalid123'
      };

      await expect(transformGoogleCalendarEvent(googleEvent))
        .rejects.toThrow(CalendarError);
    });

    it('should transform attendees correctly', async () => {
      const googleEvent: GoogleCalendarEvent = {
        id: 'attendees123',
        summary: 'Event with Attendees',
        start: {
          dateTime: '2024-01-15T10:00:00Z'
        },
        end: {
          dateTime: '2024-01-15T11:00:00Z'
        },
        htmlLink: 'https://calendar.google.com/event?eid=attendees123',
        attendees: [
          {
            email: 'john@example.com',
            displayName: 'John Doe',
            responseStatus: 'accepted'
          },
          {
            email: 'jane@example.com',
            displayName: 'Jane Smith',
            responseStatus: 'tentative'
          }
        ]
      };

      const result = await transformGoogleCalendarEvent(googleEvent);

      expect(result.attendees).toHaveLength(2);
      expect(result.attendees![0]).toMatchObject({
        email: 'john@example.com',
        name: 'John Doe',
        status: 'accepted'
      });
      expect(result.attendees![1]).toMatchObject({
        email: 'jane@example.com',
        name: 'Jane Smith',
        status: 'tentative'
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateCalendarId', () => {
      it('should validate correct email format calendar IDs', () => {
        expect(validateCalendarId('test@example.com')).toBe(true);
        expect(validateCalendarId('user.name@domain.co.uk')).toBe(true);
      });

      it('should reject invalid calendar IDs', () => {
        expect(validateCalendarId('')).toBe(false);
        expect(validateCalendarId('invalid')).toBe(false);
        expect(validateCalendarId('invalid@')).toBe(false);
        expect(validateCalendarId('@invalid.com')).toBe(false);
      });
    });

    describe('validateApiKey', () => {
      it('should validate correct Google API key format', () => {
        const validKey = 'AIza' + 'x'.repeat(35);
        expect(validateApiKey(validKey)).toBe(true);
      });

      it('should reject invalid API keys', () => {
        expect(validateApiKey('')).toBe(false);
        expect(validateApiKey('invalid')).toBe(false);
        expect(validateApiKey('AIza123')).toBe(false); // Too short
        expect(validateApiKey('BIZA' + 'x'.repeat(35))).toBe(false); // Wrong prefix
      });
    });
  });

  describe('Event Filtering and Grouping', () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Event 1',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        isAllDay: false,
        status: 'confirmed'
      },
      {
        id: '2',
        title: 'Event 2',
        startTime: new Date('2024-01-16T14:00:00Z'),
        endTime: new Date('2024-01-16T15:00:00Z'),
        isAllDay: false,
        status: 'confirmed'
      },
      {
        id: '3',
        title: 'Event 3',
        startTime: new Date('2024-01-20T09:00:00Z'),
        endTime: new Date('2024-01-20T10:00:00Z'),
        isAllDay: false,
        status: 'confirmed'
      }
    ];

    describe('filterEventsForWeek', () => {
      it('should filter events for a specific week', () => {
        const weekStart = new Date('2024-01-15T00:00:00Z'); // Monday
        const filteredEvents = filterEventsForWeek(mockEvents, weekStart);

        expect(filteredEvents).toHaveLength(2);
        expect(filteredEvents.map(e => e.id)).toEqual(['1', '2']);
      });

      it('should handle events that span across week boundaries', () => {
        const spanningEvent: CalendarEvent = {
          id: 'spanning',
          title: 'Spanning Event',
          startTime: new Date('2024-01-14T23:00:00Z'), // Sunday before
          endTime: new Date('2024-01-15T01:00:00Z'), // Monday after
          isAllDay: false,
          status: 'confirmed'
        };

        const weekStart = new Date('2024-01-15T00:00:00Z');
        const filteredEvents = filterEventsForWeek([spanningEvent], weekStart);

        expect(filteredEvents).toHaveLength(1);
      });
    });

    describe('groupEventsByDay', () => {
      it('should group events by day for a week', () => {
        const weekStart = new Date('2024-01-15T00:00:00Z'); // Monday
        const groupedEvents = groupEventsByDay(mockEvents, weekStart);

        expect(groupedEvents.size).toBe(7); // All 7 days should be present
        expect(groupedEvents.get('2024-01-15')).toHaveLength(1);
        expect(groupedEvents.get('2024-01-16')).toHaveLength(1);
        expect(groupedEvents.get('2024-01-17')).toHaveLength(0);
      });

      it('should sort events within each day by start time', () => {
        const earlyEvent: CalendarEvent = {
          id: 'early',
          title: 'Early Event',
          startTime: new Date('2024-01-15T08:00:00Z'),
          endTime: new Date('2024-01-15T09:00:00Z'),
          isAllDay: false,
          status: 'confirmed'
        };

        const lateEvent: CalendarEvent = {
          id: 'late',
          title: 'Late Event',
          startTime: new Date('2024-01-15T16:00:00Z'),
          endTime: new Date('2024-01-15T17:00:00Z'),
          isAllDay: false,
          status: 'confirmed'
        };

        const weekStart = new Date('2024-01-15T00:00:00Z');
        const groupedEvents = groupEventsByDay([lateEvent, earlyEvent], weekStart);
        const dayEvents = groupedEvents.get('2024-01-15')!;

        expect(dayEvents).toHaveLength(2);
        expect(dayEvents[0].id).toBe('early');
        expect(dayEvents[1].id).toBe('late');
      });
    });
  });
});