import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CalendarClient } from '../CalendarClient';
import type { CalendarEvent } from '../../types/events';

// Mock the date utilities
vi.mock('../../utils/date-utils', () => ({
  getCurrentWeek: vi.fn(() => ({
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-03-16'),
    days: [
      {
        date: new Date('2024-03-10'),
        dayName: 'Sunday',
        events: [],
        isToday: false,
      },
      {
        date: new Date('2024-03-11'),
        dayName: 'Monday',
        events: [],
        isToday: true,
      },
      {
        date: new Date('2024-03-12'),
        dayName: 'Tuesday',
        events: [],
        isToday: false,
      },
      {
        date: new Date('2024-03-13'),
        dayName: 'Wednesday',
        events: [],
        isToday: false,
      },
      {
        date: new Date('2024-03-14'),
        dayName: 'Thursday',
        events: [],
        isToday: false,
      },
      {
        date: new Date('2024-03-15'),
        dayName: 'Friday',
        events: [],
        isToday: false,
      },
      {
        date: new Date('2024-03-16'),
        dayName: 'Saturday',
        events: [],
        isToday: false,
      },
    ],
  })),
  getNextWeek: vi.fn((date) => {
    const next = new Date(date);
    next.setDate(date.getDate() + 7);
    return next;
  }),
  getPreviousWeek: vi.fn((date) => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 7);
    return prev;
  }),
  populateWeekWithEvents: vi.fn((weekData, events) => ({
    ...weekData,
    days: weekData.days.map(day => ({
      ...day,
      events: events.filter(event => 
        event.startTime.toDateString() === day.date.toDateString()
      ),
    })),
  })),
  filterEventsForWeek: vi.fn((events) => events),
  getWeekRangeString: vi.fn(() => 'March 10 - 16, 2024'),
}));

// Mock child components
vi.mock('../WeekNavigation', () => ({
  WeekNavigation: ({ onPreviousWeek, onNextWeek, weekRangeString }: any) => (
    <div data-testid="week-navigation">
      <button onClick={onPreviousWeek} data-testid="prev-week">Previous</button>
      <span data-testid="week-range">{weekRangeString}</span>
      <button onClick={onNextWeek} data-testid="next-week">Next</button>
    </div>
  ),
}));

vi.mock('../CalendarGrid', () => ({
  CalendarGrid: ({ weekData, onEventClick }: any) => (
    <div data-testid="calendar-grid">
      {weekData.days.map((day: any, index: number) => (
        <div key={index} data-testid={`day-${index}`}>
          <span>{day.dayName}</span>
          {day.events.map((event: any, eventIndex: number) => (
            <button
              key={eventIndex}
              onClick={() => onEventClick(event)}
              data-testid={`event-${event.id}`}
            >
              {event.title}
            </button>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../EventModal', () => ({
  EventModal: ({ event, isOpen, onClose }: any) => (
    isOpen && event ? (
      <div data-testid="event-modal">
        <h2>{event.title}</h2>
        <button onClick={onClose} data-testid="close-modal">Close</button>
      </div>
    ) : null
  ),
}));

describe('CalendarClient', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Test Event 1',
      description: 'Test description',
      startTime: new Date('2024-03-11T10:00:00'),
      endTime: new Date('2024-03-11T11:00:00'),
      isAllDay: false,
      status: 'confirmed',
    },
    {
      id: '2',
      title: 'Test Event 2',
      description: 'Another test',
      startTime: new Date('2024-03-12T14:00:00'),
      endTime: new Date('2024-03-12T15:00:00'),
      isAllDay: false,
      status: 'confirmed',
    },
  ];

  const defaultProps = {
    events: mockEvents,
    locale: 'en-US',
    timeZone: 'UTC',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders calendar with week navigation and grid', () => {
      render(<CalendarClient {...defaultProps} />);
      
      expect(screen.getByTestId('week-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
      expect(screen.getByTestId('week-range')).toHaveTextContent('March 10 - 16, 2024');
    });

    it('renders all days of the week', () => {
      render(<CalendarClient {...defaultProps} />);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayNames.forEach(dayName => {
        expect(screen.getByText(dayName)).toBeInTheDocument();
      });
    });

    it('applies correct CSS classes for calendar structure', () => {
      const { container } = render(<CalendarClient {...defaultProps} />);
      
      expect(container.querySelector('.cal7-calendar')).toBeInTheDocument();
      expect(container.querySelector('.cal7-calendar__navigation')).toBeInTheDocument();
      expect(container.querySelector('.cal7-calendar__grid')).toBeInTheDocument();
    });
  });

  describe('Week Navigation', () => {
    it('handles previous week navigation', async () => {
      render(<CalendarClient {...defaultProps} />);
      
      const prevButton = screen.getByTestId('prev-week');
      fireEvent.click(prevButton);
      
      // Verify that the navigation functions are called
      await waitFor(() => {
        expect(vi.mocked(require('../../utils/date-utils').getPreviousWeek)).toHaveBeenCalled();
      });
    });

    it('handles next week navigation', async () => {
      render(<CalendarClient {...defaultProps} />);
      
      const nextButton = screen.getByTestId('next-week');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(vi.mocked(require('../../utils/date-utils').getNextWeek)).toHaveBeenCalled();
      });
    });

    it('uses initial week when provided', () => {
      const initialWeek = new Date('2024-04-01');
      render(<CalendarClient {...defaultProps} initialWeek={initialWeek} />);
      
      // The component should use the initial week
      expect(vi.mocked(require('../../utils/date-utils').getCurrentWeek)).toHaveBeenCalledWith(initialWeek);
    });
  });

  describe('Event Interaction', () => {
    it('opens modal when event is clicked', async () => {
      render(<CalendarClient {...defaultProps} />);
      
      const eventButton = screen.getByTestId('event-1');
      fireEvent.click(eventButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('event-modal')).toBeInTheDocument();
        expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      render(<CalendarClient {...defaultProps} />);
      
      // Open modal
      const eventButton = screen.getByTestId('event-1');
      fireEvent.click(eventButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('event-modal')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('event-modal')).not.toBeInTheDocument();
      });
    });

    it('calls onEventClick callback when provided', async () => {
      const onEventClick = vi.fn();
      render(<CalendarClient {...defaultProps} onEventClick={onEventClick} />);
      
      const eventButton = screen.getByTestId('event-1');
      fireEvent.click(eventButton);
      
      await waitFor(() => {
        expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const { container } = render(<CalendarClient {...defaultProps} />);
      
      const calendar = container.querySelector('.cal7-calendar');
      expect(calendar).toHaveAttribute('role', 'application');
      expect(calendar).toHaveAttribute('aria-label', 'Calendar for week of March 10 - 16, 2024');
    });

    it('supports keyboard navigation', () => {
      render(<CalendarClient {...defaultProps} />);
      
      const calendar = screen.getByRole('application');
      expect(calendar).toBeInTheDocument();
      
      // Test that the calendar is focusable
      calendar.focus();
      expect(document.activeElement).toBe(calendar);
    });
  });

  describe('Responsive Layout', () => {
    it('applies responsive CSS classes', () => {
      const { container } = render(<CalendarClient {...defaultProps} />);
      
      // Check that responsive classes are present
      expect(container.querySelector('.cal7-calendar-grid')).toBeInTheDocument();
      expect(container.querySelector('.cal7-calendar-grid__headers')).toBeInTheDocument();
      expect(container.querySelector('.cal7-calendar-grid__body')).toBeInTheDocument();
    });

    it('handles custom className prop', () => {
      const { container } = render(<CalendarClient {...defaultProps} className="custom-calendar" />);
      
      expect(container.querySelector('.cal7-calendar.custom-calendar')).toBeInTheDocument();
    });
  });

  describe('Event Filtering and Grouping', () => {
    it('filters events for current week', () => {
      render(<CalendarClient {...defaultProps} />);
      
      expect(vi.mocked(require('../../utils/date-utils').filterEventsForWeek)).toHaveBeenCalledWith(
        mockEvents,
        expect.any(Date)
      );
    });

    it('populates week with filtered events', () => {
      render(<CalendarClient {...defaultProps} />);
      
      expect(vi.mocked(require('../../utils/date-utils').populateWeekWithEvents)).toHaveBeenCalledWith(
        expect.any(Object),
        mockEvents
      );
    });

    it('updates events when week changes', async () => {
      render(<CalendarClient {...defaultProps} />);
      
      const nextButton = screen.getByTestId('next-week');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        // Should call filtering functions again with new week
        expect(vi.mocked(require('../../utils/date-utils').filterEventsForWeek)).toHaveBeenCalledTimes(2);
      });
    });
  });
});