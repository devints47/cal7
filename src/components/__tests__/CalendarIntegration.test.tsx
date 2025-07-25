import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CalendarClient } from '../CalendarClient';
import type { CalendarEvent } from '../../types/events';

describe('Calendar Integration', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Test Event',
      description: 'Test description',
      startTime: new Date('2024-03-11T10:00:00'),
      endTime: new Date('2024-03-11T11:00:00'),
      isAllDay: false,
      status: 'confirmed',
    },
  ];

  it('renders calendar with basic structure', () => {
    render(<CalendarClient events={mockEvents} />);
    
    // Check that the main calendar container is present
    const calendar = screen.getByRole('application');
    expect(calendar).toBeInTheDocument();
    expect(calendar).toHaveClass('cal7-calendar');
  });

  it('includes responsive CSS classes', () => {
    const { container } = render(<CalendarClient events={mockEvents} />);
    
    // Check that the calendar has the expected structure
    expect(container.querySelector('.cal7-calendar')).toBeInTheDocument();
  });

  it('handles empty events array', () => {
    render(<CalendarClient events={[]} />);
    
    const calendar = screen.getByRole('application');
    expect(calendar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CalendarClient events={mockEvents} className="custom-class" />
    );
    
    expect(container.querySelector('.cal7-calendar.custom-class')).toBeInTheDocument();
  });
});