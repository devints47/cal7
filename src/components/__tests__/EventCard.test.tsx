import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EventCard } from '../EventCard';
import type { CalendarEvent } from '../../types/events';

// Extend Jest matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Mock event data for testing
const mockEvent: CalendarEvent = {
  id: 'test-event-1',
  title: 'Test Event',
  description: 'This is a test event description that should be displayed in the card.',
  location: 'Test Location',
  startTime: new Date(2024, 2, 15, 14, 30), // March 15, 2024, 2:30 PM
  endTime: new Date(2024, 2, 15, 16, 0), // March 15, 2024, 4:00 PM
  isAllDay: false,
  status: 'confirmed' as const,
  url: 'https://example.com/event',
  attendees: [
    { email: 'test@example.com', name: 'Test User', status: 'accepted' as const }
  ]
};

const mockAllDayEvent: CalendarEvent = {
  ...mockEvent,
  id: 'test-event-2',
  title: 'All Day Event',
  startTime: new Date(2024, 2, 15, 0, 0),
  endTime: new Date(2024, 2, 15, 23, 59),
  isAllDay: true,
  description: undefined,
  location: undefined,
};

const mockTentativeEvent: CalendarEvent = {
  ...mockEvent,
  id: 'test-event-3',
  title: 'Tentative Event',
  status: 'tentative' as const,
};

const mockCancelledEvent: CalendarEvent = {
  ...mockEvent,
  id: 'test-event-4',
  title: 'Cancelled Event',
  status: 'cancelled' as const,
};

describe('EventCard', () => {
  const mockOnClick = vi.fn();
  const mockOnFocus = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any live regions that might have been created
    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => {
      if (region.className === 'cal7-sr-only') {
        region.remove();
      }
    });
  });

  describe('Basic Rendering', () => {
    it('renders event title and basic information', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText(/2:30 PM - 4:00 PM/)).toBeInTheDocument();
      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });

    it('renders in compact mode with limited information', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
          compact={true}
        />
      );

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText(/2:30 PM/)).toBeInTheDocument();
      expect(screen.queryByText('Test Location')).not.toBeInTheDocument();
      expect(screen.queryByText(/This is a test event description/)).not.toBeInTheDocument();
    });

    it('renders all day events correctly', () => {
      render(
        <EventCard
          event={mockAllDayEvent}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('All Day Event')).toBeInTheDocument();
      expect(screen.getByText('All day')).toBeInTheDocument();
    });

    it('renders event status indicators', () => {
      const { rerender } = render(
        <EventCard
          event={mockTentativeEvent}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Tentative')).toBeInTheDocument();

      rerender(
        <EventCard
          event={mockCancelledEvent}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('Interaction Handling', () => {
    it('calls onClick when clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      await user.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
    });

    it('calls onClick when Enter key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
    });

    it('calls onClick when Space key is pressed', async () => {
      const user = userEvent.setup();
      
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      
      expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
    });

    it('does not trigger onClick for other keys', async () => {
      const user = userEvent.setup();
      
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{ArrowDown}');
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('calls onFocus when focused', async () => {
      const user = userEvent.setup();
      
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
          onFocus={mockOnFocus}
        />
      );

      await user.tab();
      expect(mockOnFocus).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA attributes', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label');
      expect(card).toHaveAttribute('aria-describedby');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('provides comprehensive aria-label', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const card = screen.getByRole('button');
      const ariaLabel = card.getAttribute('aria-label');
      
      expect(ariaLabel).toContain('Test Event');
      expect(ariaLabel).toContain('Friday, March 15');
      expect(ariaLabel).toContain('2:30 PM to 4:00 PM');
      expect(ariaLabel).toContain('Test Location');
      expect(ariaLabel).toContain('Press Enter or Space');
    });

    it('has proper semantic HTML structure', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
      expect(screen.getByRole('time')).toBeInTheDocument();
    });

    it('has proper time element with datetime attribute', () => {
      render(
        <EventCard
          event={mockEvent}
          onClick={mockOnClick}
        />
      );

      const timeElement = screen.getByRole('time');
      expect(timeElement).toHaveAttribute('dateTime', mockEvent.startTime.toISOString());
      expect(timeElement).toHaveAttribute('title');
    });
  });

  describe('Keyboard Navigation', () => {
    it('is focusable with tab key', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Before</button>
          <EventCard
            event={mockEvent}
            onClick={mockOnClick}
          />
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByText('Before');
      const card = screen.getByRole('button', { name: /Test Event/ });
      const afterButton = screen.getByText('After');

      beforeButton.focus();
      await user.tab();
      expect(card).toHaveFocus();
      
      await user.tab();
      expect(afterButton).toHaveFocus();
    });

    it('supports reverse tab navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>Before</button>
          <EventCard
            event={mockEvent}
            onClick={mockOnClick}
          />
          <button>After</button>
        </div>
      );

      const beforeButton = screen.getByText('Before');
      const card = screen.getByRole('button', { name: /Test Event/ });
      const afterButton = screen.getByText('After');

      afterButton.focus();
      await user.tab({ shift: true });
      expect(card).toHaveFocus();
      
      await user.tab({ shift: true });
      expect(beforeButton).toHaveFocus();
    });
  });
});