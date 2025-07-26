# cal7

A zero-configuration React calendar component for displaying Google Calendar events in a responsive weekly view.

## Installation

```bash
npm install cal7
```

## Quick Start

```tsx
import { Calendar } from "cal7";
import "cal7/styles";

// Set environment variable: GOOGLE_CALENDAR_API_KEY=your_api_key

export default function MyApp() {
  return <Calendar />;
}
```

## Features

- 🚀 **Zero Configuration**: Just set your API key and go
- 📱 **Responsive Design**: Adapts from desktop 7-day view to mobile-friendly layout
- ♿ **Accessibility First**: Full keyboard navigation and screen reader support
- 🎨 **Customizable Theming**: Extensive theme system with CSS custom properties
- 🌙 **Dark Mode**: Built-in dark theme with system preference detection
- 📅 **Add to Calendar**: Device-aware calendar integration (Google, Apple, iCal)
- 🔒 **Secure**: Server-side API key handling, no client-side exposure
- ⚡ **Performance**: Built-in caching and optimized rendering
- 🎯 **TypeScript**: Full type safety and IntelliSense support

## Basic Usage

### Server Component (Recommended)

```tsx
import { Calendar } from "cal7";

export default function EventsPage() {
  return <Calendar locale="en-US" timeZone="America/New_York" />;
}
```

### With Theme Provider

```tsx
import { Calendar, ThemeProvider } from "cal7";

const customTheme = {
  colors: {
    primary: "#3b82f6",
    background: "#ffffff",
    eventBackground: "#f8fafc",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    customFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
};

export default function App() {
  return (
    <ThemeProvider config={{ theme: customTheme }}>
      <Calendar />
    </ThemeProvider>
  );
}
```

## Theming & Customization

Cal7 provides extensive theming capabilities through CSS custom properties and a comprehensive theme system.

### Theme Configuration

```tsx
import { Calendar, ThemeProvider, type CalendarTheme } from "cal7";

const customTheme: CalendarTheme = {
  colors: {
    // Primary colors
    primary: "#3b82f6",
    secondary: "#6b7280",
    background: "#ffffff",
    surface: "#f9fafb",

    // Text colors
    text: "#111827",
    textSecondary: "#374151",
    textMuted: "#6b7280",
    eventPastText: "#9ca3af", // Color for past events

    // Border colors
    border: "#e5e7eb",
    borderLight: "#f3f4f6",

    // State colors
    today: "#92400e",
    todayBackground: "#fef3c7",
    focus: "#3b82f6",
    hover: "#f3f4f6",

    // Day alternating colors
    dayEven: "#fafafa",
    dayOdd: "#ffffff",
    dayHover: "#f8fafc",

    // Header alternating colors
    headerEven: "#f3f4f6",
    headerOdd: "#f9fafb",

    // Event colors
    eventBackground: "#ffffff",
    eventBorder: "#e5e7eb",
    eventText: "#111827",
  },

  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    customFontUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },

  shadows: {
    calendar:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
    md: "0 2px 4px rgba(0, 0, 0, 0.1)",
    lg: "0 4px 6px rgba(0, 0, 0, 0.1)",
    xl: "0 10px 15px rgba(0, 0, 0, 0.1)",
  },

  event: {
    height: "auto", // Customizable event section height
    width: "100%", // Customizable event width
    titleMinHeight: "2.5rem", // Minimum height for event titles (2 lines)
  },
};

export default function App() {
  return (
    <ThemeProvider config={{ theme: customTheme }}>
      <Calendar />
    </ThemeProvider>
  );
}
```

### Dark Mode

```tsx
import { ThemeProvider } from "cal7";

export default function App() {
  return (
    <ThemeProvider
      config={{
        mode: "dark", // 'light' | 'dark' | 'system'
        theme: customLightTheme,
        darkTheme: customDarkTheme,
      }}
    >
      <Calendar />
    </ThemeProvider>
  );
}
```

### CSS Custom Properties

You can also customize the calendar using CSS custom properties:

```css
:root {
  /* Colors */
  --cal7-color-primary: #3b82f6;
  --cal7-color-background: #ffffff;
  --cal7-color-surface: #f9fafb;
  --cal7-color-text: #111827;
  --cal7-color-border: #e5e7eb;

  /* Day alternating colors */
  --cal7-color-day-even: #fafafa;
  --cal7-color-day-odd: #ffffff;
  --cal7-color-day-hover: #f8fafc;

  /* Header alternating colors */
  --cal7-color-header-even: #f3f4f6;
  --cal7-color-header-odd: #f9fafb;

  /* Past events */
  --cal7-color-event-past-text: #9ca3af;

  /* Typography */
  --cal7-font-family: "Inter", sans-serif;
  --cal7-font-size-base: 1rem;
  --cal7-font-weight-bold: 700;

  /* Event customization */
  --cal7-event-height: auto;
  --cal7-event-width: 100%;
  --cal7-event-title-min-height: 2.5rem;

  /* Shadows */
  --cal7-shadow-calendar: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  /* Spacing */
  --cal7-spacing-sm: 0.5rem;
  --cal7-spacing-md: 1rem;
  --cal7-spacing-lg: 1.5rem;
}
```

### Custom Font Integration

```tsx
const themeWithCustomFont = {
  typography: {
    fontFamily: "Poppins, sans-serif",
    customFontUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  },
};
```

## Component Props

### Calendar

| Prop         | Type                     | Default      | Description                        |
| ------------ | ------------------------ | ------------ | ---------------------------------- |
| `calendarId` | `string`                 | **Required** | Google Calendar ID                 |
| `locale`     | `string`                 | `'en-US'`    | Locale for date/time formatting    |
| `timeZone`   | `string`                 | `'UTC'`      | Timezone for event display         |
| `revalidate` | `number`                 | `300`        | Cache revalidation time in seconds |
| `className`  | `string`                 | `''`         | Additional CSS classes             |
| `theme`      | `CalendarTheme`          | `undefined`  | Custom theme configuration         |
| `onError`    | `(error: Error) => void` | `undefined`  | Error handler callback             |

### ThemeProvider

| Prop                 | Type                            | Default            | Description               |
| -------------------- | ------------------------------- | ------------------ | ------------------------- |
| `config.theme`       | `CalendarTheme`                 | `defaultTheme`     | Light theme configuration |
| `config.darkTheme`   | `CalendarTheme`                 | `defaultDarkTheme` | Dark theme configuration  |
| `config.mode`        | `'light' \| 'dark' \| 'system'` | `'light'`          | Theme mode                |
| `config.classPrefix` | `string`                        | `'cal7'`           | CSS class prefix          |

## Styling Features

### Enhanced Visual Design

- **Drop Shadow**: Entire calendar component has a subtle drop shadow
- **Alternating Colors**: Days and headers alternate background colors for better visual separation
- **Smooth Animations**: Hover effects with scale and smooth transitions
- **Past Event Styling**: Past events are automatically greyed out using theme-appropriate colors

### Event Card Enhancements

- **Clock Icons**: Time displays include clock icons
- **Start/End Times**: Shows both start and end times (e.g., "8:00AM to 10:00PM")
- **Bold Titles**: Event titles are bold and have increased font size
- **Minimum Height**: Event titles have a minimum 2-line height by default
- **Location Icons**: SVG location icons instead of emoji pins
- **Customizable Dimensions**: Event height and width can be customized via theme

### Interactive Features

- **Clickable Links**: Email addresses and URLs in event descriptions are automatically clickable
- **Map Integration**: Event locations are clickable and open in device-appropriate map apps
- **Add to Calendar**: Event modal dates are clickable with add-to-calendar functionality
- **Themed Buttons**: Add-to-calendar buttons match the selected theme (no gradients)

### Navigation Improvements

- **Current Week Indicator**: Shows "Current Week" badge when viewing the current week
- **Themed Borders**: Themed border between week selector and calendar grid
- **Date Format**: Week selector shows dates in "Jul 20 - 26, 2025" format
- **Button Layout**: Navigation arrows positioned left and right of "Today" button

## Environment Setup

Set your Google Calendar API key as an environment variable:

```bash
# .env.local
GOOGLE_CALENDAR_API_KEY=your_api_key_here
```

## TypeScript Support

Cal7 is built with TypeScript and provides full type definitions:

```tsx
import type { CalendarTheme, CalendarEvent, ThemeConfig } from "cal7";

const theme: CalendarTheme = {
  colors: {
    primary: "#3b82f6",
    // ... other theme properties with full IntelliSense
  },
};
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Space, and Escape
- **Screen Reader Support**: Comprehensive ARIA labels and live region announcements
- **Focus Management**: Proper focus trapping in modals and logical tab order
- **High Contrast**: Supports high contrast mode preferences
- **Reduced Motion**: Respects user's reduced motion preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT
