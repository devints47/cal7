# Original Calendar Implementation Analysis

## Overview

This document analyzes the original calendar implementation in `noveltea/app/events/` to identify reusable patterns, components, and code that can be extracted into the Cal7 package. The analysis covers architecture patterns, TypeScript interfaces, UI components, API integration, and testing approaches.

## Project Structure

```
noveltea/
├── app/
│   ├── events/
│   │   ├── page.tsx              # Main events page component
│   │   └── layout.tsx            # Events layout with metadata
│   └── api/
│       └── google-events/
│           └── route.ts          # Google Calendar API endpoint
├── components/events/
│   ├── CalendarView.tsx          # Main calendar grid component
│   ├── EventCard.tsx             # Individual event display
│   ├── EventModal.tsx            # Event details modal
│   ├── AddToCalendarButton.tsx   # Device-specific calendar integration
│   ├── CalendarSubscriptionButton.tsx
│   ├── EventsHero.tsx            # Hero section component
│   ├── ErrorBoundary.tsx         # Error handling components
│   ├── ErrorStates.tsx           # Error state components
│   └── LoadingStates.tsx         # Loading skeleton components
├── lib/
│   ├── google-calendar-service.ts # Google Calendar API service
│   ├── calendar-utils.ts         # Date/calendar utility functions
│   ├── simple-cache.ts           # Client-side caching
│   └── device-detection.ts       # Device type detection
└── types/
    └── events.ts                 # TypeScript type definitions
```

## Core Architecture Patterns

### 1. Service Layer Pattern
- **Google Calendar Service** (`lib/google-calendar-service.ts`)
  - Centralized API integration with error handling
  - Built-in caching mechanism (15-minute cache)
  - Custom error types with specific error codes
  - Data transformation from Google Calendar API to internal format

### 2. Component Composition Pattern
- **Modular Components**: Each UI element is a separate, focused component
- **Props-based Configuration**: Components accept configuration through props
- **Event-driven Communication**: Parent-child communication through callback props

### 3. Error Boundary Pattern
- **Hierarchical Error Handling**: Different error boundaries for different contexts
- **Graceful Degradation**: Fallback UI when components fail
- **Development vs Production**: Different error displays based on environment
## Typ
eScript Interfaces and Types

### Core Data Models

```typescript
// Primary event data structure
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  duration: string;
  location?: string;
  isAllDay: boolean;
  googleCalendarId: string;
  icalUrl: string;
}

// Week-based calendar structure
interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayData[];
}

interface DayData {
  date: Date;
  dayName: string;
  events: CalendarEvent[];
  isToday: boolean;
}
```

### Google Calendar API Types

```typescript
// Google Calendar API response structure
interface GoogleCalendarEvent {
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
}

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
  nextPageToken?: string;
  error?: {
    message: string;
    code: number;
  };
}
```

### Component Props Interfaces

```typescript
// Main calendar component props
interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  loading?: boolean;
}

// Event card component props
interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  compact?: boolean;
}

// Modal component props
interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}
```

### Device Detection Types

```typescript
type DeviceType = "ios" | "android" | "desktop" | "unknown";

interface DeviceInfo {
  type: DeviceType;
  isTouch: boolean;
  userAgent: string;
}
```##
 Google Calendar API Integration Patterns

### Service Architecture

The Google Calendar integration follows a layered service pattern:

1. **API Route Handler** (`app/api/google-events/route.ts`)
   - Next.js API route for server-side calendar fetching
   - Error handling with specific HTTP status codes
   - JSON response formatting

2. **Service Layer** (`lib/google-calendar-service.ts`)
   - Core business logic for calendar operations
   - Data transformation and validation
   - Caching and error recovery

### Key Integration Features

#### Authentication Strategy
- Uses public calendar access with API key
- No OAuth required for public calendars
- API key stored in environment variables

#### Data Transformation Pipeline
```typescript
// Raw Google Calendar Event → Internal CalendarEvent
function transformGoogleCalendarEvent(googleEvent: any): CalendarEvent {
  const isAllDay = !googleEvent.start.dateTime;
  
  // Handle timezone-aware date parsing
  let startDate: Date;
  let endDate: Date;
  
  if (isAllDay) {
    // All-day events: Parse date strings in local timezone
    const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
    startDate = new Date(startYear, startMonth - 1, startDay, 12, 0, 0);
  } else {
    // Timed events: Use dateTime directly
    startDate = new Date(googleEvent.start.dateTime);
  }
  
  return {
    id: googleEvent.id,
    title: googleEvent.summary || "Untitled Event",
    description: cleanDescription(googleEvent.description || ""),
    startDate,
    endDate,
    startTime: isAllDay ? "All Day" : formatTime(startDate),
    endTime: isAllDay ? "All Day" : formatTime(endDate),
    duration: isAllDay ? "All Day" : calculateDuration(startDate, endDate),
    location: googleEvent.location,
    isAllDay,
    googleCalendarId: CALENDAR_ID,
    icalUrl: `https://calendar.google.com/calendar/ical/${CALENDAR_ID}/public/basic.ics`,
  };
}
```

#### Caching Strategy
- **Server-side caching**: 15-minute cache in service layer
- **Client-side caching**: 1-hour cache using simple-cache utility
- **Cache invalidation**: Manual refresh capability
- **Fallback mechanism**: Return cached data on API failures

#### Error Handling
```typescript
class GoogleCalendarServiceError extends Error {
  constructor(
    message: string,
    public code: "NETWORK_ERROR" | "AUTH_ERROR" | "INVALID_DATA" | "UNKNOWN_ERROR",
    public originalError?: Error
  ) {
    super(message);
    this.name = "GoogleCalendarServiceError";
  }
}
```

### API Configuration
- **Date Range**: 6 months past to 6 months future
- **Event Expansion**: `singleEvents=true` for recurring events
- **Sorting**: Events ordered by start time
- **Limits**: 1000 events maximum per request## UI Com
ponents and Patterns

### Component Architecture

#### 1. CalendarView Component
**Purpose**: Main calendar grid displaying weekly events

**Key Features**:
- Responsive design (mobile-first approach)
- Week-based navigation with keyboard support
- Loading states and error handling
- Accessibility features (ARIA labels, keyboard navigation)

**Responsive Patterns**:
```typescript
// Mobile: Stacked day layout with headers
<div className="md:hidden mb-4 pb-2 border-b border-gray-200">
  <div className="flex items-center justify-between">
    <h3>{day.dayName}</h3>
    <p>{day.date.toLocaleDateString()}</p>
  </div>
</div>

// Desktop: Grid layout with column headers
<div className="hidden md:contents" role="row">
  {weekWithEvents.days.map((day, index) => (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 text-center">
      <h3>{day.dayName.slice(0, 3)}</h3>
    </div>
  ))}
</div>
```

#### 2. EventCard Component
**Purpose**: Individual event display with two variants

**Variants**:
- **Compact**: For calendar grid cells
- **Full**: For detailed event listings

**Interaction Patterns**:
- Click and keyboard navigation support
- Hover effects and transitions
- Truncation for long content

#### 3. EventModal Component
**Purpose**: Full event details in modal overlay

**Features**:
- Focus management and keyboard navigation
- Backdrop click to close
- Device-specific calendar integration
- Accessibility compliance (ARIA attributes)

### Design System Patterns

#### Color Scheme
- **Primary**: Orange to amber gradients (`from-orange-500 to-amber-500`)
- **Backgrounds**: Subtle gradients (`from-orange-50 to-amber-50`)
- **Text**: Stone color palette for readability
- **States**: Color-coded feedback (red for errors, green for success)

#### Typography
- **Font Family**: Playfair Display serif font for elegance
- **Hierarchy**: Consistent sizing scale (text-sm to text-5xl)
- **Weight**: Strategic use of font weights for emphasis

#### Animation and Transitions
```css
/* Consistent transition timing */
transition-all duration-300
hover:scale-105
hover:-translate-y-1

/* Loading animations */
animate-pulse
animate-spin
```

#### Spacing and Layout
- **Container**: `max-w-6xl mx-auto px-6` for consistent page width
- **Grid**: CSS Grid for calendar layout
- **Flexbox**: For component internal layouts
- **Responsive**: Mobile-first breakpoints#
# Accessibility Features

### Keyboard Navigation
- **Calendar Grid**: Arrow key navigation between days and events
- **Focus Management**: Proper focus indicators and tab order
- **Keyboard Shortcuts**: Enter/Space for event selection, Escape for modal close

### ARIA Implementation
```typescript
// Calendar grid with proper roles
<div 
  role="grid"
  aria-labelledby="calendar-week-heading"
  aria-describedby="calendar-description"
>
  <div role="gridcell" aria-label={`${day.dayName}, ${eventCount} events`}>
    <div role="list" aria-label={`Events for ${day.dayName}`}>
      <div role="listitem">
        <EventCard />
      </div>
    </div>
  </div>
</div>

// Modal with proper dialog semantics
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
```

### Screen Reader Support
- **Live Regions**: `aria-live="polite"` for dynamic content updates
- **Descriptive Labels**: Comprehensive aria-label attributes
- **Status Messages**: Clear feedback for loading and error states

### Visual Accessibility
- **Color Contrast**: Sufficient contrast ratios for text readability
- **Focus Indicators**: Visible focus rings with `focus:ring-2 focus:ring-amber-500`
- **Reduced Motion**: Respects user motion preferences

## Performance Optimizations

### Caching Strategy
1. **Multi-level Caching**:
   - Server-side: 15-minute cache in Google Calendar service
   - Client-side: 1-hour cache using simple-cache utility
   - Browser: HTTP caching headers

2. **Cache Implementation**:
```typescript
class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
}
```

### Loading Optimizations
- **Skeleton Loading**: Detailed loading states that match final content structure
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Lazy Loading**: Components load as needed

### Bundle Optimization
- **Tree Shaking**: Only import used utilities from libraries
- **Code Splitting**: Separate chunks for different features
- **Dynamic Imports**: Load heavy components on demand

### Data Fetching Patterns
- **SWR Pattern**: Stale-while-revalidate for fresh data
- **Error Recovery**: Graceful fallbacks when API fails
- **Optimistic Updates**: Immediate UI feedback## T
esting Patterns

### Testing Architecture
- **Framework**: Vitest for unit testing
- **React Testing**: React Testing Library for component tests
- **Mocking Strategy**: Comprehensive mocking of external dependencies

### API Testing Patterns
```typescript
// Mock external services
vi.mock('@/lib/google-calendar-service', () => ({
  getGoogleCalendarEvents: vi.fn(),
  GoogleCalendarServiceError: class MockGoogleCalendarServiceError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'GoogleCalendarServiceError';
    }
  },
}));

// Test error scenarios
it('handles GoogleCalendarServiceError with AUTH_ERROR', async () => {
  const authError = new GoogleCalendarServiceError('Authentication failed', 'AUTH_ERROR');
  mockGetGoogleCalendarEvents.mockRejectedValue(authError);
  
  const response = await GET(request);
  expect(response.status).toBe(401);
});
```

### Component Testing Patterns
```typescript
// Mock utility functions
vi.mock('@/lib/calendar-utils', () => ({
  getCurrentWeek: vi.fn(() => mockWeekData),
  groupEventsByDay: vi.fn((events, weekData) => ({ ...weekData, days: mockDays })),
}));

// Test component behavior
it('renders calendar with days of the week', () => {
  render(<CalendarView {...mockProps} />);
  expect(screen.getByText('Sunday')).toBeInTheDocument();
});
```

### Utility Testing Patterns
- **Date Utilities**: Comprehensive testing of date manipulation functions
- **Device Detection**: Testing across different user agent strings
- **Data Transformation**: Testing Google Calendar API response transformation

## Reusable Utilities and Patterns

### Date and Time Utilities
```typescript
// Week-based calendar operations
export function getWeekStart(date: Date): Date;
export function getWeekEnd(date: Date): Date;
export function getCurrentWeek(date?: Date): WeekData;
export function getNextWeek(currentWeek: Date): Date;
export function getPreviousWeek(currentWeek: Date): Date;

// Date formatting and comparison
export function isSameDay(date1: Date, date2: Date): boolean;
export function formatTime(date: Date): string;
export function formatDate(date: Date): string;
export function calculateDuration(startDate: Date, endDate: Date): string;

// Event filtering and grouping
export function filterEventsForWeek(events: CalendarEvent[], weekStart: Date): CalendarEvent[];
export function groupEventsByDay(events: CalendarEvent[], weekData: WeekData): WeekData;
```

### Device Detection Utilities
```typescript
export function detectDeviceType(userAgent?: string): DeviceType;
export function isTouchDevice(): boolean;
export function getDeviceInfo(userAgent?: string): DeviceInfo;
export function isMobileDevice(userAgent?: string): boolean;
export function isAppleDevice(userAgent?: string): boolean;
export function getCalendarAppName(userAgent?: string): string;
```

### Validation Utilities
```typescript
export function isValidDate(date: Date): boolean;
export function isValidCalendarEvent(event: any): event is CalendarEvent;
```

### Error Handling Patterns
```typescript
// Custom error classes with specific error codes
class GoogleCalendarServiceError extends Error {
  constructor(
    message: string,
    public code: "NETWORK_ERROR" | "AUTH_ERROR" | "INVALID_DATA" | "UNKNOWN_ERROR",
    public originalError?: Error
  ) {
    super(message);
    this.name = "GoogleCalendarServiceError";
  }
}

// Error boundary components for different contexts
export function CalendarErrorBoundary({ children, onRetry });
export function EventModalErrorBoundary({ children, onClose });
```## Devi
ce-Specific Calendar Integration

### Add to Calendar Button Patterns
The implementation includes sophisticated device detection for optimal calendar integration:

```typescript
// Device-specific calendar URLs
const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`,
    details: event.description || "",
    location: event.location || "",
  });
  return `${baseUrl}?${params.toString()}`;
};

// iCal file generation
const generateICalContent = (event: CalendarEvent): string => {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NovelTea//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@noveltea.com`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${event.title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};
```

### Platform-Specific Behaviors
- **iOS**: Downloads .ics file that opens in Apple Calendar
- **Android**: Opens Google Calendar web interface
- **Desktop**: Dropdown with multiple options (Google Calendar, iCal download)

## Recommendations for Cal7 Package

### Core Components to Extract
1. **CalendarView**: Main calendar grid component with week navigation
2. **EventCard**: Flexible event display component (compact/full variants)
3. **EventModal**: Event details modal with accessibility features
4. **AddToCalendarButton**: Device-aware calendar integration
5. **LoadingStates**: Skeleton loading components
6. **ErrorStates**: Error handling and display components

### Utility Functions to Package
1. **Date/Time Utilities**: Week-based calendar operations
2. **Device Detection**: Platform-specific behavior handling
3. **Data Transformation**: Google Calendar API response processing
4. **Validation**: Event and date validation functions
5. **Caching**: Simple client-side cache implementation

### Configuration Patterns
```typescript
// Package configuration interface
interface Cal7Config {
  googleCalendarId: string;
  apiKey?: string;
  cacheConfig?: {
    serverCacheDuration?: number;
    clientCacheDuration?: number;
  };
  theme?: {
    primaryColor?: string;
    fontFamily?: string;
  };
  accessibility?: {
    enableKeyboardNavigation?: boolean;
    announceChanges?: boolean;
  };
}
```

### API Design Recommendations
1. **Flexible Data Sources**: Support multiple calendar providers
2. **Customizable Theming**: CSS custom properties for easy styling
3. **Accessibility First**: Built-in ARIA support and keyboard navigation
4. **Performance Optimized**: Efficient caching and loading strategies
5. **TypeScript Native**: Full type safety and IntelliSense support

## Conclusion

The original NovelTea calendar implementation demonstrates excellent patterns for:
- **Modular Architecture**: Well-separated concerns with clear interfaces
- **Accessibility**: Comprehensive ARIA implementation and keyboard support
- **Performance**: Multi-level caching and optimized loading states
- **Device Compatibility**: Platform-specific calendar integration
- **Error Handling**: Graceful degradation and user-friendly error states
- **Testing**: Comprehensive test coverage with proper mocking strategies

These patterns provide a solid foundation for creating a reusable Cal7 package that maintains the quality and functionality of the original implementation while being flexible enough for different use cases and styling requirements.