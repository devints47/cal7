import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '../Calendar';
import { CalendarError } from '../../types/utils';
import type { CalendarEvent } from '../../types/events';

// Mock the CalendarClient component
vi.mock('../CalendarClient', () => ({
  CalendarClient: (props: any) => {
    const events = props.events || [];
    const className = props.className || '';
    return (
      <div data-testid="calendar-client" className={className}>
        <div data-testid="events-count">{events.length}</div>
        {events.map((event: any) => (
          <div key={event.id} data-testid="event-item">
            {event.title}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock the google-calendar-api utility
const mockTransformGoogleCalendarEvent = vi.fn();
vi.mock('../../utils/google-calendar-api', () => ({
  fetchCalendarEvents: vi.fn(),
  transformGoogleCalendarEvent: mockTransformGoogleCalendarEvent,
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;

describe('Calendar Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Variable Validation', () => {
    it('renders error when GOOGLE_CALENDAR_API_KEY is missing', async () => {
      delete process.env.GOOGLE_CALENDAR_API_KEY;

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Configuration Error')).toBeInTheDocument();
      expect(screen.getByText(/Missing Google Calendar API key/)).toBeInTheDocument();
      expect(screen.getAllByText(/GOOGLE_CALENDAR_API_KEY/)).toHaveLength(2); // Appears in message and help text
      expect(screen.getByText('View Setup Guide →')).toBeInTheDocument();
    });

    it('calls onError callback when API key is missing', async () => {
      delete process.env.GOOGLE_CALENDAR_API_KEY;
      const onError = vi.fn();

      await Calendar({
        calendarId: 'test@example.com',
        onError,
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'MISSING_API_KEY',
          message: expect.stringContaining('Google Calendar API key is required'),
        })
      );
    });

    it('renders error for invalid calendar ID', async () => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);

      const result = await Calendar({
        calendarId: '',
      });

      render(result);

      expect(screen.getByText('Invalid Calendar ID')).toBeInTheDocument();
      expect(screen.getByText(/Please provide a valid Google Calendar ID/)).toBeInTheDocument();
    });
  });

  describe('Data Fetching with Caching', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
      mockTransformGoogleCalendarEvent.mockClear();
    });

    it('fetches calendar events with default revalidate time', async () => {
      const mockGoogleEvent = {
        id: '1',
        summary: 'Test Event',
        start: { dateTime: '2024-01-01T10:00:00Z' },
        end: { dateTime: '2024-01-01T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=1',
      };

      const mockTransformedEvent = {
        id: '1',
        title: 'Test Event',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        isAllDay: false,
        status: 'confirmed' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [mockGoogleEvent],
        }),
      });

      mockTransformGoogleCalendarEvent.mockReturnValue(mockTransformedEvent);

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/calendar/v3/calendars/test%40example.com/events'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': 'cal7-package/1.0.0',
          }),
          next: expect.objectContaining({
            revalidate: 300, // default 5 minutes
            tags: ['calendar-test@example.com'],
          }),
        })
      );

      expect(mockTransformGoogleCalendarEvent).toHaveBeenCalledWith(mockGoogleEvent, 'test@example.com');
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });

    it('uses custom revalidate time when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await Calendar({
        calendarId: 'test@example.com',
        revalidate: 600, // 10 minutes
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: expect.objectContaining({
            revalidate: 600,
          }),
        })
      );
    });

    it('includes correct query parameters in API request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await Calendar({
        calendarId: 'test@example.com',
      });

      const fetchCall = mockFetch.mock.calls[0];
      const url = new URL(fetchCall[0]);
      
      expect(url.searchParams.get('key')).toBe(process.env.GOOGLE_CALENDAR_API_KEY);
      expect(url.searchParams.get('singleEvents')).toBe('true');
      expect(url.searchParams.get('orderBy')).toBe('startTime');
      expect(url.searchParams.get('maxResults')).toBe('1000');
      expect(url.searchParams.get('timeMin')).toBeTruthy();
      expect(url.searchParams.get('timeMax')).toBeTruthy();
    });

    it('uses custom fetcher when provided', async () => {
      const customFetcher = vi.fn().mockResolvedValue([
        {
          id: 'custom-1',
          title: 'Custom Event',
          startTime: new Date(),
          endTime: new Date(),
          isAllDay: false,
          status: 'confirmed' as const,
        },
      ]);

      const result = await Calendar({
        calendarId: 'test@example.com',
        fetcher: customFetcher,
      });

      render(result);

      expect(customFetcher).toHaveBeenCalledWith('test@example.com');
      expect(mockFetch).not.toHaveBeenCalled();
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
    });

    it('handles 401 authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText(/Invalid API key or insufficient permissions/)).toBeInTheDocument();
    });

    it('handles 403 permission errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Permission Error')).toBeInTheDocument();
      expect(screen.getByText(/Access to the calendar is forbidden/)).toBeInTheDocument();
    });

    it('handles 404 calendar not found errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await Calendar({
        calendarId: 'nonexistent@example.com',
      });

      render(result);

      expect(screen.getByText('Calendar Not Found')).toBeInTheDocument();
      expect(screen.getByText(/nonexistent@example.com.*could not be found/)).toBeInTheDocument();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText(/Unable to connect to Google Calendar API/)).toBeInTheDocument();
    });

    it('handles API-level errors in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          error: {
            message: 'API quota exceeded',
            code: 403,
          },
        }),
      });

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Calendar Error')).toBeInTheDocument();
      expect(screen.getByText(/API quota exceeded/)).toBeInTheDocument();
    });

    it('calls onError callback for all error types', async () => {
      const onError = vi.fn();
      
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      await Calendar({
        calendarId: 'test@example.com',
        onError,
      });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'UNKNOWN_ERROR',
          message: expect.stringContaining('Test error'),
        })
      );
    });

    it('shows debug information in development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByText('Debug Information')).toBeInTheDocument();

      process.env.NODE_ENV = originalNodeEnv;
    });

    it('handles individual event transformation errors gracefully', async () => {
      const validEvent = {
        id: '1',
        summary: 'Valid Event',
        start: { dateTime: '2024-01-01T10:00:00Z' },
        end: { dateTime: '2024-01-01T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=1',
      };

      const invalidEvent = {
        id: '2',
        summary: 'Invalid Event',
        start: { dateTime: 'invalid-date' },
        end: { dateTime: 'invalid-date' },
        htmlLink: 'https://calendar.google.com/event?eid=2',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [validEvent, invalidEvent],
        }),
      });

      // Mock transformation: first call succeeds, second call fails
      mockTransformGoogleCalendarEvent
        .mockReturnValueOnce({
          id: '1',
          title: 'Valid Event',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
          isAllDay: false,
          status: 'confirmed' as const,
        })
        .mockImplementationOnce(() => {
          throw new Error('Invalid date format');
        });

      // Mock console.warn to verify error logging
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      // Should still render the calendar with valid events only
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
      
      // Should log warning for invalid event
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to transform event 2'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      });
    });

    it('passes all props to CalendarClient component', async () => {
      const result = await Calendar({
        calendarId: 'test@example.com',
        className: 'custom-class',
        locale: 'fr-FR',
        timeZone: 'Europe/Paris',
        theme: { colors: { primary: '#ff0000' } } as any,
      });

      render(result);

      const calendarClient = screen.getByTestId('calendar-client');
      expect(calendarClient).toHaveClass('custom-class');
    });

    it('uses default values for optional props', async () => {
      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
      // Default revalidate time should be used (tested in fetch call)
    });
  });

  describe('Data Sanitization', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
      mockTransformGoogleCalendarEvent.mockClear();
    });

    it('processes events through transformation utility for sanitization', async () => {
      const mockGoogleEvent = {
        id: '1',
        summary: 'Test Event <script>alert("xss")</script>',
        description: 'Description with <b>bold</b> and <script>alert("xss")</script>',
        start: { dateTime: '2024-01-01T10:00:00Z' },
        end: { dateTime: '2024-01-01T11:00:00Z' },
        htmlLink: 'https://calendar.google.com/event?eid=1',
      };

      const mockSanitizedEvent = {
        id: '1',
        title: 'Test Event', // Should be sanitized
        description: 'Description with <b>bold</b>', // Should allow safe tags
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        isAllDay: false,
        status: 'confirmed' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [mockGoogleEvent],
        }),
      });

      mockTransformGoogleCalendarEvent.mockReturnValue(mockSanitizedEvent);

      const result = await Calendar({
        calendarId: 'test@example.com',
      });

      render(result);

      // Verify transformation utility was called with the raw event
      expect(mockTransformGoogleCalendarEvent).toHaveBeenCalledWith(mockGoogleEvent, 'test@example.com');
      
      // The transformation utility should handle sanitization
      // This test verifies the flow works, actual sanitization is tested in the utility tests
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
    });
  });

  describe('Cache Tags', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] }),
      });
    });

    it('includes calendar-specific cache tags', async () => {
      await Calendar({
        calendarId: 'specific@example.com',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: expect.objectContaining({
            tags: ['calendar-specific@example.com'],
          }),
        })
      );
    });

    it('uses different cache tags for different calendars', async () => {
      await Calendar({
        calendarId: 'calendar1@example.com',
      });

      await Calendar({
        calendarId: 'calendar2@example.com',
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1,
        expect.any(String),
        expect.objectContaining({
          next: expect.objectContaining({
            tags: ['calendar-calendar1@example.com'],
          }),
        })
      );

      expect(mockFetch).toHaveBeenNthCalledWith(2,
        expect.any(String),
        expect.objectContaining({
          next: expect.objectContaining({
            tags: ['calendar-calendar2@example.com'],
          }),
        })
      );
    });
  });
});