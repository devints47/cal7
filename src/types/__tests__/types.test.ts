import { describe, it, expect } from 'vitest';
import type {
  // Calendar types
  CalendarProps,
  CalendarClientProps,
  EventModalProps,
  EventCardProps,
  AddToCalendarButtonProps,
  CalendarViewProps,
  WeekNavigationProps,
  DayColumnProps,
  LoadingStateProps,
  
  // Event types
  CalendarEvent,
  EventAttendee,
  RecurrenceRule,
  WeekData,
  DayData,
  GoogleCalendarEvent,
  GoogleCalendarResponse,
  DeviceType,
  DeviceInfo,
  CalendarSubscription,
  
  // Theme types
  CalendarTheme,
  
  // Utility types
  CalendarErrorCode,
  ErrorState,
  LoadingStateType,
  LoadingState,
  ApiResponse,
  CalendarApiResponse,
  CacheEntry,
  CacheConfig,
  ValidationResult,
  CalendarConfig,
  EventClickHandler,
  WeekChangeHandler,
  ErrorHandler,
  RetryHandler,
  KeyboardAction,
  KeyboardEvent,
  ViewMode,
  BreakpointSize,
  ResponsiveConfig,
  AccessibilityConfig,
  PerformanceMetrics,
  LocaleConfig
} from '../index';

// Import the CalendarError class separately
import { CalendarError } from '../index';

describe('TypeScript Interface Definitions', () => {
  it('should have properly defined CalendarEvent interface', () => {
    const mockEvent: CalendarEvent = {
      id: 'test-id',
      title: 'Test Event',
      description: 'Test description',
      location: 'Test location',
      startTime: new Date(),
      endTime: new Date(),
      isAllDay: false,
      url: 'https://example.com',
      status: 'confirmed',
      attendees: [{
        email: 'test@example.com',
        name: 'Test User',
        status: 'accepted'
      }],
      recurrence: {
        frequency: 'weekly',
        interval: 1
      },
      googleCalendarId: 'test@google.com',
      icalUrl: 'https://example.com/ical'
    };

    expect(mockEvent.id).toBe('test-id');
    expect(mockEvent.title).toBe('Test Event');
    expect(mockEvent.status).toBe('confirmed');
  });

  it('should have properly defined CalendarTheme interface', () => {
    const mockTheme: CalendarTheme = {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
        hover: '#e9ecef',
        focus: '#0d6efd',
        error: '#dc3545',
        success: '#198754'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    };

    expect(mockTheme.colors.primary).toBe('#ff6b35');
    expect(mockTheme.typography.fontFamily).toBe('Inter, sans-serif');
  });

  it('should have properly defined CalendarProps interface', () => {
    const mockProps: CalendarProps = {
      calendarId: 'test@google.com',
      revalidate: 300,
      timeZone: 'America/New_York',
      locale: 'en-US',
      className: 'custom-calendar',
      fetcher: async (calendarId: string) => [],
      onError: (error: Error) => console.error(error)
    };

    expect(mockProps.calendarId).toBe('test@google.com');
    expect(mockProps.revalidate).toBe(300);
  });

  it('should have properly defined EventModalProps interface', () => {
    const mockEvent: CalendarEvent = {
      id: 'test',
      title: 'Test',
      startTime: new Date(),
      endTime: new Date(),
      isAllDay: false,
      status: 'confirmed'
    };

    const mockModalProps: EventModalProps = {
      event: mockEvent,
      isOpen: true,
      onClose: () => {},
      timeZone: 'America/New_York',
      locale: 'en-US',
      showAddToCalendar: true
    };

    expect(mockModalProps.isOpen).toBe(true);
    expect(mockModalProps.event?.id).toBe('test');
  });

  it('should have properly defined utility types', () => {
    const mockError = new CalendarError('Test error', 'NETWORK_ERROR');
    expect(mockError.code).toBe('NETWORK_ERROR');
    expect(mockError.name).toBe('CalendarError');

    const mockLoadingState: LoadingState = {
      status: 'loading',
      message: 'Fetching events...'
    };
    expect(mockLoadingState.status).toBe('loading');

    const mockApiResponse: CalendarApiResponse = {
      data: [],
      success: true,
      timestamp: new Date(),
      totalEvents: 0
    };
    expect(mockApiResponse.success).toBe(true);
  });

  it('should have properly defined device and responsive types', () => {
    const deviceType: DeviceType = 'ios';
    expect(deviceType).toBe('ios');

    const viewMode: ViewMode = 'week';
    expect(viewMode).toBe('week');

    const breakpoint: BreakpointSize = 'md';
    expect(breakpoint).toBe('md');
  });

  it('should have properly defined handler types', () => {
    const eventHandler: EventClickHandler = (event: CalendarEvent) => {
      console.log(event.title);
    };

    const weekHandler: WeekChangeHandler = (newWeek: Date) => {
      console.log(newWeek);
    };

    const errorHandler: ErrorHandler = (error: CalendarError) => {
      console.error(error.message);
    };

    expect(typeof eventHandler).toBe('function');
    expect(typeof weekHandler).toBe('function');
    expect(typeof errorHandler).toBe('function');
  });

  it('should have properly defined configuration types', () => {
    const config: CalendarConfig = {
      googleCalendarId: 'test@google.com',
      apiKey: 'test-key',
      cacheConfig: {
        serverCacheDuration: 300,
        clientCacheDuration: 3600000,
        maxEntries: 100
      },
      accessibility: {
        enableKeyboardNavigation: true,
        announceChanges: true,
        highContrast: false
      },
      performance: {
        enableVirtualScrolling: false,
        maxEventsPerDay: 50,
        prefetchWeeks: 2
      }
    };

    expect(config.googleCalendarId).toBe('test@google.com');
    expect(config.accessibility?.enableKeyboardNavigation).toBe(true);
  });

  it('should have properly defined Google Calendar API types', () => {
    const googleEvent: GoogleCalendarEvent = {
      id: 'google-event-id',
      summary: 'Google Event',
      description: 'Event description',
      start: {
        dateTime: '2024-01-01T10:00:00Z',
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: '2024-01-01T11:00:00Z',
        timeZone: 'America/New_York'
      },
      location: 'Test Location',
      htmlLink: 'https://calendar.google.com/event'
    };

    const googleResponse: GoogleCalendarResponse = {
      items: [googleEvent],
      nextPageToken: 'next-page-token'
    };

    expect(googleEvent.summary).toBe('Google Event');
    expect(googleResponse.items).toHaveLength(1);
  });
});