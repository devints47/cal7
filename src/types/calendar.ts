import type { CalendarEvent } from './events';
import type { CalendarTheme } from './theme';

export interface CalendarProps {
  calendarId: string;
  revalidate?: number; // seconds, default 300
  timeZone?: string;
  locale?: string;
  className?: string;
  theme?: CalendarTheme;
  fetcher?: (calendarId: string) => Promise<CalendarEvent[]>;
  onError?: (error: Error) => void;
}

export interface CalendarClientProps {
  events: CalendarEvent[];
  initialWeek?: Date;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
  timeZone?: string;
  onEventClick?: (event: CalendarEvent) => void;
}