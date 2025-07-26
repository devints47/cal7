// Export Google Calendar API utilities
export {
  fetchCalendarData,
  transformGoogleCalendarEvent,
  validateCalendarId,
  validateApiKey,
  filterEventsForWeek,
  groupEventsByDay
} from './google-calendar-api';

// Export date utilities
export {
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
  getWeekRangeString
} from './date-utils';

// Export other utility functions (to be added in future tasks)
// export * from './device-detection';
// export * from './cache';