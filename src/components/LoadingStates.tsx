'use client';

interface LoadingStatesProps {
  type: "calendar" | "events" | "modal";
  className?: string;
}

/**
 * LoadingStates Component
 * 
 * Provides skeleton loading states that match the final content structure.
 * Different loading states for different components (calendar, events, modal).
 */
export function LoadingStates({ type, className = '' }: LoadingStatesProps) {
  
  if (type === 'calendar') {
    return <CalendarLoadingState className={className} />;
  }
  
  if (type === 'events') {
    return <EventsLoadingState className={className} />;
  }
  
  if (type === 'modal') {
    return <ModalLoadingState className={className} />;
  }
  
  return null;
}

/**
 * Calendar Grid Loading State
 */
function CalendarLoadingState({ className }: { className: string }) {
  return (
    <div className={`cal7-loading-calendar ${className}`} role="status" aria-label="Loading calendar">
      {/* Navigation Loading */}
      <div className="cal7-loading-calendar__navigation">
        <div className="cal7-loading-skeleton cal7-loading-skeleton--button" />
        <div className="cal7-loading-skeleton cal7-loading-skeleton--title" />
        <div className="cal7-loading-skeleton cal7-loading-skeleton--button" />
      </div>

      {/* Headers Loading */}
      <div className="cal7-loading-calendar__headers">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="cal7-loading-calendar__header">
            <div className="cal7-loading-skeleton cal7-loading-skeleton--day-name" />
            <div className="cal7-loading-skeleton cal7-loading-skeleton--day-date" />
          </div>
        ))}
      </div>

      {/* Grid Loading */}
      <div className="cal7-loading-calendar__grid">
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={dayIndex} className="cal7-loading-calendar__day">
            {/* Random number of event skeletons per day */}
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, eventIndex) => (
              <div key={eventIndex} className="cal7-loading-calendar__event">
                <div className="cal7-loading-skeleton cal7-loading-skeleton--event-title" />
                <div className="cal7-loading-skeleton cal7-loading-skeleton--event-time" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <span className="cal7-sr-only">Loading calendar events...</span>
    </div>
  );
}

/**
 * Events List Loading State
 */
function EventsLoadingState({ className }: { className: string }) {
  return (
    <div className={`cal7-loading-events ${className}`} role="status" aria-label="Loading events">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="cal7-loading-events__event">
          <div className="cal7-loading-skeleton cal7-loading-skeleton--event-title" />
          <div className="cal7-loading-skeleton cal7-loading-skeleton--event-time" />
          <div className="cal7-loading-skeleton cal7-loading-skeleton--event-location" />
        </div>
      ))}
      <span className="cal7-sr-only">Loading events...</span>
    </div>
  );
}

/**
 * Modal Loading State
 */
function ModalLoadingState({ className }: { className: string }) {
  return (
    <div className={`cal7-loading-modal ${className}`} role="status" aria-label="Loading event details">
      <div className="cal7-loading-modal__header">
        <div className="cal7-loading-skeleton cal7-loading-skeleton--modal-title" />
        <div className="cal7-loading-skeleton cal7-loading-skeleton--modal-time" />
      </div>
      <div className="cal7-loading-modal__content">
        <div className="cal7-loading-skeleton cal7-loading-skeleton--modal-description" />
        <div className="cal7-loading-skeleton cal7-loading-skeleton--modal-location" />
      </div>
      <div className="cal7-loading-modal__actions">
        <div className="cal7-loading-skeleton cal7-loading-skeleton--button" />
        <div className="cal7-loading-skeleton cal7-loading-skeleton--button" />
      </div>
      <span className="cal7-sr-only">Loading event details...</span>
    </div>
  );
}