'use client';

import { useCallback, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../types/events';
import type { CalendarTheme } from '../types/theme';
// Removed unused import: calculateDuration

interface EventCardProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  onFocus?: () => void;
  compact?: boolean;
  isFocused?: boolean;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
  timeZone?: string;
}

/**
 * EventCard Component
 * 
 * Displays individual event information in a card format.
 * Supports both compact (calendar grid) and full (detailed) variants.
 * Implements proper keyboard navigation and accessibility features.
 * 
 * Features:
 * - ARIA labels and semantic HTML structure
 * - Keyboard navigation (Tab, Enter, Space)
 * - Hover and focus states with visual feedback
 * - Locale and timezone support for time formatting
 * - Text truncation with overflow handling
 * - Screen reader announcements
 */
export function EventCard({
  event,
  onClick,
  onFocus,
  compact = false,
  isFocused = false,
  className = '',
  theme: _theme,
  locale = 'en-US',
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: EventCardProps) {
  
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Handle click events
  const handleClick = useCallback(() => {
    onClick(event);
  }, [onClick, event]);

  // Handle keyboard events with proper navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onClick(event);
        break;
      case 'Escape':
        // Allow parent to handle escape (e.g., close modal)
        break;
      default:
        // Let other keys bubble up for grid navigation
        break;
    }
  }, [onClick, event]);

  // Handle focus events with screen reader announcements
  const handleFocus = useCallback(() => {
    if (onFocus) {
      onFocus();
    }
    
    // Announce to screen readers when focused
    if (cardRef.current) {
      // Generate accessible time description inline
      let timeDescription = '';
      if (event.isAllDay) {
        timeDescription = 'All day event';
      } else {
        const dateOptions: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          timeZone: timeZone,
        };
        
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: timeZone,
        };
        
        const eventDate = event.startTime.toLocaleDateString(locale, dateOptions);
        const startTime = event.startTime.toLocaleTimeString(locale, timeOptions);
        const endTime = event.endTime.toLocaleTimeString(locale, timeOptions);
        
        timeDescription = `on ${eventDate} from ${startTime} to ${endTime}`;
      }
      
      const announcement = `Event ${event.title} focused. ${timeDescription}${event.location ? ` at ${event.location}` : ''}. Press Enter or Space to view details.`;
      
      // Create a temporary live region for the announcement
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'cal7-sr-only';
      liveRegion.textContent = announcement;
      
      document.body.appendChild(liveRegion);
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }
  }, [onFocus, event.title, event.location, event.startTime, event.endTime, event.isAllDay, locale, timeZone]);

  // Focus management for programmatic focus
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  // Format event time display with locale and timezone support
  const getTimeDisplay = () => {
    if (event.isAllDay) {
      return { type: 'allday', text: 'All day' };
    }
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone,
    };
    
    const startTime = event.startTime.toLocaleTimeString(locale, options);
    const endTime = event.endTime.toLocaleTimeString(locale, options);
    
    // Return structured time for 3-line display
    return {
      type: 'timed',
      startTime,
      endTime,
      text: `${startTime} to ${endTime}` // For accessibility
    };
  };

  // Check if event is in the past
  const isPastEvent = () => {
    const now = new Date();
    return event.endTime < now;
  };

  // Get accessible time description for screen readers
  const getAccessibleTimeDescription = () => {
    if (event.isAllDay) {
      return 'All day event';
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timeZone,
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone,
    };
    
    const eventDate = event.startTime.toLocaleDateString(locale, dateOptions);
    const startTime = event.startTime.toLocaleTimeString(locale, timeOptions);
    const endTime = event.endTime.toLocaleTimeString(locale, timeOptions);
    
    return `on ${eventDate} from ${startTime} to ${endTime}`;
  };

  // Truncate text with proper word boundaries and ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    
    // Find the last space before the max length to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '…';
    }
    
    return truncated.substring(0, maxLength - 1) + '…';
  };

  // Generate comprehensive accessible label
  const getAccessibleLabel = () => {
    const statusText = event.status !== 'confirmed' ? `${event.status} ` : '';
    const timeText = getAccessibleTimeDescription();
    const locationText = event.location ? ` at ${event.location}` : '';
    const descriptionText = event.description && !compact ? `. ${truncateText(event.description, 50)}` : '';
    
    return `${statusText}Event: ${event.title}${timeText}${locationText}${descriptionText}. Press Enter or Space to view full details.`;
  };

  // Get event status display text
  const getStatusDisplay = () => {
    switch (event.status) {
      case 'tentative':
        return 'Tentative';
      case 'cancelled':
        return 'Cancelled';
      default:
        return null;
    }
  };

  return (
    <div
      ref={cardRef}
      className={`cal7-event-card ${compact ? 'cal7-event-card--compact' : 'cal7-event-card--full'} ${isFocused ? 'cal7-event-card--focused' : ''} ${event.status !== 'confirmed' ? `cal7-event-card--${event.status}` : ''} ${isPastEvent() ? 'cal7-event-card--past' : ''} ${className}`}
      role="button"
      tabIndex={0}
      aria-label={getAccessibleLabel()}
      aria-describedby={`event-${event.id}-details`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
      {/* Event Status Indicator */}
      {event.status !== 'confirmed' && (
        <div 
          className={`cal7-event-card__status cal7-event-card__status--${event.status}`}
          aria-label={`Event status: ${getStatusDisplay()}`}
        >
          <span className="cal7-event-card__status-text">
            {getStatusDisplay()}
          </span>
        </div>
      )}

      {/* Event Content */}
      <div className="cal7-event-card__content">
        {/* Event Title */}
        <h4 
          ref={titleRef}
          className="cal7-event-card__title"
          title={event.title} // Show full title on hover if truncated
        >
          {compact ? truncateText(event.title, 30) : event.title}
        </h4>

        {/* Event Time */}
        <div className="cal7-event-card__time">
          {(() => {
            const timeDisplay = getTimeDisplay();
            if (timeDisplay.type === 'allday') {
              return (
                <div className="cal7-event-card__time-multiline cal7-event-card__time-multiline--allday">
                  <div className="cal7-event-card__time-start">
                    <svg 
                      className="cal7-event-card__time-icon" 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <span>All Day</span>
                  </div>
                  <div className="cal7-event-card__time-to">
                    <span>Event</span>
                  </div>
                  <div className="cal7-event-card__time-end">
                    <span>&nbsp;</span>
                  </div>
                  <time 
                    dateTime={event.startTime.toISOString()}
                    className="cal7-sr-only"
                    title={getAccessibleTimeDescription()}
                  >
                    {timeDisplay.text}
                  </time>
                </div>
              );
            } else {
              return (
                <div className="cal7-event-card__time-multiline">
                  <div className="cal7-event-card__time-start">
                    <svg 
                      className="cal7-event-card__time-icon" 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <span>{timeDisplay.startTime}</span>
                  </div>
                  <div className="cal7-event-card__time-to">
                    <span>to</span>
                  </div>
                  <div className="cal7-event-card__time-end">
                    <span>{timeDisplay.endTime}</span>
                  </div>
                  <time 
                    dateTime={event.startTime.toISOString()}
                    className="cal7-sr-only"
                    title={getAccessibleTimeDescription()}
                  >
                    {timeDisplay.text}
                  </time>
                </div>
              );
            }
          })()}
        </div>

        {/* Event Location (if present and not compact) */}
        {event.location && !compact && (
          <div className="cal7-event-card__location">
            <svg 
              className="cal7-event-card__location-icon" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span 
              className="cal7-event-card__location-text"
              title={event.location} // Full location on hover if truncated
            >
              {truncateText(event.location, 50)}
            </span>
          </div>
        )}

        {/* Event Description (if present and not compact) */}
        {event.description && !compact && (
          <div className="cal7-event-card__description">
            <p 
              className="cal7-event-card__description-text"
              title={event.description} // Full description on hover
            >
              {truncateText(event.description, 100)}
            </p>
          </div>
        )}

        {/* Compact Location Indicator */}
        {event.location && compact && (
          <div 
            className="cal7-event-card__location-indicator"
            title={`Location: ${event.location}`}
          >
            <svg 
              className="cal7-event-card__location-icon" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        )}
      </div>

      {/* Hidden details for screen readers */}
      <div 
        id={`event-${event.id}-details`}
        className="cal7-sr-only"
      >
        Additional event details: {event.description && !compact ? `Description: ${event.description}. ` : ''}
        {event.attendees && event.attendees.length > 0 ? `${event.attendees.length} attendees. ` : ''}
        {event.url ? 'External link available. ' : ''}
        Use Enter or Space key to open event details modal.
      </div>

      {/* Focus Ring for Accessibility */}
      <div className="cal7-event-card__focus-ring" aria-hidden="true" />
    </div>
  );
}