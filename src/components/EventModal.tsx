'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createFocusTrap, type FocusTrap } from 'focus-trap';
import type { EventModalProps } from '../types/calendar';
import AddToCalendarButton from './AddToCalendarButton';

/**
 * EventModal Component
 * 
 * A fully accessible modal dialog for displaying detailed event information.
 * Features focus management, keyboard navigation, and proper ARIA semantics.
 */
export function EventModal({
  event,
  isOpen,
  onClose,
  timeZone = 'UTC',
  locale = 'en-US',
  showAddToCalendar = true,
}: EventModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store the element that triggered the modal for focus restoration
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle focus trap setup and cleanup
  useEffect(() => {
    if (isOpen && modalRef.current) {
      try {
        // Create focus trap
        focusTrapRef.current = createFocusTrap(modalRef.current, {
          initialFocus: modalRef.current,
          fallbackFocus: modalRef.current,
          escapeDeactivates: false, // We handle escape manually
          clickOutsideDeactivates: false, // We handle backdrop clicks manually
          returnFocusOnDeactivate: false, // We handle focus restoration manually
        });

        // Activate focus trap
        focusTrapRef.current.activate();
      } catch (error) {
        // Focus trap creation failed, continue without it
        console.warn('Failed to create focus trap:', error);
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = getScrollbarWidth() + 'px';

      return () => {
        // Deactivate focus trap
        if (focusTrapRef.current) {
          try {
            focusTrapRef.current.deactivate();
          } catch (error) {
            // Focus trap deactivation failed, continue cleanup
            console.warn('Failed to deactivate focus trap:', error);
          }
        }

        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        // Restore focus to triggering element
        if (triggerElementRef.current) {
          triggerElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Format date and time helpers
  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone,
    }).format(date);
  };

  const formatEventTime = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    }).format(date);
  };

  const formatDuration = (startTime: Date, endTime: Date) => {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes} minutes`;
    } else if (diffMinutes === 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ${diffMinutes} minutes`;
    }
  };

  // Make emails and links clickable in text
  const makeLinksClickable = (text: string): string => {
    // Email regex
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    // URL regex
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    
    return text
      .replace(emailRegex, '<a href="mailto:$1" style="color: #3b82f6; text-decoration: underline;">$1</a>')
      .replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">$1</a>');
  };

  // Open device-appropriate map app
  const openMapApp = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      // iOS - Apple Maps
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else if (userAgent.includes('android')) {
      // Android - Google Maps
      window.open(`geo:0,0?q=${encodedAddress}`, '_blank');
    } else {
      // Desktop - Google Maps
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  // Get scrollbar width for body padding adjustment
  function getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode?.removeChild(outer);

    return scrollbarWidth;
  }

  if (!isOpen || !event) {
    return null;
  }

  return (
    <div
      className="cal7-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={modalRef}
        className="cal7-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal7-modal-title"
        aria-describedby="cal7-modal-description"
        tabIndex={-1}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          outline: 'none',
        }}
      >
        {/* Modal Header */}
        <div
          className="cal7-modal-header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#fefdf8',
          }}
        >
          <div style={{ flex: 1, paddingRight: '1rem' }}>
            <h2
              id="cal7-modal-title"
              style={{
                fontSize: '1.875rem',
                fontWeight: '600',
                color: '#374151',
                lineHeight: '1.25',
                margin: 0,
              }}
            >
              {event.title}
            </h2>
            {event.isAllDay && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.875rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontWeight: '500',
                }}
              >
                All Day Event
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close event details modal"
            style={{
              flexShrink: 0,
              padding: '0.5rem',
              color: '#9ca3af',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px #f59e0b';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Event Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            {/* Date Information - Clickable with Add to Calendar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem',
                color: '#374151',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                style={{ marginRight: '0.75rem', flexShrink: 0 }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: '500' }}>
                  {formatEventDate(event.startTime)}
                </span>
                <div style={{ marginTop: '0.25rem' }}>
                  <AddToCalendarButton 
                    event={event} 
                    showLabel={false}
                    className="cal7-modal-add-to-calendar"
                  />
                </div>
              </div>
            </div>

            {/* Time Information */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1rem',
                color: '#374151',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                style={{ marginRight: '0.75rem', flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <div>
                <span style={{ fontWeight: '500' }}>
                  {event.isAllDay ? (
                    'All Day Event'
                  ) : (
                    <>
                      {formatEventTime(event.startTime)}
                      {' - '}
                      {formatEventTime(event.endTime)}
                      <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>
                        ({formatDuration(event.startTime, event.endTime)})
                      </span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Location - Clickable to open in map app */}
            {event.location && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  color: '#374151',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  style={{ marginRight: '0.75rem', flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <button
                  onClick={() => openMapApp(event.location!)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    padding: 0,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                  title="Open in map application"
                >
                  {event.location}
                </button>
              </div>
            )}

            {/* Attendees */}
            {event.attendees && event.attendees.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                  color: '#374151',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  style={{ marginRight: '0.75rem', flexShrink: 0, marginTop: '0.125rem' }}
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <div>
                  <span style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem' }}>
                    Attendees ({event.attendees.length})
                  </span>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {event.attendees.slice(0, 5).map((attendee, index) => (
                      <li key={index} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.125rem' }}>
                        {attendee.name || attendee.email}
                        {attendee.status !== 'needsAction' && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                            ({attendee.status})
                          </span>
                        )}
                      </li>
                    ))}
                    {event.attendees.length > 5 && (
                      <li style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                        +{event.attendees.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Event Description */}
          {event.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.75rem',
                  margin: '0 0 0.75rem 0',
                }}
              >
                About This Event
              </h3>
              <div
                id="cal7-modal-description"
                style={{
                  color: '#6b7280',
                  lineHeight: '1.625',
                  whiteSpace: 'pre-wrap',
                }}
                dangerouslySetInnerHTML={{
                  __html: makeLinksClickable(event.description.replace(/\n/g, '<br>')),
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px #f59e0b';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Close
              </button>

              {showAddToCalendar && (
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <AddToCalendarButton event={event} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}