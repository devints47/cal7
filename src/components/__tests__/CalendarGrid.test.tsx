import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CalendarGrid } from '../CalendarGrid';
import type { WeekData, CalendarEvent } from '../../types/events';

// Mock child components
vi.mock('../DayColumn', () => ({
  DayColumn: ({ day, onEventClick }: { day: { dayName: string; date: Date; events: { id: string; title: string }[] }; onEventClick: (event: unknown) => void }) => (
    <div data-testid={`day-column-${day.dayName.toLowerCase()}`}>
      <h3>{day.dayName}</h3>
      <span data-testid="day-date">{day.date.getDate()}</span>
      {day.events.map((event: { id: string; title: string }) => (
        <button
          key={event.id}
          onClick={() => onEventClick(event)}
          data-testid={`event-${event.id}`}
        >
          {event.title}
        </button>
      ))}
    </div>
  ),
}));

describe('CalendarGrid', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Test Event 1',
      description: 'Test description',
      startTime: new Date(2024, 2, 11, 10, 0), // March 11, 2024 10:00 AM
      endTime: new Date(2024, 2, 11, 11, 0),   // March 11, 2024 11:00 AM
      isAllDay: false,
      status: 'confirmed',
    },
    {
      id: '2',
      title: 'Test Event 2',
      description: 'Another test',
      startTime: new Date(2024, 2, 12, 14, 0), // March 12, 2024 2:00 PM
      endTime: new Date(2024, 2, 12, 15, 0),   // March 12, 2024 3:00 PM
      isAllDay: false,
      status: 'confirmed',
    },
  ];

  const mockWeekData: WeekData = {
    startDate: new Date(2024, 2, 10), // March 10, 2024 (Sunday)
    endDate: new Date(2024, 2, 16),   // March 16, 2024 (Saturday)
    days: [
      {
        date: new Date(2024, 2, 10),
        dayName: 'Sunday',
        events: [],
        isToday: false,
      },
      {
        date: new Date(2024, 2, 11),
        dayName: 'Monday',
        events: [mockEvents[0]],
        isToday: true,
      },
      {
        date: new Date(2024, 2, 12),
        dayName: 'Tuesday',
        events: [mockEvents[1]],
        isToday: false,
      },
      {
        date: new Date(2024, 2, 13),
        dayName: 'Wednesday',
        events: [],
        isToday: false,
      },
      {
        date: new Date(2024, 2, 14),
        dayName: 'Thursday',
        events: [],
        isToday: false,
      },
      {
        date: new Date(2024, 2, 15),
        dayName: 'Friday',
        events: [],
        isToday: false,
      },
      {
        date: new Date(2024, 2, 16),
        dayName: 'Saturday',
        events: [],
        isToday: false,
      },
    ],
  };

  const defaultProps = {
    weekData: mockWeekData,
    onEventClick: vi.fn(),
    locale: 'en-US',
    timeZone: 'UTC',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all days of the week', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayNames.forEach(dayName => {
        // Use getAllByText since day names appear in both header and body
        expect(screen.getAllByText(dayName)).toHaveLength(2);
      });
    });

    it('renders events in correct days', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      expect(screen.getByTestId('event-1')).toBeInTheDocument();
      expect(screen.getByTestId('event-2')).toBeInTheDocument();
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(<CalendarGrid {...defaultProps} className="custom-grid" />);
      
      expect(container.firstChild).toHaveClass('custom-grid');
    });
  });

  describe('Event Interaction', () => {
    it('calls onEventClick when event is clicked', () => {
      const onEventClick = vi.fn();
      render(<CalendarGrid {...defaultProps} onEventClick={onEventClick} />);
      
      const eventButton = screen.getByTestId('event-1');
      fireEvent.click(eventButton);
      
      expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
    });

    it('handles multiple event clicks correctly', () => {
      const onEventClick = vi.fn();
      render(<CalendarGrid {...defaultProps} onEventClick={onEventClick} />);
      
      const event1Button = screen.getByTestId('event-1');
      const event2Button = screen.getByTestId('event-2');
      
      fireEvent.click(event1Button);
      fireEvent.click(event2Button);
      
      expect(onEventClick).toHaveBeenCalledTimes(2);
      expect(onEventClick).toHaveBeenNthCalledWith(1, mockEvents[0]);
      expect(onEventClick).toHaveBeenNthCalledWith(2, mockEvents[1]);
    });
  });

  describe('Accessibility', () => {
    it('has proper grid structure', () => {
      const { container } = render(<CalendarGrid {...defaultProps} />);
      
      const grid = container.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });

    it('renders day columns with proper structure', () => {
      render(<CalendarGrid {...defaultProps} />);
      
      // Check that all day columns are rendered
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayNames.forEach(dayName => {
        expect(screen.getByTestId(`day-column-${dayName}`)).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('renders days without events correctly', () => {
      const emptyWeekData: WeekData = {
        ...mockWeekData,
        days: mockWeekData.days.map(day => ({ ...day, events: [] })),
      };
      
      render(<CalendarGrid {...defaultProps} weekData={emptyWeekData} />);
      
      // Should still render all days
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayNames.forEach(dayName => {
        // Use getAllByText since day names appear in both header and body
        expect(screen.getAllByText(dayName)).toHaveLength(2);
      });
      
      // Should not render any events
      expect(screen.queryByTestId('event-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('event-2')).not.toBeInTheDocument();
    });
  });
});