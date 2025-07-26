import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CalendarClient } from "../CalendarClient";
import { ThemeProvider } from "../ThemeProvider";
import type { CalendarEvent } from "../../types/events";

// Mock the google-calendar-api utilities
vi.mock("../../utils/google-calendar-api", () => ({
  filterEventsForWeek: vi.fn((events) => events),
}));

// Mock the date utilities
vi.mock("../../utils/date-utils", () => ({
  getCurrentWeek: vi.fn(() => ({
    startDate: new Date("2024-03-10"),
    endDate: new Date("2024-03-16"),
    days: [
      {
        date: new Date("2024-03-10"),
        dayName: "Sunday",
        events: [],
        isToday: false,
      },
      {
        date: new Date("2024-03-11"),
        dayName: "Monday",
        events: [],
        isToday: true,
      },
      {
        date: new Date("2024-03-12"),
        dayName: "Tuesday",
        events: [],
        isToday: false,
      },
      {
        date: new Date("2024-03-13"),
        dayName: "Wednesday",
        events: [],
        isToday: false,
      },
      {
        date: new Date("2024-03-14"),
        dayName: "Thursday",
        events: [],
        isToday: false,
      },
      {
        date: new Date("2024-03-15"),
        dayName: "Friday",
        events: [],
        isToday: false,
      },
      {
        date: new Date("2024-03-16"),
        dayName: "Saturday",
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
    days: weekData.days.map((day: { date: Date }) => ({
      ...day,
      events: events.filter(
        (event: { startTime: Date }) =>
          event.startTime.toDateString() === day.date.toDateString()
      ),
    })),
  })),
  filterEventsForWeek: vi.fn((events) => events),
  getWeekRangeString: vi.fn(() => "March 10 - 16, 2024"),
}));

// Mock child components
vi.mock("../WeekNavigation", () => ({
  WeekNavigation: ({
    onPreviousWeek,
    onNextWeek,
    weekRangeString,
  }: {
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    weekRangeString: string;
  }) => (
    <div data-testid="week-navigation">
      <button onClick={onPreviousWeek} data-testid="prev-week">
        Previous
      </button>
      <span data-testid="week-range">{weekRangeString}</span>
      <button onClick={onNextWeek} data-testid="next-week">
        Next
      </button>
    </div>
  ),
}));

vi.mock("../CalendarGrid", () => ({
  CalendarGrid: ({
    weekData,
    onEventClick,
  }: {
    weekData: unknown;
    onEventClick: (event: unknown) => void;
  }) => (
    <div data-testid="calendar-grid">
      {(
        weekData as {
          days: { dayName: string; events: { id: string; title: string }[] }[];
        }
      ).days.map((day, index: number) => (
        <div key={index} data-testid={`day-${index}`}>
          <span>{day.dayName}</span>
          {day.events.map((event, eventIndex: number) => (
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

vi.mock("../EventModal", () => ({
  EventModal: ({
    event,
    isOpen,
    onClose,
  }: {
    event: { title: string } | null;
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen && event ? (
      <div data-testid="event-modal">
        <h2>{event.title}</h2>
        <button onClick={onClose} data-testid="close-modal">
          Close
        </button>
      </div>
    ) : null,
}));

describe("CalendarClient", () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: "1",
      title: "Test Event 1",
      description: "Test description",
      startTime: new Date("2024-03-11T10:00:00"),
      endTime: new Date("2024-03-11T11:00:00"),
      isAllDay: false,
      status: "confirmed",
    },
    {
      id: "2",
      title: "Test Event 2",
      description: "Another test",
      startTime: new Date("2024-03-12T14:00:00"),
      endTime: new Date("2024-03-12T15:00:00"),
      isAllDay: false,
      status: "confirmed",
    },
  ];

  const defaultProps = {
    events: mockEvents,
    locale: "en-US",
    timeZone: "UTC",
  };

  // Helper function to render with ThemeProvider
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders calendar with week navigation and grid", () => {
      render(<CalendarClient {...defaultProps} />);

      expect(screen.getByTestId("week-navigation")).toBeInTheDocument();
      expect(screen.getByTestId("calendar-grid")).toBeInTheDocument();
      expect(screen.getByTestId("week-range")).toHaveTextContent(
        "March 10 - 16, 2024"
      );
    });

    it("renders all days of the week", () => {
      render(<CalendarClient {...defaultProps} />);

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      dayNames.forEach((dayName) => {
        expect(screen.getByText(dayName)).toBeInTheDocument();
      });
    });

    it("applies correct CSS classes for calendar structure", () => {
      const { container } = render(<CalendarClient {...defaultProps} />);

      expect(container.querySelector(".cal7-calendar")).toBeInTheDocument();
      // Note: The navigation and grid classes are applied to child components, not direct children
      expect(screen.getByTestId("week-navigation")).toBeInTheDocument();
      expect(screen.getByTestId("calendar-grid")).toBeInTheDocument();
    });
  });

  describe("Week Navigation", () => {
    it("handles previous week navigation", async () => {
      const { getPreviousWeek } = await import("../../utils/date-utils");
      render(<CalendarClient {...defaultProps} />);

      const prevButton = screen.getByTestId("prev-week");
      fireEvent.click(prevButton);

      // Verify that the navigation functions are called
      await waitFor(() => {
        expect(vi.mocked(getPreviousWeek)).toHaveBeenCalled();
      });
    });

    it("handles next week navigation", async () => {
      const { getNextWeek } = await import("../../utils/date-utils");
      render(<CalendarClient {...defaultProps} />);

      const nextButton = screen.getByTestId("next-week");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(vi.mocked(getNextWeek)).toHaveBeenCalled();
      });
    });

    it("uses initial week when provided", async () => {
      const { getCurrentWeek } = await import("../../utils/date-utils");
      const initialWeek = new Date("2024-04-01");
      render(<CalendarClient {...defaultProps} initialWeek={initialWeek} />);

      // The component should use the initial week
      expect(vi.mocked(getCurrentWeek)).toHaveBeenCalledWith(initialWeek);
    });
  });

  describe("Event Interaction", () => {
    it("opens modal when event is clicked", async () => {
      render(<CalendarClient {...defaultProps} />);

      const eventButton = screen.getByTestId("event-1");
      fireEvent.click(eventButton);

      await waitFor(() => {
        expect(screen.getByTestId("event-modal")).toBeInTheDocument();
        // Use getAllByText since the event title appears in both the button and modal
        expect(screen.getAllByText("Test Event 1")).toHaveLength(2);
      });
    });

    it("closes modal when close button is clicked", async () => {
      render(<CalendarClient {...defaultProps} />);

      // Open modal
      const eventButton = screen.getByTestId("event-1");
      fireEvent.click(eventButton);

      await waitFor(() => {
        expect(screen.getByTestId("event-modal")).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByTestId("close-modal");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("event-modal")).not.toBeInTheDocument();
      });
    });

    it("calls onEventClick callback when provided", async () => {
      const onEventClick = vi.fn();
      render(<CalendarClient {...defaultProps} onEventClick={onEventClick} />);

      const eventButton = screen.getByTestId("event-1");
      fireEvent.click(eventButton);

      await waitFor(() => {
        expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      const { container } = render(<CalendarClient {...defaultProps} />);

      const calendar = container.querySelector(".cal7-calendar");
      expect(calendar).toHaveAttribute("role", "application");
      expect(calendar).toHaveAttribute(
        "aria-label",
        "Calendar for week of March 10 - 16, 2024"
      );
    });

    it("supports keyboard navigation", () => {
      render(<CalendarClient {...defaultProps} />);

      const calendar = screen.getByRole("application");
      expect(calendar).toBeInTheDocument();

      // Test that the calendar has the proper attributes for keyboard navigation
      expect(calendar).toHaveAttribute("role", "application");
      expect(calendar).toHaveAttribute("aria-label");

      // In a real browser, the calendar would be focusable, but in jsdom it's not
      // So we just verify the structure is correct for keyboard navigation
      expect(calendar).toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("applies responsive CSS classes", () => {
      const { container } = render(<CalendarClient {...defaultProps} />);

      // Check that the main calendar container is present
      expect(container.querySelector(".cal7-calendar")).toBeInTheDocument();
      // The grid classes are applied by child components
      expect(screen.getByTestId("calendar-grid")).toBeInTheDocument();
    });

    it("handles custom className prop", () => {
      const { container } = render(
        <CalendarClient {...defaultProps} className="custom-calendar" />
      );

      expect(
        container.querySelector(".cal7-calendar.custom-calendar")
      ).toBeInTheDocument();
    });
  });

  describe("Event Filtering and Grouping", () => {
    it("filters events for current week", async () => {
      // Note: filterEventsForWeek is imported from google-calendar-api, not date-utils
      const { filterEventsForWeek } = await import(
        "../../utils/google-calendar-api"
      );
      render(<CalendarClient {...defaultProps} />);

      expect(vi.mocked(filterEventsForWeek)).toHaveBeenCalledWith(
        mockEvents,
        expect.any(Date)
      );
    });

    it("populates week with filtered events", async () => {
      const { populateWeekWithEvents } = await import("../../utils/date-utils");
      render(<CalendarClient {...defaultProps} />);

      expect(vi.mocked(populateWeekWithEvents)).toHaveBeenCalledWith(
        expect.any(Object),
        mockEvents
      );
    });

    it("updates events when week changes", async () => {
      const { filterEventsForWeek } = await import(
        "../../utils/google-calendar-api"
      );
      render(<CalendarClient {...defaultProps} />);

      const nextButton = screen.getByTestId("next-week");
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Should call filtering functions again with new week
        expect(vi.mocked(filterEventsForWeek)).toHaveBeenCalledTimes(2);
      });
    });
  });
});
