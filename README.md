# cal7

A zero-configuration React calendar component for displaying Google Calendar events in a responsive weekly view.

## Installation

```bash
npm install cal7
```

## Quick Start

1. Set your Google Calendar API key as an environment variable:
```bash
GOOGLE_CALENDAR_API_KEY=your_api_key_here
```

2. Import and use the Calendar component:
```tsx
import { Calendar } from 'cal7';
import 'cal7/styles';

export default function MyApp() {
  return (
    <Calendar calendarId="your-calendar-id@gmail.com" />
  );
}
```

## Documentation

See the [docs](./docs) folder for detailed documentation.

## Examples

Check out the [examples](./examples) folder for usage examples.

## License

MIT