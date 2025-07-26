"use client";

import React, { useState, useEffect } from "react";
import { CalendarEvent } from "../types/events";
import { detectDeviceType, getCalendarAppName } from "../utils/device-detection";

export interface AddToCalendarButtonProps {
  event: CalendarEvent;
  userAgent?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * AddToCalendarButton Component
 * Provides device-specific calendar integration options
 * - iOS: Apple Calendar subscription via iCal download
 * - Android: Google Calendar integration
 * - Desktop: Multiple options (Google Calendar, iCal download)
 */
export default function AddToCalendarButton({ 
  event, 
  userAgent, 
  className = "",
  showLabel = true 
}: AddToCalendarButtonProps) {
  const [deviceType, setDeviceType] = useState<string>("unknown");
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only run device detection on the client side
    if (typeof window !== 'undefined') {
      setDeviceType(detectDeviceType(userAgent));
    }
  }, [userAgent]);

  /**
   * Generates Google Calendar URL for adding a single event
   */
  const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      dates: `${formatDateForGoogle(event.startTime)}/${formatDateForGoogle(event.endTime)}`,
      details: event.description || "",
      location: event.location || "",
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  /**
   * Generates iCal content for downloading as .ics file
   */
  const generateICalContent = (event: CalendarEvent): string => {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Cal7//Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@cal7.com`,
      `DTSTAMP:${formatDate(now)}`,
      `DTSTART:${formatDate(event.startTime)}`,
      `DTEND:${formatDate(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ""}`,
      ...(event.location ? [`LOCATION:${event.location}`] : []),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  };

  /**
   * Formats date for Google Calendar URL
   */
  const formatDateForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  /**
   * Downloads iCal file
   */
  const downloadICalFile = () => {
    const icalContent = generateICalContent(event);
    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Opens Google Calendar with event details
   */
  const openGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /**
   * Opens Apple Calendar subscription (for iOS devices)
   */
  const openAppleCalendar = () => {
    // For iOS, we'll download the iCal file which will open in Apple Calendar
    downloadICalFile();
  };

  /**
   * Handles the primary action based on device type
   */
  const handlePrimaryAction = async () => {
    setIsLoading(true);
    
    try {
      switch (deviceType) {
        case "ios":
          openAppleCalendar();
          break;
        case "android":
          openGoogleCalendar();
          break;
        case "desktop":
          // For desktop, show options dropdown
          setShowOptions(!showOptions);
          setIsLoading(false);
          return;
        default:
          // Fallback to iCal download
          downloadICalFile();
          break;
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  /**
   * Renders the primary button for mobile devices
   */
  const renderMobileButton = () => {
    const calendarAppName = getCalendarAppName(userAgent);
    
    return (
      <button
        onClick={handlePrimaryAction}
        disabled={isLoading}
        className={`cal7-add-to-calendar-button cal7-add-to-calendar-button--mobile ${className}`}
        aria-label={`Add ${event.title} event to ${calendarAppName}`}
        title={`Add to ${calendarAppName}`}
      >
        {isLoading ? (
          <div className="cal7-loading-spinner" />
        ) : (
          <svg className="cal7-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        )}
        {showLabel && <span>Add to {calendarAppName}</span>}
      </button>
    );
  };

  /**
   * Renders the dropdown button for desktop devices
   */
  const renderDesktopButton = () => {
    return (
      <div className="cal7-calendar-dropdown-container">
        <button
          onClick={handlePrimaryAction}
          className={`cal7-add-to-calendar-button cal7-add-to-calendar-button--desktop ${className}`}
          aria-label={`Add ${event.title} event to calendar. ${showOptions ? 'Close' : 'Open'} calendar options menu.`}
          aria-expanded={showOptions}
          aria-haspopup="menu"
          title="Add to calendar"
        >
          <svg className="cal7-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {showLabel && <span>Add to Calendar</span>}
          <svg className={`cal7-chevron-icon ${showOptions ? "cal7-chevron-icon--rotated" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="18,15 12,9 6,15"/>
          </svg>
        </button>

        {/* Dropdown Options - Positioned above the button */}
        {showOptions && (
          <div 
            className="cal7-calendar-dropdown"
            role="menu"
            aria-label="Calendar options"
          >
            <button
              onClick={() => {
                openGoogleCalendar();
                setShowOptions(false);
              }}
              className="cal7-calendar-dropdown-item"
              role="menuitem"
              aria-label={`Add ${event.title} to Google Calendar`}
            >
              <svg className="cal7-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 11 3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>Google Calendar</span>
            </button>
            <button
              onClick={() => {
                downloadICalFile();
                setShowOptions(false);
              }}
              className="cal7-calendar-dropdown-item"
              role="menuitem"
              aria-label={`Download ${event.title} as iCal file`}
            >
              <svg className="cal7-dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Download iCal (.ics)</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Handle keyboard navigation and close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside the dropdown container
      if (showOptions && !target.closest(".cal7-calendar-dropdown-container")) {
        setShowOptions(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showOptions) return;

      switch (event.key) {
        case 'Escape': {
          setShowOptions(false);
          // Focus back to the trigger button
          const triggerButton = document.querySelector('.cal7-calendar-dropdown-container button') as HTMLElement;
          if (triggerButton) triggerButton.focus();
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          const firstMenuItem = document.querySelector('[role="menuitem"]') as HTMLElement;
          if (firstMenuItem) firstMenuItem.focus();
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const menuItems = document.querySelectorAll('[role="menuitem"]');
          const lastMenuItem = menuItems[menuItems.length - 1] as HTMLElement;
          if (lastMenuItem) lastMenuItem.focus();
          break;
        }
      }
    };

    if (showOptions) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showOptions]);

  // Render appropriate button based on device type
  if (deviceType === "desktop") {
    return renderDesktopButton();
  }

  return renderMobileButton();
}