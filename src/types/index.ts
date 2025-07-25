// Re-export all types from individual modules
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
} from './calendar';

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
} from './events';

export type { CalendarTheme } from './theme';

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
} from './utils';

// Export the CalendarError class (not as type)
export { CalendarError } from './utils';