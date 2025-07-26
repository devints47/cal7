# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-27

### Added
- Initial release of Cal7 calendar component
- **Calendar Component**: Server-side rendered Google Calendar integration for Next.js
- **CalendarClient Component**: Client-side calendar display with event interaction
- **SubscribeButton Component**: Optional subscription/download functionality
- **Comprehensive Theming**: CSS custom properties with light/dark mode support
- **Accessibility Features**: Full keyboard navigation and screen reader support
- **Responsive Design**: Adapts from desktop 7-day view to mobile-friendly layout
- **TypeScript Support**: Full type definitions and IntelliSense support
- **Google Calendar API Integration**: Secure server-side API key handling
- **Event Modal**: Detailed event view with add-to-calendar functionality
- **Device Detection**: Smart calendar app recommendations (Google, Apple, iCal)
- **Error Handling**: Comprehensive error boundaries and retry logic
- **Performance Optimization**: Built-in caching and optimized rendering

### Framework Support
- ✅ **Next.js 13+ (App Router)** - Full server-side rendering support
- ✅ **Next.js 12+ (Pages Router)** - Compatible with SSR/SSG
- ⚠️ **Create React App / Vite** - Client-side only with custom fetcher
- ⚠️ **Remix** - Partial support (not fully tested)

### Components Exported
- `Calendar` - Main server component for Next.js
- `CalendarClient` - Client component for event display
- `CalendarGrid` - Week view calendar grid
- `EventCard` - Individual event display
- `EventModal` - Event details modal
- `SubscribeButton` - Calendar subscription functionality
- `WeekNavigation` - Week navigation controls
- `ThemeProvider` - Theme management
- `AddToCalendarButton` - Add to calendar functionality

### Utilities Exported
- `fetchCalendarData` - Google Calendar API fetching
- `transformGoogleCalendarEvent` - Event data transformation
- `validateCalendarId` - Calendar ID validation
- `validateApiKey` - API key validation
- `filterEventsForWeek` - Event filtering utilities
- `groupEventsByDay` - Event grouping utilities
- Date utilities and device detection functions

### Notes
- Requires `GOOGLE_CALENDAR_API_KEY` environment variable
- Designed primarily for Next.js applications
- Uses Playfair Display font for elegant typography
- Includes comprehensive test suite with 18+ test files 