import type { WeekData, DayData, CalendarEvent } from '../types/events';

/**
 * Gets the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Gets the end of the week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekEnd = new Date(date);
  weekEnd.setDate(date.getDate() + (6 - date.getDay()));
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
}

/**
 * Gets the current week data structure
 */
export function getCurrentWeek(date: Date = new Date()): WeekData {
  const startDate = getWeekStart(date);
  const endDate = getWeekEnd(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const days: DayData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.push({
      date: dayDate,
      dayName: dayNames[i],
      events: [],
      isToday: dayDate.getTime() === today.getTime(),
    });
  }
  
  return {
    startDate,
    endDate,
    days,
  };
}

/**
 * Gets the next week's start date
 */
export function getNextWeek(currentWeek: Date): Date {
  const nextWeek = new Date(currentWeek);
  nextWeek.setDate(currentWeek.getDate() + 7);
  return getWeekStart(nextWeek);
}

/**
 * Gets the previous week's start date
 */
export function getPreviousWeek(currentWeek: Date): Date {
  const previousWeek = new Date(currentWeek);
  previousWeek.setDate(currentWeek.getDate() - 7);
  return getWeekStart(previousWeek);
}

/**
 * Checks if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Formats time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date for display (e.g., "March 15, 2024")
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats date for short display (e.g., "Mar 15")
 */
export function formatDateShort(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculates duration between two dates
 */
export function calculateDuration(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) {
    return `${diffMinutes}m`;
  } else if (diffMinutes === 0) {
    return `${diffHours}h`;
  } else {
    return `${diffHours}h ${diffMinutes}m`;
  }
}

/**
 * Populates week data with events grouped by day
 */
export function populateWeekWithEvents(weekData: WeekData, events: CalendarEvent[]): WeekData {
  // Create a copy of the week data
  const populatedWeek: WeekData = {
    ...weekData,
    days: weekData.days.map(day => ({ ...day, events: [] })),
  };
  
  // Group events by day
  for (const event of events) {
    const eventDate = new Date(event.startTime);
    
    // Find the matching day
    const matchingDay = populatedWeek.days.find(day => 
      isSameDay(day.date, eventDate)
    );
    
    if (matchingDay) {
      matchingDay.events.push(event);
    }
  }
  
  // Sort events within each day by start time
  for (const day of populatedWeek.days) {
    day.events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
  
  return populatedWeek;
}

/**
 * Validates that a date is valid
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Gets the week number of the year for a given date
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Gets a human-readable week range string (e.g., "Jul 20 - 26, 2025")
 */
export function getWeekRangeString(weekStart: Date, locale: string = 'en-US'): string {
  const weekEnd = getWeekEnd(weekStart);
  
  // If same month
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    const month = weekStart.toLocaleDateString(locale, { 
      month: 'short'
    });
    const year = weekStart.getFullYear();
    return `${month} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${year}`;
  } else {
    // Different months
    const startStr = weekStart.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric' 
    });
    const endStr = weekEnd.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${startStr} - ${endStr}`;
  }
}

/**
 * Checks if a given week start date is the current week
 */
export function isCurrentWeek(weekStart: Date): boolean {
  const today = new Date();
  const currentWeekStart = getWeekStart(today);
  return weekStart.getTime() === currentWeekStart.getTime();
}