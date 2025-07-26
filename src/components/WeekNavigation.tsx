'use client';

import { useCallback } from 'react';
import type { CalendarTheme } from '../types/theme';

interface WeekNavigationProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  weekRangeString: string;
  className?: string;
  theme?: CalendarTheme;
  locale?: string;
}

/**
 * WeekNavigation Component
 * 
 * Provides navigation controls for moving between weeks with keyboard support.
 * Includes previous/next buttons and displays the current week range.
 */
export function WeekNavigation({
  currentWeek: _currentWeek,
  onWeekChange,
  onPreviousWeek,
  onNextWeek,
  weekRangeString,
  className = '',
  theme: _theme,
  locale: _locale = 'en-US',
}: WeekNavigationProps) {
  
  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        onPreviousWeek();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onNextWeek();
        break;
      case 'Home':
        event.preventDefault();
        onWeekChange(new Date()); // Go to current week
        break;
    }
  }, [onPreviousWeek, onNextWeek, onWeekChange]);

  // Go to today's week
  const handleTodayClick = () => {
    onWeekChange(new Date());
  };

  return (
    <div 
      className={`cal7-week-navigation ${className}`}
      role="toolbar"
      aria-label="Week navigation"
      onKeyDown={handleKeyDown}
    >
      <div className="cal7-week-navigation__controls">
        {/* Previous Week Button */}
        <button
          type="button"
          className="cal7-week-navigation__button cal7-week-navigation__button--prev"
          onClick={onPreviousWeek}
          aria-label="Previous week"
          title="Previous week (Left arrow)"
        >
          <svg 
            className="cal7-week-navigation__icon" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10.5 3.5L6 8l4.5 4.5L9 14l-6-6 6-6 1.5 1.5z"/>
          </svg>
          <span className="cal7-sr-only">Previous week</span>
        </button>

        {/* Current Week Display */}
        <div className="cal7-week-navigation__current">
          <h2 className="cal7-week-navigation__title">
            {weekRangeString}
          </h2>
        </div>

        {/* Next Week Button */}
        <button
          type="button"
          className="cal7-week-navigation__button cal7-week-navigation__button--next"
          onClick={onNextWeek}
          aria-label="Next week"
          title="Next week (Right arrow)"
        >
          <svg 
            className="cal7-week-navigation__icon" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5.5 3.5L10 8l-4.5 4.5L7 14l6-6-6-6-1.5 1.5z"/>
          </svg>
          <span className="cal7-sr-only">Next week</span>
        </button>
      </div>

      {/* Today Button */}
      <div className="cal7-week-navigation__actions">
        <button
          type="button"
          className="cal7-week-navigation__today"
          onClick={handleTodayClick}
          aria-label="Go to current week"
          title="Go to current week (Home key)"
        >
          Today
        </button>
      </div>
    </div>
  );
}