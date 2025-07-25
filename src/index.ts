// Main package exports
export { Calendar } from './components/Calendar';
export { CalendarClient } from './components/CalendarClient';
export { EventModal } from './components/EventModal';

// Type exports
export type { CalendarProps } from './types/calendar';
export type { CalendarEvent, EventAttendee, RecurrenceRule } from './types/events';
export type { CalendarTheme } from './types/theme';

// Utility exports
export { fetchCalendarEvents } from './utils/api';
export { sanitizeEventContent } from './utils/security';