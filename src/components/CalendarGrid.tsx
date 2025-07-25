'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { WeekData, CalendarEvent } from '../types/events';
import type { CalendarTheme } from '../types/theme';
import { DayColumn } from './DayColumn';
import { LoadingStates } from './LoadingStates';

interface CalendarGridProps {
  weekData: WeekData;
  onEventClick: (event: CalendarEvent) => void;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
  timeZone?: string;
  loading?: boolean;
}

/**
 * CalendarGrid Component
 * 
 * Responsive calendar grid that displays weekly events using CSS Grid.
 * Adapts from 7-day desktop view to condensed mobile view.
 * Implements keyboard navigation between days and events.
 */
export function CalendarGrid({
  weekData,
  onEventClick,
  className = '',
  theme,
  locale = 'en-US',
  timeZone = 'UTC',
  loading = false,
}: CalendarGridProps) {
  const [focusedDayIndex, setFocusedDayIndex] = useState(0);
  const [focusedEventIndex, setFocusedEventIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Find today's index for initial focus
  useEffect(() => {
    const todayIndex = weekData.days.findIndex(day => day.isToday);
    if (todayIndex !== -1) {
      setFocusedDayIndex(todayIndex);
    }
  }, [weekData.days]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const currentDay = weekData.days[focusedDayIndex];
    const hasEvents = currentDay.events.length > 0;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (focusedDayIndex > 0) {
          setFocusedDayIndex(focusedDayIndex - 1);
          setFocusedEventIndex(0);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (focusedDayIndex < weekData.days.length - 1) {
          setFocusedDayIndex(focusedDayIndex + 1);
          setFocusedEventIndex(0);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (hasEvents && focusedEventIndex > 0) {
          setFocusedEventIndex(focusedEventIndex - 1);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (hasEvents && focusedEventIndex < currentDay.events.length - 1) {
          setFocusedEventIndex(focusedEventIndex + 1);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (hasEvents) {
          const focusedEvent = currentDay.events[focusedEventIndex];
          if (focusedEvent) {
            onEventClick(focusedEvent);
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        setFocusedDayIndex(0);
        setFocusedEventIndex(0);
        break;

      case 'End':
        event.preventDefault();
        setFocusedDayIndex(weekData.days.length - 1);
        setFocusedEventIndex(0);
        break;
    }
  }, [focusedDayIndex, focusedEventIndex, weekData.days, onEventClick]);

  // Handle day focus change
  const handleDayFocus = useCallback((dayIndex: number) => {
    setFocusedDayIndex(dayIndex);
    setFocusedEventIndex(0);
  }, []);

  // Handle event focus change
  const handleEventFocus = useCallback((dayIndex: number, eventIndex: number) => {
    setFocusedDayIndex(dayIndex);
    setFocusedEventIndex(eventIndex);
  }, []);

  if (loading) {
    return <LoadingStates type="calendar" className={className} />;
  }

  return (
    <div 
      ref={gridRef}
      className={`cal7-calendar-grid ${className}`}
      role="grid"
      aria-label={`Calendar grid for week starting ${weekData.startDate.toLocaleDateString(locale)}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Desktop: Column Headers */}
      <div className="cal7-calendar-grid__headers">
        {weekData.days.map((day, index) => (
          <div
            key={day.date.toISOString()}
            className={`cal7-calendar-grid__header ${day.isToday ? 'cal7-calendar-grid__header--today' : ''}`}
            role="columnheader"
          >
            <div className="cal7-calendar-grid__header-content">
              <span className="cal7-calendar-grid__day-name">
                {day.dayName}
              </span>
              <span className="cal7-calendar-grid__day-date">
                {day.date.getDate()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid Body */}
      <div className="cal7-calendar-grid__body" role="rowgroup">
        {weekData.days.map((day, dayIndex) => (
          <DayColumn
            key={day.date.toISOString()}
            day={day}
            dayIndex={dayIndex}
            onEventClick={onEventClick}
            onDayFocus={handleDayFocus}
            onEventFocus={handleEventFocus}
            isFocused={dayIndex === focusedDayIndex}
            focusedEventIndex={dayIndex === focusedDayIndex ? focusedEventIndex : -1}
            className="cal7-calendar-grid__day"
            theme={theme}
            locale={locale}
            timeZone={timeZone}
          />
        ))}
      </div>

      {/* Screen reader instructions */}
      <div className="cal7-sr-only" aria-live="polite">
        Use arrow keys to navigate between days and events. Press Enter or Space to open event details.
      </div>
    </div>
  );
}