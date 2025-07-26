import type { CalendarEvent } from './events';
import type { CalendarTheme, ThemeMode } from './theme';

// Main Calendar Server Component props
export interface CalendarProps {
  revalidate?: number; // seconds, default 300
  timeZone?: string;
  locale?: string;
  className?: string;
  theme?: CalendarTheme;
  darkTheme?: CalendarTheme;
  mode?: ThemeMode;
  classPrefix?: string;
  fetcher?: () => Promise<CalendarEvent[]>;
  onError?: (error: Error) => void;
}

// Calendar Client Component props
export interface CalendarClientProps {
  events: CalendarEvent[];
  initialWeek?: Date;
  className?: string;
  locale?: string;
  timeZone?: string;
  onEventClick?: (event: CalendarEvent) => void;
}

// Event Modal Component props
export interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  timeZone?: string;
  locale?: string;
  showAddToCalendar?: boolean;
}

// Event Card Component props
export interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
  className?: string;
  theme?: CalendarTheme;
}

// Add to Calendar Button props
export interface AddToCalendarButtonProps {
  event: CalendarEvent;
  userAgent?: string;
  className?: string;
  showLabel?: boolean;
}

// Calendar View props (for the main calendar grid)
export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  loading?: boolean;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
  timeZone?: string;
}

// Week Navigation props
export interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
}

// Day Column props
export interface DayColumnProps {
  day: import('./events').DayData;
  onEventClick: (event: CalendarEvent) => void;
  className?: string;
  theme?: CalendarTheme;
  compact?: boolean;
}

// Loading State props
export interface LoadingStateProps {
  type: "calendar" | "events" | "modal";
  className?: string;
}