// Utility types for error states, loading states, and API responses

// Error handling types
export type CalendarErrorCode = 
  | "NETWORK_ERROR" 
  | "AUTH_ERROR" 
  | "INVALID_DATA" 
  | "UNKNOWN_ERROR"
  | "MISSING_API_KEY"
  | "INVALID_CALENDAR_ID"
  | "PERMISSION_ERROR";

export class CalendarError extends Error {
  constructor(
    message: string,
    public code: CalendarErrorCode,
    public originalError?: Error
  ) {
    super(message);
    this.name = "CalendarError";
  }
}

export interface ErrorState {
  hasError: boolean;
  error: CalendarError | null;
  retryCount: number;
}

// Loading state types
export type LoadingStateType = "idle" | "loading" | "success" | "error";

export interface LoadingState {
  status: LoadingStateType;
  message?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: CalendarError;
  success: boolean;
  timestamp: Date;
}

export interface CalendarApiResponse extends ApiResponse<import('./events').CalendarEvent[]> {
  nextPageToken?: string;
  totalEvents?: number;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  key: string;
}

export interface CacheConfig {
  serverCacheDuration?: number; // seconds
  clientCacheDuration?: number; // milliseconds
  maxEntries?: number;
}

// Validation types
export type ValidationResult<T> = {
  isValid: boolean;
  data?: T;
  errors: string[];
};

// Configuration types
export interface CalendarConfig {
  googleCalendarId: string;
  apiKey?: string;
  cacheConfig?: CacheConfig;
  theme?: import('./theme').CalendarTheme;
  accessibility?: {
    enableKeyboardNavigation?: boolean;
    announceChanges?: boolean;
    highContrast?: boolean;
  };
  performance?: {
    enableVirtualScrolling?: boolean;
    maxEventsPerDay?: number;
    prefetchWeeks?: number;
  };
}

// Event handler types
export type EventClickHandler = (event: import('./events').CalendarEvent) => void;
export type WeekChangeHandler = (newWeek: Date) => void;
export type ErrorHandler = (error: CalendarError) => void;
export type RetryHandler = () => void;

// Keyboard navigation types
export type KeyboardAction = 
  | "navigate_previous_week"
  | "navigate_next_week"
  | "navigate_previous_day"
  | "navigate_next_day"
  | "select_event"
  | "close_modal"
  | "open_event_details";

export interface KeyboardEvent {
  action: KeyboardAction;
  event: import('./events').CalendarEvent | null;
  preventDefault: () => void;
}

// Responsive design types
export type ViewMode = "week" | "day" | "month";
export type BreakpointSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ResponsiveConfig {
  breakpoints: Record<BreakpointSize, number>;
  defaultViewMode: ViewMode;
  mobileViewMode: ViewMode;
}

// Accessibility types
export interface AccessibilityConfig {
  enableKeyboardNavigation: boolean;
  announceChanges: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  bundleSize: number;
}

// Internationalization types
export interface LocaleConfig {
  locale: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
}