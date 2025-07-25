import type { CalendarEvent } from '../types/events';

export interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  timeZone?: string;
  locale?: string;
  showAddToCalendar?: boolean;
}

// Placeholder EventModal component - will be implemented in later tasks
export function EventModal(_props: EventModalProps) {
  return <div>EventModal component placeholder</div>;
}