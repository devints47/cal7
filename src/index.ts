// Main package exports
export { Calendar } from './components/Calendar';
export { CalendarClient } from './components/CalendarClient';
export { EventModal } from './components/EventModal';
export { default as AddToCalendarButton } from './components/AddToCalendarButton';

// Core type exports
export type { 
  CalendarProps,
  CalendarClientProps,
  EventModalProps,
  EventCardProps,
  AddToCalendarButtonProps,
  CalendarViewProps,
  WeekNavigationProps,
  DayColumnProps,
  LoadingStateProps
} from './types/calendar';

export type { 
  CalendarEvent,
  EventAttendee,
  RecurrenceRule,
  WeekData,
  DayData,
  GoogleCalendarEvent,
  GoogleCalendarResponse,
  DeviceType,
  DeviceInfo,
  CalendarSubscription
} from './types/events';

export type { CalendarTheme } from './types/theme';

export type {
  CalendarErrorCode,
  ErrorState,
  LoadingStateType,
  LoadingState,
  ApiResponse,
  CalendarApiResponse,
  CacheEntry,
  CacheConfig,
  ValidationResult,
  CalendarConfig,
  EventClickHandler,
  WeekChangeHandler,
  ErrorHandler,
  RetryHandler,
  KeyboardAction,
  KeyboardEvent,
  ViewMode,
  BreakpointSize,
  ResponsiveConfig,
  AccessibilityConfig,
  PerformanceMetrics,
  LocaleConfig
} from './types/utils';

// Export CalendarError class
export { CalendarError } from './types/utils';

// Utility exports
export {
  fetchCalendarEvents,
  transformGoogleCalendarEvent,
  validateCalendarId,
  validateApiKey,
  filterEventsForWeek,
  groupEventsByDay
} from './utils/google-calendar-api';

export {
  detectDeviceType,
  isTouchDevice,
  getDeviceInfo,
  isMobileDevice,
  isAppleDevice,
  getCalendarAppName
} from './utils/device-detection';