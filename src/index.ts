// Main package exports
export { Calendar } from './components/Calendar';
export { CalendarClient } from './components/CalendarClient';

export { EventModal } from './components/EventModal';
export { default as AddToCalendarButton } from './components/AddToCalendarButton';

// Error handling components
export { 
  ErrorBoundary,
  CalendarErrorBoundary,
  EventModalErrorBoundary 
} from './components/CalendarErrorBoundary';
export { 
  ErrorState,
  CalendarErrorState,
  InlineErrorMessage,
  EmptyEventsState,
  ConnectionStatus,
  DevelopmentWarning 
} from './components/ErrorStates';

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

export type { 
  CalendarTheme, 
  ThemeMode, 
  ThemeConfig, 
  DarkTheme 
} from './types/theme';

// Theme system exports
export { 
  ThemeProvider, 
  useTheme, 
  useThemeClasses, 
  useThemeVariables 
} from './components/ThemeProvider';

export {
  defaultTheme,
  defaultDarkTheme,
  mergeTheme,
  generateCSSVariables,
  validateTheme,
  getSystemThemePreference,
  resolveThemeMode
} from './types/theme';

export type {
  CalendarErrorCode,
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
  fetchCalendarData,
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

// Retry and error handling utilities
export {
  withRetry,
  useRetryState,
  useAutoRetry,
  CircuitBreaker,
  isRetryableError,
  calculateRetryDelay,
  DEFAULT_RETRY_CONFIG
} from './utils/retry';

export type {
  RetryConfig,
  RetryState
} from './utils/retry';