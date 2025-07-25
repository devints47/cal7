'use client';

import type { EventModalProps } from '../types/calendar';

/**
 * EventModal Component (Placeholder)
 * 
 * This is a placeholder implementation for the EventModal component.
 * The full implementation will be completed in task 8.
 */
export function EventModal({
  event,
  isOpen,
  onClose,
  timeZone,
  locale,
  showAddToCalendar,
}: EventModalProps) {
  if (!isOpen || !event) {
    return null;
  }

  return (
    <div className="cal7-event-modal-placeholder">
      <div className="cal7-event-modal-placeholder__backdrop" onClick={onClose} />
      <div className="cal7-event-modal-placeholder__content">
        <h2>{event.title}</h2>
        <p>Event modal placeholder - will be implemented in task 8</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}