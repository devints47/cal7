'use client';

import { useRef, useEffect } from 'react';
import type { DayData, CalendarEvent } from '../types/events';
import type { CalendarTheme } from '../types/theme';
import { EventCard } from './EventCard';
import { formatDateShort } from '../utils/date-utils';

interface DayColumnProps {
  day: DayData;
  dayIndex: number;
  onEventClick: (event: CalendarEvent) => void;
  onDayFocus: (dayIndex: number) => void;
  onEventFocus: (dayIndex: number, eventIndex: number) => void;
  isFocused: boolean;
  focusedEventIndex: number;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
  timeZone?: string;
}

/**
 * DayColumn Component
 * 
 * Displays events for a single day in chronological order.
 * Handles focus management and provides empty state messaging.
 * Responsive design adapts between desktop grid and mobile stack layouts.
 */
export function DayColumn({
  day,
  dayIndex,
  onEventClick,
  onDayFocus,
  onEventFocus,
  isFocused,
  focusedEventIndex,
  className = '',
  theme,
  locale = 'en-US',
  timeZone = 'UTC',
}: DayColumnProps) {
  const dayRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Focus management
  useEffect(() => {
    if (isFocused && dayRef.current) {
      if (day.events.length === 0) {
        // Focus the day container if no events
        dayRef.current.focus();
      } else if (focusedEventIndex >= 0 && eventRefs.current[focusedEventIndex]) {
        // Focus the specific event
        eventRefs.current[focusedEventIndex]?.focus();
      }
    }
  }, [isFocused, focusedEventIndex, day.events.length]);

  // Handle day click/focus
  const handleDayClick = () => {
    onDayFocus(dayIndex);
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent, eventIndex: number) => {
    onEventFocus(dayIndex, eventIndex);
    onEventClick(event);
  };

  // Handle event focus (for keyboard navigation)
  const handleEventFocus = (eventIndex: number) => {
    onEventFocus(dayIndex, eventIndex);
  };

  // Generate accessible day description
  const dayDescription = `${day.dayName}, ${formatDateShort(day.date, locale)}${day.isToday ? ', today' : ''}, ${day.events.length} event${day.events.length !== 1 ? 's' : ''}`;

  return (
    <div
      ref={dayRef}
      className={`cal7-day-column ${className} ${day.isToday ? 'cal7-day-column--today' : ''} ${isFocused ? 'cal7-day-column--focused' : ''}`}
      role="gridcell"
      aria-label={dayDescription}
      tabIndex={isFocused && day.events.length === 0 ? 0 : -1}
      onClick={handleDayClick}
    >
      {/* Mobile: Day Header (hidden on desktop) */}
      <div className="cal7-day-column__mobile-header">
        <div className="cal7-day-column__mobile-header-content">
          <h3 className="cal7-day-column__mobile-day-name">
            {day.dayName}
          </h3>
          <p className="cal7-day-column__mobile-day-date">
            {formatDateShort(day.date, locale)}
          </p>
          {day.isToday && (
            <span className="cal7-day-column__today-indicator">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Events Container */}
      <div 
        className="cal7-day-column__events"
        role="list"
        aria-label={`Events for ${day.dayName}`}
      >
        {day.events.length > 0 ? (
          day.events.map((event, eventIndex) => (
            <div
              key={event.id}
              ref={el => eventRefs.current[eventIndex] = el}
              role="listitem"
            >
              <EventCard
                event={event}
                onClick={(event) => handleEventClick(event, eventIndex)}
                onFocus={() => handleEventFocus(eventIndex)}
                compact={true}
                isFocused={isFocused && focusedEventIndex === eventIndex}
                className="cal7-day-column__event"
                theme={theme}
                locale={locale}
                timeZone={timeZone}
              />
            </div>
          ))
        ) : (
          <EmptyDayState 
            day={day} 
            className="cal7-day-column__empty"
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

/**
 * EmptyDayState Component
 * 
 * Displays appropriate messaging when a day has no events.
 */
interface EmptyDayStateProps {
  day: DayData;
  className?: string;
  locale?: string;
}

function EmptyDayState({ day, className = '', locale = 'en-US' }: EmptyDayStateProps) {
  const today = new Date();
  const isPast = day.date < today;
  const isToday = day.isToday;
  
  let message = 'No events';
  
  if (isToday) {
    message = 'No events today';
  } else if (isPast) {
    message = 'No events';
  } else {
    message = 'No events scheduled';
  }

  return (
    <div 
      className={`cal7-empty-day ${className}`}
      role="status"
      aria-label={`${message} for ${day.dayName}`}
    >
      <div className="cal7-empty-day__content">
        <span className="cal7-empty-day__message">
          {message}
        </span>
      </div>
    </div>
  );
}