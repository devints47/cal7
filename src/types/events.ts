// Core event data model
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  isAllDay: boolean;
  url?: string;
  attendees?: EventAttendee[];
  recurrence?: RecurrenceRule;
  status: 'confirmed' | 'tentative' | 'cancelled';
  googleCalendarId?: string;
  icalUrl?: string;
}

export interface EventAttendee {
  email: string;
  name?: string;
  status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  until?: Date;
  count?: number;
}

// Week-based calendar structure
export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayData[];
}

export interface DayData {
  date: Date;
  dayName: string;
  events: CalendarEvent[];
  isToday: boolean;
}

// Google Calendar API types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
}

export interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
  error?: {
    message: string;
    code: number;
  };
}

// Device detection types
export type DeviceType = "ios" | "android" | "desktop" | "unknown";

export interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  userAgent: string;
}

// Calendar subscription URLs
export interface CalendarSubscription {
  google: string;
  ical: string;
  apple: string;
}