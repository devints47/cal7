'use client';

import { useState, useRef, useEffect } from 'react';
import type { CalendarEvent } from '../types/events';

interface SubscribeButtonProps {
  events: CalendarEvent[];
  calendarName: string;
  className?: string;
}

export function SubscribeButton({ events, calendarName, className = '' }: SubscribeButtonProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate calendar URL for subscription (Google Calendar format)
  const generateSubscriptionUrl = () => {
    // For a real implementation, this would be the calendar's public URL
    // Since we're working with a demo, we'll use a placeholder
    const googleCalendarId = 'b382cfad3622bc528f1e748cc100b3abc92abfe801f983ca2a527357f7be7445@group.calendar.google.com';
    return `https://calendar.google.com/calendar/ical/${googleCalendarId}/public/basic.ics`;
  };

  // Generate ICS file content for download
  const generateICSContent = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cal7//Cal7 Calendar//EN',
      `X-WR-CALNAME:${calendarName}`,
      'METHOD:PUBLISH',
      'CALSCALE:GREGORIAN'
    ];

    events.forEach(event => {
      const startTime = new Date(event.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endTime = new Date(event.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@cal7.com`,
        `DTSTART:${startTime}`,
        `DTEND:${endTime}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        `DTSTAMP:${timestamp}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  const handleSubscribe = () => {
    const subscriptionUrl = generateSubscriptionUrl();
    window.open(subscriptionUrl, '_blank');
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${calendarName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`cal7-subscribe-container ${className}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="cal7-subscribe-button"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <svg className="cal7-subscribe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l3 3-3 3" />
        </svg>
        Subscribe to {calendarName}!
        <svg className={`cal7-dropdown-arrow ${isDropdownOpen ? 'cal7-dropdown-arrow--up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div ref={dropdownRef} className="cal7-subscribe-dropdown">
          <button onClick={handleSubscribe} className="cal7-subscribe-option">
            <svg className="cal7-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Subscribe to Calendar
          </button>
          <button onClick={handleDownload} className="cal7-subscribe-option">
            <svg className="cal7-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download .ics File
          </button>
        </div>
      )}
    </div>
  );
} 