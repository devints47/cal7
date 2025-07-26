import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '../Calendar';

// Mock the CalendarClient component
vi.mock('../CalendarClient', () => ({
  CalendarClient: (props: { events: unknown[]; className: string }) => {
    const events = props.events || [];
    const className = props.className || '';
    return (
      <div data-testid="calendar-client" className={className}>
        <div data-testid="events-count">{events.length}</div>
        {(events as { id: string; title: string }[]).map((event) => (
          <div key={event.id} data-testid="event-item">
            {event.title}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock the google-calendar-api utility
const mockFetchCalendarData = vi.fn();
vi.mock('../../utils/google-calendar-api', () => ({
  fetchCalendarData: mockFetchCalendarData,
}));

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
      mockFetchCalendarData.mockRejectedValue(new Error('Missing API key'));

      const result = await Calendar({});

      render(result);

      expect(screen.getByText(/Configuration Error|Missing API key/)).toBeInTheDocument();
    });

    it('calls onError callback when API key is missing', async () => {
      delete process.env.GOOGLE_CALENDAR_API_KEY;
      const onError = vi.fn();
      mockFetchCalendarData.mockRejectedValue(new Error('Missing API key'));

      await Calendar({
        onError,
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Data Fetching with Caching', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
    });

    it('fetches calendar events with default revalidate time', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Test Event',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T11:00:00Z'),
          isAllDay: false,
          status: 'confirmed' as const,
        },
      ];

      mockFetchCalendarData.mockResolvedValue({
        events: mockEvents,
        metadata: { name: 'Test Calendar' }
      });

      const result = await Calendar({});

      render(result);

      expect(mockFetchCalendarData).toHaveBeenCalled();
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
      expect(screen.getByTestId('events-count')).toHaveTextContent('1');
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
        fetcher: customFetcher,
      });

      render(result);

      expect(customFetcher).toHaveBeenCalled();
      expect(mockFetchCalendarData).not.toHaveBeenCalled();
      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
    });

    it('handles network errors', async () => {
      mockFetchCalendarData.mockRejectedValue(new Error('Network error'));

      const result = await Calendar({});

      render(result);

      expect(screen.getByText(/Error|Failed/)).toBeInTheDocument();
    });

    it('calls onError callback for all error types', async () => {
      const onError = vi.fn();
      
      mockFetchCalendarData.mockRejectedValue(new Error('Test error'));

      await Calendar({
        onError,
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    beforeEach(() => {
      process.env.GOOGLE_CALENDAR_API_KEY = 'AIza' + 'x'.repeat(35);
      mockFetchCalendarData.mockResolvedValue([]);
    });

    it('passes all props to CalendarClient component', async () => {
      const result = await Calendar({
        className: 'custom-class',
        locale: 'fr-FR',
        timeZone: 'Europe/Paris',
        theme: { colors: { primary: '#ff0000' } },
      });

      render(result);

      const calendarClient = screen.getByTestId('calendar-client');
      expect(calendarClient).toHaveClass('custom-class');
    });

    it('uses default values for optional props', async () => {
      const result = await Calendar({});

      render(result);

      expect(screen.getByTestId('calendar-client')).toBeInTheDocument();
    });
  });
});