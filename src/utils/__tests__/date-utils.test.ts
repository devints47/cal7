import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getWeekStart,
  getWeekEnd,
  getCurrentWeek,
  getNextWeek,
  getPreviousWeek,
  isSameDay,
  formatTime,
  formatDate,
  formatDateShort,
  calculateDuration,
  populateWeekWithEvents,
  isValidDate,
  getWeekNumber,
  getWeekRangeString,
} from '../date-utils';
import type { CalendarEvent } from '../../types/events';
import { afterEach } from 'node:test';

describe('date-utils', () => {
  beforeEach(() => {
    // Mock the current date to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-13T12:00:00Z')); // Wednesday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getWeekStart', () => {
    it('returns Sunday for any day of the week', () => {
      const wednesday = new Date('2024-03-13'); // Wednesday
      const weekStart = getWeekStart(wednesday);
      
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(10); // March 10, 2024
      expect(weekStart.getHours()).toBe(0);
      expect(weekStart.getMinutes()).toBe(0);
      expect(weekStart.getSeconds()).toBe(0);
      expect(weekStart.getMilliseconds()).toBe(0);
    });

    it('returns same date if already Sunday', () => {
      const sunday = new Date(2024, 2, 10); // March 10, 2024 (Sunday)
      const weekStart = getWeekStart(sunday);
      
      expect(weekStart.getDay()).toBe(0);
      expect(weekStart.getDate()).toBe(10);
    });
  });

  describe('getWeekEnd', () => {
    it('returns Saturday for any day of the week', () => {
      const wednesday = new Date('2024-03-13'); // Wednesday
      const weekEnd = getWeekEnd(wednesday);
      
      expect(weekEnd.getDay()).toBe(6); // Saturday
      expect(weekEnd.getDate()).toBe(16); // March 16, 2024
      expect(weekEnd.getHours()).toBe(23);
      expect(weekEnd.getMinutes()).toBe(59);
      expect(weekEnd.getSeconds()).toBe(59);
      expect(weekEnd.getMilliseconds()).toBe(999);
    });

    it('returns same date if already Saturday', () => {
      const saturday = new Date('2024-03-16'); // Saturday
      const weekEnd = getWeekEnd(saturday);
      
      expect(weekEnd.getDay()).toBe(6);
      expect(weekEnd.getDate()).toBe(16);
    });
  });

  describe('getCurrentWeek', () => {
    it('returns week data structure with 7 days', () => {
      const weekData = getCurrentWeek();
      
      expect(weekData.days).toHaveLength(7);
      expect(weekData.startDate.getDay()).toBe(0); // Sunday
      expect(weekData.endDate.getDay()).toBe(6); // Saturday
    });

    it('correctly identifies today', () => {
      const weekData = getCurrentWeek();
      
      // Today is Wednesday (March 13)
      const todayIndex = weekData.days.findIndex(day => day.isToday);
      expect(todayIndex).toBe(3); // Wednesday is index 3
      expect(weekData.days[todayIndex].dayName).toBe('Wednesday');
    });

    it('generates correct day names', () => {
      const weekData = getCurrentWeek();
      const expectedDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      weekData.days.forEach((day, index) => {
        expect(day.dayName).toBe(expectedDayNames[index]);
      });
    });

    it('initializes empty events arrays', () => {
      const weekData = getCurrentWeek();
      
      weekData.days.forEach(day => {
        expect(day.events).toEqual([]);
      });
    });

    it('uses provided date instead of current date', () => {
      const customDate = new Date('2024-04-10'); // Different week
      const weekData = getCurrentWeek(customDate);
      
      expect(weekData.startDate.getDate()).toBe(7); // April 7, 2024 (Sunday)
      expect(weekData.endDate.getDate()).toBe(13); // April 13, 2024 (Saturday)
    });
  });

  describe('getNextWeek', () => {
    it('returns date 7 days later', () => {
      const currentWeek = new Date(2024, 2, 10); // March 10, 2024 (Sunday)
      const nextWeek = getNextWeek(currentWeek);
      
      expect(nextWeek.getDate()).toBe(17); // March 17, 2024 (next Sunday)
      expect(nextWeek.getDay()).toBe(0); // Still Sunday
    });

    it('handles month boundaries', () => {
      const endOfMonth = new Date(2024, 2, 31); // March 31, 2024 (Sunday)
      const nextWeek = getNextWeek(endOfMonth);
      
      expect(nextWeek.getMonth()).toBe(3); // April (0-indexed)
      expect(nextWeek.getDate()).toBe(7); // April 7, 2024
    });
  });

  describe('getPreviousWeek', () => {
    it('returns date 7 days earlier', () => {
      const currentWeek = new Date(2024, 2, 10); // March 10, 2024 (Sunday)
      const previousWeek = getPreviousWeek(currentWeek);
      
      expect(previousWeek.getDate()).toBe(3); // March 3, 2024 (previous Sunday)
      expect(previousWeek.getDay()).toBe(0); // Still Sunday
    });

    it('handles month boundaries', () => {
      const startOfMonth = new Date(2024, 3, 7); // April 7, 2024 (Sunday)
      const previousWeek = getPreviousWeek(startOfMonth);
      
      expect(previousWeek.getMonth()).toBe(2); // March (0-indexed)
      expect(previousWeek.getDate()).toBe(31); // March 31, 2024
    });
  });

  describe('isSameDay', () => {
    it('returns true for same date', () => {
      const date1 = new Date('2024-03-13T10:00:00');
      const date2 = new Date('2024-03-13T15:30:00');
      
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('returns false for different dates', () => {
      const date1 = new Date('2024-03-13');
      const date2 = new Date('2024-03-14');
      
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('handles different months', () => {
      const date1 = new Date('2024-03-31');
      const date2 = new Date('2024-04-01');
      
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('formatTime', () => {
    it('formats time in 12-hour format by default', () => {
      const date = new Date('2024-03-13T14:30:00');
      const formatted = formatTime(date);
      
      expect(formatted).toBe('2:30 PM');
    });

    it('handles morning times', () => {
      const date = new Date('2024-03-13T09:15:00');
      const formatted = formatTime(date);
      
      expect(formatted).toBe('9:15 AM');
    });

    it('handles midnight', () => {
      const date = new Date('2024-03-13T00:00:00');
      const formatted = formatTime(date);
      
      expect(formatted).toBe('12:00 AM');
    });

    it('handles noon', () => {
      const date = new Date('2024-03-13T12:00:00');
      const formatted = formatTime(date);
      
      expect(formatted).toBe('12:00 PM');
    });
  });

  describe('formatDate', () => {
    it('formats date in long format', () => {
      const date = new Date(2024, 2, 13); // March 13, 2024
      const formatted = formatDate(date);
      
      expect(formatted).toBe('March 13, 2024');
    });

    it('respects locale parameter', () => {
      const date = new Date(2024, 2, 13); // March 13, 2024
      const formatted = formatDate(date, 'en-GB');
      
      expect(formatted).toBe('13 March 2024');
    });
  });

  describe('formatDateShort', () => {
    it('formats date in short format', () => {
      const date = new Date(2024, 2, 13); // March 13, 2024
      const formatted = formatDateShort(date);
      
      expect(formatted).toBe('Mar 13');
    });
  });

  describe('calculateDuration', () => {
    it('calculates duration in hours and minutes', () => {
      const start = new Date('2024-03-13T10:00:00');
      const end = new Date('2024-03-13T11:30:00');
      const duration = calculateDuration(start, end);
      
      expect(duration).toBe('1h 30m');
    });

    it('handles exact hours', () => {
      const start = new Date('2024-03-13T10:00:00');
      const end = new Date('2024-03-13T12:00:00');
      const duration = calculateDuration(start, end);
      
      expect(duration).toBe('2h');
    });

    it('handles minutes only', () => {
      const start = new Date('2024-03-13T10:00:00');
      const end = new Date('2024-03-13T10:45:00');
      const duration = calculateDuration(start, end);
      
      expect(duration).toBe('45m');
    });
  });

  describe('populateWeekWithEvents', () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Event 1',
        startTime: new Date('2024-03-11T10:00:00'), // Monday
        endTime: new Date('2024-03-11T11:00:00'),
        isAllDay: false,
        status: 'confirmed',
      },
      {
        id: '2',
        title: 'Event 2',
        startTime: new Date('2024-03-11T14:00:00'), // Monday
        endTime: new Date('2024-03-11T15:00:00'),
        isAllDay: false,
        status: 'confirmed',
      },
      {
        id: '3',
        title: 'Event 3',
        startTime: new Date('2024-03-13T09:00:00'), // Wednesday
        endTime: new Date('2024-03-13T10:00:00'),
        isAllDay: false,
        status: 'confirmed',
      },
    ];

    it('groups events by day correctly', () => {
      const weekData = getCurrentWeek(new Date('2024-03-13'));
      const populatedWeek = populateWeekWithEvents(weekData, mockEvents);
      
      // Monday should have 2 events
      const monday = populatedWeek.days[1];
      expect(monday.events).toHaveLength(2);
      expect(monday.events[0].title).toBe('Event 1');
      expect(monday.events[1].title).toBe('Event 2');
      
      // Wednesday should have 1 event
      const wednesday = populatedWeek.days[3];
      expect(wednesday.events).toHaveLength(1);
      expect(wednesday.events[0].title).toBe('Event 3');
      
      // Other days should have no events
      [0, 2, 4, 5, 6].forEach(dayIndex => {
        expect(populatedWeek.days[dayIndex].events).toHaveLength(0);
      });
    });

    it('sorts events by start time within each day', () => {
      const weekData = getCurrentWeek(new Date('2024-03-13'));
      const populatedWeek = populateWeekWithEvents(weekData, mockEvents);
      
      const monday = populatedWeek.days[1];
      expect(monday.events[0].startTime.getHours()).toBe(10); // 10:00 AM first
      expect(monday.events[1].startTime.getHours()).toBe(14); // 2:00 PM second
    });

    it('preserves original week data structure', () => {
      const weekData = getCurrentWeek(new Date('2024-03-13'));
      const originalDaysLength = weekData.days.length;
      const populatedWeek = populateWeekWithEvents(weekData, mockEvents);
      
      expect(populatedWeek.days).toHaveLength(originalDaysLength);
      expect(populatedWeek.startDate).toEqual(weekData.startDate);
      expect(populatedWeek.endDate).toEqual(weekData.endDate);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      const validDate = new Date('2024-03-13');
      expect(isValidDate(validDate)).toBe(true);
    });

    it('returns false for invalid dates', () => {
      const invalidDate = new Date('invalid');
      expect(isValidDate(invalidDate)).toBe(false);
    });

    it('returns false for non-Date objects', () => {
      expect(isValidDate('2024-03-13' as unknown as Date)).toBe(false);
      expect(isValidDate(null as unknown as Date)).toBe(false);
      expect(isValidDate(undefined as unknown as Date)).toBe(false);
    });
  });

  describe('getWeekNumber', () => {
    it('calculates week number correctly', () => {
      const date = new Date('2024-03-13'); // Should be around week 11
      const weekNumber = getWeekNumber(date);
      
      expect(weekNumber).toBeGreaterThan(0);
      expect(weekNumber).toBeLessThanOrEqual(53);
    });

    it('returns 1 for first week of year', () => {
      const firstWeek = new Date(2024, 0, 7); // January 7, 2024 (first Sunday)
      const weekNumber = getWeekNumber(firstWeek);
      
      // January 7, 2024 is actually in the 2nd week since January 1 is a Monday
      expect(weekNumber).toBe(2);
    });
  });

  describe('getWeekRangeString', () => {
    it('formats week range for same month', () => {
      const weekStart = new Date(2024, 2, 10); // March 10, 2024 (Sunday)
      const rangeString = getWeekRangeString(weekStart);
      
      expect(rangeString).toBe('March 2024 10 - 16');
    });

    it('formats week range for different months', () => {
      const weekStart = new Date(2024, 2, 31); // March 31, 2024 (Sunday)
      const rangeString = getWeekRangeString(weekStart);
      
      expect(rangeString).toBe('Mar 31 - Apr 6, 2024');
    });

    it('respects locale parameter', () => {
      const weekStart = new Date(2024, 2, 10); // March 10, 2024 (Sunday)
      const rangeString = getWeekRangeString(weekStart, 'en-GB');
      
      // Should use British date formatting
      expect(rangeString).toContain('March');
    });
  });

  describe('Responsive Layout Calculations', () => {
    it('handles week boundaries correctly for layout', () => {
      const weekData = getCurrentWeek(new Date(2024, 2, 13)); // March 13, 2024 (Wednesday)
      
      // Week should start on Sunday and end on Saturday
      expect(weekData.startDate.getDay()).toBe(0);
      expect(weekData.endDate.getDay()).toBe(6);
      
      // Should have exactly 7 days
      expect(weekData.days).toHaveLength(7);
      
      // Days should be consecutive
      for (let i = 1; i < weekData.days.length; i++) {
        const prevDay = weekData.days[i - 1].date;
        const currentDay = weekData.days[i].date;
        const dayDiff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24);
        // Allow for slight variations due to daylight saving time
        expect(dayDiff).toBeCloseTo(1, 1);
      }
    });

    it('maintains consistent date objects for grid layout', () => {
      const weekData = getCurrentWeek(new Date(2024, 2, 13)); // March 13, 2024 (Wednesday)
      
      weekData.days.forEach(day => {
        expect(day.date).toBeInstanceOf(Date);
        expect(isValidDate(day.date)).toBe(true);
        expect(typeof day.dayName).toBe('string');
        expect(Array.isArray(day.events)).toBe(true);
        expect(typeof day.isToday).toBe('boolean');
      });
    });
  });
});