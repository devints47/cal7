import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventModal } from "../EventModal";
import type { CalendarEvent } from "../../types/events";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock focus-trap
vi.mock("focus-trap", () => ({
  createFocusTrap: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
  })),
}));

// Mock scrollbar width calculation
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  value: 100,
});

describe("EventModal", () => {
  const mockEvent: CalendarEvent = {
    id: "1",
    title: "Test Event",
    description: "This is a test event description",
    location: "Test Location",
    startTime: new Date("2024-01-15T10:00:00Z"),
    endTime: new Date("2024-01-15T11:30:00Z"),
    isAllDay: false,
    status: "confirmed",
    url: "https://calendar.google.com/event/test",
    attendees: [
      {
        email: "john@example.com",
        name: "John Doe",
        status: "accepted",
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        status: "tentative",
      },
    ],
  };

  const mockAllDayEvent: CalendarEvent = {
    id: "2",
    title: "All Day Event",
    description: "This is an all day event",
    startTime: new Date("2024-01-15T00:00:00Z"),
    endTime: new Date("2024-01-15T23:59:59Z"),
    isAllDay: true,
    status: "confirmed",
  };

  const defaultProps = {
    event: mockEvent,
    isOpen: true,
    onClose: vi.fn(),
    timeZone: "America/New_York",
    locale: "en-US",
    showAddToCalendar: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body styles
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  afterEach(() => {
    // Clean up body styles
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  describe("Rendering", () => {
    it("renders nothing when isOpen is false", () => {
      render(<EventModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders nothing when event is null", () => {
      render(<EventModal {...defaultProps} event={null} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders modal with event details when open", () => {
      render(<EventModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(
        screen.getByText("This is a test event description")
      ).toBeInTheDocument();
      expect(screen.getByText("Test Location")).toBeInTheDocument();
    });

    it("renders all day event badge for all day events", () => {
      render(<EventModal {...defaultProps} event={mockAllDayEvent} />);

      expect(screen.getAllByText("All Day Event")).toHaveLength(3); // Title, badge, and time display
    });

    it("renders attendees list when attendees exist", () => {
      render(<EventModal {...defaultProps} />);

      expect(screen.getByText("Attendees (2)")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("(accepted)")).toBeInTheDocument();
      expect(screen.getByText("(tentative)")).toBeInTheDocument();
    });

    it("truncates attendees list when more than 5 attendees", () => {
      const eventWithManyAttendees = {
        ...mockEvent,
        attendees: Array.from({ length: 7 }, (_, i) => ({
          email: `user${i}@example.com`,
          name: `User ${i}`,
          status: "accepted" as const,
        })),
      };

      render(<EventModal {...defaultProps} event={eventWithManyAttendees} />);

      expect(screen.getByText("Attendees (7)")).toBeInTheDocument();
      expect(screen.getByText("+2 more")).toBeInTheDocument();
    });

    it("hides add to calendar button when showAddToCalendar is false", () => {
      render(<EventModal {...defaultProps} showAddToCalendar={false} />);

      expect(
        screen.queryByText("View in Google Calendar")
      ).not.toBeInTheDocument();
    });

    it("hides add to calendar button when event has no URL", () => {
      const eventWithoutUrl = { ...mockEvent, url: undefined };
      render(<EventModal {...defaultProps} event={eventWithoutUrl} />);

      expect(
        screen.queryByText("View in Google Calendar")
      ).not.toBeInTheDocument();
    });
  });

  describe("Focus Management", () => {
    it("creates and activates focus trap when modal opens", async () => {
      const { createFocusTrap } = await import("focus-trap");
      const mockCreateFocusTrap = vi.mocked(createFocusTrap);

      render(<EventModal {...defaultProps} />);

      expect(mockCreateFocusTrap).toHaveBeenCalled();
    });

    it("deactivates focus trap when modal closes", async () => {
      const { createFocusTrap } = await import("focus-trap");
      const mockCreateFocusTrap = vi.mocked(createFocusTrap);
      const mockDeactivate = vi.fn();

      mockCreateFocusTrap.mockReturnValue({
        activate: vi.fn(),
        deactivate: mockDeactivate,
      } as unknown);

      const { rerender } = render(<EventModal {...defaultProps} />);

      rerender(<EventModal {...defaultProps} isOpen={false} />);

      expect(mockDeactivate).toHaveBeenCalled();
    });

    it("prevents body scroll when modal is open", () => {
      render(<EventModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe("hidden");
      expect(document.body.style.paddingRight).toBe("0px"); // Mocked scrollbar width
    });

    it("restores body scroll when modal closes", () => {
      const { rerender } = render(<EventModal {...defaultProps} />);

      rerender(<EventModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe("");
      expect(document.body.style.paddingRight).toBe("");
    });

    it("stores and restores focus to triggering element", async () => {
      // Create a button to simulate the triggering element
      const triggerButton = document.createElement("button");
      triggerButton.textContent = "Open Modal";
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      const { rerender } = render(<EventModal {...defaultProps} />);

      // Close the modal
      rerender(<EventModal {...defaultProps} isOpen={false} />);

      await waitFor(() => {
        expect(document.activeElement).toBe(triggerButton);
      });

      document.body.removeChild(triggerButton);
    });
  });

  describe("Keyboard Navigation", () => {
    it("closes modal when Escape key is pressed", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("does not close modal for other keys", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Enter" });
      fireEvent.keyDown(document, { key: "Tab" });
      fireEvent.keyDown(document, { key: "Space" });

      expect(onClose).not.toHaveBeenCalled();
    });

    it("allows tabbing between interactive elements", async () => {
      const user = userEvent.setup();
      render(<EventModal {...defaultProps} />);

      const closeButton = screen.getByLabelText("Close event details modal");
      const actionCloseButton = screen.getByText("Close");
      const calendarLink = screen.getByText("View in Google Calendar");

      // Tab through elements
      await user.tab();
      expect(closeButton).toHaveFocus();

      await user.tab();
      expect(actionCloseButton).toHaveFocus();

      await user.tab();
      expect(calendarLink).toHaveFocus();
    });
  });

  describe("Mouse Interactions", () => {
    it("closes modal when backdrop is clicked", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      const backdrop = screen.getByRole("presentation");
      fireEvent.click(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it("does not close modal when modal content is clicked", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      const modalContent = screen.getByRole("dialog");
      fireEvent.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes modal when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText("Close event details modal");
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it("closes modal when action close button is clicked", async () => {
      const onClose = vi.fn();
      render(<EventModal {...defaultProps} onClose={onClose} />);

      const actionCloseButton = screen.getByText("Close");
      fireEvent.click(actionCloseButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("Date and Time Formatting", () => {
    it("formats dates according to locale and timezone", () => {
      render(
        <EventModal
          {...defaultProps}
          locale="en-US"
          timeZone="America/New_York"
        />
      );

      // Check that date is formatted (exact format may vary by environment)
      expect(screen.getByText(/Monday.*January.*15.*2024/)).toBeInTheDocument();
    });

    it("formats time for non-all-day events", () => {
      render(<EventModal {...defaultProps} />);

      // Should show time range and duration
      expect(screen.getByText(/AM.*-.*AM/)).toBeInTheDocument();
      expect(screen.getByText(/1 hour 30 minutes/)).toBeInTheDocument();
    });

    it('shows "All Day Event" for all-day events', () => {
      render(<EventModal {...defaultProps} event={mockAllDayEvent} />);

      expect(screen.getAllByText("All Day Event")).toHaveLength(3); // Title, badge, and time display
    });

    it("calculates duration correctly for different time spans", () => {
      const shortEvent = {
        ...mockEvent,
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T10:30:00Z"),
      };

      render(<EventModal {...defaultProps} event={shortEvent} />);

      expect(screen.getByText("(30 minutes)")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(<EventModal {...defaultProps} />);

      const modal = screen.getByRole("dialog");
      expect(modal).toHaveAttribute("aria-modal", "true");
      expect(modal).toHaveAttribute("aria-labelledby", "cal7-modal-title");
      expect(modal).toHaveAttribute(
        "aria-describedby",
        "cal7-modal-description"
      );
    });

    it("has accessible close button", () => {
      render(<EventModal {...defaultProps} />);

      const closeButton = screen.getByLabelText("Close event details modal");
      expect(closeButton).toBeInTheDocument();
    });

    it("meets accessibility standards", async () => {
      const { container } = render(<EventModal {...defaultProps} />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    it("has proper heading hierarchy", () => {
      render(<EventModal {...defaultProps} />);

      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toHaveTextContent("Test Event");

      const aboutHeading = screen.getByRole("heading", { level: 3 });
      expect(aboutHeading).toHaveTextContent("About This Event");
    });
  });

  describe("Error Handling", () => {
    it("handles missing event properties gracefully", () => {
      const minimalEvent: CalendarEvent = {
        id: "1",
        title: "Minimal Event",
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T11:00:00Z"),
        isAllDay: false,
        status: "confirmed",
      };

      render(<EventModal {...defaultProps} event={minimalEvent} />);

      expect(screen.getByText("Minimal Event")).toBeInTheDocument();
      expect(screen.queryByText("About This Event")).not.toBeInTheDocument();
      expect(screen.queryByText("Attendees")).not.toBeInTheDocument();
    });

    it("handles focus trap creation failure gracefully", async () => {
      const { createFocusTrap } = await import("focus-trap");
      const mockCreateFocusTrap = vi.mocked(createFocusTrap);

      mockCreateFocusTrap.mockImplementationOnce(() => {
        throw new Error("Focus trap failed");
      });

      // Should not crash
      expect(() => {
        render(<EventModal {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe("Performance", () => {
    it("does not render when closed to avoid unnecessary DOM", () => {
      const { container } = render(
        <EventModal {...defaultProps} isOpen={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("cleans up event listeners when unmounted", () => {
      const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

      const { unmount } = render(<EventModal {...defaultProps} />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });
});
