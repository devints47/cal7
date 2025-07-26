import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddToCalendarButton from '../AddToCalendarButton';
import { CalendarEvent } from '../../types/events';
import * as deviceDetection from '../../utils/device-detection';

// Mock device detection utilities
vi.mock('../../utils/device-detection', () => ({
  detectDeviceType: vi.fn(),
  getCalendarAppName: vi.fn(),
}));

const mockDetectDeviceType = vi.mocked(deviceDetection.detectDeviceType);
const mockGetCalendarAppName = vi.mocked(deviceDetection.getCalendarAppName);

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true,
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true,
});

// Mock document.createElement and appendChild/removeChild
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
};
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => mockLink),
  writable: true,
});
Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true,
});
Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true,
});

describe('AddToCalendarButton', () => {
  const mockEvent: CalendarEvent = {
    id: 'test-event-1',
    title: 'Test Event',
    description: 'This is a test event description',
    location: 'Test Location',
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    isAllDay: false,
    status: 'confirmed',
    url: 'https://calendar.google.com/event/test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDetectDeviceType.mockReturnValue('desktop');
    mockGetCalendarAppName.mockReturnValue('Calendar');
    
    // Setup DOM environment
    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      mockDetectDeviceType.mockReturnValue('desktop');
      mockGetCalendarAppName.mockReturnValue('Calendar');

      expect(() => {
        render(<AddToCalendarButton event={mockEvent} />);
      }).not.toThrow();
    });

    it('renders a button element', () => {
      mockDetectDeviceType.mockReturnValue('desktop');
      mockGetCalendarAppName.mockReturnValue('Calendar');

      render(<AddToCalendarButton event={mockEvent} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders mobile button for Android devices', () => {
      mockDetectDeviceType.mockReturnValue('android');
      mockGetCalendarAppName.mockReturnValue('Google Calendar');

      render(<AddToCalendarButton event={mockEvent} />);

      expect(screen.getByRole('button')).toHaveClass('cal7-add-to-calendar-button--mobile');
      expect(screen.getByText('Add to Google Calendar')).toBeInTheDocument();
    });

    it('renders desktop button with dropdown for desktop devices', () => {
      mockDetectDeviceType.mockReturnValue('desktop');

      render(<AddToCalendarButton event={mockEvent} />);

      expect(screen.getByRole('button')).toHaveClass('cal7-add-to-calendar-button--desktop');
      expect(screen.getByText('Add to Calendar')).toBeInTheDocument();
    });

    it('uses provided userAgent for device detection', () => {
      const customUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      
      render(<AddToCalendarButton event={mockEvent} userAgent={customUserAgent} />);

      expect(mockDetectDeviceType).toHaveBeenCalledWith(customUserAgent);
    });
  });

  describe('iOS Device Behavior', () => {
    beforeEach(() => {
      mockDetectDeviceType.mockReturnValue('ios');
      mockGetCalendarAppName.mockReturnValue('Apple Calendar');
    });

    it('downloads iCal file when clicked on iOS', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });
    });

    it('generates correct iCal content', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'text/calendar;charset=utf-8',
          })
        );
      });

      // Check that the blob was created with iCal content
      if (mockCreateObjectURL.mock.calls.length > 0) {
        const firstCall = mockCreateObjectURL.mock.calls[0] as unknown[];
        if (firstCall && firstCall.length > 0) {
          const blobCall = firstCall[0];
          expect(blobCall).toBeInstanceOf(Blob);
        }
      }
    });
  });

  describe('Android Device Behavior', () => {
    beforeEach(() => {
      mockDetectDeviceType.mockReturnValue('android');
      mockGetCalendarAppName.mockReturnValue('Google Calendar');
    });

    it('opens Google Calendar when clicked on Android', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWindowOpen).toHaveBeenCalledWith(
          expect.stringContaining('https://calendar.google.com/calendar/render'),
          '_blank',
          'noopener,noreferrer'
        );
      });
    });

    it('generates correct Google Calendar URL', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const calledUrl = mockWindowOpen.mock.calls[0][0];
        expect(calledUrl).toContain('action=TEMPLATE');
        expect(calledUrl).toContain('text=Test%20Event');
        expect(calledUrl).toContain('location=Test%20Location');
        expect(calledUrl).toContain('details=This%20is%20a%20test%20event%20description');
      });
    });
  });

  describe('Desktop Device Behavior', () => {
    beforeEach(() => {
      mockDetectDeviceType.mockReturnValue('desktop');
    });

    it('shows dropdown when clicked on desktop', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Google Calendar')).toBeInTheDocument();
        expect(screen.getByText('Download iCal (.ics)')).toBeInTheDocument();
      });
    });

    it('opens Google Calendar when Google Calendar option is clicked', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const googleOption = screen.getByText('Google Calendar');
        fireEvent.click(googleOption);
      });

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://calendar.google.com/calendar/render'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('downloads iCal file when iCal option is clicked', async () => {
      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const icalOption = screen.getByText('Download iCal (.ics)');
        fireEvent.click(icalOption);
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for mobile button', () => {
      mockDetectDeviceType.mockReturnValue('ios');
      mockGetCalendarAppName.mockReturnValue('Apple Calendar');

      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add Test Event event to Apple Calendar');
      expect(button).toHaveAttribute('title', 'Add to Apple Calendar');
    });

    it('has proper ARIA attributes for desktop dropdown', () => {
      mockDetectDeviceType.mockReturnValue('desktop');

      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'menu');

      fireEvent.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toHaveAttribute('aria-label', 'Calendar options');
    });
  });

  describe('Error Handling', () => {
    it('handles unknown device type gracefully', () => {
      mockDetectDeviceType.mockReturnValue('unknown');
      mockGetCalendarAppName.mockReturnValue('Calendar');

      render(<AddToCalendarButton event={mockEvent} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Add to Calendar')).toBeInTheDocument();
    });
  });
});