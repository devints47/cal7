'use client';

import { useState, useMemo } from 'react';
import '../styles/calendar.css';
import '../styles/calendar-grid.css';
import type { CalendarClientProps } from '../types/calendar';
import type { CalendarEvent } from '../types/events';
import { 
  getCurrentWeek, 
  getNextWeek, 
  getPreviousWeek, 
  populateWeekWithEvents,
  getWeekRangeString
} from '../utils/date-utils';
import { filterEventsForWeek } from '../utils/google-calendar-api';
import { WeekNavigation } from './WeekNavigation';
import { CalendarGrid } from './CalendarGrid';
import { EventModal } from './EventModal';
import { EventModalErrorBoundary } from './CalendarErrorBoundary';
import { useThemeClasses } from './ThemeProvider';

/**
 * CalendarClient Component
 * 
 * Client-side calendar component that handles user interactions and state management.
 * Manages week navigation, event selection, and modal display with keyboard navigation.
 * Implements responsive layout logic for different screen sizes.
 */
export function CalendarClient({
  events,
  initialWeek,
  className = '',
  locale = 'en-US',
  timeZone = 'UTC',
  onEventClick,
}: CalendarClientProps) {
  // Get theme classes
  const themeClasses = useThemeClasses();
  // State management
  const [currentWeek, setCurrentWeek] = useState<Date>(
    initialWeek ? new Date(initialWeek) : new Date()
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current week data structure
  const weekData = useMemo(() => getCurrentWeek(currentWeek), [currentWeek]);
  
  // Filter events for current week
  const weekEvents = useMemo(() => 
    filterEventsForWeek(events, weekData.startDate), 
    [events, weekData.startDate]
  );
  
  // Populate week with events
  const weekWithEvents = useMemo(() => 
    populateWeekWithEvents(weekData, weekEvents), 
    [weekData, weekEvents]
  );

  // Navigation handlers
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => getPreviousWeek(prev));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => getNextWeek(prev));
  };

  const handleWeekChange = (newWeek: Date) => {
    setCurrentWeek(newWeek);
  };

  // Event interaction handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    
    // Call optional external handler
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Generate week range string for accessibility
  const weekRangeString = getWeekRangeString(weekData.startDate, locale);

  return (
    <div 
      className={`${themeClasses.calendar} ${className}`}
      role="application"
      aria-label={`Calendar for week of ${weekRangeString}`}
    >
      {/* Week Navigation */}
      <WeekNavigation
        currentWeek={currentWeek}
        onWeekChange={handleWeekChange}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        weekRangeString={weekRangeString}
        className={`${themeClasses.calendar}__navigation`}
        locale={locale}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        weekData={weekWithEvents}
        onEventClick={handleEventClick}
        className={`${themeClasses.calendar}__grid`}
        locale={locale}
        timeZone={timeZone}
      />

      {/* Event Modal with Error Boundary */}
      <EventModalErrorBoundary onClose={handleModalClose}>
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          timeZone={timeZone}
          locale={locale}
          showAddToCalendar={true}
        />
      </EventModalErrorBoundary>
    </div>
  );
}